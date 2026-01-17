// Priority sources to show at the top in "Latest News"
const PRIORITY_SOURCES = [
    'BBC',
    'BBC News',
    'Reuters',
    'AP News',
    'Associated Press',
    'The Hindu',
    'Indian Express',
    'The Indian Express',
    'The Guardian',
    'New York Times',
    'The New York Times',
    'Financial Times',
    'The Economist',
    'Al Jazeera',
    'NDTV',
    'Bloomberg'
];

function isPrioritySource(source) {
    if (!source) return false;
    const s = source.toLowerCase();
    return PRIORITY_SOURCES.some(name => s.includes(name.toLowerCase()));
}

function prioritizeSources(articles) {
    if (!Array.isArray(articles)) return articles;

    // Stable sort: keep original order inside each group
    return [...articles]
        .map((article, index) => ({ article, index }))
        .sort((a, b) => {
            const aGood = isPrioritySource(a.article.source);
            const bGood = isPrioritySource(b.article.source);

            if (aGood && !bGood) return -1;   // good source comes first
            if (!aGood && bGood) return 1;    // non-good comes after
            return a.index - b.index;         // keep original order otherwise
        })
        .map(x => x.article);
}

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentLanguage = 'en';
let currentUser = null;
let authToken = null;
let allArticles = [];
let userBookmarks = [];
let articleReactions = {};
let sentimentChart = null;
let sourceChart = null;
let categoryChart = null;
let analysisSentimentChart = null;
let analysisSourceChart = null;
let isFromCache = false;

// Helper function to truncate text
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
}

const translations = {
    en: {
        // Navbar
        logo: '📊 NewsPulse',
        forYou: 'For You',
        trending: 'Trending',
        analysis: 'Analysis',
        login: 'Login',
        logout: 'Logout',
        searchPlaceholder: 'Search headlines...',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',

        // Auth Modal
        welcomeBack: 'Welcome Back!',
        loginSubtitle: 'Login to access your personalized news feed',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        loginButton: 'Login',
        signupButton: 'Sign Up',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        createAccount: 'Create Account',
        joinNewsPulse: 'Join NewsPulse to stay updated',

        // Daily Mix
        dailyMix: '✨ Your Daily Mix',
        dailyMixSubtitle: 'Personalized news recommendations',
        recommended: 'Recommended',
        unlockDailyMix: 'Unlock Your Daily Mix',
        loginForRecommendations: 'Login to get personalized news recommendations',
        loginNow: 'Login Now',
        startBuildingMix: 'Start Building Your Mix',
        likeArticlesForRecs: 'Like articles to get personalized recommendations',
        exploreNews: 'Explore News',

        // Categories
        filterByCategory: 'Filter by Category',
        all: 'All',
        business: 'Business',
        technology: 'Technology',
        sports: 'Sports',
        politics: 'Politics',
        entertainment: 'Entertainment',
        health: 'Health',
        science: 'Science',

        // News Section
        trendingNews: 'Trending News',
        latestNews: 'Latest News',
        readMore: 'Read More',
        similar: 'Similar',
        readFullStory: 'Read Full Story',
        cached: '📦 Cached',
        fresh: '🆕 Fresh',

        // Sidebar
        trendingTopics: 'TRENDING TOPICS',
        filters: 'FILTERS',
        country: 'Country:',
        language: 'Language:',
        bookmarkedArticles: 'BOOKMARKED ARTICLES',
        newsletter: '📬 NEWSLETTER',
        loginToViewBookmarks: 'Login to view bookmarks',
        noBookmarks: 'No bookmarked articles yet',

        // Newsletter
        getDailyHeadlines: 'Get daily top headlines delivered to your inbox every morning! 📬',
        subscribeNow: 'Subscribe Now',
        subscribed: '✅ Subscribed!',
        youllReceiveUpdates: "You'll receive %s updates",
        frequency: 'Frequency:',
        categories: 'Categories:',
        managePreferences: 'Manage Preferences',
        unsubscribe: 'Unsubscribe',
        daily: 'daily',
        weekly: 'weekly',

        // Pages
        mostPopularStories: 'Most Popular Stories',
        sentimentTrends: 'SENTIMENT TRENDS',
        newsAnalyticsDashboard: 'News Analytics Dashboard',
        totalArticles: 'Total Articles',
        positiveNews: 'Positive News',
        negativeNews: 'Negative News',
        neutralNews: 'Neutral News',
        sentimentDistribution: 'Sentiment Distribution',
        categoryDistribution: 'Category Distribution',
        newsSourceDistribution: 'News Source Distribution',
        topKeywords: 'Top Keywords',
        keyInsights: 'KEY INSIGHTS',

        // Similar Articles
        similarArticles: 'Similar Articles',
        noSimilarArticles: 'No similar articles found',

        // Sentiment & Time
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        recently: 'Recently',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',

        // Messages
        noArticlesFound: 'No articles found',
        analyzingData: 'Analyzing data...',

        // Footer
        aboutNewsPulse: 'About NewsPulse',
        aboutDescription: 'Bringing you trending headlines with AI-powered sentiment analysis and insights.',
        contact: 'Contact',
        followUs: 'Follow Us',
        footerCopyright: '© 2025 NewsPulse. All rights reserved. Powered by NewsAPI.ai'
    },

    hi: {
        logo: '📊 न्यूज़पल्स',
        forYou: 'आपके लिए',
        trending: 'ट्रेंडिंग',
        analysis: 'विश्लेषण',
        login: 'लॉगिन',
        logout: 'लॉगआउट',
        searchPlaceholder: 'सुर्खियां खोजें...',
        lightMode: 'लाइट मोड',
        darkMode: 'डार्क मोड',
        welcomeBack: 'वापसी पर स्वागत है!',
        loginSubtitle: 'अपने व्यक्तिगत समाचार फ़ीड तक पहुँचने के लिए लॉगिन करें',
        email: 'ईमेल',
        password: 'पासवर्ड',
        fullName: 'पूरा नाम',
        loginButton: 'लॉगिन करें',
        signupButton: 'साइन अप करें',
        dontHaveAccount: 'खाता नहीं है?',
        alreadyHaveAccount: 'पहले से खाता है?',
        createAccount: 'खाता बनाएं',
        joinNewsPulse: 'अपडेट रहने के लिए न्यूज़पल्स से जुड़ें',
        dailyMix: '✨ आपका दैनिक मिश्रण',
        dailyMixSubtitle: 'व्यक्तिगत समाचार सिफारिशें',
        recommended: 'अनुशंसित',
        unlockDailyMix: 'अपना दैनिक मिश्रण अनलॉक करें',
        loginForRecommendations: 'व्यक्तिगत समाचार सिफारिशें प्राप्त करने के लिए लॉगिन करें',
        loginNow: 'अभी लॉगिन करें',
        startBuildingMix: 'अपना मिश्रण बनाना शुरू करें',
        likeArticlesForRecs: 'व्यक्तिगत सिफारिशें प्राप्त करने के लिए लेखों को लाइक करें',
        exploreNews: 'समाचार एक्सप्लोर करें',
        filterByCategory: 'श्रेणी के अनुसार फ़िल्टर करें',
        all: 'सभी',
        business: 'व्यवसाय',
        technology: 'प्रौद्योगिकी',
        sports: 'खेल',
        politics: 'राजनीति',
        entertainment: 'मनोरंजन',
        health: 'स्वास्थ्य',
        science: 'विज्ञान',
        trendingNews: 'ट्रेंडिंग समाचार',
        latestNews: 'नवीनतम समाचार',
        readMore: 'और पढ़ें',
        similar: 'समान',
        readFullStory: 'पूरी कहानी पढ़ें',
        cached: '📦 कैश्ड',
        fresh: '🆕 ताजा',
        trendingTopics: 'ट्रेंडिंग विषय',
        filters: 'फ़िल्टर',
        country: 'देश:',
        language: 'भाषा:',
        bookmarkedArticles: 'बुकमार्क किए गए लेख',
        newsletter: '📬 न्यूज़लेटर',
        loginToViewBookmarks: 'बुकमार्क देखने के लिए लॉगिन करें',
        noBookmarks: 'अभी तक कोई बुकमार्क नहीं',
        getDailyHeadlines: 'हर सुबह अपने इनबॉक्स में शीर्ष सुर्खियां प्राप्त करें! 📬',
        subscribeNow: 'अभी सब्सक्राइब करें',
        subscribed: '✅ सब्सक्राइब किया!',
        youllReceiveUpdates: 'आप %s अपडेट प्राप्त करेंगे',
        frequency: 'आवृत्ति:',
        categories: 'श्रेणियां:',
        managePreferences: 'प्राथमिकताएं प्रबंधित करें',
        unsubscribe: 'सदस्यता समाप्त करें',
        daily: 'दैनिक',
        weekly: 'साप्ताहिक',
        mostPopularStories: 'सबसे लोकप्रिय कहानियां',
        sentimentTrends: 'भावना रुझान',
        newsAnalyticsDashboard: 'समाचार विश्लेषण डैशबोर्ड',
        totalArticles: 'कुल लेख',
        positiveNews: 'सकारात्मक समाचार',
        negativeNews: 'नकारात्मक समाचार',
        neutralNews: 'तटस्थ समाचार',
        sentimentDistribution: 'भावना वितरण',
        categoryDistribution: 'श्रेणी वितरण',
        newsSourceDistribution: 'समाचार स्रोत वितरण',
        topKeywords: 'शीर्ष कीवर्ड',
        keyInsights: 'मुख्य अंतर्दृष्टि',
        similarArticles: 'समान लेख',
        noSimilarArticles: 'कोई समान लेख नहीं मिला',
        positive: 'सकारात्मक',
        negative: 'नकारात्मक',
        neutral: 'तटस्थ',
        recently: 'हाल ही में',
        minutesAgo: 'मिनट पहले',
        hoursAgo: 'घंटे पहले',
        daysAgo: 'दिन पहले',
        noArticlesFound: 'कोई लेख नहीं मिला',
        analyzingData: 'डेटा का विश्लेषण...',
        aboutNewsPulse: 'न्यूज़पल्स के बारे में',
        aboutDescription: 'एआई-संचालित भावना विश्लेषण और अंतर्दृष्टि के साथ ट्रेंडिंग सुर्खियां लाना।',
        contact: 'संपर्क',
        followUs: 'हमें फॉलो करें',
        footerCopyright: '© 2025 न्यूज़पल्स। सर्वाधिकार सुरक्षित। NewsAPI.ai द्वारा संचालित'
    }
};

