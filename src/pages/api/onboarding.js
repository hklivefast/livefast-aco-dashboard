import { getSession } from "../../lib/session";
import { getServiceSupabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const sb = getServiceSupabase();

  if (req.method === "GET") {
    const { data, error } = await sb
      .from("member_profiles")
      .select("*")
      .eq("user_id", session.userId)
      .single();

    if (error && error.code !== "PGRST116") {
      return res.status(500).json({ error: error.message });
    }
    return res.json({ profile: data || null });
  }

  if (req.method === "POST" || req.method === "PUT") {
    const {
      full_name, phone, shipping_address,
      walmart_email, target_email, pokemon_center_email,
      sams_club_email, amazon_email, bestbuy_email, notes,
    } = req.body;

    const profileData = {
      user_id: session.userId,
      full_name, phone, shipping_address,
      walmart_email, target_email, pokemon_center_email,
      sams_club_email, amazon_email, bestbuy_email, notes,
      onboarding_complete: true,
    };

    const { data, error } = await sb
      .from("member_profiles")
      .upsert(profileData, { onConflict: "user_id" })
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ profile: data });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
