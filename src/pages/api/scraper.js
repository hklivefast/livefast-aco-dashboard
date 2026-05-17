import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import { getSupabase } from "@/lib/supabase";
import { getSessionCookie, verifySession } from "@/lib/session";

const RETAILERS = {
  target: {
    label: "Target",
    senders: ["target.com"],
    subjectPatterns: ["order", "shipped", "delivered", "confirmation", "ready for pickup"],
  },
  walmart: {
    label: "Walmart",
    senders: ["walmart.com"],
    subjectPatterns: ["order", "shipped", "delivered", "confirmation", "ready for pickup"],
  },
  pokemonCenter: {
    label: "Pokemon Center",
    senders: ["pokemoncenter.com", "pokemon.com"],
    subjectPatterns: ["order", "shipped", "delivered", "confirmation"],
  },
};

function htmlToText(html) {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(?:p|div|tr|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#?\w+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseOrder(parsed, retailerLabel) {
  const subject = parsed.subject || "";
  const date = parsed.date ? parsed.date.toISOString().split("T")[0] : null;
  const text = parsed.text || htmlToText(parsed.html || "");

  // Order number
  const orderNumMatch =
    subject.match(/order\s*#?\s*(\w[\w-]{3,})/i) ||
    text.match(/order\s*(?:number|#|no\.?)\s*:?\s*(\w[\w-]{3,})/i);
  const orderNumber = orderNumMatch ? orderNumMatch[1] : null;

  // Status from subject
  let status = "Confirmed";
  const sl = subject.toLowerCase();
  if (sl.includes("deliver") || sl.includes("ready for pickup")) status = "Delivered";
  else if (sl.includes("ship") || sl.includes("on its way") || sl.includes("tracking")) status = "Shipped";
  else if (sl.includes("cancel")) status = "Cancelled";
  else if (sl.includes("refund")) status = "Refunded";

  // Total
  const totalMatch = text.match(
    /(?:order\s*total|total|amount\s*charged|grand\s*total|you\s*paid)\s*:?\s*\$\s*([\d,]+\.\d{2})/i
  );
  const total = totalMatch ? parseFloat(totalMatch[1].replace(",", "")) : null;

  // Item name - best effort extraction
  let item = subject
    .replace(/^(re|fw|fwd):\s*/gi, "")
    .replace(/your\s+order\s+(has\s+)?(been\s+)?(confirmed|shipped|delivered|placed)/gi, "")
    .replace(/order\s*#?\s*\w[\w-]*/gi, "")
    .replace(new RegExp(retailerLabel, "gi"), "")
    .replace(/confirmation|update|notification/gi, "")
    .replace(/[!.]+$/, "")
    .replace(/^\s*[-:,]\s*/, "")
    .trim();

  if (!item || item.length < 3) item = `${retailerLabel} Order`;

  return { orderNumber, item, date, status, total, retailer: retailerLabel };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Verify session
  const token = getSessionCookie(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = await verifySession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  const { email, password, imapServer, retailers: selectedRetailers, daysBack = 90 } = req.body;

  if (!email || !password || !imapServer) {
    return res.status(400).json({ error: "Email, password, and IMAP server are required" });
  }
  if (!selectedRetailers || selectedRetailers.length === 0) {
    return res.status(400).json({ error: "Select at least one retailer" });
  }

  let client;
  try {
    client = new ImapFlow({
      host: imapServer,
      port: 993,
      secure: true,
      auth: { user: email, pass: password },
      logger: false,
      greetTimeout: 10000,
      socketTimeout: 20000,
    });

    await client.connect();
    const lock = await client.getMailboxLock("INBOX");

    const allOrders = [];

    try {
      for (const retailerKey of selectedRetailers) {
        const retailer = RETAILERS[retailerKey];
        if (!retailer) continue;

        const since = new Date();
        since.setDate(since.getDate() - daysBack);

        for (const sender of retailer.senders) {
          try {
            const messages = client.fetch(
              { from: sender, since },
              { envelope: true, source: true }
            );

            let count = 0;
            for await (const msg of messages) {
              if (count >= 50) break;
              count++;
              try {
                const parsed = await simpleParser(msg.source);
                const subjectLower = (parsed.subject || "").toLowerCase();
                const isOrderRelated = retailer.subjectPatterns.some((p) => subjectLower.includes(p));
                if (isOrderRelated) {
                  const order = parseOrder(parsed, retailer.label);
                  if (order) allOrders.push(order);
                }
              } catch (_) {
                // skip unparseable messages
              }
            }
          } catch (_) {
            // search might fail for some criteria, continue
          }
        }
      }
    } finally {
      lock.release();
    }

    await client.logout();

    // Deduplicate by order number
    const seen = new Set();
    const orders = allOrders.filter((o) => {
      if (o.orderNumber) {
        if (seen.has(o.orderNumber)) return false;
        seen.add(o.orderNumber);
      }
      return true;
    });

    // Sort by date descending
    orders.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date.localeCompare(a.date);
    });

    // Save to Supabase
    try {
      const supabase = getSupabase();
      const userId = session.id;

      for (const order of orders) {
        // Upsert: if we already have this order number for this user, update status
        const record = {
          user_id: userId,
          retailer: order.retailer,
          order_number: order.orderNumber,
          item: order.item,
          order_date: order.date,
          status: order.status,
          total: order.total,
          last_scanned: new Date().toISOString(),
        };

        if (order.orderNumber) {
          await supabase
            .from("orders")
            .upsert(record, { onConflict: "user_id,order_number", ignoreDuplicates: false });
        } else {
          // No order number - insert but check for duplicates by item + date
          const { data: existing } = await supabase
            .from("orders")
            .select("id")
            .eq("user_id", userId)
            .eq("item", order.item)
            .eq("order_date", order.date)
            .eq("retailer", order.retailer)
            .limit(1);

          if (!existing || existing.length === 0) {
            await supabase.from("orders").insert(record);
          }
        }
      }
    } catch (dbErr) {
      console.error("Supabase save error:", dbErr);
      // Still return the orders even if save fails
    }

    return res.status(200).json({
      success: true,
      orders: orders.map((o) => ({
        ...o,
        total: o.total ? `$${o.total.toFixed(2)}` : "N/A",
      })),
      count: orders.length,
    });
  } catch (err) {
    console.error("IMAP error:", err);

    let userMessage = "Failed to connect to your email. Please check your credentials.";
    if (err.message?.includes("AUTHENTICATIONFAILED") || err.authenticationFailed) {
      userMessage = "Login failed. If you use Gmail, make sure you are using an App Password with 2FA enabled.";
    } else if (err.message?.includes("ENOTFOUND")) {
      userMessage = "Could not find that IMAP server. Double-check the server address.";
    } else if (err.message?.includes("ETIMEDOUT") || err.message?.includes("timeout")) {
      userMessage = "Connection timed out. The server might be blocking the connection.";
    }

    return res.status(500).json({ error: userMessage });
  } finally {
    if (client) {
      try { await client.logout(); } catch (_) {}
    }
  }
}

export const config = {
  api: {
    bodyParser: { sizeLimit: "1mb" },
    responseLimit: false,
  },
  maxDuration: 30,
};
