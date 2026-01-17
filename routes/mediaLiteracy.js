const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getMediaLiteracyContent,
  getMediaLiteracyArticle,
  createMediaLiteracyContent
} = require('../controllers/mediaLiteracyController');

const router = express.Router();

router.get('/', getMediaLiteracyContent);
router.get('/:slug', getMediaLiteracyArticle);
router.post('/', protect, authorize('admin'), createMediaLiteracyContent);

module.exports = router;
