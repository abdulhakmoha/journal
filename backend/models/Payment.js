const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan: { type: String, enum: ['Pro', 'Elite', 'Premium'], required: true },
  amount: { type: Number, required: true },
  method: { type: String, enum: ['Crypto', 'Mobile Money'], required: true },
  transactionId: { type: String, required: true }, // Hash ID or Trans ID
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
