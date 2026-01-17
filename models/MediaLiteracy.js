const mongoose = require('mongoose');

const MediaLiteracySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['credibility-basics', 'fact-checking', 'bias-detection', 'source-evaluation', 'misinformation-tactics', 'methodology'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  summary: {
    type: String,
    maxlength: 500
  },
  icon: {
    type: String,
    default: 'fa-book'
  },
  order: {
    type: Number,
    default: 0
  },
  relatedTopics: [{
    type: mongoose.Schema.ObjectId,
    ref: 'MediaLiteracy'
  }],
  tips: [{
    title: String,
    description: String
  }],
  examples: [{
    title: String,
    description: String,
    imageUrl: String
  }],
  status: {
    type: String,
    enum: ['draft', 'published'],
    default: 'published'
  },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster queries
MediaLiteracySchema.index({ slug: 1 });
MediaLiteracySchema.index({ category: 1, order: 1 });

module.exports = mongoose.model('MediaLiteracy', MediaLiteracySchema);
