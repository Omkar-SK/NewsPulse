const mongoose = require('mongoose');

const UserPreferenceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  categoryScores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  sourceScores: {
    type: Map,
    of: Number,
    default: new Map()
  },
  sentimentPreference: {
    positive: { type: Number, default: 0 },
    negative: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 }
  },
  totalInteractions: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Update lastUpdated before saving
UserPreferenceSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

module.exports = mongoose.model('UserPreference', UserPreferenceSchema);