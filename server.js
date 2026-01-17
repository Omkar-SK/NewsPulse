const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

require("dotenv").config();

// Load env vars
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmarks');
const reactionRoutes = require('./routes/reactions');
const newsRoutes = require('./routes/news');
const recommendationRoutes = require('./routes/recommendations');
const newsletterRoutes = require('./routes/newsletter');
const aiRoutes = require('./routes/ai');
const credibilityRoutes = require('./routes/credibility'); // NEW
const communityRoutes = require('./routes/community');

// Import newsletter scheduler
const { initializeNewsletterScheduler } = require('./utils/newsletterScheduler');
const { testEmailConnection } = require('./utils/emailService');

const app = express();
// Temporary route to clear credibility cache (FOR TESTING ONLY)
app.get('/api/credibility/clear-cache', async (req, res) => {
  try {
    const CredibilityScore = require('./models/CredibilityScore');
    const result = await CredibilityScore.deleteMany({});
    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} cached credibility scores`
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (your HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('✅ MongoDB Connected');

    // Clean up expired articles on startup
    cleanupExpiredArticles();

    // Test email connection
    const emailReady = await testEmailConnection();
    if (emailReady) {
      // Initialize newsletter scheduler
      initializeNewsletterScheduler();
    } else {
      console.log('⚠️  Email service not configured. Newsletter feature will be disabled.');
    }
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/reactions', reactionRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/credibility', credibilityRoutes); // NEW
app.use('/api/community', communityRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Cleanup function for expired articles
async function cleanupExpiredArticles() {
  try {
    const Article = require('./models/Article');
    const result = await Article.deleteMany({
      expiresAt: { $lt: new Date() }
    });
    console.log(`🧹 Cleaned up ${result.deletedCount} expired articles`);
  } catch (error) {
    console.error('❌ Error cleaning up expired articles:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredArticles, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Credibility System: ACTIVE`);
});