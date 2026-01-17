const User = require('../models/User');
const Newsletter = require('../models/Newsletter');

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Private
exports.subscribe = async (req, res) => {
  try {
    const { frequency, categories } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update newsletter preferences
    user.newsletterSubscribed = true;
    
    if (frequency) {
      user.newsletterPreferences.frequency = frequency;
    }
    
    if (categories && Array.isArray(categories)) {
      user.newsletterPreferences.categories = categories;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      preferences: user.newsletterPreferences
    });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to subscribe to newsletter',
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Private
exports.unsubscribe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.newsletterSubscribed = false;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    console.error('Unsubscribe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unsubscribe from newsletter',
      error: error.message
    });
  }
};

// @desc    Update newsletter preferences
// @route   PUT /api/newsletter/preferences
// @access  Private
exports.updatePreferences = async (req, res) => {
  try {
    const { frequency, categories } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.newsletterSubscribed) {
      return res.status(400).json({
        success: false,
        message: 'You are not subscribed to newsletter'
      });
    }

    if (frequency) {
      user.newsletterPreferences.frequency = frequency;
    }

    if (categories && Array.isArray(categories)) {
      user.newsletterPreferences.categories = categories;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences: user.newsletterPreferences
    });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update preferences',
      error: error.message
    });
  }
};

// @desc    Get newsletter subscription status
// @route   GET /api/newsletter/status
// @access  Private
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      subscribed: user.newsletterSubscribed,
      preferences: user.newsletterPreferences
    });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get subscription status',
      error: error.message
    });
  }
};

// @desc    Get newsletter history
// @route   GET /api/newsletter/history
// @access  Private
exports.getHistory = async (req, res) => {
  try {
    const newsletters = await Newsletter.find({ user: req.user.id })
      .sort({ sentAt: -1 })
      .limit(10)
      .select('-articles');

    res.status(200).json({
      success: true,
      count: newsletters.length,
      newsletters
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get newsletter history',
      error: error.message
    });
  }
};