// Translation Helper Function
function t(key) {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
}

// Update ALL UI with translations
function updateUILanguage() {
    console.log('🌍 Updating UI language to:', currentLanguage);

    const logo = document.querySelector('.logo');
    if (logo) logo.textContent = t('logo');

    document.querySelectorAll('.nav-link').forEach(link => {
        const page = link.dataset.page;
        if (page === 'for-you') link.textContent = t('forYou');
        if (page === 'trending') link.textContent = t('trending');
        if (page === 'analysis') link.textContent = t('analysis');
    });

    const loginBtn = document.getElementById('show-auth-btn');
    if (loginBtn) loginBtn.textContent = t('login');

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');

    const modeLabel = document.getElementById('mode-label');
    if (modeLabel) {
        const isDark = document.getElementById('mode-toggle').checked;
        modeLabel.textContent = isDark ? t('darkMode') : t('lightMode');
    }
}

function setupLanguageSelector() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;

    langSelect.addEventListener('change', function () {
        const newLang = this.value;
        console.log('🌍 Language changed to:', newLang);

        currentLanguage = newLang;
        localStorage.setItem('preferredLanguage', newLang);
        updateUILanguage();
    });
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();
    setupEventListeners();
    initializeCharts();
    initAISummaries();
    initChatbot();
});

// Auth Functions
function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');

    if (token && user) {
        authToken = token;
        currentUser = JSON.parse(user);
        updateUIForLoggedInUser();
        loadUserBookmarks().then(() => {
            loadNewsFromAPI();
            loadDailyMix();
        });
    } else {
        updateUIForLoggedOutUser();
        loadNewsFromAPI();
        showDailyMixLoginPrompt();
    }
}

function updateUIForLoggedInUser() {
    document.getElementById('show-auth-btn').style.display = 'none';
    document.getElementById('user-menu').style.display = 'block';
    document.getElementById('nav-links').style.display = 'flex';
    document.getElementById('search-bar').style.display = 'flex';

    const userAvatar = document.getElementById('user-avatar');
    const userNameText = document.getElementById('user-name-text');

    userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
    userNameText.textContent = currentUser.name;
}

function updateUIForLoggedOutUser() {
    document.getElementById('show-auth-btn').style.display = 'block';
    document.getElementById('user-menu').style.display = 'none';
    document.getElementById('nav-links').style.display = 'flex';
    document.getElementById('search-bar').style.display = 'flex';

    const bookmarksContainer = document.getElementById('bookmarked-articles');
    bookmarksContainer.innerHTML = '<p class="empty-state">Login to view bookmarks</p>';
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

        await loadUserBookmarks();
        await loadNewsFromAPI();
        await loadDailyMix();

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign Up';
    }
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

        await loadUserBookmarks();
        await loadNewsFromAPI();
        await loadDailyMix();

    } catch (error) {
        errorDiv.textContent = error.message;
        errorDiv.classList.add('active');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Login';
    }
}

function handleLogout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    authToken = null;
    currentUser = null;
    userBookmarks = [];
    articleReactions = {};

    updateUIForLoggedOutUser();
    loadNewsFromAPI();
    showDailyMixLoginPrompt();
}

// ========== DAILY MIX FUNCTIONS ========== 

async function loadDailyMix() {
    if (!authToken) {
        showDailyMixLoginPrompt();
        return;
    }

    const loadingDiv = document.getElementById('daily-mix-loading');
    const contentDiv = document.getElementById('daily-mix-content');

    loadingDiv.style.display = 'flex';
    contentDiv.innerHTML = '';

    try {
        console.log('🎯 Fetching Daily Mix recommendations...');

        const response = await fetch(`${API_BASE_URL}/recommendations?limit=15`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        loadingDiv.style.display = 'none';

        if (data.success && data.recommendations && data.recommendations.length > 0) {
            console.log(`✅ Loaded ${data.recommendations.length} recommendations`);
            displayDailyMix(data.recommendations);
        } else {
            console.log('⚠️ No recommendations available');
            showDailyMixEmpty();
        }
    } catch (error) {
        console.error('❌ Error loading daily mix:', error);
        loadingDiv.style.display = 'none';
        showDailyMixEmpty();
    }
}

function displayDailyMix(recommendations) {
    const contentDiv = document.getElementById('daily-mix-content');

    const carouselWrapper = document.createElement('div');
    carouselWrapper.className = 'daily-mix-carousel-wrapper';

    const carouselContainer = document.createElement('div');
    carouselContainer.className = 'daily-mix-carousel-container';

    const carousel = document.createElement('div');
    carousel.className = 'daily-mix-carousel';
    carousel.id = 'daily-mix-carousel';

    recommendations.forEach((article, index) => {
        const card = createDailyMixCard(article, index);
        carousel.appendChild(card);
    });

    carouselContainer.appendChild(carousel);
    carouselWrapper.appendChild(carouselContainer);

    const leftBtn = document.createElement('div');
    leftBtn.className = 'daily-mix-scroll-btn daily-mix-scroll-left';
    leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftBtn.onclick = () => scrollDailyMix('left');

    const rightBtn = document.createElement('div');
    rightBtn.className = 'daily-mix-scroll-btn daily-mix-scroll-right';
    rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightBtn.onclick = () => scrollDailyMix('right');

    carouselWrapper.appendChild(leftBtn);
    carouselWrapper.appendChild(rightBtn);

    contentDiv.appendChild(carouselWrapper);

    setTimeout(() => {
        updateDailyMixScrollButtons();
    }, 100);

    carousel.addEventListener('scroll', updateDailyMixScrollButtons);
}

function createDailyMixCard(article, index) {
    const card = document.createElement('div');
    card.className = 'daily-mix-card';

    const sentiment = getSentimentLabel(article.sentiment);
    const sentimentEmoji = sentiment === 'Positive' ? '😊' : sentiment === 'Negative' ? '😟' : '😐';

    const truncatedTitle = truncateText(article.title, 80);
    const truncatedSummary = truncateText(article.summary, 120);

    card.innerHTML = `
        <div class="daily-mix-card-image">
            <img src="${article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'}" 
                 alt="${article.title}" 
                 onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'">
            <div class="daily-mix-recommended-badge">
                <i class="fas fa-star"></i> Recommended
            </div>
        </div>
        <div class="daily-mix-card-content">
            <h3 title="${article.title}">${truncatedTitle}</h3>
            <p title="${article.summary}">${truncatedSummary}</p>
            <div class="daily-mix-meta">
                <span class="daily-mix-category">${article.category || 'General'}</span>
                <span>${sentimentEmoji} ${sentiment}</span>
            </div>
        </div>
    `;

    card.onclick = () => window.open(article.url, '_blank');

    return card;
}

function scrollDailyMix(direction) {
    const carousel = document.getElementById('daily-mix-carousel');
    if (!carousel) return;

    const scrollAmount = 320;

    if (direction === 'left') {
        carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    } else {
        carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }

    setTimeout(updateDailyMixScrollButtons, 300);
}

function updateDailyMixScrollButtons() {
    const carousel = document.getElementById('daily-mix-carousel');
    const leftBtn = document.querySelector('.daily-mix-scroll-left');
    const rightBtn = document.querySelector('.daily-mix-scroll-right');

    if (!carousel || !leftBtn || !rightBtn) return;

    const isAtStart = carousel.scrollLeft <= 10;
    const isAtEnd = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 10);

    leftBtn.classList.toggle('disabled', isAtStart);
    rightBtn.classList.toggle('disabled', isAtEnd);
}

