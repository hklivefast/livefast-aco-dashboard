import { getSupabase } from "./supabase";

const C_EMBED = 2303786; // LIVEFAST dark charcoal

const retailerColors = {
  Target: 0xcc3333,
  Walmart: 0x2d7fd3,
  "Pokemon Center": 0xd4a017,
  Amazon: 0xff9900,
  "Best Buy": 0x0046be,
};

const statusEmoji = {
  Confirmed: "\u2705",
  Ordered: "\u2705",
  Shipped: "\uD83D\uDCE6",
  "In Transit": "\uD83D\uDE9A",
  "Out for Delivery": "\uD83D\uDEEB",
  Delivered: "\uD83C\uDFE0",
  Cancelled: "\u274C",
  Refunded: "\uD83D\uDCB8",
};

/**
 * Determine which notification type an order event maps to:
 *   "new_order" | "shipped" | "delivered" | "cancelled" | null
 */
function getNotificationType(status, isNew) {
  if (isNew) return "new_order";
  const s = (status || "").toLowerCase();
  if (["shipped", "in transit", "out for delivery"].includes(s)) return "shipped";
  if (s === "delivered") return "delivered";
  if (["cancelled", "refunded", "returned"].includes(s)) return "cancelled";
  return null;
}

/**
 * Build a Discord embed for an order event.
 */
function buildEmbed(order, isNew) {
  const emoji = statusEmoji[order.status] || "\uD83D\uDCCB";
  const color = retailerColors[order.retailer] || C_EMBED;

  const title = isNew
    ? `${emoji}  New Checkout: ${order.retailer}`
    : `${emoji}  ${order.status}: ${order.retailer}`;

  const fields = [];
  if (order.item) fields.push({ name: "Product", value: order.item, inline: false });
  if (order.order_number) fields.push({ name: "Order #", value: `\`${order.order_number}\``, inline: true });
  if (order.total) fields.push({ name: "Total", value: `$${Number(order.total).toFixed(2)}`, inline: true });
  if (order.status) fields.push({ name: "Status", value: order.status, inline: true });
  if (order.carrier && order.tracking_number) {
    fields.push({ name: "Tracking", value: `${order.carrier}: \`${order.tracking_number}\``, inline: false });
  }
  if (order.estimated_delivery) {
    const d = new Date(order.estimated_delivery + "T12:00:00");
    fields.push({
      name: "Estimated Delivery",
      value: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }),
      inline: true,
    });
  }

  return {
    title,
    color,
    fields,
    footer: { text: "LIVEFAST ACO" },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Send a Discord webhook notification for an order event.
 * Returns true if sent, false if skipped/failed.
 */
async function sendWebhook(webhookUrl, embed) {
  if (!webhookUrl) return false;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Main function: notify a user about order events.
 * Call after upserting orders in scan.js.
 *
 * @param {string} userId - Discord user ID
 * @param {Array} events - [{ order, isNew }] where order is the DB record
 */
export async function notifyOrderEvents(userId, events) {
  if (!events || events.length === 0) return;

  const supabase = getSupabase();

  // Fetch user settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!settings?.discord_webhook_url) return;

  const prefs = {
    new_order: settings.notify_new_order !== false,
    shipped: settings.notify_shipped !== false,
    delivered: settings.notify_delivered !== false,
    cancelled: settings.notify_cancelled !== false,
  };

  // Batch: max 10 embeds per webhook message
  const embeds = [];
  for (const { order, isNew } of events) {
    const type = getNotificationType(order.status, isNew);
    if (!type || !prefs[type]) continue;
    embeds.push(buildEmbed(order, isNew));
  }

  if (embeds.length === 0) return;

  // Discord allows max 10 embeds per message
  for (let i = 0; i < embeds.length; i += 10) {
    const batch = embeds.slice(i, i + 10);
    try {
      await fetch(settings.discord_webhook_url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ embeds: batch }),
      });
    } catch {}
    // Respect Discord rate limits
    if (i + 10 < embeds.length) await new Promise((r) => setTimeout(r, 500));
  }
}
