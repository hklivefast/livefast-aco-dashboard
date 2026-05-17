import { getSession } from "../../lib/session";
import { getServiceSupabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const sb = getServiceSupabase();

  if (req.method === "GET") {
    const { status } = req.query;
    let query = sb.from("invoices").select("*").order("issued_date", { ascending: false });
    if (!session.isAdmin) query = query.eq("user_id", session.userId);
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ invoices: data });
  }

  if (req.method === "POST") {
    if (!session.isAdmin) return res.status(403).json({ error: "Admin only" });
    const { client_name, amount, user_id, notes, due_date, pas_fee_rate = 18 } = req.body;

    // Auto-generate invoice number
    const { count } = await sb.from("invoices").select("*", { count: "exact", head: true });
    const invoiceNumber = `INV-${new Date().getFullYear()}-${String((count || 0) + 1).padStart(3, "0")}`;
    const pas_fee_amount = (amount * pas_fee_rate / 100).toFixed(2);

    const { data, error } = await sb.from("invoices").insert({
      invoice_number: invoiceNumber,
      client_name,
      amount,
      user_id,
      notes,
      due_date,
      pas_fee_rate,
      pas_fee_amount,
    }).select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data);
  }

  if (req.method === "PATCH") {
    if (!session.isAdmin) return res.status(403).json({ error: "Admin only" });
    const { id, ...updates } = req.body;
    const { data, error } = await sb.from("invoices").update(updates).eq("id", id).select().single();
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data);
  }

  return res.status(405).json({ error: "Method not allowed" });
}
