import { getSupabase } from "@/lib/supabase";
import { getSessionCookie, verifySession } from "@/lib/session";
import { encrypt } from "@/lib/crypto";

export default async function handler(req, res) {
  const token = getSessionCookie(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = await verifySession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  const supabase = getSupabase();
  const userId = session.id;

  // GET - list accounts
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("email_accounts")
      .select("id, label, provider, email, imap_server, status, last_scanned, last_error, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) return res.status(500).json({ error: "Failed to load accounts" });
    return res.json({ accounts: data || [] });
  }

  // POST - add account
  if (req.method === "POST") {
    const { label, provider, email, imapServer, password } = req.body;

    if (!email || !password || !imapServer || !provider) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Test IMAP connection first
    try {
      const { ImapFlow } = await import("imapflow");
      const client = new ImapFlow({
        host: imapServer,
        port: 993,
        secure: true,
        auth: { user: email, pass: password },
        logger: false,
        greetTimeout: 8000,
        socketTimeout: 10000,
      });
      await client.connect();
      await client.logout();
    } catch (err) {
      let msg = "Could not connect to email server. Check your credentials.";
      if (err.message?.includes("AUTHENTICATIONFAILED")) {
        msg = "Authentication failed. Make sure you are using an App Password.";
      } else if (err.message?.includes("ENOTFOUND")) {
        msg = "IMAP server not found. Check the server address.";
      }
      return res.status(400).json({ error: msg });
    }

    // Encrypt password and save
    const encryptedPassword = encrypt(password);

    const { data, error } = await supabase
      .from("email_accounts")
      .upsert(
        {
          user_id: userId,
          label: label || provider,
          provider,
          email,
          imap_server: imapServer,
          encrypted_password: encryptedPassword,
          status: "active",
          last_error: null,
        },
        { onConflict: "user_id,email" }
      )
      .select("id, label, provider, email, imap_server, status, created_at")
      .single();

    if (error) return res.status(500).json({ error: "Failed to save account" });
    return res.json({ account: data });
  }

  // DELETE - remove account
  if (req.method === "DELETE") {
    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Account ID required" });

    const { error } = await supabase
      .from("email_accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) return res.status(500).json({ error: "Failed to remove account" });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
