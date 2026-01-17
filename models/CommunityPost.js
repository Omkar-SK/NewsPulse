const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  articleId: {
    type: String,
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  // Snapshot of article data at time of sharing
  articleData: {
    title: String,
    summary: String,
    image: String,
    url: String,
    source: String,
    category: String,
    credibilityScore: Number
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  commentCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
CommunityPostSchema.index({ createdAt: -1 });
CommunityPostSchema.index({ userId: 1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);
