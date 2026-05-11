const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Account = require('../models/Account');
const router = express.Router();

// @route   GET api/auth/test
router.get('/test', (req, res) => {
  res.json({ message: 'Auth route is working' });
});

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, regCode } = req.body;
    
    // Check Registration Code
    const MASTER_CODE = process.env.REGISTRATION_CODE || 'ZEN2026';
    if (regCode !== MASTER_CODE) {
      return res.status(403).json({ message: 'Invalid Registration Code. Only authorized users can sign up.' });
    }
    
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    user = new User({ name, email, password });
    await user.save();

    // Create an initial account for the new user
    try {
      const initialAccount = new Account({
        user: user._id,
        name: 'Primary Account',
        type: 'Personal',
        initialBalance: 10000,
        target: 0
      });
      await initialAccount.save();
    } catch (accErr) {
      console.error('Account creation failed:', accErr.message);
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.status(201).json({ token, user: { id: user._id, name, email } });
  } catch (err) {
    console.error('SERVER_REG_ERROR:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// @route   POST api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', { expiresIn: '30d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email } });
  } catch (err) {
    console.error('Login Error Full Details:', err);
    res.status(500).json({ 
      message: 'Server error: ' + err.message,
      stack: err.stack
    });
  }
});

module.exports = router;
