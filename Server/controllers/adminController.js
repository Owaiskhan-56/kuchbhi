import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

// GET /api/admin/stats
export const getStats = async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalProducts = await Product.countDocuments();
  const totalOrders = await Order.countDocuments();

  const revenue = await Order.aggregate([
    { $match: { orderStatus: { $ne: "Cancelled" } } },
    { $group: { _id: null, total: { $sum: "$totalPrice" } } },
  ]);
  const totalRevenue = revenue[0]?.total || 0;

  const recentOrders = await Order.find().sort("-createdAt").limit(5);

  // sales of the last 6 months (for the chart)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);
  sixMonthsAgo.setHours(0, 0, 0, 0);

  const monthlySales = await Order.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo }, orderStatus: { $ne: "Cancelled" } } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        sales: { $sum: "$totalPrice" },
        orders: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({
    success: true,
    stats: { totalUsers, totalProducts, totalOrders, totalRevenue },
    recentOrders,
    monthlySales,
  });
};

// GET /api/admin/orders?status=Pending
export const getAllOrders = async (req, res) => {
  const filter = req.query.status ? { orderStatus: req.query.status } : {};
  const orders = await Order.find(filter).sort("-createdAt");
  res.json({ success: true, orders });
};

// GET /api/admin/orders/:id
export const getAdminOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }
  res.json({ success: true, order });
};

// PUT /api/admin/orders/:id/status   body: { status }
export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  // put stock back if the order is cancelled
  if (status === "Cancelled" && order.orderStatus !== "Cancelled") {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
    }
  }

  order.orderStatus = status;

  // Cash on Delivery is paid when the order is delivered
  if (status === "Delivered") {
    order.deliveredAt = new Date();
    if (!order.isPaid) {
      order.isPaid = true;
      order.paidAt = new Date();
    }
  }

  await order.save();
  res.json({ success: true, order });
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  const users = await User.find().sort("-createdAt");
  res.json({ success: true, users });
};