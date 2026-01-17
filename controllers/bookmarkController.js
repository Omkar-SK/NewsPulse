const Bookmark = require('../models/Bookmark');

// @desc    Get all bookmarks for logged in user
// @route   GET /api/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      bookmarks
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Add bookmark
// @route   POST /api/bookmarks
// @access  Private
exports.addBookmark = async (req, res) => {
  try {
    const bookmarkData = {
      ...req.body,
      user: req.user.id
    };

    // Check if bookmark already exists
    const existingBookmark = await Bookmark.findOne({
      user: req.user.id,
      articleId: req.body.articleId
    });

    if (existingBookmark) {
      return res.status(400).json({
        success: false,
        message: 'Article already bookmarked'
      });
    }

    const bookmark = await Bookmark.create(bookmarkData);

    res.status(201).json({
      success: true,
      bookmark
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Delete bookmark
// @route   DELETE /api/bookmarks/:id
// @access  Private
exports.deleteBookmark = async (req, res) => {
  try {
    const bookmark = await Bookmark.findById(req.params.id);

    if (!bookmark) {
      return res.status(404).json({
        success: false,
        message: 'Bookmark not found'
      });
    }

    // Make sure user owns bookmark
    if (bookmark.user.toString() !== req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this bookmark'
      });
    }

    await bookmark.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Bookmark removed'
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};