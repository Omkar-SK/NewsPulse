const MediaLiteracy = require('../models/MediaLiteracy');

// @desc    Get all media literacy content
// @route   GET /api/media-literacy
// @access  Public
exports.getMediaLiteracyContent = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { status: 'published' };
    if (category) {
      filter.category = category;
    }

    const content = await MediaLiteracy.find(filter)
      .sort('order')
      .select('-content'); // Don't send full content in list

    res.status(200).json({
      success: true,
      content
    });
  } catch (error) {
    console.error('Error getting media literacy content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single media literacy article
// @route   GET /api/media-literacy/:slug
// @access  Public
exports.getMediaLiteracyArticle = async (req, res) => {
  try {
    const { slug } = req.params;

    const article = await MediaLiteracy.findOne({ slug, status: 'published' })
      .populate('relatedTopics', 'title slug icon');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Increment view count
    article.views += 1;
    await article.save();

    res.status(200).json({
      success: true,
      article
    });
  } catch (error) {
    console.error('Error getting media literacy article:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create media literacy content
// @route   POST /api/media-literacy
// @access  Private/Admin
exports.createMediaLiteracyContent = async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      content,
      summary,
      icon,
      order,
      tips,
      examples
    } = req.body;

    const article = await MediaLiteracy.create({
      title,
      slug,
      category,
      content,
      summary,
      icon,
      order,
      tips,
      examples,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Content created successfully',
      article
    });
  } catch (error) {
    console.error('Error creating media literacy content:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};
