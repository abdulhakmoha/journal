const express = require('express');
const BacktestSession = require('../models/BacktestSession');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/backtest
// @desc    Get all backtest sessions
router.get('/', auth, async (req, res) => {
  try {
    const sessions = await BacktestSession.find({ user: req.user }).sort({ date: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/backtest
// @desc    Create a backtest session
router.post('/', auth, async (req, res) => {
  try {
    const { name, strategy, pair, account } = req.body;
    const newSession = new BacktestSession({
      user: req.user,
      name,
      strategy,
      pair,
      account: account || 'Default',
      trades: []
    });
    const session = await newSession.save();
    res.json(session);
  } catch (err) {
    console.error('Error creating backtest session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/backtest/:id
// @desc    Update session (summary, name, etc.)
router.put('/:id', auth, async (req, res) => {
  try {
    const session = await BacktestSession.findOne({ _id: req.params.id, user: req.user });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const allowedFields = ['name', 'strategy', 'pair', 'account', 'summary'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        session[field] = req.body[field];
      }
    });

    await session.save();
    res.json(session);
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/backtest/:id/trades
// @desc    Add a trade to a session
router.post('/:id/trades', auth, async (req, res) => {
  try {
    const session = await BacktestSession.findOne({ _id: req.params.id, user: req.user });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const tradeData = { ...req.body };
    if (!tradeData.symbol) tradeData.symbol = session.pair || 'Unknown';

    // Use provided tradeDate or default to now
    if (!tradeData.tradeDate) tradeData.tradeDate = new Date();

    session.trades.push(tradeData);
    await session.save();
    res.json(session);
  } catch (err) {
    console.error('Error adding trade to backtest:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/backtest/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await BacktestSession.findOneAndDelete({ _id: req.params.id, user: req.user });
    if (!result) return res.status(404).json({ message: 'Session not found' });
    res.json({ message: 'Session deleted' });
  } catch (err) {
    console.error('Error deleting session:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/backtest/:id/trades/:tradeId
router.delete('/:id/trades/:tradeId', auth, async (req, res) => {
  try {
    const session = await BacktestSession.findOne({ _id: req.params.id, user: req.user });
    if (!session) return res.status(404).json({ message: 'Session not found' });

    const originalLength = session.trades.length;
    session.trades = session.trades.filter(t => t._id.toString() !== req.params.tradeId);

    if (session.trades.length === originalLength) {
      return res.status(404).json({ message: 'Trade not found' });
    }

    await session.save();
    res.json(session);
  } catch (err) {
    console.error('Error deleting trade:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
