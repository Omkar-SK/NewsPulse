const cron = require('node-cron');
const User = require('../models/User');
const Newsletter = require('../models/Newsletter');
const Article = require('../models/Article');
const { sendNewsletterEmail } = require('./emailService');

// Get top articles for newsletter
const getTopArticles = async (categories, limit = 10) => {
  try {
    let query = {
      expiresAt: { $gt: new Date() }
    };

    // Filter by categories if not 'all'
    if (!categories.includes('all')) {
      query.category = { $in: categories };
    }

    const articles = await Article.find(query)
      .sort({ shares: -1, 'reactions.total': -1, publishedAt: -1 })
      .limit(limit)
      .lean();

    return articles.map(article => ({
      articleId: article.articleId,
      title: article.title,
      summary: article.summary,
      image: article.image,
      url: article.url,
      source: article.source,
      category: article.category,
      sentiment: article.sentiment
    }));
  } catch (error) {
    console.error('Error fetching top articles:', error);
    return [];
  }
};

// Send newsletter to a single user
const sendNewsletterToUser = async (user) => {
  try {
    console.log(`📧 Sending newsletter to ${user.email}...`);

    const articles = await getTopArticles(
      user.newsletterPreferences.categories,
      10
    );

    if (articles.length === 0) {
      console.log(`⚠️ No articles found for ${user.email}`);
      return { success: false, reason: 'No articles available' };
    }

    // Send email
    const emailResult = await sendNewsletterEmail(
      user.email,
      user.name,
      articles
    );

    if (emailResult.success) {
      // Save newsletter record
      const newsletter = await Newsletter.create({
        user: user._id,
        email: user.email,
        sentAt: new Date(),
        articles: articles,
        status: 'sent'
      });

      // Update user's last sent timestamp
      user.newsletterPreferences.lastSentAt = new Date();
      await user.save();

      console.log(`✅ Newsletter sent successfully to ${user.email}`);
      return { success: true, newsletter };
    } else {
      // Save failed newsletter record
      await Newsletter.create({
        user: user._id,
        email: user.email,
        sentAt: new Date(),
        articles: articles,
        status: 'failed',
        error: emailResult.error
      });

      console.log(`❌ Failed to send newsletter to ${user.email}:`, emailResult.error);
      return { success: false, error: emailResult.error };
    }
  } catch (error) {
    console.error(`❌ Error sending newsletter to ${user.email}:`, error);
    return { success: false, error: error.message };
  }
};

// Send newsletters to all subscribed users
const sendDailyNewsletters = async () => {
  try {
    console.log('📬 Starting daily newsletter job...');

    const now = new Date();
    const oneDayAgo = new Date(now - 24 * 60 * 60 * 1000);

    // Find users who are subscribed and haven't received newsletter in last 24 hours
    const users = await User.find({
      newsletterSubscribed: true,
      'newsletterPreferences.frequency': 'daily',
      $or: [
        { 'newsletterPreferences.lastSentAt': { $lt: oneDayAgo } },
        { 'newsletterPreferences.lastSentAt': null }
      ]
    });

    console.log(`📊 Found ${users.length} users to send newsletters to`);

    let successCount = 0;
    let failCount = 0;

    // Send newsletters with delay to avoid rate limiting
    for (const user of users) {
      const result = await sendNewsletterToUser(user);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      // Wait 1 second between emails to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Newsletter job completed: ${successCount} sent, ${failCount} failed`);
    return { successCount, failCount, total: users.length };
  } catch (error) {
    console.error('❌ Error in newsletter job:', error);
    return { error: error.message };
  }
};

// Send weekly newsletters
const sendWeeklyNewsletters = async () => {
  try {
    console.log('📬 Starting weekly newsletter job...');

    const now = new Date();
    const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const users = await User.find({
      newsletterSubscribed: true,
      'newsletterPreferences.frequency': 'weekly',
      $or: [
        { 'newsletterPreferences.lastSentAt': { $lt: oneWeekAgo } },
        { 'newsletterPreferences.lastSentAt': null }
      ]
    });

    console.log(`📊 Found ${users.length} users for weekly newsletter`);

    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      const result = await sendNewsletterToUser(user);
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(`✅ Weekly newsletter job completed: ${successCount} sent, ${failCount} failed`);
    return { successCount, failCount, total: users.length };
  } catch (error) {
    console.error('❌ Error in weekly newsletter job:', error);
    return { error: error.message };
  }
};

// Initialize cron jobs
const initializeNewsletterScheduler = () => {
  // Daily newsletter - runs every day at 11:45 AM
  cron.schedule('40 11 * * *', async () => {
    console.log('⏰ Running daily newsletter cron job...');
    await sendDailyNewsletters();
  });

  // Weekly newsletter - runs every Monday at 11:45 AM
  cron.schedule('40 11 * * 1', async () => {
    console.log('⏰ Running weekly newsletter cron job...');
    await sendWeeklyNewsletters();
  });

  console.log('✅ Newsletter scheduler initialized');
  console.log('📅 Daily newsletters: Every day at 11:40 AM');
  console.log('📅 Weekly newsletters: Every Monday at 11:40 AM');
};

// Manual trigger for testing
const triggerManualNewsletter = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (!user.newsletterSubscribed) {
      return { success: false, message: 'User not subscribed to newsletter' };
    }

    return await sendNewsletterToUser(user);
  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = {
  initializeNewsletterScheduler,
  sendDailyNewsletters,
  sendWeeklyNewsletters,
  triggerManualNewsletter
};