const Reaction = require('../models/Reaction');
const UserPreference = require('../models/UserPreference');
const Article = require('../models/Article');

class RecommendationEngine {
  
  // Update user preferences based on reactions
  async updateUserPreferences(userId, articleData, reactionType) {
    try {
      let userPref = await UserPreference.findOne({ user: userId });
      
      if (!userPref) {
        userPref = new UserPreference({ user: userId });
      }

      // Score weights - stronger impact for likes/dislikes
      const weights = {
        like: 2,      // Increased from 1
        neutral: 0,
        dislike: -2   // Increased from -1
      };

      const score = weights[reactionType];

      // Update category scores
      if (articleData.category) {
        const currentCategoryScore = userPref.categoryScores.get(articleData.category) || 0;
        userPref.categoryScores.set(articleData.category, currentCategoryScore + score);
        console.log(`📊 Updated category "${articleData.category}": ${currentCategoryScore} → ${currentCategoryScore + score}`);
      }

      // Update source scores
      if (articleData.source) {
        const currentSourceScore = userPref.sourceScores.get(articleData.source) || 0;
        userPref.sourceScores.set(articleData.source, currentSourceScore + score);
        console.log(`📰 Updated source "${articleData.source}": ${currentSourceScore} → ${currentSourceScore + score}`);
      }

      // Update sentiment preference
      const sentiment = this.getSentimentLabel(articleData.sentiment);
      if (sentiment === 'positive') {
        userPref.sentimentPreference.positive += score;
      } else if (sentiment === 'negative') {
        userPref.sentimentPreference.negative += score;
      } else {
        userPref.sentimentPreference.neutral += score;
      }

      userPref.totalInteractions += 1;
      await userPref.save();

      console.log(`✅ Updated preferences for user ${userId} (Total interactions: ${userPref.totalInteractions})`);
      return userPref;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Get personalized recommendations
  async getRecommendations(userId, articles, limit = 15) {
    try {
      // Get user preferences
      const userPref = await UserPreference.findOne({ user: userId });
      
      // Get user's past reactions
      const userReactions = await Reaction.find({ user: userId });
      const reactedArticleIds = new Set(userReactions.map(r => r.articleId));
      const likedReactions = userReactions.filter(r => r.reactionType === 'like');
      const dislikedReactions = userReactions.filter(r => r.reactionType === 'dislike');

      // Filter out already reacted articles
      const unreactedArticles = articles.filter(article => 
        !reactedArticleIds.has(article.articleId)
      );

      console.log(`\n🎯 RECOMMENDATION ENGINE REPORT`);
      console.log(`📰 Total articles: ${articles.length}`);
      console.log(`📰 Unreacted articles: ${unreactedArticles.length}`);
      console.log(`👍 User likes: ${likedReactions.length}`);
      console.log(`👎 User dislikes: ${dislikedReactions.length}`);

      if (unreactedArticles.length === 0) {
        console.log('⚠️ No unreacted articles available');
        return [];
      }

      let scoredArticles;

      // Strategy 1: NEW USERS (0-2 likes) - Diverse trending content
      if (likedReactions.length < 3) {
        console.log(`📊 NEW USER STRATEGY (${likedReactions.length} likes)`);
        scoredArticles = this.getNewUserRecommendations(unreactedArticles, limit);
      } 
      // Strategy 2: LEARNING USERS (3-7 likes) - Hybrid approach
      else if (likedReactions.length < 8) {
        console.log(`🔄 HYBRID STRATEGY (${likedReactions.length} likes)`);
        scoredArticles = await this.getHybridRecommendations(
          unreactedArticles, 
          userPref, 
          likedReactions,
          userId
        );
      }
      // Strategy 3: EXPERIENCED USERS (8+ likes) - Full personalization
      else {
        console.log(`🎯 PERSONALIZED STRATEGY (${likedReactions.length} likes)`);
        scoredArticles = await this.getPersonalizedRecommendations(
          unreactedArticles, 
          userPref,
          userId
        );
      }

      // Log top recommendations
      console.log(`\n✅ TOP 5 RECOMMENDATIONS:`);
      scoredArticles.slice(0, 5).forEach((article, i) => {
        console.log(`${i + 1}. [Score: ${article.score?.toFixed(2)}] ${article.category} - ${article.title?.substring(0, 60)}...`);
      });

      return scoredArticles.slice(0, limit);

    } catch (error) {
      console.error('❌ Error getting recommendations:', error);
      return this.getFallbackRecommendations(articles, limit);
    }
  }

  // NEW USER RECOMMENDATIONS: Diverse trending content
  getNewUserRecommendations(articles, limit = 15) {
    console.log('📊 Using diverse trending strategy for new user');
    
    // Group by category
    const byCategory = {};
    articles.forEach(article => {
      const cat = article.category || 'general';
      if (!byCategory[cat]) byCategory[cat] = [];
      byCategory[cat].push(article);
    });

    // Sort each category by engagement + recency
    Object.keys(byCategory).forEach(cat => {
      byCategory[cat].sort((a, b) => {
        const scoreA = this.calculateTrendingScore(a);
        const scoreB = this.calculateTrendingScore(b);
        return scoreB - scoreA;
      });
    });

    // Take top 2-3 articles from each category (round-robin for diversity)
    const result = [];
    const categories = Object.keys(byCategory);
    let round = 0;

    while (result.length < limit && categories.length > 0) {
      const remainingCategories = categories.filter(cat => byCategory[cat].length > round);
      
      if (remainingCategories.length === 0) break;

      remainingCategories.forEach(cat => {
        if (result.length < limit && byCategory[cat][round]) {
          const article = byCategory[cat][round];
          result.push({
            ...article,
            score: this.calculateTrendingScore(article)
          });
        }
      });

      round++;
    }

    console.log(`📊 Selected from ${new Set(result.map(a => a.category)).size} different categories`);
    return result;
  }

  // HYBRID RECOMMENDATIONS: Mix preferences with trending
  async getHybridRecommendations(articles, userPref, likedReactions, userId) {
    console.log('🔄 Using hybrid strategy (preferences + trending)');

    // Get categories user liked
    const likedCategories = {};
    if (userPref) {
      userPref.categoryScores.forEach((score, category) => {
        if (score > 0) {
          likedCategories[category] = score;
        }
      });
    }

    console.log(`💚 User prefers categories:`, likedCategories);

    // Score articles
    const scored = articles.map(article => {
      const preferenceScore = userPref ? this.calculateArticleScore(article, userPref) : 0;
      const trendingScore = this.calculateTrendingScore(article);
      const collaborativeScore = 0; // We'll add this below

      // Weighted combination: 50% preference, 30% trending, 20% collaborative
      const totalScore = (preferenceScore * 0.5) + (trendingScore * 0.3) + (collaborativeScore * 0.2);

      return {
        ...article.toObject ? article.toObject() : article,
        score: totalScore,
        preferenceScore,
        trendingScore
      };
    });

    // Try collaborative filtering
    try {
      const similarUsers = await this.findSimilarUsers(userId, 5);
      if (similarUsers.length > 0) {
        console.log(`👥 Found ${similarUsers.length} similar users`);
        
        // Get articles liked by similar users
        const similarLikes = await Reaction.find({
          user: { $in: similarUsers },
          reactionType: 'like'
        });

        const collaborativeLikedArticles = new Set(similarLikes.map(r => r.articleId));

        // Boost scores for articles liked by similar users
        scored.forEach(article => {
          if (collaborativeLikedArticles.has(article.articleId)) {
            article.score += 2; // Collaborative boost
            console.log(`👥 Collaborative boost for: ${article.title?.substring(0, 40)}...`);
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Collaborative filtering skipped:', error.message);
    }

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  // PERSONALIZED RECOMMENDATIONS: Full preference-based
  async getPersonalizedRecommendations(articles, userPref, userId) {
    console.log('🎯 Using full personalization');

    // Log user preferences
    console.log('\n📊 USER PREFERENCE PROFILE:');
    console.log('Categories:', Object.fromEntries(userPref.categoryScores));
    console.log('Sentiment:', userPref.sentimentPreference);

    const scored = articles.map(article => {
      const score = this.calculateArticleScore(article, userPref) + 
                    this.getRecencyBoost(article.publishedAt) * 0.3;

      return {
        ...article.toObject ? article.toObject() : article,
        score
      };
    });

    // Get collaborative recommendations
    try {
      const similarUsers = await this.findSimilarUsers(userId, 10);
      if (similarUsers.length > 0) {
        const similarLikes = await Reaction.find({
          user: { $in: similarUsers },
          reactionType: 'like'
        });

        const collaborativeLikedArticles = new Set(similarLikes.map(r => r.articleId));

        scored.forEach(article => {
          if (collaborativeLikedArticles.has(article.articleId)) {
            article.score += 3; // Strong collaborative boost for experienced users
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Collaborative filtering error:', error.message);
    }

    scored.sort((a, b) => b.score - a.score);
    return scored;
  }

  // Calculate trending score (engagement + recency)
  calculateTrendingScore(article) {
    const engagementScore = (article.reactions?.total || 0) * 2 + (article.shares || 0);
    const recencyBoost = this.getRecencyBoost(article.publishedAt);
    return engagementScore + recencyBoost * 5; // Recency matters more for trending
  }

  // Calculate article score based on user preferences
  calculateArticleScore(article, userPref) {
    let score = 0;

    // Category score (weight: 50%)
    if (article.category) {
      const categoryScore = userPref.categoryScores.get(article.category) || 0;
      score += categoryScore * 0.5;
    }

    // Source score (weight: 25%)
    if (article.source) {
      const sourceScore = userPref.sourceScores.get(article.source) || 0;
      score += sourceScore * 0.25;
    }

    // Sentiment score (weight: 25%)
    const sentiment = this.getSentimentLabel(article.sentiment);
    if (sentiment === 'positive') {
      score += userPref.sentimentPreference.positive * 0.25;
    } else if (sentiment === 'negative') {
      score += userPref.sentimentPreference.negative * 0.25;
    } else {
      score += userPref.sentimentPreference.neutral * 0.25;
    }

    return score;
  }

  // Get recency boost (newer articles get higher boost)
  getRecencyBoost(publishedAt) {
    const now = new Date();
    const articleDate = new Date(publishedAt);
    const hoursDiff = (now - articleDate) / (1000 * 60 * 60);
    
    if (hoursDiff < 6) return 3;      // Very recent
    if (hoursDiff < 12) return 2.5;   // Recent
    if (hoursDiff < 24) return 2;     // Today
    if (hoursDiff < 48) return 1;     // Yesterday
    if (hoursDiff < 72) return 0.5;   // 2 days ago
    
    return 0;
  }

  // Fallback: Get trending articles
  getFallbackRecommendations(articles, limit = 15) {
    console.log('📈 Using fallback trending articles');
    return articles
      .sort((a, b) => this.calculateTrendingScore(b) - this.calculateTrendingScore(a))
      .slice(0, limit);
  }

  // Get sentiment label
  getSentimentLabel(sentiment) {
    if (sentiment > 0.1) return 'positive';
    if (sentiment < -0.1) return 'negative';
    return 'neutral';
  }

  // Collaborative filtering: Find similar users
  async findSimilarUsers(userId, limit = 10) {
    try {
      const userReactions = await Reaction.find({ user: userId, reactionType: 'like' });
      const likedArticles = new Set(userReactions.map(r => r.articleId));

      if (likedArticles.size === 0) {
        return [];
      }

      // Find users who liked similar articles
      const similarUserReactions = await Reaction.find({
        articleId: { $in: Array.from(likedArticles) },
        user: { $ne: userId },
        reactionType: 'like'
      });

      // Count common likes per user
      const userSimilarity = {};
      similarUserReactions.forEach(reaction => {
        const otherUserId = reaction.user.toString();
        userSimilarity[otherUserId] = (userSimilarity[otherUserId] || 0) + 1;
      });

      // Sort by similarity (users with most common likes)
      const similarUsers = Object.entries(userSimilarity)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([userId, commonLikes]) => {
          console.log(`👤 Similar user found: ${commonLikes} common likes`);
          return userId;
        });

      return similarUsers;
    } catch (error) {
      console.error('Error finding similar users:', error);
      return [];
    }
  }
}

module.exports = new RecommendationEngine();