const express = require('express');
const credibilityController = require('../controllers/credibilityController');

const router = express.Router();

router.get('/analyze/:articleId', credibilityController.analyzeArticleCredibility);
router.get('/score/:articleId', credibilityController.getCredibilityScore);

module.exports = router;