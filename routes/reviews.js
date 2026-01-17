const express = require('express');
const { protect } = require('../middleware/auth');
const {
  submitReview,
  getArticleReviews,
  getSourceReviews,
  voteReview
} = require('../controllers/reviewController');

const router = express.Router();

router.post('/', protect, submitReview);
router.get('/article/:articleId', getArticleReviews);
router.get('/source/:sourceId', getSourceReviews);
router.put('/:id/vote', protect, voteReview);

module.exports = router;
