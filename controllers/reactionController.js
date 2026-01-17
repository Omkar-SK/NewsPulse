const Reaction = require('../models/Reaction');
const Article = require('../models/Article');
const recommendationEngine = require('../utils/recommendationEngine');

// @desc    Add or update reaction
// @route   POST /api/reactions
// @access  Private
exports.addReaction = async (req, res) => {
  try {
    const { articleId, reactionType } = req.body;

    if (!['like', 'dislike', 'neutral'].includes(reactionType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid reaction type'
      });
    }

    console.log('🔵 Reaction request:', {
      userId: req.user.id,
      userEmail: req.user.email,
      articleId,
      reactionType
    });

    // Check if reaction exists for THIS USER
    let reaction = await Reaction.findOne({ 
      user: req.user.id, 
      articleId 
    });

    if (reaction) {
      console.log('🔄 Updating existing reaction from', reaction.reactionType, 'to', reactionType);
      // Update existing reaction
      reaction.reactionType = reactionType;
      reaction.updatedAt = Date.now();
      await reaction.save();
    } else {
      console.log('➕ Creating new reaction');
      // Create new reaction
      reaction = await Reaction.create({
        user: req.user.id,
        articleId,
        reactionType
      });
    }

    // Update user preferences based on the reaction
    try {
      const article = await Article.findOne({ articleId });
      if (article) {
        await recommendationEngine.updateUserPreferences(
          req.user.id,
          {
            category: article.category,
            source: article.source,
            sentiment: article.sentiment
          },
          reactionType
        );
        console.log('✅ User preferences updated');
      }
    } catch (prefError) {
      console.error('⚠️ Error updating preferences:', prefError);
      // Don't fail the reaction if preference update fails
    }

    // Get ALL reaction counts for this article (from ALL users)
    const reactionCounts = await Reaction.aggregate([
      { $match: { articleId } },
      { $group: { 
          _id: '$reactionType', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const counts = {
      like: 0,
      dislike: 0,
      neutral: 0,
      total: 0
    };

    reactionCounts.forEach(item => {
      counts[item._id] = item.count;
      counts.total += item.count;
    });

    console.log('📊 Final counts for article:', counts);

    res.status(200).json({
      success: true,
      reaction: {
        reactionType: reaction.reactionType,
        userId: req.user.id
      },
      counts
    });
  } catch (err) {
    console.error('❌ Error in addReaction:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get reaction counts for an article
// @route   GET /api/reactions/article/:articleId
// @access  Public
exports.getArticleReactions = async (req, res) => {
  try {
    const { articleId } = req.params;

    console.log('📊 Getting reaction counts for article:', articleId);

    const reactionCounts = await Reaction.aggregate([
      { $match: { articleId } },
      { $group: { 
          _id: '$reactionType', 
          count: { $sum: 1 } 
        } 
      }
    ]);

    const counts = {
      like: 0,
      dislike: 0,
      neutral: 0,
      total: 0
    };

    reactionCounts.forEach(item => {
      counts[item._id] = item.count;
      counts.total += item.count;
    });

    // Determine dominant sentiment
    let dominantSentiment = 'neutral';
    let maxCount = counts.neutral;

    if (counts.like > maxCount) {
      dominantSentiment = 'positive';
      maxCount = counts.like;
    }
    if (counts.dislike > maxCount) {
      dominantSentiment = 'negative';
    }

    console.log('✅ Reaction counts:', counts);

    res.status(200).json({
      success: true,
      counts,
      dominantSentiment
    });
  } catch (err) {
    console.error('❌ Error in getArticleReactions:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get user's reaction for an article
// @route   GET /api/reactions/user/:articleId
// @access  Private
exports.getUserReaction = async (req, res) => {
  try {
    const { articleId } = req.params;

    console.log('👤 Getting user reaction:', {
      userId: req.user.id,
      articleId
    });

    const reaction = await Reaction.findOne({
      user: req.user.id,
      articleId
    });

    console.log('✅ User reaction:', reaction ? reaction.reactionType : 'none');

    res.status(200).json({
      success: true,
      reaction: reaction ? reaction.reactionType : null
    });
  } catch (err) {
    console.error('❌ Error in getUserReaction:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};