const Review = require('../models/Review');
const Article = require('../models/Article');
const Source = require('../models/Source');

// @desc    Submit a review for an article or source
// @route   POST /api/reviews
// @access  Private
exports.submitReview = async (req, res) => {
  try {
    const { 
      targetType, 
      articleId, 
      sourceId, 
      rating, 
      credibilityRating,
      title,
      comment,
      accuracyRating,
      sourcingRating,
      biasRating
    } = req.body;

    // Validate required fields
    if (!targetType || !rating || !credibilityRating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    if (targetType === 'article' && !articleId) {
      return res.status(400).json({
        success: false,
        message: 'Article ID is required for article reviews'
      });
    }

    if (targetType === 'source' && !sourceId) {
      return res.status(400).json({
        success: false,
        message: 'Source ID is required for source reviews'
      });
    }

    // Check if user has already reviewed this item
    const existingReview = await Review.findOne({
      user: req.user._id,
      ...(targetType === 'article' ? { articleId } : { sourceId })
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this item'
      });
    }

    // Create review
    const review = await Review.create({
      user: req.user._id,
      targetType,
      articleId: targetType === 'article' ? articleId : null,
      sourceId: targetType === 'source' ? sourceId : null,
      rating,
      credibilityRating,
      title,
      comment,
      accuracyRating,
      sourcingRating,
      biasRating
    });

    // Update user contribution stats
    req.user.contributionStats.reviewsPosted += 1;
    await req.user.save();

    // Update article or source credibility score
    if (targetType === 'article') {
      await updateArticleCredibility(articleId);
    } else {
      await updateSourceCredibility(sourceId);
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully',
      review
    });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for an article
// @route   GET /api/reviews/article/:articleId
// @access  Public
exports.getArticleReviews = async (req, res) => {
  try {
    const { articleId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      articleId,
      status: 'approved'
    })
      .populate('user', 'name reputationScore')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ articleId, status: 'approved' });

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting article reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get reviews for a source
// @route   GET /api/reviews/source/:sourceId
// @access  Public
exports.getSourceReviews = async (req, res) => {
  try {
    const { sourceId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({
      sourceId,
      status: 'approved'
    })
      .populate('user', 'name reputationScore')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ sourceId, status: 'approved' });

    res.status(200).json({
      success: true,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting source reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Vote review as helpful/not helpful
// @route   PUT /api/reviews/:id/vote
// @access  Private
exports.voteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { helpful } = req.body;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    if (helpful) {
      review.helpfulVotes += 1;
      // Update reviewer reputation
      const reviewer = await require('../models/User').findById(review.user);
      if (reviewer) {
        reviewer.contributionStats.helpfulReviews += 1;
        reviewer.reputationScore = Math.min(100, reviewer.reputationScore + 0.5);
        await reviewer.save();
      }
    } else {
      review.notHelpfulVotes += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      review
    });
  } catch (error) {
    console.error('Error voting review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to update article credibility
async function updateArticleCredibility(articleId) {
  try {
    const reviews = await Review.find({ articleId, status: 'approved' });
    if (reviews.length > 0) {
      const avgCredibility = reviews.reduce((sum, r) => sum + r.credibilityRating, 0) / reviews.length;
      await Article.findOneAndUpdate(
        { articleId },
        { credibilityScore: Math.round(avgCredibility) }
      );
    }
  } catch (error) {
    console.error('Error updating article credibility:', error);
  }
}

// Helper function to update source credibility
async function updateSourceCredibility(sourceId) {
  try {
    const reviews = await Review.find({ sourceId, status: 'approved' });
    if (reviews.length > 0) {
      const avgCredibility = reviews.reduce((sum, r) => sum + r.credibilityRating, 0) / reviews.length;
      await Source.findByIdAndUpdate(
        sourceId,
        { 
          reputationScore: Math.round(avgCredibility),
          averageCredibilityScore: Math.round(avgCredibility)
        }
      );
    }
  } catch (error) {
    console.error('Error updating source credibility:', error);
  }
}

module.exports = {
  submitReview,
  getArticleReviews,
  getSourceReviews,
  voteReview
};
