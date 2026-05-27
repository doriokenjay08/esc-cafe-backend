const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/stats/dashboard — get all dashboard stats (admin only)
// GET /api/stats/dashboard?range=today|week|month — filter by period, default today
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    const range = req.query.range || "today";
    let start, end;
    const now = new Date();

    if (range === "week") {
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    } else if (range === "month") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else {
      // today — default
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
    }

    // Total orders in range
    const totalOrders = await Order.countDocuments({
      createdAt: { $gte: start, $lte: end },
    });

    // Pending orders in range
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["pending", "confirmed", "preparing"] },
      createdAt: { $gte: start, $lte: end },
    });

    // Revenue in range — only COMPLETED orders that are paid
    const revenueData = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          paymentStatus: "paid",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const revenue = revenueData.length > 0 ? revenueData[0].total : 0;

    // Total users
    const totalUsers = await User.countDocuments();

    // Completed orders in range
    const completedData = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          createdAt: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);
    const completed = completedData.length > 0 ? completedData[0].count : 0;

    // Orders by status (for chart) — no date filter to show full picture
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$orderStatus",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: 1 },
      },
    ]);

    // Payment methods breakdown — no date filter
    const paymentMethods = await Order.aggregate([
      {
        $group: {
          _id: "$paymentMethod",
          count: { $sum: 1 },
          revenue: { $sum: "$totalAmount" },
        },
      },
    ]);

    res.json({
      totalOrders,
      pendingOrders,
      revenue,
      totalUsers,
      completed,
      range,
      ordersByStatus,
      paymentMethods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
