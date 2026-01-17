document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const urlForm = document.getElementById('submit-url-form');
    const manualForm = document.getElementById('submit-manual-form');
    const loadingState = document.getElementById('loading-state');
    const resultsContainer = document.getElementById('results-container');
    const authOverlay = document.getElementById('auth-overlay');
    const authClose = document.getElementById('auth-close');
    const showAuthBtn = document.getElementById('show-auth-btn');
    const userMenu = document.getElementById('user-menu');
    const logoutBtn = document.getElementById('logout-btn');
    const authWarning = document.getElementById('auth-warning');
    const authWarningLogin = document.getElementById('auth-warning-login');

    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    const API_BASE = 'http://localhost:5000/api';
    let userToken = localStorage.getItem('token');

    // Tab Logic
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            document.getElementById(btn.dataset.tab).classList.add('active');
        });
    });

    // Init Auth State
    function updateAuthState() {
        userToken = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));

        if (userToken && user) {
            showAuthBtn.style.display = 'none';
            userMenu.style.display = 'flex';
            document.getElementById('user-name-text').textContent = user.name || 'User';
            document.getElementById('user-avatar').textContent = (user.name || 'U')[0].toUpperCase();
            authWarning.style.display = 'none';
            document.getElementById('url-submit-btn').disabled = false;
            document.getElementById('manual-submit-btn').disabled = false;
        } else {
            showAuthBtn.style.display = 'block';
            userMenu.style.display = 'none';
            authWarning.style.display = 'block';
            document.getElementById('url-submit-btn').disabled = true;
            document.getElementById('manual-submit-btn').disabled = true;
        }
    }

    updateAuthState();

    // Login Modal Handlers
    showAuthBtn.addEventListener('click', () => {
        authOverlay.style.display = 'flex';
    });

    authClose.addEventListener('click', () => {
        authOverlay.style.display = 'none';
    });

    authWarningLogin.addEventListener('click', (e) => {
        e.preventDefault();
        authOverlay.style.display = 'flex';
    });

    // Handle Login
    document.getElementById('login-form-element').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorMsg = document.getElementById('login-error');

        try {
            const response = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                authOverlay.style.display = 'none';
                updateAuthState();
            } else {
                errorMsg.textContent = data.message || 'Login failed';
            }
        } catch (err) {
            errorMsg.textContent = 'Server error. Please try again.';
        }
    });

    // Logout
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
    });

    // Handle URL Submission
    urlForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('news-url').value.trim();

        if (!url) return;

        performAnalysis(`${API_BASE}/credibility/analyze-url`, { url });
    });

    // Handle Manual Submission
    manualForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('news-title').value.trim();
        const content = document.getElementById('news-content').value.trim();

        if (!title || !content) return;

        performAnalysis(`${API_BASE}/credibility/analyze-content`, { title, content });
    });

    async function performAnalysis(endpoint, body) {
        // Reset UI
        resultsContainer.style.display = 'none';
        loadingState.style.display = 'flex';

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userToken}`
                },
                body: JSON.stringify(body)
            });

            const data = await response.json();

            if (data.success) {
                displayResults(data.credibility);
            } else {
                alert(data.message || 'Analysis failed. Please try Manual Submission.');
            }
        } catch (err) {
            console.error('Analysis error:', err);
            alert('An error occurred. Please check your connection.');
        } finally {
            loadingState.style.display = 'none';
        }
    }

    // Share Logic
    const shareModal = document.getElementById('share-modal');
    const shareForm = document.getElementById('share-form');
    const shareModalClose = document.getElementById('share-modal-close');
    const shareCommunityBtn = document.getElementById('share-community-btn');
    const sharePreview = document.getElementById('share-preview');
    const shareSubmitBtn = document.getElementById('share-submit-btn');

    let currentCredibilityResult = null;

    if (shareCommunityBtn) {
        shareCommunityBtn.addEventListener('click', () => {
            if (!currentCredibilityResult) return;
            openShareModal(currentCredibilityResult);
        });
    }

    if (shareModalClose) {
        shareModalClose.addEventListener('click', () => {
            shareModal.classList.remove('active');
        });
    }

    // Close on outside click
    window.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('active');
        }
    });

    function openShareModal(credibility) {
        if (!userToken) {
            authOverlay.style.display = 'flex';
            return;
        }

        const sourceName = credibility.sourceMetadata?.name || 'Unknown Source';
        const url = credibility.sourceMetadata?.url || '';

        // Populate preview
        sharePreview.innerHTML = `
            <h4>Article Preview</h4>
            <div class="share-preview-article">
                <div class="share-preview-image">
                    <img src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800" 
                         alt="News Thumbnail">
                </div>
                <div class="share-preview-content">
                    <h5>${url || 'Article Submission'}</h5>
                    <p>${sourceName} • ${credibility.sourceMetadata?.category || 'General'}</p>
                    <div style="margin-top: 5px; font-weight: bold; color: var(--primary);">
                        Score: ${credibility.finalScore}/100
                    </div>
                </div>
            </div>
        `;

        document.getElementById('share-message').value = '';
        shareModal.classList.add('active');
    }

    if (shareForm) {
        shareForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            if (!currentCredibilityResult || !userToken) return;

            const message = document.getElementById('share-message').value.trim();
            shareSubmitBtn.disabled = true;
            shareSubmitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sharing...';

            try {
                const response = await fetch(`${API_BASE}/community/share`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${userToken}`
                    },
                    body: JSON.stringify({
                        articleId: currentCredibilityResult.articleId,
                        message: message,
                        articleData: {
                            title: currentCredibilityResult.sourceMetadata?.url || 'News Article',
                            summary: currentCredibilityResult.explanationTags.join(', '),
                            image: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
                            url: currentCredibilityResult.sourceMetadata?.url,
                            source: currentCredibilityResult.sourceMetadata?.name || 'User Submission',
                            category: currentCredibilityResult.sourceMetadata?.category || 'General'
                        }
                    })
                });

                const data = await response.json();

                if (data.success) {
                    shareModal.classList.remove('active');
                    if (confirm('✅ Article shared to community! View it now?')) {
                        window.location.href = 'community.html';
                    }
                } else {
                    alert('Sharing failed: ' + data.message);
                }
            } catch (err) {
                console.error('Sharing error:', err);
                alert('An error occurred while sharing.');
            } finally {
                shareSubmitBtn.disabled = false;
                shareSubmitBtn.innerHTML = '<i class="fas fa-rocket"></i> Boost & Share to Community';
            }
        });
    }

    function displayResults(credibility) {
        currentCredibilityResult = credibility; // Store for sharing
        const score = credibility.finalScore;
        const risk = credibility.riskLevel;
        const tags = credibility.explanationTags;

        const scoreDisplay = document.getElementById('score-display');
        const scoreRisk = document.getElementById('score-risk');
        const scoreCard = document.getElementById('score-card');
        const tagsContainer = document.getElementById('tags-container');

        scoreDisplay.textContent = score;
        scoreRisk.textContent = risk.toUpperCase() + ' RISK';

        // Update card style
        scoreCard.className = 'score-card';
        if (risk === 'low') scoreCard.classList.add('score-low');
        else if (risk === 'medium') scoreCard.classList.add('score-medium');
        else scoreCard.classList.add('score-high');

        // Render Tags
        tagsContainer.innerHTML = '';
        tags.forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'tag';

            if (tag.includes('✅')) tagEl.classList.add('tag-positive');
            else if (tag.includes('⚠️')) tagEl.classList.add('tag-warning');
            else tagEl.classList.add('tag-danger');

            tagEl.textContent = tag;
            tagsContainer.appendChild(tagEl);
        });

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Dark Mode Toggle
    const modeToggle = document.getElementById('mode-toggle');
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    modeToggle.checked = isDarkMode;
    if (isDarkMode) document.body.classList.add('dark-mode');

    modeToggle.addEventListener('change', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', modeToggle.checked);
    });
});
