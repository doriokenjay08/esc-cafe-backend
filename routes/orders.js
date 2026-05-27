const express = require('express');
const router  = express.Router();
const Order   = require('../models/Order');
const { protect, adminOnly } = require('../middleware/auth');

router.post('/', async (req, res) => {
  try {
    const { items, totalAmount, paymentMethod, customerName, customerEmail, customerPhone, userId } = req.body;
    if (!items || items.length === 0) return res.status(400).json({ message: 'No items in order' });
    const order = await Order.create({ user: userId || null, items, totalAmount, paymentMethod, customerName, customerEmail, customerPhone });
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus, paymentMethod, sort } = req.query;
    const filter = {};
    if (orderStatus) filter.orderStatus = orderStatus;
    if (paymentMethod) filter.paymentMethod = paymentMethod;
    const sortOption = sort === 'asc' ? { createdAt: 1 } : { createdAt: -1 };
    const orders = await Order.find(filter).populate('user', 'name email').sort(sortOption);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const update = { orderStatus };
    if (orderStatus === 'confirmed' || orderStatus === 'completed') {
      update.paymentStatus = 'paid';
    }
    const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order) return res.status(404).json({ message: 'Order not found' });
    res.json({ message: 'Order deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;