function showDailyMixLoginPrompt() {
    const contentDiv = document.getElementById('daily-mix-content');
    contentDiv.innerHTML = `
        <div class="daily-mix-empty">
            <i class="fas fa-lock"></i>
            <h3>Unlock Your Daily Mix</h3>
            <p>Login to get personalized news recommendations</p>
            <button class="btn" onclick="document.getElementById('auth-overlay').classList.add('active')">
                Login Now
            </button>
        </div>
    `;
}

function showDailyMixEmpty() {
    const contentDiv = document.getElementById('daily-mix-content');
    contentDiv.innerHTML = `
        <div class="daily-mix-empty">
            <i class="fas fa-heart"></i>
            <h3>Start Building Your Mix</h3>
            <p>Like articles to get personalized recommendations</p>
            <button class="btn" onclick="document.querySelector('.news-section').scrollIntoView({ behavior: 'smooth' })">
                Explore News
            </button>
        </div>
    `;
}

// ========== END DAILY MIX FUNCTIONS ==========
// ========== BOOKMARKS AND REACTIONS ==========

async function loadUserBookmarks() {
    if (!authToken) {
        userBookmarks = [];
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/bookmarks`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            userBookmarks = data.bookmarks;
            console.log('Loaded bookmarks:', userBookmarks.length);
            updateBookmarksUI();
        }
    } catch (error) {
        console.error('Error loading bookmarks:', error);
        userBookmarks = [];
    }
}

async function loadNewsletterStatus() {
    const widget = document.getElementById('newsletter-content');

    if (!authToken) {
        widget.innerHTML = `
            <div class="newsletter-login-prompt">
                <i class="fas fa-envelope"></i>
                <p>Login to subscribe to our daily newsletter</p>
                <button class="btn-newsletter btn-subscribe" onclick="document.getElementById('auth-overlay').classList.add('active')">
                    Login to Subscribe
                </button>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.subscribed) {
                displaySubscribedNewsletter(data.preferences);
            } else {
                displayUnsubscribedNewsletter();
            }
        }
    } catch (error) {
        console.error('Error loading newsletter status:', error);
        widget.innerHTML = '<p class="empty-state">Error loading newsletter</p>';
    }
}

function displaySubscribedNewsletter(preferences) {
    const widget = document.getElementById('newsletter-content');

    const categories = preferences.categories.join(', ');
    const frequency = preferences.frequency.charAt(0).toUpperCase() + preferences.frequency.slice(1);

    widget.innerHTML = `
        <div class="newsletter-subscribed">
            <i class="fas fa-check-circle"></i>
            <h4>✅ Subscribed!</h4>
            <p>You'll receive ${frequency.toLowerCase()} updates</p>
            
            <div class="newsletter-preferences">
                <p><strong>Frequency:</strong> ${frequency}</p>
                <p><strong>Categories:</strong> ${categories}</p>
            </div>
            
            <button class="btn-newsletter btn-manage" onclick="openNewsletterModal()">
                <i class="fas fa-cog"></i> Manage Preferences
            </button>
            
            <button class="btn-newsletter btn-unsubscribe" onclick="unsubscribeNewsletter()">
                Unsubscribe
            </button>
        </div>
    `;
}

function displayUnsubscribedNewsletter() {
    const widget = document.getElementById('newsletter-content');

    widget.innerHTML = `
        <div class="newsletter-section">
            <p>Get daily top headlines delivered to your inbox every morning! 📬</p>
            <button class="btn-newsletter btn-subscribe" onclick="subscribeNewsletter()">
                <i class="fas fa-envelope"></i> Subscribe Now
            </button>
        </div>
    `;
}

async function subscribeNewsletter() {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                frequency: 'daily',
                categories: ['all']
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Successfully subscribed to newsletter!');
            loadNewsletterStatus();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error subscribing:', error);
        alert('❌ Failed to subscribe');
    }
}

async function unsubscribeNewsletter() {
    if (!confirm('Are you sure you want to unsubscribe from the newsletter?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Successfully unsubscribed');
            loadNewsletterStatus();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error unsubscribing:', error);
        alert('❌ Failed to unsubscribe');
    }
}

function openNewsletterModal() {
    document.getElementById('newsletter-modal').classList.add('active');
    loadCurrentPreferences();
}

async function loadCurrentPreferences() {
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success && data.preferences) {
            document.getElementById('newsletter-frequency').value = data.preferences.frequency;

            document.querySelectorAll('[name="category"]').forEach(cb => cb.checked = false);

            data.preferences.categories.forEach(cat => {
                const checkbox = document.querySelector(`[name="category"][value="${cat}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

function updateBookmarksUI() {
    const container = document.getElementById('bookmarked-articles');
    container.innerHTML = '';

    if (userBookmarks.length === 0) {
        container.innerHTML = '<p class="empty-state">No bookmarked articles yet</p>';
        return;
    }

    userBookmarks.slice(0, 5).forEach(bookmark => {
        const item = document.createElement('div');
        item.className = 'bookmark-item';
        item.innerHTML = `
            <h4>${bookmark.title}</h4>
            <span>${bookmark.source}</span>
        `;
        item.onclick = () => window.open(bookmark.url, '_blank');
        container.appendChild(item);
    });
}

async function toggleBookmark(article, btnElement) {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    const isBookmarked = btnElement.classList.contains('bookmarked');

    try {
        if (isBookmarked) {
            const bookmark = userBookmarks.find(b => b.articleId === article.id);
            if (bookmark) {
                const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmark._id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    userBookmarks = userBookmarks.filter(b => b._id !== bookmark._id);
                    btnElement.classList.remove('bookmarked');
                    btnElement.querySelector('i').classList.remove('fas');
                    btnElement.querySelector('i').classList.add('far');
                    updateBookmarksUI();
                    console.log('Bookmark removed');
                }
            }
        } else {
            const response = await fetch(`${API_BASE_URL}/bookmarks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    articleId: article.id,
                    title: article.title,
                    summary: article.summary,
                    image: article.image,
                    source: article.source,
                    url: article.url,
                    category: article.category,
                    sentiment: article.sentiment
                })
            });

            const data = await response.json();

            if (data.success) {
                userBookmarks.unshift(data.bookmark);
                btnElement.classList.add('bookmarked');
                btnElement.querySelector('i').classList.remove('far');
                btnElement.querySelector('i').classList.add('fas');
                updateBookmarksUI();
                console.log('Bookmark added');
            } else {
                throw new Error(data.message);
            }
        }
    } catch (error) {
        console.error('Error toggling bookmark:', error);
        alert('Error: ' + error.message);
    }
}

async function handleReaction(articleId, reactionType, btnElement) {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    console.log('🎯 Handling reaction:', { articleId, reactionType, user: currentUser?.email });

    try {
        const response = await fetch(`${API_BASE_URL}/reactions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                articleId,
                reactionType
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('✅ Server response:', data);

            articleReactions[articleId] = data.counts;

            const articleIndex = allArticles.findIndex(a => a.id === articleId);
            if (articleIndex !== -1) {
                allArticles[articleIndex].reactions = data.counts;
            }

            const allCards = document.querySelectorAll(`[data-article-id="${articleId}"]`);
            console.log(`📌 Found ${allCards.length} cards to update`);

            allCards.forEach(card => {
                const reactionsContainer = card.querySelector('.reactions');
                if (reactionsContainer) {
                    const allReactionBtns = reactionsContainer.querySelectorAll('.reaction-btn');
                    allReactionBtns.forEach(btn => {
                        const btnType = btn.getAttribute('data-type');
                        if (btnType === reactionType) {
                            btn.classList.add('active');
                        } else {
                            btn.classList.remove('active');
                        }
                    });

                    const likeCountSpan = reactionsContainer.querySelector('[data-type="like"] .reaction-count');
                    const dislikeCountSpan = reactionsContainer.querySelector('[data-type="dislike"] .reaction-count');
                    const neutralCountSpan = reactionsContainer.querySelector('[data-type="neutral"] .reaction-count');

                    if (likeCountSpan) {
                        likeCountSpan.textContent = data.counts.like || 0;
                    }
                    if (dislikeCountSpan) {
                        dislikeCountSpan.textContent = data.counts.dislike || 0;
                    }
                    if (neutralCountSpan) {
                        neutralCountSpan.textContent = data.counts.neutral || 0;
                    }
                }
            });

            console.log('✅ All counts updated successfully!');

            if (reactionType === 'like') {
                console.log('🔄 Reloading Daily Mix after like...');
                setTimeout(() => loadDailyMix(), 500);
            }
        } else {
            console.error('❌ Server returned error:', data);
        }
    } catch (error) {
        console.error('❌ Error in handleReaction:', error);
    }
}

async function loadUserReaction(articleId) {
    if (!authToken) return null;

    try {
        const response = await fetch(`${API_BASE_URL}/reactions/user/${articleId}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success && data.reaction) {
            return data.reaction;
        }
    } catch (error) {
        console.error('Error loading user reaction:', error);
    }

    return null;
}

