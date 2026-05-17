import { getSession } from "../../lib/session";
import { getServiceSupabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const sb = getServiceSupabase();

  if (req.method === "GET") {
    const { status, retailer, limit = 50, offset = 0 } = req.query;
    let query = sb
      .from("orders")
      .select("*", { count: "exact" })
      .order("order_date", { ascending: false })
      .range(offset, offset + limit - 1);

    // Admins see all orders, members see their own
    if (!session.isAdmin) {
      query = query.eq("user_id", session.userId);
    }
    if (status) query = query.eq("status", status);
    if (retailer) query = query.eq("retailer", retailer);

    const { data, error, count } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ orders: data, total: count });
  }

  if (req.method === "POST") {
    if (!session.isAdmin) return res.status(403).json({ error: "Admin only" });
    const { data, error } = await sb.from("orders").insert(req.body).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === "PATCH") {
    if (!session.isAdmin) return res.status(403).json({ error: "Admin only" });
    const { id, ...updates } = req.body;
    const { data, error } = await sb.from("orders").update(updates).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
