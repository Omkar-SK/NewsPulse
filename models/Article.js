const mongoose = require('mongoose');

const ArticleSchema = new mongoose.Schema({
  articleId: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  summary: String,
  body: String,
  image: String,
  source: String,
  url: String,
  category: String,
  sentiment: {
    type: Number,
    default: 0
  },
  publishedAt: Date,
  uri: String,
  lang: String,
  shares: {
    type: Number,
    default: 0
  },
  cacheKey: String,
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  aiSummary: {
  type: String,
  default: null
},
aiSummaryGeneratedAt: {
  type: Date,
  default: null
}
}, {
  timestamps: true
});

// Index for faster queries
ArticleSchema.index({ cacheKey: 1, expiresAt: 1 });
ArticleSchema.index({ articleId: 1 });

module.exports = mongoose.model('Article', ArticleSchema);