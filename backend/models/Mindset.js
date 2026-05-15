const mongoose = require('mongoose');

const mindsetSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  reflection: { type: String, required: true },
  mood: { type: String, enum: ['Confident', 'Fearful', 'Aggressive', 'Calm', 'Neutral'], default: 'Neutral' },
  timestamp: { type: Date, default: Date.now, index: true }
});

// Compound index for fast user history lookup
mindsetSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model('Mindset', mindsetSchema);
