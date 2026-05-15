const mongoose = require('mongoose');

const tradeSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  account: { type: String, required: true }, // The name or ID of the linked account
  symbol: { type: String, required: true },
  type: { type: String, enum: ['Long', 'Short'], required: true },
  risk: { type: Number },
  reward: { type: Number },
  riskUnit: { type: String, default: '%' },
  riskPercent: { type: Number, default: 1 },
  rr: { type: Number },
  strategy: { type: String },
  session: { type: String },
  timeframe: { type: String },
  beforeChart: { type: String },
  afterChart: { type: String },
  preMindset: { type: String },
  postMindset: { type: String },
  status: { type: String, enum: ['Win', 'Loss', 'BE', 'Active'], default: 'Active' },
  isMistake: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  grade: { type: String },
  rules: { type: Map, of: Boolean },
  customData: { type: Map, of: String },
  date: { type: Date, default: Date.now },
  timestamp: { type: Date, default: Date.now }
});

// Performance Indexes
tradeSchema.index({ user: 1, date: -1 });
tradeSchema.index({ account: 1 });
tradeSchema.index({ symbol: 1 });

module.exports = mongoose.model('Trade', tradeSchema);
