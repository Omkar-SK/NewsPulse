const mongoose = require('mongoose');

const NewsletterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  email: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    required: true,
    default: Date.now
  },
  articles: [{
    articleId: String,
    title: String,
    summary: String,
    image: String,
    url: String,
    source: String,
    category: String,
    sentiment: Number
  }],
  status: {
    type: String,
    enum: ['sent', 'failed', 'pending'],
    default: 'pending'
  },
  error: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
NewsletterSchema.index({ user: 1, sentAt: -1 });
NewsletterSchema.index({ status: 1 });

module.exports = mongoose.model('Newsletter', NewsletterSchema);