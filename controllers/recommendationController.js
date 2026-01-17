const Article = require('../models/Article');
const recommendationEngine = require('../utils/recommendationEngine');

// @desc    Get personalized recommendations for user
// @route   GET /api/recommendations
// @access  Private
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 15;

    // Get all available articles
    const articles = await Article.find({
      expiresAt: { $gt: new Date() }
    }).sort({ publishedAt: -1 });

    if (articles.length === 0) {
      return res.json({
        success: true,
        recommendations: [],
        message: 'No articles available'
      });
    }

    // Get personalized recommendations
    const recommendations = await recommendationEngine.getRecommendations(
      userId,
      articles,
      limit
    );

    res.json({
      success: true,
      count: recommendations.length,
      recommendations: recommendations.map(article => ({
        articleId: article.articleId,
        title: article.title,
        summary: article.summary,
        image: article.image,
        source: article.source,
        publishedAt: article.publishedAt,
        category: article.category,
        url: article.url,
        sentiment: article.sentiment,
        reactions: article.reactions,
        score: article.score // Recommendation score
      }))
    });

  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching recommendations',
      error: error.message
    });
  }
};

// @desc    Get user preferences
// @route   GET /api/recommendations/preferences
// @access  Private
exports.getUserPreferences = async (req, res) => {
  try {
    const UserPreference = require('../models/UserPreference');
    const userId = req.user.id;

    let userPref = await UserPreference.findOne({ user: userId });

    if (!userPref) {
      return res.json({
        success: true,
        preferences: null,
        message: 'No preferences found. Start liking articles!'
      });
    }

    // Convert Maps to objects for JSON response
    const categoryScores = {};
    userPref.categoryScores.forEach((value, key) => {
      categoryScores[key] = value;
    });

    const sourceScores = {};
    userPref.sourceScores.forEach((value, key) => {
      sourceScores[key] = value;
    });

    res.json({
      success: true,
      preferences: {
        categoryScores,
        sourceScores,
        sentimentPreference: userPref.sentimentPreference,
        totalInteractions: userPref.totalInteractions,
        lastUpdated: userPref.lastUpdated
      }
    });

  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching preferences',
      error: error.message
    });
  }
};