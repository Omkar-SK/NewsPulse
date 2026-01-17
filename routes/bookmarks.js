const express = require('express');
const bookmarkController = require('../controllers/bookmarkController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(bookmarkController.getBookmarks)
  .post(bookmarkController.addBookmark);

router.route('/:id')
  .delete(bookmarkController.deleteBookmark);

module.exports = router;