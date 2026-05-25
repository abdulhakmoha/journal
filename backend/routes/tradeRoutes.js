const express = require('express');
const Trade = require('../models/Trade');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { getNewsCalendar } = require('./newsRoutes');
const router = express.Router();

async function checkNewsConflict(symbol, tradeTimestampStr) {
  if (!symbol || !tradeTimestampStr) return { newsConflict: false, newsEvent: '' };
  
  try {
    const upperSym = symbol.toUpperCase().trim();
    const currencies = [];
    const majors = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'];
    majors.forEach(curr => {
      if (upperSym.includes(curr)) {
        currencies.push(curr);
      }
    });
    if (currencies.length === 0 && upperSym.length >= 3) {
      currencies.push(upperSym.substring(0, 3));
    }
    
    const newsEvents = await getNewsCalendar();
    const tradeTime = new Date(tradeTimestampStr).getTime();
    const THIRTY_MINUTES_MS = 30 * 60 * 1000;
    
    for (const event of newsEvents) {
      if (event.impact !== 'High') continue;
      
      const eventTime = new Date(event.date).getTime();
      if (isNaN(eventTime)) continue;
      
      const diff = Math.abs(tradeTime - eventTime);
      if (diff <= THIRTY_MINUTES_MS) {
        const countryMatch = currencies.includes(event.country.toUpperCase()) || event.country.toUpperCase() === 'ALL';
        if (countryMatch) {
          return {
            newsConflict: true,
            newsEvent: `${event.country} ${event.title}`
          };
        }
      }
    }
  } catch (error) {
    console.error('Error during news conflict check:', error);
  }
  
  return { newsConflict: false, newsEvent: '' };
}

// @route   GET api/trades
router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;

    const trades = await Trade.find({ user: req.user })
      .sort({ date: -1, timestamp: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Trade.countDocuments({ user: req.user });
    
    res.json({
      trades,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/trades
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user);
    const tradeCount = await Trade.countDocuments({ user: req.user });

    // Subscription Check Logic
    const isExpired = user.subscription?.endDate && new Date() > new Date(user.subscription.endDate);
    const currentPlan = isExpired ? 'Free' : user.subscription.plan;

    if (currentPlan !== 'Premium' && !user.isAdmin && tradeCount >= 5) {
      return res.status(403).json({ 
        message: 'Tijaabadii 5-ta Trade way dhammaatay! Fadlan u cusboonaysii Premium si aad u sii waddo journaling-ka.' 
      });
    }

    console.log('Saving Trade Body:', req.body);
    
    // Check for economic news conflicts
    const { newsConflict, newsEvent } = await checkNewsConflict(req.body.symbol, req.body.timestamp || req.body.date);
    
    const newTrade = new Trade({
      ...req.body,
      newsConflict,
      newsEvent,
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

    const updateData = { ...req.body };
    
    // Re-check news conflicts if symbol or timestamp changes
    if (req.body.symbol || req.body.timestamp || req.body.date) {
      const activeSym = req.body.symbol || trade.symbol;
      const activeTime = req.body.timestamp || req.body.date || trade.timestamp || trade.date;
      const { newsConflict, newsEvent } = await checkNewsConflict(activeSym, activeTime);
      updateData.newsConflict = newsConflict;
      updateData.newsEvent = newsEvent;
    }

    trade = await Trade.findByIdAndUpdate(req.params.id, { $set: updateData }, { new: true });
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