// ========== NEWS API FUNCTIONS ==========

async function fetchNews(category = 'all', country = '', lang = 'en') {
    try {
        const params = new URLSearchParams({
            category,
            country,
            lang
        });

        const response = await fetch(`${API_BASE_URL}/news?${params}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.articles) {
            isFromCache = data.fromCache;

            const cacheStatus = document.getElementById('cache-status');
            const cacheStatusCarousel = document.getElementById('cache-status-carousel');

            if (cacheStatus) {
                cacheStatus.innerHTML = data.fromCache ?
                    '<span class="cache-indicator cached">📦 Cached</span>' :
                    '<span class="cache-indicator fresh">🆕 Fresh</span>';
            }

            if (cacheStatusCarousel) {
                cacheStatusCarousel.innerHTML = data.fromCache ?
                    '<span class="cache-indicator cached">📦 Cached</span>' :
                    '<span class="cache-indicator fresh">🆕 Fresh</span>';
            }

            allArticles = data.articles.map(article => ({
                id: article.articleId,
                title: article.title,
                summary: article.summary,
                image: article.image,
                source: article.source,
                time: formatTime(article.publishedAt),
                category: article.category,
                url: article.url,
                sentiment: article.sentiment,
                dateTime: article.publishedAt,
                shares: article.shares,
                uri: article.uri,
                lang: article.lang,
                reactions: article.reactions || { like: 0, dislike: 0, neutral: 0, total: 0 }
            }));

            allArticles.forEach(article => {
                articleReactions[article.id] = article.reactions;
            });

            console.log(`Loaded ${allArticles.length} articles (from ${data.fromCache ? 'cache' : 'API'})`);
            return allArticles;
        } else {
            throw new Error('No articles found');
        }
    } catch (error) {
        console.error('Error fetching news:', error);
        return [];
    }
}

async function searchNews(query) {
    try {
        const langSelect = document.getElementById('lang-select');
        const lang = langSelect ? langSelect.value : 'en';

        const params = new URLSearchParams({
            query,
            lang
        });

        const response = await fetch(`${API_BASE_URL}/news/search?${params}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.articles) {
            return data.articles.map(article => ({
                id: article.articleId,
                title: article.title,
                summary: article.summary,
                image: article.image,
                source: article.source,
                time: formatTime(article.publishedAt),
                category: article.category,
                url: article.url,
                sentiment: article.sentiment,
                dateTime: article.publishedAt,
                shares: article.shares,
                uri: article.uri,
                reactions: article.reactions || { like: 0, dislike: 0, neutral: 0, total: 0 }
            }));
        }

        return [];
    } catch (error) {
        console.error('Error searching news:', error);
        return [];
    }
}

async function findSimilarArticles(articleUri) {
    try {
        const response = await fetch(`${API_BASE_URL}/news/similar/${articleUri}`);

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.articles) {
            return data.articles;
        }

        return [];
    } catch (error) {
        console.error('Error finding similar articles:', error);
        return [];
    }
}

// ========== DISPLAY FUNCTIONS ==========

async function loadNewsFromAPI(category = 'all', country = '', lang = 'en') {
    const container = document.getElementById('news-container');
    const loading = document.getElementById('news-loading');
    
    loading.style.display = 'flex';
    container.style.display = 'none';
    
    const articles = await fetchNews(category, country, lang);

    // NEW: prioritize good sources (BBC, Reuters, The Hindu, etc.)
    const prioritizedArticles = prioritizeSources(articles);
    
    loading.style.display = 'none';
    container.style.display = 'grid';
    
    // Use prioritized list for rendering and analytics
    await displayNewsArticles(prioritizedArticles, 'news-container');
    updateAnalytics(prioritizedArticles);
    loadCarousel(prioritizedArticles.slice(0, 5));
}

async function loadTrendingArticles() {
    const container = document.getElementById('trending-news-container');
    const loading = document.getElementById('trending-loading');
    const langSelect = document.getElementById('lang-select');
    const lang = langSelect ? langSelect.value : 'en';

    loading.style.display = 'flex';
    container.style.display = 'none';

    const articles = await fetchNews('all', '', lang);
    const trending = articles.sort((a, b) => {
        const aScore = (a.reactions.total || 0) + (a.shares || 0);
        const bScore = (b.reactions.total || 0) + (b.shares || 0);
        return bScore - aScore;
    }).slice(0, 20);

    loading.style.display = 'none';
    container.style.display = 'grid';

    await displayNewsArticles(trending, 'trending-news-container');
}

async function displayNewsArticles(articles, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (articles.length === 0) {
        container.innerHTML = '<p class="empty-state">No articles found</p>';
        return;
    }

    for (const article of articles) {
        const newsCard = await createNewsCard(article);
        container.appendChild(newsCard);
    }
}

async function createNewsCard(article) {
    const card = document.createElement('div');
    card.className = 'news-card';
    card.dataset.category = article.category;
    card.dataset.articleId = article.id;

    const sentiment = getSentimentLabel(article.sentiment);
    const sentimentClass = sentiment.toLowerCase();

    const isBookmarked = userBookmarks.some(b => b.articleId === article.id);

    const reactions = article.reactions || { like: 0, dislike: 0, neutral: 0, total: 0 };
    const userReaction = await loadUserReaction(article.id);

    let dominantSentiment = 'neutral';
    if (reactions.like > reactions.dislike && reactions.like > reactions.neutral) {
        dominantSentiment = 'positive';
    } else if (reactions.dislike > reactions.like && reactions.dislike > reactions.neutral) {
        dominantSentiment = 'negative';
    }

    card.innerHTML = `
        <div class="news-image">
            <img src="${article.image}" alt="News image" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'">
            <span class="sentiment-badge sentiment-${dominantSentiment}">
                ${dominantSentiment === 'positive' ? '😊' : dominantSentiment === 'negative' ? '😟' : '😐'} ${dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)}
            </span>
            ${authToken ? `
            <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-article-id="${article.id}">
                <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
            </button>
            ` : ''}
            <div class="credibility-badge-placeholder"></div>
        </div>
        <div class="news-content">
            <h3>${article.title}</h3>
            <p>${article.summary}</p>
            <div class="news-meta">
                <span class="source">${article.source}</span>
                <span class="time">${article.time}</span>
            </div>
            <div class="news-actions">
                <div class="action-group">
                    <button class="btn btn-primary read-more" data-url="${article.url}">Read More</button>
                    <button class="btn btn-similar find-similar" data-uri="${article.uri}">Similar</button>
                </div>
                <div class="action-group">
                    ${authToken ? `
                    <div class="reactions">
                        <button class="reaction-btn like ${userReaction === 'like' ? 'active' : ''}" data-article-id="${article.id}" data-type="like" title="Like">
                            👍 <span class="reaction-count" data-type="like">${reactions.like}</span>
                        </button>
                        <button class="reaction-btn dislike ${userReaction === 'dislike' ? 'active' : ''}" data-article-id="${article.id}" data-type="dislike" title="Dislike">
                            👎 <span class="reaction-count" data-type="dislike">${reactions.dislike}</span>
                        </button>
                        <button class="reaction-btn neutral ${userReaction === 'neutral' ? 'active' : ''}" data-article-id="${article.id}" data-type="neutral" title="Neutral">
                            😐 <span class="reaction-count" data-type="neutral">${reactions.neutral}</span>
                        </button>
                    </div>
                    <button class="btn-share" data-article-id="${article.id}" title="Share to Community">
                        <i class="fas fa-rocket"></i>
                        <span>Boost & Share</span>
                    </button>
                    ` : `
                    <div class="reactions">
                        <span style="font-size: 12px;">👍 ${reactions.like} 👎 ${reactions.dislike} 😐 ${reactions.neutral}</span>
                    </div>
                    `}
                </div>
            </div>
        </div>
    `;

    // Add credibility badge AFTER card is created
    // Use setTimeout to ensure DOM is ready
    setTimeout(() => {
        addCredibilityBadge(card, article.id);
    }, 0);

    return card;
}
function loadCarousel(articles) {
    const carousel = document.getElementById('carousel');
    const indicators = document.getElementById('carousel-indicators');
    const container = document.getElementById('carousel-container');
    const loading = document.getElementById('carousel-loading');

    if (articles.length === 0) {
        loading.style.display = 'none';
        return;
    }

    carousel.innerHTML = '';
    indicators.innerHTML = '';

    articles.forEach((article, index) => {
        const item = document.createElement('div');
        item.className = 'carousel-item';
        item.innerHTML = `
            <img src="${article.image}" alt="${article.title}" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200'">
            <div class="carousel-content">
                <h3>${article.title}</h3>
                <p>${article.summary}</p>
                <button class="btn btn-primary read-more" data-url="${article.url}">Read Full Story</button>
            </div>
        `;
        carousel.appendChild(item);

        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.dataset.index = index;
        indicators.appendChild(indicator);
    });

    loading.style.display = 'none';
    container.style.display = 'block';

    initializeCarousel();
}
// ========== ANALYTICS FUNCTIONS ==========

