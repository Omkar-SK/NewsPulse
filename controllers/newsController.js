const Article = require('../models/Article');
const Reaction = require('../models/Reaction');
const axios = require('axios');

const NEWS_API_KEY = process.env.NEWS_API_KEY || 'f62067a1-8ecb-49eb-86d5-93503c1b95d5';
const NEWS_API_BASE_URL = 'https://eventregistry.org/api/v1';
const CACHE_DURATION = 2 * 60 * 60 * 1000; // 2 hours in milliseconds

// Language mapping for News API
const languageMapping = {
  'en': 'eng',
  'hi': 'hin',
  'mr': 'mar',
  'ta': 'tam',
  'te': 'tel',
  'fr': 'fra',
  'es': 'spa'
};

// Country mapping for News API
const countryMapping = {
  'us': 'http://en.wikipedia.org/wiki/United_States',
  'gb': 'http://en.wikipedia.org/wiki/United_Kingdom',
  'in': 'http://en.wikipedia.org/wiki/India',
  'ca': 'http://en.wikipedia.org/wiki/Canada',
  'au': 'http://en.wikipedia.org/wiki/Australia',
  'de': 'http://en.wikipedia.org/wiki/Germany',
  'fr': 'http://en.wikipedia.org/wiki/France',
  'jp': 'http://en.wikipedia.org/wiki/Japan',
  'cn': 'http://en.wikipedia.org/wiki/China',
  'br': 'http://en.wikipedia.org/wiki/Brazil'
};

// Generate cache key based on parameters
function generateCacheKey(category, country, lang) {
  return `news_${category}_${country}_${lang}`;
}

