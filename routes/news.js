const express = require('express');
const newsController = require('../controllers/newsController');

const router = express.Router();

router.get('/', newsController.getNews);
router.get('/search', newsController.searchNews);
router.get('/similar/:uri', newsController.getSimilarArticles);

module.exports = router;