const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const {
    getPosts,
    shareArticle,
    likePost,
    dislikePost,
    deletePost,
    getComments,
    addComment
} = require('../controllers/communityController');

// Get all community posts (public, but with optional auth for user reactions)
router.get('/posts', optionalAuth, getPosts);

// Share an article to community (requires auth)
router.post('/share', protect, shareArticle);

// Like a post (requires auth)
router.post('/posts/:postId/like', protect, likePost);

// Dislike a post (requires auth)
router.post('/posts/:postId/dislike', protect, dislikePost);

// Delete a post (requires auth)
router.delete('/posts/:postId', protect, deletePost);

// Get comments for a post (public)
router.get('/posts/:postId/comments', getComments);

// Add a comment to a post (requires auth)
router.post('/posts/:postId/comments', protect, addComment);

module.exports = router;
