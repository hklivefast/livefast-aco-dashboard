import { getSupabase } from "@/lib/supabase";
import { getSessionCookie, verifySession } from "@/lib/session";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const token = getSessionCookie(req);
  if (!token) return res.status(401).json({ error: "Not authenticated" });
  const session = await verifySession(token);
  if (!session) return res.status(401).json({ error: "Invalid session" });

  try {
    const supabase = getSupabase();
    const userId = session.id;

    // Fetch all orders for this user including new v3 columns
    const { data: orders, error } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", userId)
      .order("order_date", { ascending: false });

    if (error) throw error;

    // Compute stats
    const totalOrders = orders.length;
    const totalSpend = orders
      .filter((o) => o.total != null)
      .reduce((sum, o) => sum + Number(o.total), 0);

    const byRetailer = {};
    const byStatus = {};
    const retailerSpend = {};
    for (const o of orders) {
      byRetailer[o.retailer] = (byRetailer[o.retailer] || 0) + 1;
      byStatus[o.status] = (byStatus[o.status] || 0) + 1;
      if (o.total) {
        retailerSpend[o.retailer] = (retailerSpend[o.retailer] || 0) + Number(o.total);
      }
    }

    // Recent orders (last 20)
    const recentOrders = orders.slice(0, 20);

    // Monthly spend breakdown (last 6 months)
    const monthlySpend = {};
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthlySpend[key] = 0;
    }
    for (const o of orders) {
      if (!o.order_date || !o.total) continue;
      const key = o.order_date.substring(0, 7);
      if (key in monthlySpend) {
        monthlySpend[key] += Number(o.total);
      }
    }

    // Active shipments (shipped but not delivered)
    const activeShipments = orders.filter(
      (o) => o.status === "Shipped" || o.status === "Out for Delivery" || o.status === "In Transit"
    );

    // Fulfillment stats
    const delivered = orders.filter(o => o.status === "Delivered").length;
    const cancelled = orders.filter(o => o.status === "Cancelled" || o.status === "Refunded").length;
    const fulfillmentRate = totalOrders > 0
      ? Math.round((delivered / (totalOrders - cancelled || 1)) * 100)
      : 0;

    // Average order value
    const ordersWithTotal = orders.filter(o => o.total != null);
    const avgOrderValue = ordersWithTotal.length > 0
      ? (totalSpend / ordersWithTotal.length).toFixed(2)
      : "0.00";

    // Items with tracking
    const withTracking = orders.filter(o => o.tracking_number).length;

    // Parse items_json for top products
    const productSpend = {};
    for (const o of orders) {
      if (!o.total) continue;
      let itemNames = [o.item];
      if (o.items_json) {
        try { itemNames = JSON.parse(o.items_json); } catch {}
      }
      const perItem = Number(o.total) / itemNames.length;
      for (const name of itemNames) {
        if (!productSpend[name]) productSpend[name] = { item: name, retailer: o.retailer, spend: 0, qty: 0 };
        productSpend[name].spend += perItem;
        productSpend[name].qty += 1;
      }
    }
    const topProducts = Object.values(productSpend)
      .sort((a, b) => b.spend - a.spend)
      .slice(0, 15);

    return res.status(200).json({
      orders: recentOrders,
      allOrders: orders,
      activeShipments,
      topProducts,
      stats: {
        totalOrders,
        totalSpend: totalSpend.toFixed(2),
        byRetailer,
        byStatus,
        retailerSpend,
        monthlySpend,
        fulfillmentRate,
        avgOrderValue,
        withTracking,
        delivered,
        cancelled,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    return res.status(500).json({ error: "Failed to load dashboard data" });
  }
}
