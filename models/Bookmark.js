const mongoose = require('mongoose');

const BookmarkSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  articleId: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  summary: {
    type: String
  },
  image: {
    type: String
  },
  source: {
    type: String
  },
  url: {
    type: String,
    required: true
  },
  category: {
    type: String
  },
  sentiment: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index to ensure user can't bookmark same article twice
BookmarkSchema.index({ user: 1, articleId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', BookmarkSchema);