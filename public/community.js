// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentUser = null;
let authToken = null;
let currentPage = 1;

// Initialize
document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
    setupEventListeners();
    loadCommunityPosts();
});

// Auth Functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
    } else {
        updateUIForLoggedOutUser();
    }
}

function updateUIForLoggedInUser() {
    document.getElementById('show-auth-btn').style.display = 'none';
    document.getElementById('user-menu').style.display = 'block';

    const userAvatar = document.getElementById('user-avatar');
    const userNameText = document.getElementById('user-name-text');

    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    userNameText.textContent = currentUser.name;
}

function updateUIForLoggedOutUser() {
    document.getElementById('show-auth-btn').style.display = 'block';
    document.getElementById('user-menu').style.display = 'none';
}

// Event Listeners
function setupEventListeners() {
    // Auth modal
    document.getElementById('show-auth-btn').addEventListener('click', () => {
        document.getElementById('auth-overlay').classList.add('active');
    });

    document.getElementById('auth-close').addEventListener('click', () => {
        document.getElementById('auth-overlay').classList.remove('active');
    });

    document.getElementById('show-signup').addEventListener('click', () => {
        document.getElementById('login-form').style.display = 'none';
        document.getElementById('signup-form').style.display = 'block';
    });

    document.getElementById('show-login').addEventListener('click', () => {
        document.getElementById('signup-form').style.display = 'none';
        document.getElementById('login-form').style.display = 'block';
    });

    // Auth forms
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('signup-form-element').addEventListener('submit', handleSignup);
    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Dark mode
    const modeToggle = document.getElementById('mode-toggle');
    const savedMode = localStorage.getItem('darkMode');

    if (savedMode === 'true') {
        document.body.classList.add('dark-mode');
        modeToggle.checked = true;
        document.getElementById('mode-label').textContent = 'Dark Mode';
    }

    modeToggle.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('darkMode', isDark);
        document.getElementById('mode-label').textContent = isDark ? 'Dark Mode' : 'Light Mode';
    });

    // User dropdown
    document.getElementById('user-avatar').addEventListener('click', () => {
        document.getElementById('user-dropdown').classList.toggle('active');
    });
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    const submitBtn = document.getElementById('login-btn');

    errorDiv.classList.remove('active');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        currentUser = data.user;

        document.getElementById('auth-overlay').classList.remove('active');
        updateUIForLoggedInUser();
        loadCommunityPosts();

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

async function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const errorDiv = document.getElementById('signup-error');
    const submitBtn = document.getElementById('signup-btn');

    errorDiv.classList.remove('active');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';

    try {
        const response = await fetch(`${API_BASE_URL}/auth/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Signup failed');
        }

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        authToken = data.token;
        currentUser = data.user;

        document.getElementById('auth-overlay').classList.remove('active');
        updateUIForLoggedInUser();
        loadCommunityPosts();

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;

    updateUIForLoggedOutUser();
    loadCommunityPosts();
}

// Load Community Posts
async function loadCommunityPosts() {
    const loadingDiv = document.getElementById('community-loading');
    const postsDiv = document.getElementById('community-posts');
    const emptyDiv = document.getElementById('community-empty');

    loadingDiv.style.display = 'flex';
    postsDiv.innerHTML = '';
    emptyDiv.style.display = 'none';

    try {
        const headers = {};
        if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
        }

        const response = await fetch(`${API_BASE_URL}/community/posts?page=${currentPage}&limit=20`, {
            headers
        });

        const data = await response.json();

        loadingDiv.style.display = 'none';

        if (data.success && data.posts && data.posts.length > 0) {
            data.posts.forEach(post => {
                const postElement = createPostElement(post);
                postsDiv.appendChild(postElement);
            });
        } else {
            emptyDiv.style.display = 'flex';
        }
    } catch (error) {
        console.error('Error loading community posts:', error);
        loadingDiv.style.display = 'none';
        emptyDiv.style.display = 'flex';
    }
}

// Create Post Element
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'community-post';
    postDiv.dataset.postId = post._id;

    const timeAgo = getTimeAgo(new Date(post.createdAt));
    const credibilityScore = post.articleData.credibilityScore;
    const credibilityClass = credibilityScore >= 70 ? 'high' : credibilityScore >= 40 ? 'medium' : 'low';

    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-user">
                <div class="user-avatar-small">${post.userName.charAt(0).toUpperCase()}</div>
                <div>
                    <div class="post-username">${post.userName}</div>
                    <div class="post-time">${timeAgo}</div>
                </div>
            </div>
        </div>

        <div class="post-message">
            <p>${post.message}</p>
        </div>

        <div class="post-article">
            <div class="post-article-image">
                <img src="${post.articleData.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'}" 
                     alt="${post.articleData.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'">
                ${credibilityScore !== null && credibilityScore !== undefined ? `
                <div class="credibility-badge credibility-${credibilityClass}">
                    <i class="fas fa-shield-alt"></i>
                    <span>${credibilityScore}</span>
                </div>
                ` : ''}
            </div>
            <div class="post-article-content">
                <h3>${post.articleData.title}</h3>
                <p>${post.articleData.summary}</p>
                <div class="post-article-meta">
                    <span><i class="fas fa-newspaper"></i> ${post.articleData.source}</span>
                    <span><i class="fas fa-tag"></i> ${post.articleData.category || 'General'}</span>
                </div>
                <a href="${post.articleData.url}" target="_blank" class="btn btn-sm btn-primary">
                    Read Article <i class="fas fa-external-link-alt"></i>
                </a>
            </div>
        </div>

        <div class="post-actions">
            <button class="post-action-btn like-btn ${post.userReaction === 'like' ? 'active' : ''}" 
                    onclick="handleLike('${post._id}')"
                    ${!authToken ? 'disabled title="Login to like"' : ''}>
                <i class="fas fa-thumbs-up"></i>
                <span class="like-count">${post.likeCount}</span>
            </button>
            <button class="post-action-btn dislike-btn ${post.userReaction === 'dislike' ? 'active' : ''}" 
                    onclick="handleDislike('${post._id}')"
                    ${!authToken ? 'disabled title="Login to dislike"' : ''}>
                <i class="fas fa-thumbs-down"></i>
                <span class="dislike-count">${post.dislikeCount}</span>
            </button>
            <button class="post-action-btn comment-btn" onclick="toggleComments('${post._id}')">
                <i class="fas fa-comment"></i>
                <span class="comment-count">${post.commentCount}</span>
            </button>
        </div>

        <div class="post-comments" id="comments-${post._id}" style="display: none;">
            <div class="comments-loading" style="display: none;">
                <div class="spinner-small"></div>
            </div>
            <div class="comments-list"></div>
            ${authToken ? `
            <div class="comment-form">
                <textarea placeholder="Add your review..." maxlength="1000"></textarea>
                <button class="btn btn-sm btn-primary" onclick="submitComment('${post._id}')">Post Comment</button>
            </div>
            ` : `
            <div class="comment-login-prompt">
                <p>Login to add your review</p>
                <button class="btn btn-sm btn-primary" onclick="document.getElementById('auth-overlay').classList.add('active')">Login</button>
            </div>
            `}
        </div>
    `;

    return postDiv;
}

// Handle Like
async function handleLike(postId) {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/like`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            updatePostCounts(postId, data.likeCount, data.dislikeCount);
        }
    } catch (error) {
        console.error('Error liking post:', error);
    }
}

// Handle Dislike
async function handleDislike(postId) {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/dislike`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            updatePostCounts(postId, data.likeCount, data.dislikeCount);
        }
    } catch (error) {
        console.error('Error disliking post:', error);
    }
}

