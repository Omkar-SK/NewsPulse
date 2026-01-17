const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecommendations,
  getUserPreferences
} = require('../controllers/recommendationController');

// All routes require authentication
router.use(protect);

router.get('/', getRecommendations);
router.get('/preferences', getUserPreferences);

module.exports = router;