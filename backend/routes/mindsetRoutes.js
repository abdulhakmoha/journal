const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Mindset = require('../models/Mindset');

// @route   POST api/mindset
// @desc    Save a new mindset reflection
router.post('/', auth, async (req, res) => {
  try {
    const { reflection, mood } = req.body;
    const newEntry = new Mindset({
      user: req.user,
      reflection,
      mood
    });
    await newEntry.save();
    res.status(201).json(newEntry);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/mindset
// @desc    Get all reflections for the user
router.get('/', auth, async (req, res) => {
  try {
    const history = await Mindset.find({ user: req.user }).sort({ timestamp: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/mindset/:id
// @desc    Delete a reflection
router.delete('/:id', auth, async (req, res) => {
  try {
    const entry = await Mindset.findOne({ _id: req.params.id, user: req.user });
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    await entry.deleteOne();
    res.json({ message: 'Entry removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
