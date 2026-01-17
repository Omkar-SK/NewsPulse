const axios = require('axios');

/**
 * Fetch full article content using Jina AI Reader API
 * @param {string} url - Article URL
 * @returns {object} - { success, fullText, title, error }
 */
async function fetchFullArticle(url) {
  try {
    console.log(`🌐 Fetching full article from: ${url.substring(0, 60)}...`);

    // Jina AI Reader API - converts any URL to clean markdown text
    const jinaUrl = `https://r.jina.ai/${encodeURIComponent(url)}`;
    
    const response = await axios.get(jinaUrl, {
      headers: {
        'Accept': 'application/json',
        'X-Return-Format': 'text' // Get plain text instead of markdown
      },
      timeout: 15000 // 15 second timeout
    });

    if (!response.data) {
      throw new Error('No data returned from Jina API');
    }

    // Jina returns the cleaned article text
    const fullText = typeof response.data === 'string' 
      ? response.data 
      : response.data.data || response.data.content || '';

    if (!fullText || fullText.length < 100) {
      throw new Error('Article text too short or empty');
    }

    console.log(`✅ Article fetched: ${fullText.length} characters`);

    return {
      success: true,
      fullText: fullText,
      wordCount: fullText.split(/\s+/).length,
      hasReferences: checkForReferences(fullText)
    };

  } catch (error) {
    console.error(`❌ Jina API error: ${error.message}`);
    
    return {
      success: false,
      fullText: '',
      error: error.message
    };
  }
}

/**
 * Check if article contains references/citations
 */
function checkForReferences(text) {
  const lowerText = text.toLowerCase();
  
  const referenceIndicators = [
    'according to',
    'reported by',
    'sources say',
    'study shows',
    'research found',
    'data from',
    'officials said',
    'spokesman said',
    'statement',
    'confirmed by',
    'published in',
    'journal',
    'university',
    'institute',
    'agency',
    'government',
    'citing'
  ];

  let referenceCount = 0;
  referenceIndicators.forEach(indicator => {
    const matches = lowerText.match(new RegExp(indicator, 'g'));
    if (matches) {
      referenceCount += matches.length;
    }
  });

  return {
    found: referenceCount > 0,
    count: referenceCount,
    indicators: referenceIndicators.filter(ind => lowerText.includes(ind))
  };
}

/**
 * Extract metadata from article text
 */
function extractArticleMetadata(text) {
  const metadata = {
    hasAuthor: /by\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i.test(text.substring(0, 500)),
    hasDate: /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(text.substring(0, 500)),
    hasQuotes: (text.match(/["'""][\w\s,\.!?]+["'"\"]/g) || []).length,
    paragraphCount: (text.match(/\n\n/g) || []).length + 1,
    averageSentenceLength: calculateAverageSentenceLength(text)
  };

  return metadata;
}

function calculateAverageSentenceLength(text) {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return 0;
  
  const totalWords = sentences.reduce((sum, sentence) => {
    return sum + sentence.trim().split(/\s+/).length;
  }, 0);
  
  return Math.round(totalWords / sentences.length);
}

module.exports = {
  fetchFullArticle,
  checkForReferences,
  extractArticleMetadata
};