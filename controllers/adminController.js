const Article = require('../models/Article');
const Source = require('../models/Source');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get pending article submissions
// @route   GET /api/admin/articles/pending
// @access  Private/Admin
exports.getPendingArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const articles = await Article.find({ approvalStatus: 'pending' })
      .populate('submittedBy', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Article.countDocuments({ approvalStatus: 'pending' });

    res.status(200).json({
      success: true,
      articles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting pending articles:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Approve or reject article submission
// @route   PUT /api/admin/articles/:id/review
// @access  Private/Admin
exports.reviewArticle = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    article.approvalStatus = status;
    article.reviewedBy = req.user._id;
    article.reviewedAt = new Date();

    if (status === 'rejected' && reason) {
      article.rejectionReason = reason;
    }

    await article.save();

    res.status(200).json({
      success: true,
      message: `Article ${status}`,
      article
    });
  } catch (error) {
    console.error('Error reviewing article:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get all sources
// @route   GET /api/admin/sources
// @access  Private/Admin
exports.getSources = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const sources = await Source.find()
      .sort('-reputationScore')
      .skip(skip)
      .limit(limit);

    const total = await Source.countDocuments();

    res.status(200).json({
      success: true,
      sources,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error getting sources:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create or update source
// @route   POST /api/admin/sources
// @access  Private/Admin
exports.createOrUpdateSource = async (req, res) => {
  try {
    const { 
      name, 
      url, 
      description, 
      logo,
      reputationScore,
      biasRating,
      reliabilityRating,
      ownership,
      funding,
      country,
      founded
    } = req.body;

    // Check if source exists
    let source = await Source.findOne({ name });

    if (source) {
      // Update existing source
      source.url = url || source.url;
      source.description = description || source.description;
      source.logo = logo || source.logo;
      source.reputationScore = reputationScore !== undefined ? reputationScore : source.reputationScore;
      source.biasRating = biasRating || source.biasRating;
      source.reliabilityRating = reliabilityRating || source.reliabilityRating;
      source.ownership = ownership || source.ownership;
      source.funding = funding || source.funding;
      source.country = country || source.country;
      source.founded = founded || source.founded;
      source.verifiedBy = req.user._id;
      source.verifiedAt = new Date();

      await source.save();

      return res.status(200).json({
        success: true,
        message: 'Source updated successfully',
        source
      });
    } else {
      // Create new source
      source = await Source.create({
        name,
        url,
        description,
        logo,
        reputationScore: reputationScore || 50,
        biasRating: biasRating || 'unknown',
        reliabilityRating: reliabilityRating || 'unknown',
        ownership,
        funding,
        country,
        founded,
        verifiedBy: req.user._id,
        verifiedAt: new Date()
      });

      return res.status(201).json({
        success: true,
        message: 'Source created successfully',
        source
      });
    }
  } catch (error) {
    console.error('Error creating/updating source:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete source
// @route   DELETE /api/admin/sources/:id
// @access  Private/Admin
exports.deleteSource = async (req, res) => {
  try {
    const { id } = req.params;

    const source = await Source.findById(id);

    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Source not found'
      });
    }

    await source.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Source deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting source:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get flagged reviews
// @route   GET /api/admin/reviews/flagged
// @access  Private/Admin
exports.getFlaggedReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const reviews = await Review.find({ status: 'flagged' })
      .populate('user', 'name email')
      .sort('-createdAt')
      .skip(skip)
      .limit(limit);

    const total = await Review.countDocuments({ status: 'flagged' });

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
    console.error('Error getting flagged reviews:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Moderate review
// @route   PUT /api/admin/reviews/:id/moderate
// @access  Private/Admin
exports.moderateReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    review.status = status;
    review.moderatedBy = req.user._id;
    review.moderatedAt = new Date();

    await review.save();

    res.status(200).json({
      success: true,
      message: `Review ${status}`,
      review
    });
  } catch (error) {
    console.error('Error moderating review:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getDashboardStats = async (req, res) => {
  try {
    const stats = {
      articles: {
        total: await Article.countDocuments(),
        pending: await Article.countDocuments({ approvalStatus: 'pending' }),
        approved: await Article.countDocuments({ approvalStatus: 'approved' }),
        rejected: await Article.countDocuments({ approvalStatus: 'rejected' })
      },
      sources: {
        total: await Source.countDocuments(),
        active: await Source.countDocuments({ status: 'active' }),
        suspended: await Source.countDocuments({ status: 'suspended' })
      },
      reviews: {
        total: await Review.countDocuments(),
        pending: await Review.countDocuments({ status: 'pending' }),
        flagged: await Review.countDocuments({ status: 'flagged' })
      },
      users: {
        total: await User.countDocuments(),
        admins: await User.countDocuments({ role: 'admin' }),
        moderators: await User.countDocuments({ role: 'moderator' })
      }
    };

    res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
