import { getSession } from "../../lib/session";
import { getServiceSupabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const sb = getServiceSupabase();

  if (req.method === "GET") {
    const { data: drops, error } = await sb
      .from("drops")
      .select("*")
      .order("drop_date", { ascending: true });

    if (error) return res.status(500).json({ error: error.message });

    // Check which drops the current user is signed up for
    const { data: signups } = await sb
      .from("drop_signups")
      .select("drop_id")
      .eq("user_id", session.userId);

    const signedUpDropIds = new Set((signups || []).map((s) => s.drop_id));
    const enriched = drops.map((d) => ({
      ...d,
      signedUp: signedUpDropIds.has(d.id),
    }));

    return res.json({ drops: enriched });
  }

  if (req.method === "POST") {
    // Admin creates a drop, or user signs up for a drop
    const { action } = req.body;

    if (action === "signup") {
      const { drop_id } = req.body;

      // Check drop exists and has space
      const { data: drop } = await sb.from("drops").select("*").eq("id", drop_id).single();
      if (!drop) return res.status(404).json({ error: "Drop not found" });
      if (drop.filled_slots >= drop.total_slots) return res.status(400).json({ error: "Drop is full" });

      // Insert signup
      const { error: signupError } = await sb.from("drop_signups").insert({
        drop_id,
        user_id: session.userId,
      });
      if (signupError) {
        if (signupError.code === "23505") return res.status(400).json({ error: "Already signed up" });
        return res.status(500).json({ error: signupError.message });
      }

      // Increment filled slots
      await sb.from("drops").update({ filled_slots: drop.filled_slots + 1 }).eq("id", drop_id);
      return res.json({ success: true });
    }

    // Create new drop (admin only)
    if (!session.isAdmin) return res.status(403).json({ error: "Admin only" });
    const { title, drop_date, drop_time, retailer, products, total_slots } = req.body;
    const { data, error } = await sb.from("drops").insert({
      title, drop_date, drop_time, retailer, products, total_slots,
      created_by: session.userId,
    }).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
