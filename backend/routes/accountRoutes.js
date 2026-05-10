const express = require('express');
const Account = require('../models/Account');
const auth = require('../middleware/auth');
const router = express.Router();

// @route   GET api/accounts
// @desc    Get all accounts for a user
router.get('/', auth, async (req, res) => {
  try {
    const accounts = await Account.find({ user: req.user });
    res.json(accounts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/accounts
// @desc    Add new account
router.post('/', auth, async (req, res) => {
  try {
    const newAccount = new Account({
      ...req.body,
      user: req.user
    });
    const account = await newAccount.save();
    res.json(account);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/accounts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);
    if (!account) return res.status(404).json({ message: 'Account not found' });
    if (account.user.toString() !== req.user) return res.status(401).json({ message: 'Not authorized' });
    
    await account.deleteOne();
    res.json({ message: 'Account removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
