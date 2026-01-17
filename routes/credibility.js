const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getArticleCredibility,
  submitArticle,
  getSourceCredibility,
  analyzeArticleWithAI,
  rateAIAnalysis
} = require('../controllers/credibilityController');

const router = express.Router();

router.get('/article/:articleId', getArticleCredibility);
router.post('/submit', protect, submitArticle);
router.get('/source/:sourceId', getSourceCredibility);
router.post('/analyze/:articleId', analyzeArticleWithAI);
router.put('/analyze/:articleId/rate', protect, rateAIAnalysis);

module.exports = router;
