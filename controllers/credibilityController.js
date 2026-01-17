const Article = require('../models/Article');
const Source = require('../models/Source');
const Review = require('../models/Review');

// @desc    Calculate credibility score for an article
// @route   GET /api/credibility/article/:articleId
// @access  Public
exports.getArticleCredibility = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const article = await Article.findOne({ articleId }).populate('sourceMetadata');
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get reviews for this article
    const reviews = await Review.find({ 
      articleId, 
      status: 'approved' 
    });

    // Calculate credibility score
    const credibilityData = await calculateCredibilityScore(article, reviews);

    res.status(200).json({
      success: true,
      credibilityData
    });
  } catch (error) {
    console.error('Error getting article credibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit article for review
// @route   POST /api/credibility/submit
// @access  Private
exports.submitArticle = async (req, res) => {
  try {
    const { title, url, summary, body, source, category } = req.body;

    // Validate required fields
    if (!title || !url || !source) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, URL, and source'
      });
    }

    // Check if article already exists
    const existingArticle = await Article.findOne({ url });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'Article already exists in the system'
      });
    }

    // Create article with pending approval
    const article = await Article.create({
      articleId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      title,
      url,
      summary: summary || 'User submitted article',
      body: body || '',
      source,
      category: category || 'general',
      submittedBy: req.user._id,
      approvalStatus: 'pending',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      publishedAt: new Date()
    });

    // Update user contribution stats
    req.user.contributionStats.articlesSubmitted += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Article submitted for review',
      article
    });
  } catch (error) {
    console.error('Error submitting article:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get source credibility
// @route   GET /api/credibility/source/:sourceId
// @access  Public
exports.getSourceCredibility = async (req, res) => {
  try {
    const { sourceId } = req.params;
    
    const source = await Source.findById(sourceId);
    
    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Source not found'
      });
    }

    // Get reviews for this source
    const reviews = await Review.find({ 
      sourceId, 
      status: 'approved' 
    });

    // Calculate average ratings
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.credibilityRating, 0) / reviews.length
      : source.reputationScore;

    res.status(200).json({
      success: true,
      source: {
        ...source.toObject(),
        averageRating: avgRating,
        reviewCount: reviews.length
      }
    });
  } catch (error) {
    console.error('Error getting source credibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate credibility score
async function calculateCredibilityScore(article, reviews) {
  let score = 50; // Base score
  const factors = {
    sourceReputation: 0,
    communityFeedback: 0,
    factCheckResults: 0,
    verificationStatus: 0
  };

  // Factor 1: Source reputation (30% weight)
  if (article.sourceMetadata) {
    factors.sourceReputation = article.sourceMetadata.reputationScore * 0.3;
  } else {
    // Use a default moderate score if no source metadata
    factors.sourceReputation = 50 * 0.3;
  }

  // Factor 2: Community feedback (40% weight)
  if (reviews.length > 0) {
    const avgCredibility = reviews.reduce((sum, r) => sum + r.credibilityRating, 0) / reviews.length;
    factors.communityFeedback = avgCredibility * 0.4;
  }

  // Factor 3: Fact-check results (20% weight)
  if (article.factCheckResults && article.factCheckResults.length > 0) {
    // Simplified: count positive vs negative fact-checks
    const positiveChecks = article.factCheckResults.filter(
      fc => fc.rating && (fc.rating.toLowerCase().includes('true') || fc.rating.toLowerCase().includes('correct'))
    ).length;
    const factCheckScore = (positiveChecks / article.factCheckResults.length) * 100;
    factors.factCheckResults = factCheckScore * 0.2;
  }

  // Factor 4: Verification status (10% weight)
  const verificationMap = {
    'verified': 100,
    'unverified': 50,
    'disputed': 25,
    'false': 0
  };
  factors.verificationStatus = (verificationMap[article.verificationStatus] || 50) * 0.1;

  // Calculate final score
  score = Math.round(
    factors.sourceReputation + 
    factors.communityFeedback + 
    factors.factCheckResults + 
    factors.verificationStatus
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
    reviewCount: reviews.length,
    verificationStatus: article.verificationStatus
  };
}
