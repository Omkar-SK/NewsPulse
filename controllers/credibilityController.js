const Article = require('../models/Article');
const CredibilityScore = require('../models/CredibilityScore');
const credibilityEngine = require('../utils/credibilityEngine');

/**
 * @desc    Analyze credibility of an article
 * @route   GET /api/credibility/analyze/:articleId
 * @access  Public
 */
exports.analyzeArticleCredibility = async (req, res) => {
  try {
    const { articleId } = req.params;

    console.log(`\n🔍 Credibility analysis request for: ${articleId}`);

    // Check if we have a cached credibility score (valid for 24 hours)
    const existingScore = await CredibilityScore.findOne({
      articleId,
      expiresAt: { $gt: new Date() }
    });

    if (existingScore) {
      console.log(`📦 Returning cached credibility score (${existingScore.finalScore}/100)`);
      return res.status(200).json({
        success: true,
        fromCache: true,
        credibility: existingScore
      });
    }

    // Fetch FULL article from database
    const article = await Article.findOne({ articleId });

    if (!article) {
      console.error(`❌ Article not found: ${articleId}`);
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    console.log(`📰 Article found:`, {
      title: article.title?.substring(0, 60) + '...',
      source: article.source,
      url: article.url,
      hasBody: !!article.body,
      bodyLength: article.body?.length || 0,
      hasSummary: !!article.summary,
      summaryLength: article.summary?.length || 0
    });

    // Prepare article data for analysis
    const articleData = {
      title: article.title,
      summary: article.summary || '',
      body: article.body || article.summary || '', // Use body if available, fallback to summary
      source: article.source,
      url: article.url,
      uri: article.uri,
      lang: article.lang
    };

    // Log what we're sending for analysis
    console.log(`📤 Sending for analysis:`, {
      titleLength: articleData.title?.length,
      summaryLength: articleData.summary?.length,
      bodyLength: articleData.body?.length,
      source: articleData.source
    });

    // Analyze credibility
    const analysis = await credibilityEngine.analyzeCredibility(articleData);

    // Save to database
    const credibilityScore = new CredibilityScore({
      articleId: article.articleId,
      finalScore: analysis.finalScore,
      riskLevel: analysis.riskLevel,
      scores: analysis.scores,
      explanationTags: analysis.explanationTags,
      sourceMetadata: analysis.sourceMetadata,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    });

    await credibilityScore.save();

    console.log(`💾 Credibility score saved: ${analysis.finalScore}/100 (${analysis.riskLevel} risk)\n`);

    res.status(200).json({
      success: true,
      fromCache: false,
      credibility: credibilityScore
    });

  } catch (error) {
    console.error('❌ Error in analyzeArticleCredibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get credibility score for an article (if exists)
 * @route   GET /api/credibility/score/:articleId
 * @access  Public
 */
exports.getCredibilityScore = async (req, res) => {
  try {
    const { articleId } = req.params;

    const score = await CredibilityScore.findOne({
      articleId,
      expiresAt: { $gt: new Date() }
    });

    if (!score) {
      return res.status(404).json({
        success: false,
        message: 'Credibility score not found'
      });
    }

    res.status(200).json({
      success: true,
      credibility: score
    });

  } catch (error) {
    console.error('❌ Error in getCredibilityScore:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = exports;