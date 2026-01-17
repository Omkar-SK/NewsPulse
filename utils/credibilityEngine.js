const sourceCredibilityDB = require('./sourceCredibilityDB');
const crossSourceVerifier = require('./crossSourceVerifier');
const geminiAnalyzer = require('./geminiAnalyzer');
const articleScraper = require('./articleScraper');

/**
 * Main credibility analysis function
 */
async function analyzeCredibility(article) {
  console.log(`\n🔍 Analyzing credibility for: "${article.title?.substring(0, 60)}..."`);
  console.log(`📊 Article data:`, {
    source: article.source,
    url: article.url,
    bodyLength: article.body?.length || 0,
    summaryLength: article.summary?.length || 0
  });

  // 1. Source Credibility
  let sourceIdentifier = article.source;
  
  console.log(`📋 Original source string: "${sourceIdentifier}"`);
  
  // Try to extract domain from source name
  if (sourceIdentifier && (sourceIdentifier.includes('.') || sourceIdentifier.includes('www'))) {
    const domainMatch = sourceIdentifier.match(/([a-z0-9-]+\.[a-z.]+)/i);
    if (domainMatch) {
      sourceIdentifier = domainMatch[1].replace('www.', '');
      console.log(`🔗 Extracted domain from source string: ${sourceIdentifier}`);
    }
  }
  
  // Try to extract domain from URL if source is unknown
  if (!sourceIdentifier || sourceIdentifier === 'Unknown Source' || sourceIdentifier.length < 3) {
    if (article.url) {
      try {
        const urlObj = new URL(article.url);
        sourceIdentifier = urlObj.hostname.replace('www.', '');
        console.log(`🔗 Extracted domain from URL: ${sourceIdentifier}`);
      } catch (err) {
        console.log('⚠️ Could not extract domain from URL');
      }
    }
  }

  const sourceMetadata = sourceCredibilityDB.getSourceCredibility(sourceIdentifier);
  const sourceScore = sourceCredibilityDB.calculateSourceScore(sourceMetadata);
  
  console.log(`📰 Source: ${sourceMetadata.name} (Trust: ${sourceMetadata.trust}, Score: ${sourceScore})`);

  // 2. Cross-Source Verification
  const similarArticles = await crossSourceVerifier.searchCrossSource(
    article.title,
    article.uri
  );
  
  const crossSourceResult = crossSourceVerifier.calculateCrossSourceScore(
    similarArticles,
    sourceCredibilityDB
  );
  
  console.log(`🔗 Cross-source: ${crossSourceResult.score}/100 (${crossSourceResult.sourcesFound.length} sources)`);

  // 3. Fetch FULL ARTICLE using Jina AI
  let fullArticleText = null;
  let articleMetadata = null;
  
  if (article.url) {
    console.log(`🌐 Attempting to fetch full article...`);
    const scrapedArticle = await articleScraper.fetchFullArticle(article.url);
    
    if (scrapedArticle.success) {
      fullArticleText = scrapedArticle.fullText;
      articleMetadata = articleScraper.extractArticleMetadata(fullArticleText);
      
      console.log(`✅ Full article: ${scrapedArticle.wordCount} words, ${scrapedArticle.hasReferences.count} citations`);
    } else {
      console.log(`⚠️ Could not fetch full article: ${scrapedArticle.error}`);
      console.log(`📦 Using cached content`);
    }
  }

  // 4. AI Content Analysis with FULL ARTICLE
  const contentForAnalysis = fullArticleText || article.body || article.summary;
  
  console.log(`🤖 Analyzing content (${contentForAnalysis.length} chars)...`);

  const aiSignals = await geminiAnalyzer.analyzeArticleContent(
    article.title,
    article.summary || article.body?.substring(0, 500),
    fullArticleText
  );
  
  const aiScore = geminiAnalyzer.calculateAIScore(aiSignals);
  
  console.log(`🤖 AI analysis: ${aiScore}/100`);
  console.log(`   - Sensationalism: ${aiSignals.sensationalism}%`);
  console.log(`   - Emotional: ${aiSignals.emotionalManipulation}%`);
  console.log(`   - Clickbait: ${aiSignals.clickbaitProbability}%`);
  console.log(`   - Bias: ${aiSignals.biasIndicators}%`);
  console.log(`   - Evidence Quality: ${aiSignals.evidenceQuality}%`);

  // 5. Build scores object
  const scores = {
    sourceCredibility: {
      score: sourceScore,
      weight: 35
    },
    crossSourceVerification: {
      score: crossSourceResult.score,
      weight: 35,
      sourcesFound: crossSourceResult.sourcesFound,
      totalSourcesChecked: crossSourceResult.totalSourcesChecked
    },
    aiContentAnalysis: {
      score: aiScore,
      weight: 25,
      signals: aiSignals
    },
    communitySignals: {
      score: 50,
      weight: 5
    }
  };

  // 6. Calculate final score
  const finalScore = calculateFinalScore(scores);
  const riskLevel = getRiskLevel(finalScore);
  const explanationTags = generateExplanationTags(scores, sourceMetadata, articleMetadata);

  console.log(`✅ Final credibility score: ${finalScore}/100 (${riskLevel} risk)`);
  console.log(`   Formula: (${sourceScore}×0.35) + (${crossSourceResult.score}×0.35) + (${aiScore}×0.25) + (50×0.05) = ${finalScore}`);
  console.log(`   Tags: ${explanationTags.join(', ')}\n`);

  return {
    finalScore,
    riskLevel,
    scores,
    explanationTags,
    sourceMetadata,
    articleMetadata: articleMetadata || {}
  };
}

