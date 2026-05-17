import { getSupabase } from "@/lib/supabase";
import { getSessionCookie, verifySession } from "@/lib/session";

export default async function handler(req, res) {
  const token = getSessionCookie(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = await verifySession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  const supabase = getSupabase();
  const userId = session.id;

  if (req.method === "GET") {
    const { data } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    return res.json({
      settings: data || {
        discord_webhook_url: null,
        notify_new_order: true,
        notify_shipped: true,
        notify_delivered: true,
        notify_cancelled: true,
      },
    });
  }

  if (req.method === "PUT") {
    const { discord_webhook_url, notify_new_order, notify_shipped, notify_delivered, notify_cancelled } = req.body;

    const { data, error } = await supabase
      .from("user_settings")
      .upsert(
        {
          user_id: userId,
          discord_webhook_url: discord_webhook_url || null,
          notify_new_order: notify_new_order !== false,
          notify_shipped: notify_shipped !== false,
          notify_delivered: notify_delivered !== false,
          notify_cancelled: notify_cancelled !== false,
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error) return res.status(500).json({ error: "Failed to save settings" });
    return res.json({ settings: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
