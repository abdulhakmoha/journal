const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['Challenge', 'Funded', 'Personal', 'Backtesting'], default: 'Challenge' },
  target: { type: Number, default: 8 },
  status: { type: String, enum: ['Active', 'Passed', 'Blown'], default: 'Active' },
  initialBalance: { type: Number, default: 10000 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Account', accountSchema);
