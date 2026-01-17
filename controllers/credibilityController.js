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

    const article = await Article.findOne({ articleId });

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    const analysis = await credibilityEngine.analyzeCredibility(article);

    const credibilityScore = new CredibilityScore({
      articleId: article.articleId,
      finalScore: analysis.finalScore,
      riskLevel: analysis.riskLevel,
      scores: analysis.scores,
      explanationTags: analysis.explanationTags,
      sourceMetadata: {
        name: analysis.sourceMetadata.name,
        domain: analysis.sourceMetadata.domain,
        trust: analysis.sourceMetadata.trust,
        bias: analysis.sourceMetadata.bias,
        transparency: analysis.sourceMetadata.transparency,
        category: analysis.sourceMetadata.category
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await credibilityScore.save();

    res.status(200).json({
      success: true,
      credibility: credibilityScore
    });

  } catch (error) {
    console.error('❌ Error in analyzeArticleCredibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during analysis'
    });
  }
};

/**
 * @desc    Get credibility score for an article
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
        message: 'Score not found'
      });
    }

    res.status(200).json({
      success: true,
      credibility: score
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

/**
 * @desc    Analyze credibility of a news URL
 * @route   POST /api/credibility/analyze-url
 * @access  Private
 */
exports.analyzeUrlCredibility = async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ success: false, message: 'Please provide a URL' });
    }

    console.log(`\n🌐 URL Credibility analysis request: ${url}`);

    const existingScore = await CredibilityScore.findOne({
      'sourceMetadata.url': url,
      expiresAt: { $gt: new Date() }
    });

    if (existingScore) {
      return res.status(200).json({ success: true, fromCache: true, credibility: existingScore });
    }

    const articleData = {
      url: url,
      uri: url,
      title: 'Breaking News',
      source: 'URL Submission'
    };

    const analysis = await credibilityEngine.analyzeCredibility(articleData);

    const credibilityScore = new CredibilityScore({
      articleId: `url-${Buffer.from(url).toString('base64').substring(0, 16)}`,
      finalScore: analysis.finalScore,
      riskLevel: analysis.riskLevel,
      scores: analysis.scores,
      explanationTags: analysis.explanationTags,
      sourceMetadata: {
        name: analysis.sourceMetadata.name,
        domain: analysis.sourceMetadata.domain,
        trust: analysis.sourceMetadata.trust,
        bias: analysis.sourceMetadata.bias,
        transparency: analysis.sourceMetadata.transparency,
        category: analysis.sourceMetadata.category,
        url: url
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await credibilityScore.save();

    res.status(200).json({
      success: true,
      credibility: credibilityScore
    });

  } catch (error) {
    console.error('❌ Error in analyzeUrlCredibility:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during URL analysis'
    });
  }
};

/**
 * @desc    Analyze credibility of manual content
 * @route   POST /api/credibility/analyze-content
 * @access  Private
 */
exports.analyzeContentCredibility = async (req, res) => {
  try {
    const { title, content } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: 'Please provide title and content' });
    }

    console.log(`\n📝 Manual Credibility analysis: "${title.substring(0, 50)}..."`);

    const articleData = {
      title: title,
      body: content,
      source: 'Manual Submission'
    };

    const analysis = await credibilityEngine.analyzeCredibility(articleData);

    const credibilityScore = new CredibilityScore({
      articleId: `manual-${Date.now()}`,
      finalScore: analysis.finalScore,
      riskLevel: analysis.riskLevel,
      scores: analysis.scores,
      explanationTags: analysis.explanationTags,
      sourceMetadata: {
        name: 'Manual Submission',
        domain: 'manual',
        trust: 50,
        bias: 'unknown',
        transparency: 50,
        category: 'user'
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    await credibilityScore.save();

    res.status(200).json({
      success: true,
      credibility: credibilityScore
    });

  } catch (error) {
    console.error('❌ Error in analyzeContentCredibility:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error during content analysis'
    });
  }
};

module.exports = exports;