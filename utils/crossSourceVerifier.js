const axios = require('axios');
const stringSimilarity = require('string-similarity');
const nlp = require('compromise');

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_BASE_URL = 'https://eventregistry.org/api/v1';

/**
 * Extract key entities from article title using NLP
 */
function extractKeyEntities(title) {
  const doc = nlp(title);
  
  // Extract named entities
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const organizations = doc.organizations().out('array');
  
  // Extract important nouns
  const nouns = doc.nouns().out('array')
    .filter(noun => noun.length > 3)
    .slice(0, 5);
  
  return {
    entities: [...people, ...places, ...organizations],
    keywords: nouns
  };
}

/**
 * Search for similar articles across sources using EventRegistry API
 */
async function searchCrossSource(title, originalUri) {
  try {
    const { entities, keywords } = extractKeyEntities(title);
    
    // Strategy 1: Try with entities and keywords
    let searchTerms = [...entities, ...keywords].slice(0, 4).join(' ');
    
    // Strategy 2: If no entities, use important words from title
    if (!searchTerms || searchTerms.length < 10) {
        const titleWords = title
            .split(' ')
            .filter(word => 
                word.length > 4 && 
                !['about', 'after', 'before', 'could', 'should', 'would', 'their', 'there', 'these', 'those'].includes(word.toLowerCase())
            )
            .slice(0, 5)
            .join(' ');
        searchTerms = titleWords;
    }

    console.log(`🔍 Searching for: "${searchTerms}"`);

    // Try multiple search strategies
    let articles = [];
    
    // Strategy A: Search with keywords (most relevant)
    if (searchTerms.length > 5) {
        const params1 = {
            action: 'getArticles',
            keyword: searchTerms,
            articlesCount: 50,
            articlesSortBy: 'rel',
            articlesSortByAsc: false,
            dataType: ['news'],
            resultType: 'articles',
            apiKey: NEWS_API_KEY
        };

        try {
            const response1 = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { 
                params: params1,
                timeout: 15000 
            });
            
            if (response1.data?.articles?.results) {
                articles = response1.data.articles.results;
                console.log(`📰 Strategy A (keyword search): Found ${articles.length} articles`);
            }
        } catch (err) {
            console.log(`⚠️ Strategy A failed: ${err.message}`);
        }
    }

    // Strategy B: If no results, try broader concept search
    if (articles.length === 0 && entities.length > 0) {
        const conceptUri = entities[0]; // Use first entity as concept
        
        const params2 = {
            action: 'getArticles',
            conceptUri: `http://en.wikipedia.org/wiki/${conceptUri.replace(/ /g, '_')}`,
            articlesCount: 40,
            articlesSortBy: 'date',
            articlesSortByAsc: false,
            dataType: ['news'],
            resultType: 'articles',
            apiKey: NEWS_API_KEY
        };

        try {
            const response2 = await axios.get(`${NEWS_API_BASE_URL}/article/getArticles`, { 
                params: params2,
                timeout: 15000 
            });
            
            if (response2.data?.articles?.results) {
                articles = response2.data.articles.results;
                console.log(`📰 Strategy B (concept search): Found ${articles.length} articles`);
            }
        } catch (err) {
            console.log(`⚠️ Strategy B failed: ${err.message}`);
        }
    }

    if (articles.length === 0) {
        console.log('⚠️ No results from any search strategy');
        return [];
    }

    console.log(`📰 Total articles fetched: ${articles.length}`);
    
    // Filter and score articles
    const similarArticles = articles
      .filter(article => article.uri !== originalUri)
      .map(article => {
        const similarity = stringSimilarity.compareTwoStrings(
          title.toLowerCase(),
          article.title.toLowerCase()
        );
        
        return {
          title: article.title,
          source: article.source?.title || article.source?.uri?.split('/').pop() || 'Unknown',
          url: article.url,
          similarity: similarity,
          publishedAt: article.dateTime
        };
      })
      .filter(article => article.similarity > 0.20) // Lowered from 0.25
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 20);

    console.log(`✅ Found ${similarArticles.length} similar articles (threshold: 0.20)`);
    
    if (similarArticles.length > 0) {
        console.log('Top 3 matches:', similarArticles.slice(0, 3).map(a => ({
            source: a.source,
            similarity: Math.round(a.similarity * 100) + '%',
            title: a.title.substring(0, 60) + '...'
        })));
    }
    
    return similarArticles;
    
  } catch (error) {
    console.error('❌ Error in cross-source verification:', error.message);
    return [];
  }
}

/**
 * Calculate cross-source verification score
 */
function calculateCrossSourceScore(similarArticles, sourceCredibilityDB) {
  if (similarArticles.length === 0) {
    return {
      score: 30, // Low score if no verification found
      sourcesFound: [],
      totalSourcesChecked: 0,
      verificationStrength: 'weak'
    };
  }

  const uniqueSources = [...new Set(similarArticles.map(a => a.source))];
  
  // Calculate weighted score based on source quality
  let weightedScore = 0;
  let totalWeight = 0;

  similarArticles.forEach(article => {
    const sourceData = sourceCredibilityDB.getSourceCredibility(article.source);
    const weight = sourceData.trust / 100;
    
    weightedScore += article.similarity * 100 * weight;
    totalWeight += weight;
  });

  const avgScore = totalWeight > 0 ? weightedScore / totalWeight : 30;
  
  // Cap score between 0-100
  const finalScore = Math.min(100, Math.max(0, Math.round(avgScore)));

  let verificationStrength = 'weak';
  if (uniqueSources.length >= 5) verificationStrength = 'strong';
  else if (uniqueSources.length >= 3) verificationStrength = 'moderate';

  return {
    score: finalScore,
    sourcesFound: uniqueSources.slice(0, 10),
    totalSourcesChecked: similarArticles.length,
    verificationStrength
  };
}

module.exports = {
  searchCrossSource,
  calculateCrossSourceScore,
  extractKeyEntities
};