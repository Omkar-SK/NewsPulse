const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  subscribe,
  unsubscribe,
  updatePreferences,
  getStatus,
  getHistory
} = require('../controllers/newsletterController');

// All routes require authentication
router.post('/subscribe', protect, subscribe);
router.post('/unsubscribe', protect, unsubscribe);
router.put('/preferences', protect, updatePreferences);
router.get('/status', protect, getStatus);
router.get('/history', protect, getHistory);

module.exports = router;