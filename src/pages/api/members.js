import { getSession } from "../../lib/session";
import { getServiceSupabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });
  if (!session.isAdmin) return res.status(403).json({ error: "Admin only" });

  const sb = getServiceSupabase();

  if (req.method === "GET") {
    const { data: users, error } = await sb
      .from("users")
      .select(`
        *,
        member_profiles(*),
        orders(total_price)
      `)
      .order("created_at", { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Calculate total spend per member
    const members = users.map((u) => ({
      id: u.id,
      discord_id: u.discord_id,
      username: u.discord_username,
      avatar: u.discord_avatar,
      email: u.email,
      status: u.status,
      tier: u.tier,
      is_admin: u.is_admin,
      created_at: u.created_at,
      last_login: u.last_login,
      profile: u.member_profiles?.[0] || null,
      total_spend: (u.orders || []).reduce((sum, o) => sum + (parseFloat(o.total_price) || 0), 0),
    }));

    return res.json({ members });
  }

  if (req.method === "PATCH") {
    const { id, ...updates } = req.body;
    const { data, error } = await sb.from("users").update(updates).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
