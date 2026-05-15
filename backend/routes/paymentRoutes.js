const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Payment = require('../models/Payment');
const User = require('../models/User');

// @route   POST api/payments/request
// @desc    Request a subscription upgrade
router.post('/request', auth, async (req, res) => {
  try {
    const { plan, amount, method, transactionId } = req.body;
    
    const newPayment = new Payment({
      user: req.user,
      plan,
      amount,
      method,
      transactionId
    });

    await newPayment.save();
    res.status(201).json({ message: 'Lacag-bixintaada waa lala socdaa. Fadlan sug inta laga xaqiijinayo.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/payments/admin/all
// @desc    Get all payment requests (Admin only)
router.get('/admin/all', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user.isAdmin) return res.status(403).json({ message: 'Access denied' });

    const payments = await Payment.find().populate('user', 'name email').sort({ createdAt: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/payments/admin/approve/:id
// @desc    Approve a payment (Admin only)
router.put('/admin/approve/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user.isAdmin) return res.status(403).json({ message: 'Access denied' });

    const payment = await Payment.findById(req.id || req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = 'approved';
    await payment.save();

    // Update user subscription
    const subscriber = await User.findById(payment.user);
    const months = 1; // Default 1 month
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + months);

    subscriber.subscription = {
      plan: payment.plan,
      status: 'active',
      startDate: new Date(),
      endDate: endDate
    };

    await subscriber.save();
    res.json({ message: 'Payment approved and subscription activated!' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/payments/admin/reject/:id
// @desc    Reject a payment (Admin only)
router.put('/admin/reject/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    if (!user.isAdmin) return res.status(403).json({ message: 'Access denied' });

    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ message: 'Payment not found' });

    payment.status = 'rejected';
    await payment.save();

    res.json({ message: 'Payment rejected' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