// Update Post Counts
function updatePostCounts(postId, likeCount, dislikeCount) {
    const postElement = document.querySelector(`[data-post-id="${postId}"]`);
    if (postElement) {
        postElement.querySelector('.like-count').textContent = likeCount;
        postElement.querySelector('.dislike-count').textContent = dislikeCount;
    }
}

// Toggle Comments
async function toggleComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);

    if (commentsDiv.style.display === 'none') {
        commentsDiv.style.display = 'block';
        await loadComments(postId);
    } else {
        commentsDiv.style.display = 'none';
    }
}

// Load Comments
async function loadComments(postId) {
    const commentsDiv = document.getElementById(`comments-${postId}`);
    const loadingDiv = commentsDiv.querySelector('.comments-loading');
    const listDiv = commentsDiv.querySelector('.comments-list');

    loadingDiv.style.display = 'block';
    listDiv.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`);
        const data = await response.json();

        loadingDiv.style.display = 'none';

        if (data.success && data.comments && data.comments.length > 0) {
            data.comments.forEach(comment => {
                const commentElement = createCommentElement(comment);
                listDiv.appendChild(commentElement);
            });
        } else {
            listDiv.innerHTML = '<p class="no-comments">No reviews yet. Be the first to share your thoughts!</p>';
        }
    } catch (error) {
        console.error('Error loading comments:', error);
        loadingDiv.style.display = 'none';
        listDiv.innerHTML = '<p class="error-message">Failed to load comments</p>';
    }
}

// Create Comment Element
function createCommentElement(comment) {
    const commentDiv = document.createElement('div');
    commentDiv.className = 'comment';

    const timeAgo = getTimeAgo(new Date(comment.createdAt));

    commentDiv.innerHTML = `
        <div class="comment-avatar">${comment.userName.charAt(0).toUpperCase()}</div>
        <div class="comment-content">
            <div class="comment-header">
                <span class="comment-username">${comment.userName}</span>
                <span class="comment-time">${timeAgo}</span>
            </div>
            <p>${comment.content}</p>
        </div>
    `;

    return commentDiv;
}

// Submit Comment
async function submitComment(postId) {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    const commentsDiv = document.getElementById(`comments-${postId}`);
    const textarea = commentsDiv.querySelector('textarea');
    const content = textarea.value.trim();

    if (!content) {
        alert('Please enter a comment');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/community/posts/${postId}/comments`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ content })
        });

        const data = await response.json();

        if (data.success) {
            textarea.value = '';
            await loadComments(postId);

            // Update comment count
            const postElement = document.querySelector(`[data-post-id="${postId}"]`);
            const commentCountSpan = postElement.querySelector('.comment-count');
            commentCountSpan.textContent = parseInt(commentCountSpan.textContent) + 1;
        }
    } catch (error) {
        console.error('Error submitting comment:', error);
        alert('Failed to post comment');
    }
}

// Helper: Time Ago
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
}
