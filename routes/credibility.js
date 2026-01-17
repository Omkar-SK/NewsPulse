const express = require('express');
const credibilityController = require('../controllers/credibilityController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/analyze/:articleId', credibilityController.analyzeArticleCredibility);
router.get('/score/:articleId', credibilityController.getCredibilityScore);
router.post('/analyze-url', protect, credibilityController.analyzeUrlCredibility);
router.post('/analyze-content', protect, credibilityController.analyzeContentCredibility);

module.exports = router;