// Fetch news from external API
async function fetchFromNewsAPI(category, country, lang) {
  try {
    const params = {
      action: 'getArticles',
      articlesPage: 1,
      articlesCount: 100,
      articlesSortBy: 'date',
      articlesSortByAsc: false,
      dataType: ['news'],
      resultType: 'articles',
      articleBodyLen: -1,
      apiKey: NEWS_API_KEY
    };

    if (lang && languageMapping[lang]) {
      params.lang = languageMapping[lang];
    }

    if (country && countryMapping[country]) {
      params.sourceLocationUri = countryMapping[country];
    }

    if (category && category !== 'all') {
      params.keyword = category;
      params.keywordLoc = 'body,title';
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { params });
    
    if (response.data && response.data.articles && response.data.articles.results) {
      return response.data.articles.results;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching from News API:', error);
    return [];
  }
}

// @desc    Get news articles (with caching)
// @route   GET /api/news
// @access  Public
exports.getNews = async (req, res) => {
  try {
    const { category = 'all', country = '', lang = 'en' } = req.query;
    const cacheKey = generateCacheKey(category, country, lang);
    const now = new Date();

    // Check for cached articles
    const cachedArticles = await Article.find({
      cacheKey,
      expiresAt: { $gt: now }
    }).sort('-publishedAt');

    
    // In the getNews function, replace the reaction fetching part:

if (cachedArticles.length > 0) {
  // Get reaction counts for all articles
  const articlesWithReactions = await Promise.all(
    cachedArticles.map(async (article) => {
      try {
        const reactionCounts = await Reaction.aggregate([
          { $match: { articleId: article.articleId } },
          { $group: { 
              _id: '$reactionType', 
              count: { $sum: 1 } 
            } 
          }
        ]);

        const counts = {
          like: 0,
          dislike: 0,
          neutral: 0,
          total: 0
        };

        reactionCounts.forEach(item => {
          counts[item._id] = item.count;
          counts.total += item.count;
        });

        console.log(`📊 Article ${article.articleId} reactions:`, counts);

        return {
          ...article.toObject(),
          reactions: counts
        };
      } catch (error) {
        console.error('Error fetching reactions for article:', article.articleId, error);
        return {
          ...article.toObject(),
          reactions: { like: 0, dislike: 0, neutral: 0, total: 0 }
        };
      }
    })
  );

  return res.status(200).json({
    success: true,
    fromCache: true,
    articles: articlesWithReactions
  });
}

    // Fetch fresh data from API
    const newsData = await fetchFromNewsAPI(category, country, lang);
    
    if (newsData.length === 0) {
      return res.status(200).json({
        success: true,
        fromCache: false,
        articles: []
      });
    }

    // Clear old cache for this key
    await Article.deleteMany({ cacheKey });

    // Save new articles to cache
    const expiresAt = new Date(now.getTime() + CACHE_DURATION);
    const articlesToSave = newsData.map(article => ({
      articleId: article.uri || `${Date.now()}_${Math.random()}`,
      title: article.title,
      summary: article.body ? article.body.substring(0, 500) : 'No description available',
      body: article.body,
      image: article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
      source: article.source?.title || 'Unknown Source',
      url: article.url,
      category: category !== 'all' ? category : 'general',
      sentiment: article.sentiment || 0,
      publishedAt: article.dateTime || article.date || now,
      uri: article.uri,
      lang: article.lang,
      shares: article.shares || Math.floor(Math.random() * 1000),
      cacheKey,
      expiresAt
    }));

    const savedArticles = await Article.insertMany(articlesToSave);

    // Get reaction counts for new articles
    const articlesWithReactions = await Promise.all(
      savedArticles.map(async (article) => {
        const reactionCounts = await Reaction.aggregate([
          { $match: { articleId: article.articleId } },
          { $group: { 
              _id: '$reactionType', 
              count: { $sum: 1 } 
            } 
          }
        ]);

        const counts = {
          like: 0,
          dislike: 0,
          neutral: 0,
          total: 0
        };

        reactionCounts.forEach(item => {
          counts[item._id] = item.count;
          counts.total += item.count;
        });

        return {
          ...article.toObject(),
          reactions: counts
        };
      })
    );

    res.status(200).json({
      success: true,
      fromCache: false,
      articles: articlesWithReactions
    });
  } catch (err) {
    console.error('Error in getNews:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Search news articles
// @route   GET /api/news/search
// @access  Public
exports.searchNews = async (req, res) => {
  try {
    const { query, lang = 'en' } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    // First, search in cached articles
    const cachedResults = await Article.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { summary: { $regex: query, $options: 'i' } }
      ],
      expiresAt: { $gt: new Date() }
    }).limit(50);

    if (cachedResults.length > 0) {
      const articlesWithReactions = await Promise.all(
        cachedResults.map(async (article) => {
          const reactionCounts = await Reaction.aggregate([
            { $match: { articleId: article.articleId } },
            { $group: { 
                _id: '$reactionType', 
                count: { $sum: 1 } 
              } 
            }
          ]);

          const counts = {
            like: 0,
            dislike: 0,
            neutral: 0,
            total: 0
          };

          reactionCounts.forEach(item => {
            counts[item._id] = item.count;
            counts.total += item.count;
          });

          return {
            ...article.toObject(),
            reactions: counts
          };
        })
      );

      return res.status(200).json({
        success: true,
        fromCache: true,
        articles: articlesWithReactions
      });
    }

    // If no cached results, fetch from API
    const params = {
      action: 'getArticles',
      keyword: query,
      articlesPage: 1,
      articlesCount: 50,
      articlesSortBy: 'date',
      articlesSortByAsc: false,
      dataType: ['news'],
      resultType: 'articles',
      articleBodyLen: -1,
      apiKey: NEWS_API_KEY
    };

    if (lang && languageMapping[lang]) {
      params.lang = languageMapping[lang];
    }

    const response = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { params });
    
    if (!response.data || !response.data.articles || !response.data.articles.results) {
      return res.status(200).json({
        success: true,
        fromCache: false,
        articles: []
      });
    }

    const newsData = response.data.articles.results;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + CACHE_DURATION);
    const cacheKey = `search_${query}_${lang}`;

    const articlesToSave = newsData.map(article => ({
      articleId: article.uri || `${Date.now()}_${Math.random()}`,
      title: article.title,
      summary: article.body ? article.body.substring(0, 500) : 'No description available',
      body: article.body,
      image: article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800',
      source: article.source?.title || 'Unknown Source',
      url: article.url,
      category: 'search',
      sentiment: article.sentiment || 0,
      publishedAt: article.dateTime || article.date || now,
      uri: article.uri,
      lang: article.lang,
      shares: article.shares || 0,
      cacheKey,
      expiresAt
    }));

    const savedArticles = await Article.insertMany(articlesToSave);

    const articlesWithReactions = savedArticles.map(article => ({
      ...article.toObject(),
      reactions: { like: 0, dislike: 0, neutral: 0, total: 0 }
    }));

    res.status(200).json({
      success: true,
      fromCache: false,
      articles: articlesWithReactions
    });
  } catch (err) {
    console.error('Error in searchNews:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};

// @desc    Get similar articles
// @route   GET /api/news/similar/:uri
// @access  Public
exports.getSimilarArticles = async (req, res) => {
  try {
    const { uri } = req.params;
    
    // Try to find similar articles in cache first
    const sourceArticle = await Article.findOne({ uri });
    
    if (sourceArticle) {
      // Find articles with similar keywords in title or same category
      const similarArticles = await Article.find({
        _id: { $ne: sourceArticle._id },
        category: sourceArticle.category,
        expiresAt: { $gt: new Date() }
      }).limit(10);

      if (similarArticles.length > 0) {
        return res.status(200).json({
          success: true,
          articles: similarArticles
        });
      }
    }

    // Fetch from API if no cached results
    const params = {
      action: 'getArticlesSimilar',
      uri: uri,
      articlesCount: 10,
      resultType: 'articles',
      apiKey: NEWS_API_KEY
    };

    const response = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { params });
    
    if (!response.data || !response.data.articles || !response.data.articles.results) {
      return res.status(200).json({
        success: true,
        articles: []
      });
    }

    const similarArticles = response.data.articles.results.map(article => ({
      title: article.title,
      source: article.source?.title || 'Unknown Source',
      url: article.url,
      similarity: Math.random() * 0.3 + 0.7,
      sentiment: article.sentiment || 0
    }));

    res.status(200).json({
      success: true,
      articles: similarArticles
    });
  } catch (err) {
    console.error('Error in getSimilarArticles:', err);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: err.message
    });
  }
};