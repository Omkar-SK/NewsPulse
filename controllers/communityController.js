const CommunityPost = require('../models/CommunityPost');
const Comment = require('../models/Comment');
const CredibilityScore = require('../models/CredibilityScore');

// Get all community posts
exports.getPosts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await CommunityPost.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Add like/dislike counts and user reaction status
        const userId = req.user?._id;
        const postsWithCounts = posts.map(post => ({
            ...post,
            likeCount: post.likes.length,
            dislikeCount: post.dislikes.length,
            userReaction: userId ? (
                post.likes.some(id => id.toString() === userId.toString()) ? 'like' :
                    post.dislikes.some(id => id.toString() === userId.toString()) ? 'dislike' :
                        null
            ) : null
        }));

        const total = await CommunityPost.countDocuments();

        res.json({
            success: true,
            posts: postsWithCounts,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching community posts:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch community posts'
        });
    }
};

// Share an article to community
exports.shareArticle = async (req, res) => {
    try {
        const { articleId, message, articleData } = req.body;

        if (!articleId || !message || !articleData) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields'
            });
        }

        // Get credibility score for the article
        let credibilityScore = null;
        try {
            const credibility = await CredibilityScore.findOne({ articleId });
            if (credibility) {
                credibilityScore = credibility.finalScore;
            }
        } catch (err) {
            console.log('Could not fetch credibility score:', err);
        }

        const post = await CommunityPost.create({
            articleId,
            userId: req.user._id,
            userName: req.user.name,
            message,
            articleData: {
                ...articleData,
                credibilityScore
            }
        });

        res.json({
            success: true,
            post
        });
    } catch (error) {
        console.error('Error sharing article:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to share article'
        });
    }
};

// Like a post
exports.likePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Remove from dislikes if present
        post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());

        // Toggle like
        const likeIndex = post.likes.findIndex(id => id.toString() === userId.toString());
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(userId);
        }

        await post.save();

        res.json({
            success: true,
            likeCount: post.likes.length,
            dislikeCount: post.dislikes.length
        });
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to like post'
        });
    }
};

// Dislike a post
exports.dislikePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Remove from likes if present
        post.likes = post.likes.filter(id => id.toString() !== userId.toString());

        // Toggle dislike
        const dislikeIndex = post.dislikes.findIndex(id => id.toString() === userId.toString());
        if (dislikeIndex > -1) {
            post.dislikes.splice(dislikeIndex, 1);
        } else {
            post.dislikes.push(userId);
        }

        await post.save();

        res.json({
            success: true,
            likeCount: post.likes.length,
            dislikeCount: post.dislikes.length
        });
    } catch (error) {
        console.error('Error disliking post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to dislike post'
        });
    }
};

// Get comments for a post
exports.getComments = async (req, res) => {
    try {
        const { postId } = req.params;

        const comments = await Comment.find({ postId })
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            comments
        });
    } catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch comments'
        });
    }
};

// Add a comment to a post
exports.addComment = async (req, res) => {
    try {
        const { postId } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment content is required'
            });
        }

        const comment = await Comment.create({
            postId,
            userId: req.user._id,
            userName: req.user.name,
            content: content.trim()
        });

        // Update comment count on post
        await CommunityPost.findByIdAndUpdate(postId, {
            $inc: { commentCount: 1 }
        });

        res.json({
            success: true,
            comment
        });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add comment'
        });
    }
};
// Delete a post
exports.deletePost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await CommunityPost.findById(postId);
        if (!post) {
            return res.status(404).json({
                success: false,
                message: 'Post not found'
            });
        }

        // Check ownership
        if (post.userId.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this post'
            });
        }

        // Delete associated comments
        await Comment.deleteMany({ postId });

        // Delete the post
        await CommunityPost.findByIdAndDelete(postId);

        res.json({
            success: true,
            message: 'Post deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete post'
        });
    }
};
