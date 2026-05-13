const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/user/profile
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Auto-downgrade expired subscriptions
    if (user.subscription && user.subscription.plan === 'Premium' && user.subscription.endDate) {
      if (new Date() > new Date(user.subscription.endDate)) {
        await User.updateOne(
          { _id: user._id },
          { $set: { 'subscription.plan': 'Free', 'subscription.status': 'expired' } }
        );
        user.subscription.plan = 'Free';
        user.subscription.status = 'expired';
      }
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/user/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, customRules, formFields, backtestFields } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user,
      { $set: { name, customRules, formFields, backtestFields } },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
