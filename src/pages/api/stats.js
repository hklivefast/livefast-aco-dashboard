import { getSession } from "../../lib/session";
import { getServiceSupabase } from "../../lib/supabase";

export default async function handler(req, res) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: "Unauthorized" });

  const sb = getServiceSupabase();

  try {
    const userFilter = session.isAdmin ? {} : { user_id: session.userId };

    // Total orders + spend
    let ordersQuery = sb.from("orders").select("total_price, quantity, status, retailer, product_name, order_date");
    if (!session.isAdmin) ordersQuery = ordersQuery.eq("user_id", session.userId);
    const { data: orders } = await ordersQuery;

    const totalSpend = (orders || []).reduce((s, o) => s + (parseFloat(o.total_price) || 0), 0);
    const totalOrders = (orders || []).length;
    const totalQuantity = (orders || []).reduce((s, o) => s + (o.quantity || 0), 0);
    const activeOrders = (orders || []).filter((o) => ["placed", "processing", "shipped"].includes(o.status)).length;
    const deliveredOrders = (orders || []).filter((o) => o.status === "delivered").length;
    const cancelledOrders = (orders || []).filter((o) => o.status === "cancelled").length;
    const avgOrder = totalOrders > 0 ? (totalSpend / totalOrders).toFixed(2) : 0;
    const fulfillmentRate = totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

    // Top products
    const productMap = {};
    (orders || []).forEach((o) => {
      if (!productMap[o.product_name]) {
        productMap[o.product_name] = { name: o.product_name, orders: 0, units: 0, total: 0, delivered: 0 };
      }
      productMap[o.product_name].orders++;
      productMap[o.product_name].units += o.quantity || 0;
      productMap[o.product_name].total += parseFloat(o.total_price) || 0;
      if (o.status === "delivered") productMap[o.product_name].delivered++;
    });
    const topProducts = Object.values(productMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10)
      .map((p) => ({
        ...p,
        avg: p.orders > 0 ? (p.total / p.orders).toFixed(2) : 0,
        fulfilled: p.orders > 0 ? ((p.delivered / p.orders) * 100).toFixed(1) : 0,
      }));

    // Tracking stats
    const inTransit = (orders || []).filter((o) => o.status === "shipped").length;
    const late = (orders || []).filter((o) => o.status === "shipped" && o.eta && new Date(o.eta) < new Date()).length;

    return res.json({
      totalSpend,
      totalOrders,
      totalQuantity,
      avgOrder,
      fulfillmentRate,
      activeOrders,
      deliveredOrders,
      cancelledOrders,
      inTransit,
      late,
      topProducts,
    });
  } catch (err) {
    console.error("Stats error:", err);
    return res.status(500).json({ error: "Failed to compute stats" });
  }
}
