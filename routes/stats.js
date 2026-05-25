const express = require("express");
const router = express.Router();
const Order = require("../models/Order");
const User = require("../models/User");
const MenuItem = require("../models/MenuItem");
const { protect, adminOnly } = require("../middleware/auth");

// GET /api/stats/dashboard — get all dashboard stats (admin only)
router.get("/dashboard", protect, adminOnly, async (req, res) => {
  try {
    // Total orders
    const totalOrders = await Order.countDocuments();

    // Pending orders
    const pendingOrders = await Order.countDocuments({
      orderStatus: { $in: ["pending", "confirmed", "preparing"] },
    });

    // Revenue today (paid orders created today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const revenueTodayData = await Order.aggregate([
      {
        $match: {
          paymentStatus: "paid",
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalAmount" },
        },
      },
    ]);
    const revenueToday =
      revenueTodayData.length > 0 ? revenueTodayData[0].total : 0;

    // Total users
    const totalUsers = await User.countDocuments();

    // Completed orders today
    const completedTodayData = await Order.aggregate([
      {
        $match: {
          orderStatus: "completed",
          createdAt: { $gte: today, $lt: tomorrow },
        },
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
        },
      },
    ]);
    const completedToday =
      completedTodayData.length > 0 ? completedTodayData[0].count : 0;

    // Orders by status (for chart)
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

    // Payment methods breakdown
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
      revenueToday,
      totalUsers,
      completedToday,
      ordersByStatus,
      paymentMethods,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
