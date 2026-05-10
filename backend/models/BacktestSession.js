const mongoose = require('mongoose');

const backtestTradeSchema = new mongoose.Schema({
  symbol: { type: String },
  type: { type: String, enum: ['Long', 'Short'], required: true },
  entry: { type: Number },
  sl: { type: Number },
  tp: { type: Number },
  status: { type: String, enum: ['Win', 'Loss', 'BE'], required: true },
  rr: { type: Number },
  beforeChart: { type: String },
  afterChart: { type: String },
  notes: { type: String },
  isMistake: { type: Boolean, default: false },
  tradeDate: { type: Date, default: Date.now },
  tradeTime: { type: String },
  customData: { type: Map, of: String },
  timestamp: { type: Date, default: Date.now }
});

const backtestSessionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  strategy: { type: String },
  pair: { type: String },
  account: { type: String },
  summary: { type: String },
  trades: [backtestTradeSchema],
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BacktestSession', backtestSessionSchema);
