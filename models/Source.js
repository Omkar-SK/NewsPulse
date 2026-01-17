const mongoose = require('mongoose');

const SourceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  url: {
    type: String,
    required: true
  },
  description: String,
  logo: String,
  
  // Credibility metrics
  reputationScore: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  biasRating: {
    type: String,
    enum: ['left', 'left-center', 'center', 'right-center', 'right', 'unknown'],
    default: 'unknown'
  },
  reliabilityRating: {
    type: String,
    enum: ['very-high', 'high', 'medium', 'low', 'very-low', 'unknown'],
    default: 'unknown'
  },
  
  // Metadata
  ownership: String,
  funding: String,
  country: String,
  founded: Date,
  
  // Statistics
  articlesCount: {
    type: Number,
    default: 0
  },
  averageCredibilityScore: {
    type: Number,
    default: null
  },
  
  // Verification
  verifiedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  verifiedAt: Date,
  
  // Status
  status: {
    type: String,
    enum: ['active', 'suspended', 'blacklisted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for faster queries
SourceSchema.index({ name: 1 });
SourceSchema.index({ reputationScore: -1 });

module.exports = mongoose.model('Source', SourceSchema);
