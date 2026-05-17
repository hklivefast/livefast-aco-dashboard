import { getSupabase } from "@/lib/supabase";
import { getSessionCookie, verifySession } from "@/lib/session";

async function isAdmin(supabase, userId) {
  const { data } = await supabase
    .from("admin_users")
    .select("id")
    .eq("discord_user_id", userId)
    .limit(1);
  return data && data.length > 0;
}

export default async function handler(req, res) {
  const token = getSessionCookie(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = await verifySession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  const supabase = getSupabase();
  const userId = session.id;

  // GET - list all upcoming drops (any authenticated user)
  if (req.method === "GET") {
    const { data, error } = await supabase
      .from("drops")
      .select("*")
      .gte("drop_date", new Date().toISOString().split("T")[0])
      .order("drop_date", { ascending: true });

    if (error) return res.status(500).json({ error: "Failed to fetch drops" });

    const admin = await isAdmin(supabase, userId);
    return res.json({ drops: data || [], isAdmin: admin });
  }

  // POST - create a drop (admin only)
  if (req.method === "POST") {
    const admin = await isAdmin(supabase, userId);
    if (!admin) return res.status(403).json({ error: "Admin access required" });

    const { title, description, retailer, dropDate, dropTime, imageUrl, signupUrl } = req.body;
    if (!title || !dropDate) return res.status(400).json({ error: "Title and date are required" });

    const { data, error } = await supabase.from("drops").insert({
      title,
      description: description || null,
      retailer: retailer || null,
      drop_date: dropDate,
      drop_time: dropTime || null,
      image_url: imageUrl || null,
      signup_url: signupUrl || null,
      created_by: userId,
    }).select().single();

    if (error) return res.status(500).json({ error: "Failed to create drop" });
    return res.json({ drop: data });
  }

  // PUT - update a drop (admin only)
  if (req.method === "PUT") {
    const admin = await isAdmin(supabase, userId);
    if (!admin) return res.status(403).json({ error: "Admin access required" });

    const { id, title, description, retailer, dropDate, dropTime, imageUrl, signupUrl } = req.body;
    if (!id) return res.status(400).json({ error: "Drop ID required" });

    const update = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (retailer !== undefined) update.retailer = retailer;
    if (dropDate !== undefined) update.drop_date = dropDate;
    if (dropTime !== undefined) update.drop_time = dropTime;
    if (imageUrl !== undefined) update.image_url = imageUrl;
    if (signupUrl !== undefined) update.signup_url = signupUrl;

    const { data, error } = await supabase.from("drops").update(update).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: "Failed to update drop" });
    return res.json({ drop: data });
  }

  // DELETE - remove a drop (admin only)
  if (req.method === "DELETE") {
    const admin = await isAdmin(supabase, userId);
    if (!admin) return res.status(403).json({ error: "Admin access required" });

    const { id } = req.body;
    if (!id) return res.status(400).json({ error: "Drop ID required" });

    const { error } = await supabase.from("drops").delete().eq("id", id);
    if (error) return res.status(500).json({ error: "Failed to delete drop" });
    return res.json({ success: true });
  }

  return res.status(405).json({ error: "Method not allowed" });
}
