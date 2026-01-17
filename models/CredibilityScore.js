const mongoose = require('mongoose');

const CredibilityScoreSchema = new mongoose.Schema({
  articleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Final credibility score (0-100)
  finalScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },

  // Risk level: high, medium, low
  riskLevel: {
    type: String,
    enum: ['high', 'medium', 'low'],
    required: true
  },

  // Component scores
  scores: {
    sourceCredibility: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 35 }
    },
    crossSourceVerification: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 35 },
      sourcesFound: [String],
      totalSourcesChecked: { type: Number, default: 0 }
    },
    aiContentAnalysis: {
      score: { type: Number, default: 0 },
      weight: { type: Number, default: 25 },
      signals: {
        sensationalism: { type: Number, default: 0 },
        emotionalManipulation: { type: Number, default: 0 },
        clickbaitProbability: { type: Number, default: 0 },
        biasIndicators: { type: Number, default: 0 },
        evidenceQuality: { type: Number, default: 0 }
      }
    },
    communitySignals: {
      score: { type: Number, default: 50 },
      weight: { type: Number, default: 5 }
    }
  },

  // Explanation tags
  explanationTags: [String],

  // Source metadata
  sourceMetadata: {
    name: String,
    domain: String,
    trust: Number,
    bias: String,
    transparency: Number,
    category: String,
    url: String // Added for URL submissions
  },

  // Cache timestamp
  calculatedAt: {
    type: Date,
    default: Date.now
  },

  // Expire after 24 hours
  expiresAt: {
    type: Date,
    required: true,
    index: true
  }
}, {
  timestamps: true
});

// Auto-delete expired scores
CredibilityScoreSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('CredibilityScore', CredibilityScoreSchema);