const express = require('express');
const reactionController = require('../controllers/reactionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Protected routes (require login)
router.post('/', protect, reactionController.addReaction);
router.get('/user/:articleId', protect, reactionController.getUserReaction);

// Public route (anyone can view reaction counts)
router.get('/article/:articleId', reactionController.getArticleReactions);

module.exports = router;