/**
 * Calculate final credibility score
 */
function calculateFinalScore(scores) {
  const {
    sourceCredibility,
    crossSourceVerification,
    aiContentAnalysis,
    communitySignals
  } = scores;

  const finalScore = 
    (sourceCredibility.score * sourceCredibility.weight / 100) +
    (crossSourceVerification.score * crossSourceVerification.weight / 100) +
    (aiContentAnalysis.score * aiContentAnalysis.weight / 100) +
    (communitySignals.score * communitySignals.weight / 100);

  return Math.round(finalScore);
}

/**
 * Determine risk level
 */
function getRiskLevel(score) {
  if (score >= 70) return 'low';
  if (score >= 50) return 'medium';
  return 'high';
}

/**
 * Generate explanation tags
 */
function generateExplanationTags(scores, sourceMetadata, articleMetadata) {
  const tags = [];

  // Source credibility
  if (sourceMetadata.category === 'tier1') {
    tags.push('✅ Reputable Source');
  } else if (sourceMetadata.category === 'tier3') {
    tags.push('⚠️ Unverified Source');
  }

  // Cross-source verification
  const crossSource = scores.crossSourceVerification;
  if (crossSource.sourcesFound.length >= 5) {
    tags.push(`✅ Confirmed by ${crossSource.sourcesFound.length} sources`);
  } else if (crossSource.sourcesFound.length >= 3) {
    tags.push(`⚠️ Confirmed by ${crossSource.sourcesFound.length} sources`);
  } else if (crossSource.sourcesFound.length > 0) {
    tags.push(`⚠️ Limited verification (${crossSource.sourcesFound.length} sources)`);
  } else {
    tags.push('❌ No cross-source verification');
  }

  // AI content analysis
  const ai = scores.aiContentAnalysis.signals;
  
  if (ai.sensationalism > 70) {
    tags.push('⚠️ High sensationalism');
  }
  
  if (ai.clickbaitProbability > 70) {
    tags.push('⚠️ Clickbait indicators');
  }
  
  if (ai.biasIndicators > 70) {
    tags.push('⚠️ Potential bias');
  }
  
  if (ai.evidenceQuality < 30) {
    tags.push('✅ Well-sourced article');
  } else if (ai.evidenceQuality > 70) {
    tags.push('⚠️ Lacks evidence');
  }

  if (ai.emotionalManipulation < 30) {
    tags.push('✅ Neutral tone');
  } else if (ai.emotionalManipulation > 70) {
    tags.push('⚠️ Emotional language');
  }

  // Article metadata tags (from Jina scraping)
  if (articleMetadata && Object.keys(articleMetadata).length > 0) {
    if (articleMetadata.hasAuthor) {
      tags.push('✅ Author identified');
    }
    if (articleMetadata.hasDate) {
      tags.push('✅ Date published');
    }
    if (articleMetadata.hasQuotes >= 3) {
      tags.push('✅ Multiple quotes');
    }
  }

  return tags;
}

module.exports = {
  analyzeCredibility,
  calculateFinalScore,
  getRiskLevel,
  generateExplanationTags
};