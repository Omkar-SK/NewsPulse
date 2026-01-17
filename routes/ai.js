const express = require('express');
const router = express.Router();
const { generateSummary, chatWithBot } = require('../controllers/aiController');

// These routes are public, but you could add `protect` middleware if needed
router.post('/summary', generateSummary);
router.post('/chat', chatWithBot);

module.exports = router;