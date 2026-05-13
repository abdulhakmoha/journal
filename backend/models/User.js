const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  disciplineScore: { type: Number, default: 0 },
  formFields: {
    type: [{
      label: String,
      type: { type: String, default: 'dropdown' },
      options: [String]
    }],
    default: [
      { label: 'Trading Account', type: 'dropdown', options: ['Personal Account'] },
      { label: 'Pair', type: 'dropdown', options: ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'US30'] },
      { label: 'Strategy', type: 'dropdown', options: ['Price Action', 'SMC', 'ICT', 'Scalping'] },
      { label: 'Timeframe', type: 'dropdown', options: ['1m', '5m', '15m', '1h', '4h', 'Daily'] },
      { label: 'Trading Session', type: 'dropdown', options: ['London', 'New York', 'Asia'] }
    ]
  },
  backtestFields: {
    type: [{
      label: String,
      type: { type: String, default: 'dropdown' },
      options: [String]
    }],
    default: [
      { label: 'Pair', type: 'dropdown', options: ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD', 'US30'] },
      { label: 'Strategy', type: 'dropdown', options: ['Price Action', 'SMC', 'ICT', 'Scalping'] },
      { label: 'Session', type: 'dropdown', options: ['London', 'New York', 'Asia'] }
    ]
  },
  customRules: { type: [String], default: [
    'Liquidity Sweep / Grab',
    'Market Structure Shift (MSS)',
    'Fair Value Gap (FVG) Tap',
    'Killzone Timing (London/NY)',
    'No High Impact News'
  ] },
  subscription: {
    plan: { type: String, enum: ['Free', 'Premium'], default: 'Free' },
    status: { type: String, enum: ['active', 'expired', 'pending'], default: 'active' },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date }
  },
  isAdmin: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
