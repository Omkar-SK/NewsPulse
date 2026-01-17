const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getArticleCredibility,
  submitArticle,
  getSourceCredibility
} = require('../controllers/credibilityController');

const router = express.Router();

router.get('/article/:articleId', getArticleCredibility);
router.post('/submit', protect, submitArticle);
router.get('/source/:sourceId', getSourceCredibility);

module.exports = router;
