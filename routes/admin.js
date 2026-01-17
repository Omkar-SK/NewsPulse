const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getPendingArticles,
  reviewArticle,
  getSources,
  createOrUpdateSource,
  deleteSource,
  getFlaggedReviews,
  moderateReview,
  getDashboardStats
} = require('../controllers/adminController');

const router = express.Router();

// All routes require authentication and admin/moderator role
router.use(protect);
router.use(authorize('admin', 'moderator'));

// Article management
router.get('/articles/pending', getPendingArticles);
router.put('/articles/:id/review', reviewArticle);

// Source management
router.get('/sources', getSources);
router.post('/sources', createOrUpdateSource);
router.delete('/sources/:id', deleteSource);

// Review moderation
router.get('/reviews/flagged', getFlaggedReviews);
router.put('/reviews/:id/moderate', moderateReview);

// Dashboard stats
router.get('/stats', getDashboardStats);

module.exports = router;
