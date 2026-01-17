const axios = require("axios");

/**
 * Fetch full article content using Jina AI Reader API
 * @param {string} url
 * @returns {object} { success, fullText, wordCount, hasReferences, error }
 */
async function fetchFullArticle(url) {
  try {
    console.log(`🌐 Fetching full article from: ${url.substring(0, 70)}...`);

    // Jina reader endpoint
    const jinaUrl = `https://r.jina.ai/${url}`;

    const response = await axios.get(jinaUrl, {
      headers: {
        Accept: "text/plain"
      },
      timeout: 25000
    });

    let fullText = response.data;

    // IMPORTANT FIX: force to string
    if (typeof fullText !== "string") {
      fullText = JSON.stringify(fullText);
    }

    // Basic cleanup (optional)
    fullText = fullText.trim();

    if (!fullText || fullText.length < 100) {
      throw new Error("Article text too short or empty");
    }

    console.log(`✅ Article fetched: ${fullText.length} characters`);

    const wordCount = fullText.split(/\s+/).length;
    const hasReferences = checkForReferences(fullText);

    return {
      success: true,
      fullText,
      wordCount,
      hasReferences
    };
  } catch (error) {
    console.error(`❌ Jina API error: ${error.message}`);

    return {
      success: false,
      fullText: "",
      wordCount: 0,
      hasReferences: { found: false, count: 0, indicators: [] },
      error: error.message
    };
  }
}

/**
 * Check if article contains references/citations
 */
function checkForReferences(text) {
  if (!text || typeof text !== "string") {
    return { found: false, count: 0, indicators: [] };
  }

  const lowerText = text.toLowerCase();

  const referenceIndicators = [
    "according to",
    "reported by",
    "sources say",
    "study shows",
    "research found",
    "data from",
    "officials said",
    "spokesman said",
    "statement",
    "confirmed by",
    "published in",
    "journal",
    "university",
    "institute",
    "agency",
    "government",
    "citing"
  ];

  let referenceCount = 0;
  const foundIndicators = [];

  referenceIndicators.forEach((indicator) => {
    const matches = lowerText.match(new RegExp(indicator, "g"));
    if (matches) {
      referenceCount += matches.length;
      foundIndicators.push(indicator);
    }
  });

  return {
    found: referenceCount > 0,
    count: referenceCount,
    indicators: foundIndicators
  };
}

/**
 * Extract metadata from article text
 */
function extractArticleMetadata(text) {
  if (!text || typeof text !== "string") {
    return {
      hasAuthor: false,
      hasDate: false,
      hasQuotes: 0,
      paragraphCount: 0,
      averageSentenceLength: 0
    };
  }

  return {
    hasAuthor: /by\s+[A-Z][a-z]+\s+[A-Z][a-z]+/i.test(text.substring(0, 500)),
    hasDate: /\d{4}|\d{1,2}\/\d{1,2}\/\d{2,4}|january|february|march|april|may|june|july|august|september|october|november|december/i.test(
      text.substring(0, 500)
    ),
    hasQuotes: (text.match(/["“”'][\w\s,\.!?-]+["“”']/g) || []).length,
    paragraphCount: (text.match(/\n\n/g) || []).length + 1,
    averageSentenceLength: calculateAverageSentenceLength(text)
  };
}

function calculateAverageSentenceLength(text) {
  if (!text || typeof text !== "string") return 0;

  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
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