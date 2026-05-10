const express = require('express');
const Trade = require('../models/Trade');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/trades
router.get('/', auth, async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user }).sort({ timestamp: -1 });
    res.json(trades);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/trades
router.post('/', auth, async (req, res) => {
  try {
    console.log('Saving Trade Body:', req.body);
    const newTrade = new Trade({
      ...req.body,
      user: req.user
    });
    const trade = await newTrade.save();
    res.json(trade);
  } catch (err) {
    console.error('Trade Save Error:', err);
    res.status(500).json({ message: 'Server error: ' + err.message });
  }
});

// @route   PUT api/trades/:id
router.put('/:id', auth, async (req, res) => {
  try {
    let trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    trade = await Trade.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
    res.json(trade);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/trades/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);
    if (!trade) return res.status(404).json({ message: 'Trade not found' });
    if (trade.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });

    await trade.deleteOne();
    res.json({ message: 'Trade removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