function updateAnalytics(articles) {
    if (articles.length === 0) return;

    const sentimentCounts = {
        positive: 0,
        negative: 0,
        neutral: 0
    };

    articles.forEach(article => {
        const label = getSentimentLabel(article.sentiment).toLowerCase();
        sentimentCounts[label]++;
    });

    document.getElementById('stat-total').textContent = articles.length;
    document.getElementById('stat-positive').textContent = sentimentCounts.positive;
    document.getElementById('stat-negative').textContent = sentimentCounts.negative;
    document.getElementById('stat-neutral').textContent = sentimentCounts.neutral;

    updateSentimentChart(sentimentCounts);

    const sources = {};
    articles.forEach(article => {
        sources[article.source] = (sources[article.source] || 0) + 1;
    });
    updateSourceChart(sources);

    const categories = {};
    articles.forEach(article => {
        const cat = article.category || 'General';
        categories[cat] = (categories[cat] || 0) + 1;
    });
    updateCategoryChart(categories);

    extractTrendingTopics(articles);
    generateWordCloud(articles);
}

function extractTrendingTopics(articles) {
    const words = {};
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];

    articles.forEach(article => {
        const text = (article.title + ' ' + article.summary).toLowerCase();
        const tokens = text.match(/\b[a-z]{4,}\b/g) || [];

        tokens.forEach(word => {
            if (!stopWords.includes(word)) {
                words[word] = (words[word] || 0) + 1;
            }
        });
    });

    const sortedWords = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    const container = document.getElementById('trending-topics');
    container.innerHTML = '';

    sortedWords.forEach(([word, count]) => {
        const tag = document.createElement('a');
        tag.href = '#';
        tag.textContent = `#${word} (${count})`;
        tag.onclick = (e) => {
            e.preventDefault();
            document.getElementById('search-input').value = word;
            performSearch(word);
        };
        container.appendChild(tag);
    });
}

function generateWordCloud(articles) {
    const words = {};
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];

    articles.forEach(article => {
        const text = (article.title + ' ' + article.summary).toLowerCase();
        const tokens = text.match(/\b[a-z]{4,}\b/g) || [];

        tokens.forEach(word => {
            if (!stopWords.includes(word)) {
                words[word] = (words[word] || 0) + 1;
            }
        });
    });

    const sortedWords = Object.entries(words)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20);

    const container = document.getElementById('analysis-word-cloud');
    container.innerHTML = '';

    sortedWords.forEach(([word, count], index) => {
        const wordElement = document.createElement('span');
        const size = index < 5 ? 'large' : index < 12 ? 'medium' : 'small';
        wordElement.className = `word word-${size}`;
        wordElement.textContent = word;
        wordElement.onclick = () => {
            document.getElementById('search-input').value = word;
            performSearch(word);
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.page === 'for-you') {
                    link.classList.add('active');
                }
            });
            document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
            document.getElementById('for-you-page').classList.add('active');
        };
        container.appendChild(wordElement);
    });
}

// ========== CHART FUNCTIONS ==========

function initializeCharts() {
    const sentimentCtx = document.getElementById('sentiment-chart');
    if (sentimentCtx) {
        sentimentChart = new Chart(sentimentCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#ef4444', '#64748b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }

    const sourceCtx = document.getElementById('source-chart');
    if (sourceCtx) {
        sourceChart = new Chart(sourceCtx.getContext('2d'), {
            type: 'pie',
            data: {
                labels: [],
                datasets: [{
                    data: [],
                    backgroundColor: ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#6b7280'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            boxWidth: 12,
                            font: { size: 10 }
                        }
                    }
                }
            }
        });
    }

    const analysisSentimentCtx = document.getElementById('analysis-sentiment-chart');
    if (analysisSentimentCtx) {
        analysisSentimentChart = new Chart(analysisSentimentCtx.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Positive', 'Negative', 'Neutral'],
                datasets: [{
                    data: [0, 0, 0],
                    backgroundColor: ['#10b981', '#ef4444', '#64748b'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                }
            }
        });
    }

    const categoryCtx = document.getElementById('category-chart');
    if (categoryCtx) {
        categoryChart = new Chart(categoryCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Articles',
                    data: [],
                    backgroundColor: '#4f46e5',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true }
                }
            }
        });
    }

    const analysisSourceCtx = document.getElementById('analysis-source-chart');
    if (analysisSourceCtx) {
        analysisSourceChart = new Chart(analysisSourceCtx.getContext('2d'), {
            type: 'bar',
            data: {
                labels: [],
                datasets: [{
                    label: 'Articles',
                    data: [],
                    backgroundColor: '#7c3aed',
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                indexAxis: 'y',
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true }
                }
            }
        });
    }
}

function updateSentimentChart(sentimentCounts) {
    const data = [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral];

    if (sentimentChart) {
        sentimentChart.data.datasets[0].data = data;
        sentimentChart.update();
    }

    if (analysisSentimentChart) {
        analysisSentimentChart.data.datasets[0].data = data;
        analysisSentimentChart.update();
    }
}

function updateSourceChart(sources) {
    const sortedSources = Object.entries(sources)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);

    const labels = sortedSources.map(([source]) => source.substring(0, 20));
    const data = sortedSources.map(([, count]) => count);

    if (sourceChart) {
        sourceChart.data.labels = labels;
        sourceChart.data.datasets[0].data = data;
        sourceChart.update();
    }

    if (analysisSourceChart) {
        analysisSourceChart.data.labels = labels;
        analysisSourceChart.data.datasets[0].data = data;
        analysisSourceChart.update();
    }
}

function updateCategoryChart(categories) {
    const labels = Object.keys(categories);
    const data = Object.values(categories);

    if (categoryChart) {
        categoryChart.data.labels = labels;
        categoryChart.data.datasets[0].data = data;
        categoryChart.update();
    }
}

// ========== UTILITY FUNCTIONS ==========

function getSentimentLabel(sentiment) {
    if (sentiment > 0.1) return t('positive');
    if (sentiment < -0.1) return t('negative');
    return t('neutral');
}

function formatTime(dateString) {
    if (!dateString) return t('recently');

    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    return date.toLocaleDateString();
}

// ========== EVENT LISTENERS ==========

