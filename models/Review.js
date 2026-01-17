const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Review target (either article or source)
  targetType: {
    type: String,
    enum: ['article', 'source'],
    required: true
  },
  articleId: {
    type: String,
    default: null
  },
  sourceId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Source',
    default: null
  },
  
  // Review content
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  credibilityRating: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  comment: {
    type: String,
    required: true,
    maxlength: 2000
  },
  
  // Credibility factors
  accuracyRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  sourcingRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  biasRating: {
    type: Number,
    min: 1,
    max: 5,
    default: null
  },
  
  // Helpful votes
  helpfulVotes: {
    type: Number,
    default: 0
  },
  notHelpfulVotes: {
    type: Number,
    default: 0
  },
  
  // Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'approved'
  },
  moderatedBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  moderatedAt: Date,
  
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure user can only review each article/source once
ReviewSchema.index({ user: 1, articleId: 1 }, { 
  unique: true,
  partialFilterExpression: { articleId: { $ne: null } }
});
ReviewSchema.index({ user: 1, sourceId: 1 }, { 
  unique: true,
  partialFilterExpression: { sourceId: { $ne: null } }
});

// Update the updatedAt field before saving
ReviewSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Review', ReviewSchema);
