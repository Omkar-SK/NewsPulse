const mongoose = require('mongoose');

const ReactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: String,
    required: true
  },
  reactionType: {
    type: String,
    enum: ['like', 'dislike', 'neutral'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to ensure user can only have one reaction per article
ReactionSchema.index({ user: 1, articleId: 1 }, { unique: true });

// Update the updatedAt field before saving
ReactionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Reaction', ReactionSchema);