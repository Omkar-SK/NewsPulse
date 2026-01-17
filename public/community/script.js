// Community Page JavaScript

// Constants for credibility scoring
const CREDIBILITY_CONFIG = {
    UPVOTE_BOOST: 2,
    DOWNVOTE_PENALTY: 3,
    MAX_BOOST: 20,
    MAX_PENALTY: -20,
    MIN_SCORE: 0,
    MAX_SCORE: 100
};

class CommunityApp {
    constructor() {
        this.posts = [];
        this.currentPostId = null;
        this.init();
    }

    init() {
        this.loadPosts();
        this.setupEventListeners();
        this.setupDarkMode();
        this.renderPosts();
    }

    setupEventListeners() {
        // Add post button
        document.getElementById('add-post-btn').addEventListener('click', () => this.addPost());
        
        // Enter key on URL input
        document.getElementById('news-url-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addPost();
        });

        // Modal close
        document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
        
        // Click outside modal to close
        document.getElementById('comments-modal').addEventListener('click', (e) => {
            if (e.target.id === 'comments-modal') this.closeModal();
        });

        // Add comment button
        document.getElementById('add-comment-btn').addEventListener('click', () => this.addComment());

        // Enter key on comment input (Ctrl+Enter)
        document.getElementById('comment-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) this.addComment();
        });
    }

    setupDarkMode() {
        const modeToggle = document.getElementById('mode-toggle');
        const modeLabel = document.getElementById('mode-label');
        
        // Check for saved preference
        const darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) {
            document.body.classList.add('dark-mode');
            modeToggle.checked = true;
            modeLabel.textContent = 'Dark Mode';
        }

        modeToggle.addEventListener('change', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            modeLabel.textContent = isDark ? 'Dark Mode' : 'Light Mode';
            localStorage.setItem('darkMode', isDark);
        });
    }

    async addPost() {
        const urlInput = document.getElementById('news-url-input');
        const errorMsg = document.getElementById('url-error');
        const url = urlInput.value.trim();

        // Validate URL
        if (!url) {
            this.showError('Please enter a URL');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showError('Please enter a valid URL');
            return;
        }

        // Clear error
        errorMsg.classList.remove('show');

        // Fetch metadata
        const metadata = await this.fetchMetadata(url);

        // Create post
        const post = {
            id: Date.now(),
            url: url,
            title: metadata.title,
            votes: 0,
            userVote: 0, // -1 for downvote, 0 for no vote, 1 for upvote
            credibilityScore: this.generateCredibilityScore(),
            comments: [],
            timestamp: new Date().toISOString()
        };

        this.posts.unshift(post);
        this.savePosts();
        this.renderPosts();

        // Clear input
        urlInput.value = '';
        
        // Show success feedback
        this.showSuccess('Post added successfully!');
    }

    async fetchMetadata(url) {
        // Try to fetch the page title
        try {
            // Since we can't directly fetch from another domain due to CORS,
            // we'll extract a title from the URL
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            
            // Extract title from URL path
            let title = pathname
                .split('/')
                .filter(part => part.length > 0)
                .pop() || urlObj.hostname;
            
            // Clean up the title
            title = title
                .replace(/[-_]/g, ' ')
                .replace(/\.(html|htm|php|asp|aspx)$/i, '')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
            
            // If title is too short or just numbers, use hostname
            if (title.length < 3 || /^\d+$/.test(title)) {
                title = `News from ${urlObj.hostname.replace('www.', '')}`;
            }

            return { title: title || 'News Article' };
        } catch (error) {
            return { title: 'News Article' };
        }
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    generateCredibilityScore() {
        // Generate a random credibility score between 60 and 95
        return Math.floor(Math.random() * 36) + 60;
    }

    updateCredibilityScore(postId, voteChange) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Update credibility based on the vote change (incremental, not cumulative)
        // voteChange will be +1 for upvote, -1 for downvote, +2 for switching from down to up, etc.
        let scoreChange = 0;
        if (voteChange > 0) {
            // Adding upvote(s) increases credibility
            scoreChange = Math.min(voteChange * CREDIBILITY_CONFIG.UPVOTE_BOOST, CREDIBILITY_CONFIG.MAX_BOOST);
        } else if (voteChange < 0) {
            // Removing upvotes or adding downvotes decreases credibility
            // Use UPVOTE_BOOST for consistency when undoing votes
            scoreChange = Math.max(voteChange * CREDIBILITY_CONFIG.UPVOTE_BOOST, CREDIBILITY_CONFIG.MAX_PENALTY);
        }
        
        let newScore = post.credibilityScore + scoreChange;
        
        // Keep score between 0 and 100
        newScore = Math.max(CREDIBILITY_CONFIG.MIN_SCORE, Math.min(CREDIBILITY_CONFIG.MAX_SCORE, newScore));
        
        post.credibilityScore = Math.floor(newScore);
        this.savePosts();
    }

    vote(postId, voteType) {
        const post = this.posts.find(p => p.id === postId);
        if (!post) return;

        // Calculate the vote change for credibility update
        const oldVote = post.userVote;
        
        // Remove previous vote
        post.votes -= post.userVote;

        // Apply new vote
        if (post.userVote === voteType) {
            // If clicking the same vote, remove it
            post.userVote = 0;
        } else {
            post.userVote = voteType;
            post.votes += voteType;
        }

        // Calculate the net change in votes for credibility scoring
        const voteChange = post.userVote - oldVote;
        
        // Update credibility score dynamically with the vote change
        this.updateCredibilityScore(postId, voteChange);
        
        this.savePosts();
        this.renderPosts();
    }

    openComments(postId) {
        this.currentPostId = postId;
        const modal = document.getElementById('comments-modal');
        modal.classList.add('show');
        this.renderComments();
    }

    closeModal() {
        const modal = document.getElementById('comments-modal');
        modal.classList.remove('show');
        this.currentPostId = null;
        document.getElementById('comment-input').value = '';
    }

    addComment() {
        const commentInput = document.getElementById('comment-input');
        const text = commentInput.value.trim();

        if (!text) return;

        const post = this.posts.find(p => p.id === this.currentPostId);
        if (!post) return;

        const comment = {
            id: Date.now(),
            text: text,
            timestamp: new Date().toISOString()
        };

        post.comments.push(comment);
        this.savePosts();
        this.renderComments();
        this.renderPosts(); // Update comment count in the post card
        
        // Clear input
        commentInput.value = '';
    }

    renderComments() {
        const commentsList = document.getElementById('comments-list');
        const post = this.posts.find(p => p.id === this.currentPostId);

        if (!post || post.comments.length === 0) {
            commentsList.innerHTML = '<div class="no-comments">No comments yet. Be the first to comment!</div>';
            return;
        }

        commentsList.innerHTML = post.comments
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .map(comment => `
                <div class="comment-item">
                    <div class="comment-text">${this.escapeHtml(comment.text)}</div>
                    <div class="comment-time">${this.formatTime(comment.timestamp)}</div>
                </div>
            `).join('');
    }

    renderPosts() {
        const container = document.getElementById('posts-container');

        if (this.posts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-newspaper"></i>
                    <h3>No posts yet</h3>
                    <p>Share the first news article to start the conversation!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.posts.map(post => `
            <div class="post-card" data-post-id="${post.id}">
                <div class="post-votes">
                    <button class="vote-btn upvote ${post.userVote === 1 ? 'active' : ''}" 
                            onclick="app.vote(${post.id}, 1)">
                        <i class="fas fa-arrow-up"></i>
                    </button>
                    <div class="vote-count">${post.votes}</div>
                    <button class="vote-btn downvote ${post.userVote === -1 ? 'active' : ''}" 
                            onclick="app.vote(${post.id}, -1)">
                        <i class="fas fa-arrow-down"></i>
                    </button>
                </div>
                
                <div class="post-content">
                    <h3 class="post-title">${this.escapeHtml(post.title)}</h3>
                    <a href="${post.url}" target="_blank" rel="noopener noreferrer" class="post-url">
                        <i class="fas fa-external-link-alt"></i> ${this.truncateUrl(post.url)}
                    </a>
                    <div class="post-meta">
                        <span class="post-time">
                            <i class="far fa-clock"></i> ${this.formatTime(post.timestamp)}
                        </span>
                        <button class="comment-btn" onclick="app.openComments(${post.id})">
                            <i class="far fa-comment"></i>
                            ${post.comments.length} ${post.comments.length === 1 ? 'comment' : 'comments'}
                        </button>
                    </div>
                </div>
                
                <div class="post-credibility">
                    <div class="credibility-label">Credibility</div>
                    <div class="credibility-score">${post.credibilityScore}</div>
                    <div class="credibility-bar">
                        <div class="credibility-fill" style="width: ${post.credibilityScore}%"></div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    truncateUrl(url) {
        if (url.length > 60) {
            return url.substring(0, 57) + '...';
        }
        return url;
    }

    formatTime(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diff = Math.floor((now - time) / 1000); // difference in seconds

        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        
        return time.toLocaleDateString();
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    showError(message) {
        const errorMsg = document.getElementById('url-error');
        errorMsg.textContent = message;
        errorMsg.classList.add('show');
        
        setTimeout(() => {
            errorMsg.classList.remove('show');
        }, 3000);
    }

    showSuccess(message) {
        // Create a temporary success message
        const successMsg = document.createElement('div');
        successMsg.textContent = message;
        successMsg.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(16, 185, 129, 0.3);
            z-index: 1001;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(successMsg);
        
        setTimeout(() => {
            successMsg.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => successMsg.remove(), 300);
        }, 2000);
    }

    savePosts() {
        localStorage.setItem('communityPosts', JSON.stringify(this.posts));
    }

    loadPosts() {
        const saved = localStorage.getItem('communityPosts');
        if (saved) {
            try {
                this.posts = JSON.parse(saved);
            } catch (error) {
                console.error('Error loading posts:', error);
                this.posts = [];
            }
        }
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize the app
const app = new CommunityApp();
