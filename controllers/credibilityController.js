const Article = require('../models/Article');
const Source = require('../models/Source');
const Review = require('../models/Review');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

// @desc    Analyze article with Gemini AI for fake news detection
// @route   POST /api/credibility/analyze/:articleId
// @access  Public
exports.analyzeArticleWithAI = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    if (!GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        message: 'AI service not configured'
      });
    }

    const article = await Article.findOne({ articleId });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if analysis was done recently (within 24 hours)
    if (article.aiCredibilityAnalysis?.analyzedAt) {
      const hoursSinceAnalysis = (Date.now() - article.aiCredibilityAnalysis.analyzedAt) / (1000 * 60 * 60);
      if (hoursSinceAnalysis < 24) {
        return res.status(200).json({
          success: true,
          analysis: article.aiCredibilityAnalysis,
          cached: true
        });
      }
    }

    // Prepare article content for analysis
    const articleContent = `
Title: ${article.title}
Source: ${article.source}
Published: ${article.publishedAt}
Content: ${article.body || article.summary || ''}
`.substring(0, 5000);

    const prompt = `Analyze this news article for credibility and potential misinformation. 

${articleContent}

Provide a JSON response with the following structure (ensure all strings are properly escaped):
{
  "score": <number 0-100, where 100 is highly credible>,
  "confidence": <number 0-100 indicating analysis confidence>,
  "reasoning": "<brief explanation, keep under 200 characters>",
  "redFlags": ["<flag 1>", "<flag 2>"]
}

Consider these factors:
- Sensationalism and clickbait language
- Lack of sources or citations
- Emotional manipulation
- Logical fallacies
- Consistency with known facts
- Source reputation
- Date relevance
- Bias indicators

CRITICAL: Return ONLY valid JSON with properly escaped strings. Do not include markdown formatting or extra text.`;

    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
          parts: [{
            text: "You are a professional fact-checker and credibility analyst. Analyze news articles objectively and provide structured JSON output with credibility scores and reasoning. Always return valid JSON with properly escaped strings. Never include markdown code blocks or additional text outside the JSON structure."
          }]
        },
        generationConfig: { 
          temperature: 0.2, 
          maxOutputTokens: 1024,
          responseMimeType: "application/json"
        },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      })
    });

    const data = await response.json();

    if (!response.ok || !data.candidates || data.candidates.length === 0) {
      throw new Error('AI analysis failed');
    }

    const analysisText = data.candidates[0]?.content?.parts?.[0]?.text?.trim();
    
    // Try to parse JSON with error handling
    let analysis;
    try {
      // Remove markdown code blocks if present
      let cleanedText = analysisText;
      if (cleanedText.includes('```json')) {
        cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (cleanedText.includes('```')) {
        cleanedText = cleanedText.replace(/```\n?/g, '');
      }
      
      analysis = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw response:', analysisText);
      
      // Fallback: Try to extract values with regex
      const scoreMatch = analysisText.match(/"score"\s*:\s*(\d+)/);
      const confidenceMatch = analysisText.match(/"confidence"\s*:\s*(\d+)/);
      const reasoningMatch = analysisText.match(/"reasoning"\s*:\s*"([^"]+)"/);
      
      analysis = {
        score: scoreMatch ? parseInt(scoreMatch[1]) : 50,
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 70,
        reasoning: reasoningMatch ? reasoningMatch[1] : 'Unable to parse detailed analysis. Please try again.',
        redFlags: []
      };
    }

    // Store analysis in article
    article.aiCredibilityAnalysis = {
      score: Math.min(100, Math.max(0, analysis.score || 50)),
      confidence: Math.min(100, Math.max(0, analysis.confidence || 70)),
      reasoning: analysis.reasoning || 'Analysis completed',
      redFlags: Array.isArray(analysis.redFlags) ? analysis.redFlags : [],
      analyzedAt: new Date(),
      userRatings: article.aiCredibilityAnalysis?.userRatings || { helpful: 0, notHelpful: 0 }
    };

    await article.save();

    res.status(200).json({
      success: true,
      analysis: article.aiCredibilityAnalysis,
      cached: false
    });

  } catch (error) {
    console.error('Error analyzing article with AI:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing article',
      error: error.message
    });
  }
};

// @desc    Rate AI credibility analysis
// @route   PUT /api/credibility/analyze/:articleId/rate
// @access  Private
exports.rateAIAnalysis = async (req, res) => {
  try {
    const { articleId } = req.params;
    const { helpful } = req.body;

    if (typeof helpful !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'Please specify if the analysis was helpful (true/false)'
      });
    }

    const article = await Article.findOne({ articleId });
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    if (!article.aiCredibilityAnalysis) {
      return res.status(400).json({
        success: false,
        message: 'No AI analysis available for this article'
      });
    }

    // Update user ratings
    if (helpful) {
      article.aiCredibilityAnalysis.userRatings.helpful += 1;
    } else {
      article.aiCredibilityAnalysis.userRatings.notHelpful += 1;
    }

    await article.save();

    res.status(200).json({
      success: true,
      message: 'Rating recorded',
      userRatings: article.aiCredibilityAnalysis.userRatings
    });

  } catch (error) {
    console.error('Error rating AI analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


// @desc    Calculate credibility score for an article
// @route   GET /api/credibility/article/:articleId
// @access  Public
exports.getArticleCredibility = async (req, res) => {
  try {
    const { articleId } = req.params;
    
    const article = await Article.findOne({ articleId }).populate('sourceMetadata');
    
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Get reviews for this article
    const reviews = await Review.find({ 
      articleId, 
      status: 'approved' 
    });

    // Calculate credibility score
    const credibilityData = await calculateCredibilityScore(article, reviews);

    res.status(200).json({
      success: true,
      credibilityData
    });
  } catch (error) {
    console.error('Error getting article credibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Submit article for review
// @route   POST /api/credibility/submit
// @access  Private
exports.submitArticle = async (req, res) => {
  try {
    const { title, url, summary, body, source, category } = req.body;

    // Validate required fields
    if (!title || !url || !source) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, URL, and source'
      });
    }

    // Check if article already exists
    const existingArticle = await Article.findOne({ url });
    if (existingArticle) {
      return res.status(400).json({
        success: false,
        message: 'Article already exists in the system'
      });
    }

    // Create article with pending approval
    const article = await Article.create({
      articleId: `user_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      title,
      url,
      summary: summary || 'User submitted article',
      body: body || '',
      source,
      category: category || 'general',
      submittedBy: req.user._id,
      approvalStatus: 'pending',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      publishedAt: new Date()
    });

    // Update user contribution stats
    req.user.contributionStats.articlesSubmitted += 1;
    await req.user.save();

    res.status(201).json({
      success: true,
      message: 'Article submitted for review',
      article
    });
  } catch (error) {
    console.error('Error submitting article:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get source credibility
// @route   GET /api/credibility/source/:sourceId
// @access  Public
exports.getSourceCredibility = async (req, res) => {
  try {
    const { sourceId } = req.params;
    
    const source = await Source.findById(sourceId);
    
    if (!source) {
      return res.status(404).json({
        success: false,
        message: 'Source not found'
      });
    }

    // Get reviews for this source
    const reviews = await Review.find({ 
      sourceId, 
      status: 'approved' 
    });

    // Calculate average ratings
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.credibilityRating, 0) / reviews.length
      : source.reputationScore;

    res.status(200).json({
      success: true,
      source: {
        ...source.toObject(),
        averageRating: avgRating,
        reviewCount: reviews.length
      }
    });
  } catch (error) {
    console.error('Error getting source credibility:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Helper function to calculate credibility score
async function calculateCredibilityScore(article, reviews) {
  let score = 50; // Base score
  const factors = {
    sourceReputation: 0,
    communityFeedback: 0,
    factCheckResults: 0,
    verificationStatus: 0,
    aiAnalysis: 0
  };

  // Factor 1: Source reputation (25% weight - adjusted)
  if (article.sourceMetadata) {
    factors.sourceReputation = article.sourceMetadata.reputationScore * 0.25;
  } else {
    // Use a default moderate score if no source metadata
    factors.sourceReputation = 50 * 0.25;
  }

  // Factor 2: Community feedback (30% weight - adjusted)
  if (reviews.length > 0) {
    const avgCredibility = reviews.reduce((sum, r) => sum + r.credibilityRating, 0) / reviews.length;
    factors.communityFeedback = avgCredibility * 0.3;
  }

  // Factor 3: AI Analysis (25% weight - NEW)
  if (article.aiCredibilityAnalysis && article.aiCredibilityAnalysis.score !== null) {
    const aiScore = article.aiCredibilityAnalysis.score;
    const confidence = article.aiCredibilityAnalysis.confidence || 80;
    
    // Weight AI score by confidence level
    const weightedAIScore = aiScore * (confidence / 100);
    factors.aiAnalysis = weightedAIScore * 0.25;
    
    // Consider user ratings of AI analysis
    const { helpful, notHelpful } = article.aiCredibilityAnalysis.userRatings || { helpful: 0, notHelpful: 0 };
    const totalRatings = helpful + notHelpful;
    if (totalRatings > 0) {
      const helpfulRatio = helpful / totalRatings;
      // Adjust AI factor based on user feedback
      factors.aiAnalysis *= (0.5 + (helpfulRatio * 0.5));
    }
  }

  // Factor 4: Fact-check results (15% weight - adjusted)
  if (article.factCheckResults && article.factCheckResults.length > 0) {
    // Simplified: count positive vs negative fact-checks
    const positiveChecks = article.factCheckResults.filter(
      fc => fc.rating && (fc.rating.toLowerCase().includes('true') || fc.rating.toLowerCase().includes('correct'))
    ).length;
    const factCheckScore = (positiveChecks / article.factCheckResults.length) * 100;
    factors.factCheckResults = factCheckScore * 0.15;
  }

  // Factor 5: Verification status (5% weight - adjusted)
  const verificationMap = {
    'verified': 100,
    'unverified': 50,
    'disputed': 25,
    'false': 0
  };
  factors.verificationStatus = (verificationMap[article.verificationStatus] || 50) * 0.05;

  // Calculate final score
  score = Math.round(
    factors.sourceReputation + 
    factors.communityFeedback + 
    factors.aiAnalysis +
    factors.factCheckResults + 
    factors.verificationStatus
  );

  return {
    score: Math.min(100, Math.max(0, score)),
    factors,
    reviewCount: reviews.length,
    verificationStatus: article.verificationStatus,
    aiAnalysis: article.aiCredibilityAnalysis ? {
      score: article.aiCredibilityAnalysis.score,
      confidence: article.aiCredibilityAnalysis.confidence,
      reasoning: article.aiCredibilityAnalysis.reasoning,
      redFlags: article.aiCredibilityAnalysis.redFlags,
      userRatings: article.aiCredibilityAnalysis.userRatings
    } : null
  };
}