function setupEventListeners() {
    setupLanguageSelector();

    // Auth Modal
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

    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('signup-form-element').addEventListener('submit', handleSignup);

    // User Menu
    document.getElementById('user-avatar').addEventListener('click', () => {
        document.getElementById('user-dropdown').classList.toggle('active');
    });

    document.getElementById('logout-btn').addEventListener('click', handleLogout);

    // Close user dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const userMenu = document.getElementById('user-menu');
        const userDropdown = document.getElementById('user-dropdown');

        if (userMenu && !userMenu.contains(e.target)) {
            userDropdown.classList.remove('active');
        }

        const authOverlay = document.getElementById('auth-overlay');
        if (e.target === authOverlay) {
            authOverlay.classList.remove('active');
        }
    });

    // Navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            // Only prevent default if it's a SPA link (has data-page)
            if (this.hasAttribute('data-page')) {
                e.preventDefault();

                navLinks.forEach(l => l.classList.remove('active'));
                this.classList.add('active');


                const pageId = this.dataset.page + '-page';
                document.querySelectorAll('.page-content').forEach(page => {
                    page.classList.remove('active');
                });
                document.getElementById(pageId).classList.add('active');

                if (pageId === 'trending-page') {
                    loadTrendingArticles();
                } else if (pageId === 'for-you-page') {
                    loadNewsFromAPI();
                }
            }
        });
    });

    // Dark mode toggle
    const modeToggle = document.getElementById('mode-toggle');
    const modeLabel = document.getElementById('mode-label');

    modeToggle.addEventListener('change', function () {
        document.body.classList.toggle('dark-mode', this.checked);
        modeLabel.textContent = this.checked ? 'Dark Mode' : 'Light Mode';
        localStorage.setItem('darkMode', this.checked);
    });

    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedDarkMode) {
        modeToggle.checked = true;
        document.body.classList.add('dark-mode');
        modeLabel.textContent = 'Dark Mode';
    }

    // Category filters
    const categoryBtns = document.querySelectorAll('.category-btn');
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            categoryBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            const category = this.dataset.category;
            const countrySelect = document.getElementById('country-select');
            const langSelect = document.getElementById('lang-select');
            const country = countrySelect ? countrySelect.value : '';
            const lang = langSelect ? langSelect.value : 'en';

            loadNewsFromAPI(category, country, lang);
        });
    });

    // Country filter
    const countrySelect = document.getElementById('country-select');
    if (countrySelect) {
        countrySelect.addEventListener('change', function () {
            const categoryBtn = document.querySelector('.category-btn.active');
            const category = categoryBtn ? categoryBtn.dataset.category : 'all';
            const langSelect = document.getElementById('lang-select');
            const lang = langSelect ? langSelect.value : 'en';
            loadNewsFromAPI(category, this.value, lang);
        });
    }

    // Language filter
    const langSelect = document.getElementById('lang-select');
    if (langSelect) {
        langSelect.addEventListener('change', function () {
            const categoryBtn = document.querySelector('.category-btn.active');
            const category = categoryBtn ? categoryBtn.dataset.category : 'all';
            const countrySelect = document.getElementById('country-select');
            const country = countrySelect ? countrySelect.value : '';
            loadNewsFromAPI(category, country, this.value);
        });
    }

    // Search functionality
    const searchInput = document.getElementById('search-input');
    searchInput.addEventListener('input', debounce(async function () {
        const query = this.value.trim();

        if (query.length > 2) {
            await performSearch(query);
        } else if (query.length === 0) {
            const categoryBtn = document.querySelector('.category-btn.active');
            const category = categoryBtn ? categoryBtn.dataset.category : 'all';
            const countrySelect = document.getElementById('country-select');
            const langSelect = document.getElementById('lang-select');
            const country = countrySelect ? countrySelect.value : '';
            const lang = langSelect ? langSelect.value : 'en';

            loadNewsFromAPI(category, country, lang);
        }
    }, 500));

    // Global click handlers
    document.addEventListener('click', async function (e) {
        // Bookmark button
        if (e.target.closest('.bookmark-btn')) {
            e.preventDefault();
            e.stopPropagation();

            const btn = e.target.closest('.bookmark-btn');
            const articleId = btn.dataset.articleId;
            const article = allArticles.find(a => a.id === articleId);

            if (article) {
                await toggleBookmark(article, btn);
            }
            return;
        }

        // Reaction buttons
        if (e.target.closest('.reaction-btn')) {
            e.preventDefault();
            e.stopPropagation();

            const btn = e.target.closest('.reaction-btn');
            const articleId = btn.dataset.articleId;
            const reactionType = btn.dataset.type;

            await handleReaction(articleId, reactionType, btn);
            return;
        }

        // Read more buttons
        if (e.target.classList.contains('read-more')) {
            const url = e.target.dataset.url;
            if (url && url !== '#') {
                window.open(url, '_blank');
            }
            return;
        }

        // Find similar articles button
        if (e.target.classList.contains('find-similar')) {
            const uri = e.target.dataset.uri;
            await showSimilarArticles(uri);
            return;
        }

        // Modal close
        if (e.target.classList.contains('modal-close')) {
            document.getElementById('similar-modal').classList.remove('active');
            return;
        }
    });

    // Close modal when clicking outside
    const modal = document.getElementById('similar-modal');
    modal.addEventListener('click', function (e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    // Newsletter modal event listeners
    const newsletterModalClose = document.querySelector('.newsletter-modal-close');
    if (newsletterModalClose) {
        newsletterModalClose.addEventListener('click', () => {
            document.getElementById('newsletter-modal').classList.remove('active');
        });
    }

    const newsletterModal = document.getElementById('newsletter-modal');
    if (newsletterModal) {
        newsletterModal.addEventListener('click', (e) => {
            if (e.target === newsletterModal) {
                newsletterModal.classList.remove('active');
            }
        });
    }

    const newsletterForm = document.getElementById('newsletter-preferences-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const frequency = document.getElementById('newsletter-frequency').value;
            const categories = Array.from(document.querySelectorAll('[name="category"]:checked'))
                .map(cb => cb.value);

            if (categories.length === 0) {
                alert('Please select at least one category');
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/newsletter/preferences`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ frequency, categories })
                });

                const data = await response.json();

                if (data.success) {
                    alert('✅ Preferences updated successfully!');
                    document.getElementById('newsletter-modal').classList.remove('active');
                    loadNewsletterStatus();
                } else {
                    alert('❌ Error: ' + data.message);
                }
            } catch (error) {
                console.error('Error updating preferences:', error);
                alert('❌ Failed to update preferences');
            }
        });
    }

    setTimeout(loadNewsletterStatus, 500);
}

async function performSearch(query) {
    const container = document.getElementById('news-container');
    const loading = document.getElementById('news-loading');

    loading.style.display = 'flex';
    container.style.display = 'none';

    const articles = await searchNews(query);

    loading.style.display = 'none';
    container.style.display = 'grid';

    await displayNewsArticles(articles, 'news-container');
    if (articles.length > 0) {
        updateAnalytics(articles);
    }
}

async function showSimilarArticles(articleUri) {
    const modal = document.getElementById('similar-modal');
    const loading = document.getElementById('similar-loading');
    const list = document.getElementById('similar-articles-list');

    modal.classList.add('active');
    loading.style.display = 'flex';
    list.innerHTML = '';

    const similarArticles = await findSimilarArticles(articleUri);

    loading.style.display = 'none';

    if (similarArticles.length === 0) {
        list.innerHTML = '<p class="empty-state">No similar articles found</p>';
        return;
    }

    similarArticles.forEach(article => {
        const sentiment = getSentimentLabel(article.sentiment);
        const sentimentEmoji = sentiment === 'Positive' ? '😊' : sentiment === 'Negative' ? '😟' : '😐';
        const similarityPercent = Math.round(article.similarity * 100);

        const item = document.createElement('div');
        item.className = 'similar-article';
        item.innerHTML = `
            <h4 style="font-size: 16px; margin-bottom: 8px;">${article.title}</h4>
            <p style="font-size: 14px; color: var(--gray); margin-bottom: 8px;">
                ${article.source} • ${sentimentEmoji} ${sentiment}
                <span class="similarity-score">${similarityPercent}% similar</span>
            </p>
        `;
        item.onclick = () => window.open(article.url, '_blank');
        list.appendChild(item);
    });
}

// ========== CAROUSEL FUNCTIONS ==========

function initializeCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;

    const carouselItems = carousel.querySelectorAll('.carousel-item');
    if (carouselItems.length === 0) return;

    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    const indicators = document.querySelectorAll('.indicator');

    let currentIndex = 0;
    const totalItems = carouselItems.length;
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let autoAdvanceInterval;

    function updateCarousel() {
        carousel.style.transform = `translateX(-${currentIndex * 100}%)`;

        indicators.forEach((indicator, index) => {
            indicator.classList.toggle('active', index === currentIndex);
        });
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalItems;
        updateCarousel();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalItems) % totalItems;
        updateCarousel();
    }

    function startAutoAdvance() {
        autoAdvanceInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoAdvance() {
        clearInterval(autoAdvanceInterval);
    }

    if (prevBtn) prevBtn.addEventListener('click', () => {
        prevSlide();
        stopAutoAdvance();
        startAutoAdvance();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
        nextSlide();
        stopAutoAdvance();
        startAutoAdvance();
    });

    carousel.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoAdvance();
    });

    carousel.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        currentX = e.touches[0].clientX;
        const diff = startX - currentX;

        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    });

    carousel.addEventListener('touchend', () => {
        if (!isDragging) return;

        const diff = startX - currentX;
        const swipeThreshold = 50;

        if (diff > swipeThreshold) {
            nextSlide();
        } else if (diff < -swipeThreshold) {
            prevSlide();
        }

        isDragging = false;
        startAutoAdvance();
    });

    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            stopAutoAdvance();
            startAutoAdvance();
        });
    });

    carousel.addEventListener('mouseenter', stopAutoAdvance);
    carousel.addEventListener('mouseleave', startAutoAdvance);

    startAutoAdvance();
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func.apply(this, args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ========== AI FEATURES ==========

let summaryCache = {};
let summaryTimeout;
let hideTimeout;

function initAISummaries() {
    const tooltip = document.getElementById('ai-summary-tooltip');

    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.news-card');
        if (card && !card.classList.contains('daily-mix-card')) {
            clearTimeout(hideTimeout);
            if (tooltip.dataset.activeCardId !== card.dataset.articleId) {
                clearTimeout(summaryTimeout);
                summaryTimeout = setTimeout(() => {
                    showAISummary(card, card.dataset.articleId);
                }, 600);
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.news-card');
        if (card && !card.classList.contains('daily-mix-card')) {
            clearTimeout(summaryTimeout);
            hideTimeout = setTimeout(() => {
                hideAISummary();
            }, 300);
        }
    });

    tooltip.addEventListener('mouseover', () => clearTimeout(hideTimeout));
    tooltip.addEventListener('mouseout', () => {
        hideTimeout = setTimeout(() => { hideAISummary(); }, 300);
    });
}

async function showAISummary(card, articleId) {
    const tooltip = document.getElementById('ai-summary-tooltip');
    tooltip.dataset.activeCardId = articleId;

    const cardRect = card.getBoundingClientRect();
    const tooltipWidth = 340;
    const spaceOnRight = window.innerWidth - cardRect.right;

    let left = cardRect.right + 15;
    if (spaceOnRight < (tooltipWidth + 20)) {
        left = cardRect.left - tooltipWidth - 15;
    }

    tooltip.style.top = `${cardRect.top}px`;
    tooltip.style.left = `${left}px`;

    tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-robot fa-spin"></i> AI Summary</div><div class="ai-summary-loading"><span>Generating...</span><div class="typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`;
    tooltip.classList.add('active');

    try {
        if (summaryCache[articleId]) {
            tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-robot"></i> AI Summary</div><div class="ai-summary-content">${summaryCache[articleId]}</div>`;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/ai/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId })
        });
        const data = await response.json();

        if (data.success) {
            summaryCache[articleId] = data.summary;
            tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-robot"></i> AI Summary</div><div class="ai-summary-content">${data.summary}</div>`;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-exclamation-circle"></i> Summary Error</div><div class="ai-summary-content">${error.message}</div>`;
    }
}

function hideAISummary() {
    const tooltip = document.getElementById('ai-summary-tooltip');
    tooltip.classList.remove('active');
    tooltip.dataset.activeCardId = null;
}

// AI Chatbot
let chatMessages = [];
let isTyping = false;

function initChatbot() {
    const chatButton = document.createElement('div');
    chatButton.className = 'ai-chat-button';
    chatButton.innerHTML = `<i class="fas fa-comments"></i><span class="pulse"></span>`;
    chatButton.onclick = openAIChat;

    const chatWindow = document.createElement('div');
    chatWindow.className = 'ai-chat-window';
    chatWindow.id = 'aiChat';
    chatWindow.innerHTML = `<div class="chat-header"><h3>🤖 NewsPulse AI</h3><button onclick="closeChat()">✕</button></div><div class="chat-messages" id="chatMessages"></div><div class="chat-input"><input type="text" id="chatInput" placeholder="Ask about the news..." onkeypress="if(event.key === 'Enter') sendMessage()"><button onclick="sendMessage()">Send</button></div>`;

    document.body.appendChild(chatButton);
    document.body.appendChild(chatWindow);
}

function openAIChat() {
    const chatWindow = document.getElementById('aiChat');
    chatWindow.classList.add('active');
    if (chatMessages.length === 0) {
        addMessage('bot', 'Hi! 👋 How may I help you with the news today?');
    }
}

function closeChat() {
    document.getElementById('aiChat').classList.remove('active');
}

function addMessage(sender, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    messageDiv.innerHTML = `${text}<div class="message-time">${time}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if (sender === 'user') chatMessages.push({ role: 'user', content: text });
    else chatMessages.push({ role: 'assistant', content: text });
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    if (document.getElementById('typingIndicator')) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message || isTyping) return;
    addMessage('user', message);
    input.value = '';
    isTyping = true;
    showTypingIndicator();

    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        removeTypingIndicator();
        if (data.success) {
            addMessage('bot', data.response);
        } else {
            addMessage('bot', data.response || 'Sorry, I encountered an error.');
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('bot', 'Sorry, connection issues. Please try again.');
    }
    isTyping = false;
}

// ========== CREDIBILITY SYSTEM (HOVER-TO-LOAD) ==========

let credibilityCache = {};
let credibilityLoading = {};

/**
 * Fetch credibility score for an article (called on hover)
 */
async function fetchCredibilityScore(articleId) {
    if (credibilityCache[articleId]) {
        return credibilityCache[articleId];
    }

    if (credibilityLoading[articleId]) {
        console.log(`⏳ Already loading credibility for ${articleId}`);
        return null;
    }

    try {
        credibilityLoading[articleId] = true;
        console.log(`🔍 Fetching credibility for: ${articleId}`);

        const response = await fetch(`${API_BASE_URL}/credibility/analyze/${articleId}`);
        const data = await response.json();

        if (data.success) {
            console.log(`✅ Credibility score received: ${data.credibility.finalScore}/100`);
            credibilityCache[articleId] = data.credibility;
            return data.credibility;
        } else {
            console.error(`❌ Credibility API error: ${data.message}`);
        }
    } catch (error) {
        console.error(`❌ Error fetching credibility:`, error);
    } finally {
        credibilityLoading[articleId] = false;
    }

    return null;
}

/**
 * Add credibility badge that loads on hover
 */
function addCredibilityBadge(card, articleId) {
    const placeholder = card.querySelector('.credibility-badge-placeholder');

    if (!placeholder) {
        return;
    }

    // Set initial "hover to analyze" state
    placeholder.className = 'credibility-badge hover-to-analyze';
    placeholder.innerHTML = `
        <div class="credibility-icon">
            <i class="fas fa-shield-alt"></i>
        </div>
        <div class="credibility-hint">Hover</div>
    `;

    let hoverTimeout;
    let isAnalyzed = false;

    // Start analysis on hover
    card.addEventListener('mouseenter', async () => {
        if (isAnalyzed || credibilityLoading[articleId]) return;

        hoverTimeout = setTimeout(async () => {
            console.log(`🖱️ Hover detected - analyzing ${articleId}`);

            // Show loading state
            placeholder.className = 'credibility-badge loading';
            placeholder.innerHTML = `
                <div class="credibility-score">
                    <div class="spinner-mini"></div>
                </div>
                <div class="credibility-label">Loading</div>
            `;

            // Fetch credibility
            const credibility = await fetchCredibilityScore(articleId);

            if (credibility) {
                isAnalyzed = true;
                updateCredibilityBadge(placeholder, credibility, articleId);
            } else {
                placeholder.className = 'credibility-badge hover-to-analyze error';
                placeholder.innerHTML = `
                    <div class="credibility-icon">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="credibility-hint">Error</div>
                `;
            }
        }, 300);
    });

    card.addEventListener('mouseleave', () => {
        clearTimeout(hoverTimeout);
    });
}

/**
 * Update credibility badge with score
 */
function updateCredibilityBadge(badge, credibility, articleId) {
    const { finalScore, riskLevel } = credibility;

    badge.className = `credibility-badge ${riskLevel}-risk`;
    badge.innerHTML = `
        <div class="credibility-score">${finalScore}</div>
        <div class="credibility-label">${getRiskLabel(riskLevel)}</div>
    `;

    badge.onclick = (e) => {
        e.stopPropagation();
        showCredibilityBreakdown(credibility);
    };
}

/**
 * Get risk label
 */
function getRiskLabel(riskLevel) {
    const labels = {
        'low': 'Credible',
        'medium': 'Mixed',
        'high': 'Risky'
    };
    return labels[riskLevel] || 'Unknown';
}

/**
 * Show credibility breakdown modal
 */
function showCredibilityBreakdown(credibility) {
    const modal = document.getElementById('credibility-modal');
    const content = document.getElementById('credibility-breakdown-content');

    if (!modal || !content) {
        console.error('Credibility modal not found');
        return;
    }

    const {
        finalScore,
        riskLevel,
        scores,
        explanationTags,
        sourceMetadata
    } = credibility;

    content.innerHTML = `
        <div class="credibility-header">
            <div class="credibility-main-score ${riskLevel}-risk">
                <div class="score-circle">
                    <svg viewBox="0 0 36 36" class="circular-chart">
                        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                        <path class="circle" stroke-dasharray="${finalScore}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div class="score-text">
                        <span class="score-number">${finalScore}</span>
                        <span class="score-label">/100</span>
                    </div>
                </div>
                <h3>${getRiskLabel(riskLevel)}</h3>
            </div>
        </div>

        <div class="explanation-tags">
            ${explanationTags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>

        <div class="credibility-breakdown">
            <h4>Credibility Analysis</h4>
            
            <div class="breakdown-section">
                <div class="section-header">
                    <span class="section-title">📰 Source Credibility</span>
                    <span class="section-score">${scores.sourceCredibility.score}/100</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${scores.sourceCredibility.score}%"></div>
                </div>
                <div class="section-details">
                    <p><strong>Source:</strong> ${sourceMetadata.name}</p>
                    <p><strong>Trust Rating:</strong> ${sourceMetadata.trust}/100</p>
                    <p><strong>Bias:</strong> ${sourceMetadata.bias}</p>
                    <p><strong>Transparency:</strong> ${sourceMetadata.transparency}/100</p>
                </div>
            </div>

            <div class="breakdown-section">
                <div class="section-header">
                    <span class="section-title">🔗 Cross-Source Verification</span>
                    <span class="section-score">${scores.crossSourceVerification.score}/100</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${scores.crossSourceVerification.score}%"></div>
                </div>
                <div class="section-details">
                    <p><strong>Sources Found:</strong> ${scores.crossSourceVerification.sourcesFound.length}</p>
                    ${scores.crossSourceVerification.sourcesFound.length > 0 ? `
                        <div class="sources-list">
                            ${scores.crossSourceVerification.sourcesFound.slice(0, 5).map(source =>
        `<span class="source-chip">${source}</span>`
    ).join('')}
                            ${scores.crossSourceVerification.sourcesFound.length > 5 ?
                `<span class="source-chip">+${scores.crossSourceVerification.sourcesFound.length - 5} more</span>`
                : ''}
                        </div>
                    ` : '<p class="warning-text">⚠️ No cross-source verification found</p>'}
                </div>
            </div>

            <div class="breakdown-section">
                <div class="section-header">
                    <span class="section-title">🤖 AI Content Analysis</span>
                    <span class="section-score">${scores.aiContentAnalysis.score}/100</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${scores.aiContentAnalysis.score}%"></div>
                </div>
                <div class="section-details">
                    <div class="ai-signals">
                        <div class="signal">
                            <span>Sensationalism</span>
                            <div class="signal-bar">
                                <div class="signal-fill" style="width: ${scores.aiContentAnalysis.signals.sensationalism}%"></div>
                            </div>
                            <span>${scores.aiContentAnalysis.signals.sensationalism}%</span>
                        </div>
                        <div class="signal">
                            <span>Emotional Manipulation</span>
                            <div class="signal-bar">
                                <div class="signal-fill" style="width: ${scores.aiContentAnalysis.signals.emotionalManipulation}%"></div>
                            </div>
                            <span>${scores.aiContentAnalysis.signals.emotionalManipulation}%</span>
                        </div>
                        <div class="signal">
                            <span>Clickbait Probability</span>
                            <div class="signal-bar">
                                <div class="signal-fill" style="width: ${scores.aiContentAnalysis.signals.clickbaitProbability}%"></div>
                            </div>
                            <span>${scores.aiContentAnalysis.signals.clickbaitProbability}%</span>
                        </div>
                        <div class="signal">
                            <span>Bias Indicators</span>
                            <div class="signal-bar">
                                <div class="signal-fill" style="width: ${scores.aiContentAnalysis.signals.biasIndicators}%"></div>
                            </div>
                            <span>${scores.aiContentAnalysis.signals.biasIndicators}%</span>
                        </div>
                        <div class="signal">
                            <span>Lacks Evidence</span>
                            <div class="signal-bar">
                                <div class="signal-fill" style="width: ${scores.aiContentAnalysis.signals.evidenceQuality}%"></div>
                            </div>
                            <span>${scores.aiContentAnalysis.signals.evidenceQuality}%</span>
                        </div>
                    </div>
                    <p class="signal-note">Lower percentages indicate better quality</p>
                </div>
            </div>
        </div>

        <div class="credibility-formula">
            <h4>How We Calculate This Score</h4>
            <div class="formula-breakdown">
                <div class="formula-item">
                    <span>Source Credibility</span>
                    <span>${scores.sourceCredibility.score} × 35% = ${Math.round(scores.sourceCredibility.score * 0.35)}</span>
                </div>
                <div class="formula-item">
                    <span>Cross-Source Verification</span>
                    <span>${scores.crossSourceVerification.score} × 35% = ${Math.round(scores.crossSourceVerification.score * 0.35)}</span>
                </div>
                <div class="formula-item">
                    <span>AI Content Analysis</span>
                    <span>${scores.aiContentAnalysis.score} × 25% = ${Math.round(scores.aiContentAnalysis.score * 0.25)}</span>
                </div>
                <div class="formula-item">
                    <span>Community Signals</span>
                    <span>${scores.communitySignals.score} × 5% = ${Math.round(scores.communitySignals.score * 0.05)}</span>
                </div>
                <div class="formula-total">
                    <span><strong>Final Score</strong></span>
                    <span><strong>${finalScore}/100</strong></span>
                </div>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

// Close credibility modal
document.addEventListener('DOMContentLoaded', function () {
    const credibilityModal = document.getElementById('credibility-modal');
    if (credibilityModal) {
        const closeBtn = credibilityModal.querySelector('.credibility-modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                credibilityModal.classList.remove('active');
            });
        }


        credibilityModal.addEventListener('click', (e) => {
            if (e.target === credibilityModal) {
                credibilityModal.classList.remove('active');
            }
        });
    }
});

// ========== SHARE TO COMMUNITY FUNCTIONALITY ==========

let currentShareArticle = null;

// Setup share button listeners
function setupShareListeners() {
    document.addEventListener('click', function (e) {
        if (e.target.closest('.btn-share')) {
            const shareBtn = e.target.closest('.btn-share');
            const articleId = shareBtn.dataset.articleId;
            openShareModal(articleId);
        }
    });

    // Share modal close
    const shareModal = document.getElementById('share-modal');
    if (!shareModal) return;

    const shareModalClose = shareModal.querySelector('.share-modal-close');

    shareModalClose.addEventListener('click', () => {
        shareModal.classList.remove('active');
        currentShareArticle = null;
    });

    // Close on outside click
    shareModal.addEventListener('click', (e) => {
        if (e.target === shareModal) {
            shareModal.classList.remove('active');
            currentShareArticle = null;
        }
    });

    // Share form submit
    const shareForm = document.getElementById('share-form');
    if (shareForm) {
        shareForm.addEventListener('submit', handleShareSubmit);
    }
}

function openShareModal(articleId) {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    // Find the article in allArticles
    const article = allArticles.find(a => a.id === articleId);
    if (!article) {
        console.error('Article not found:', articleId);
        return;
    }

    currentShareArticle = article;

    // Populate share preview
    const sharePreview = document.getElementById('share-preview');
    sharePreview.innerHTML = `
        <h4>Article Preview</h4>
        <div class="share-preview-article">
            <div class="share-preview-image">
                <img src="${article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'}" 
                     alt="${article.title}"
                     onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'">
            </div>
            <div class="share-preview-content">
                <h5>${article.title}</h5>
                <p>${article.source} • ${article.category || 'General'}</p>
            </div>
        </div>
    `;

    // Clear previous message
    document.getElementById('share-message').value = '';

    // Show modal
    document.getElementById('share-modal').classList.add('active');
}

async function handleShareSubmit(e) {
    e.preventDefault();

    if (!currentShareArticle || !authToken) {
        return;
    }

    const message = document.getElementById('share-message').value.trim();
    if (!message) {
        alert('Please enter a message');
        return;
    }

    const submitBtn = document.getElementById('share-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sharing...';

    try {
        const response = await fetch(`${API_BASE_URL}/community/share`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                articleId: currentShareArticle.id,
                message: message,
                articleData: {
                    title: currentShareArticle.title,
                    summary: currentShareArticle.summary,
                    image: currentShareArticle.image,
                    url: currentShareArticle.url,
                    source: currentShareArticle.source,
                    category: currentShareArticle.category
                }
            })
        });

        const data = await response.json();

        if (data.success) {
            // Close modal
            document.getElementById('share-modal').classList.remove('active');
            currentShareArticle = null;

            // Single confirmation popup
            if (confirm('✅ Article shared successfully! Would you like to view it in the community?')) {
                window.location.href = 'community.html';
            }
        } else {
            throw new Error(data.message || 'Failed to share article');
        }
    } catch (error) {
        console.error('Error sharing article:', error);
        alert('❌ Failed to share article: ' + error.message);
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-share-alt"></i> Share to Community';
    }
}

// Initialize share functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function () {
    setupShareListeners();
});


// ========== END CREDIBILITY SYSTEM ==========