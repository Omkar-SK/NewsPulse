const Article = require('../models/Article');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using the stable v1 endpoint with the universally available model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

console.log('🔑 Gemini API Key loaded:', !!GEMINI_API_KEY);

// @desc    Generate AI summary for an article
exports.generateSummary = async (req, res) => {
  try {
    const { articleId } = req.body;
    if (!GEMINI_API_KEY) throw new Error('AI service not configured.');

    const article = await Article.findOne({ articleId });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    console.log('✅ Article found:', article.title);

    if (article.aiSummary && article.aiSummaryGeneratedAt) {
      const hoursSinceGenerated = (Date.now() - article.aiSummaryGeneratedAt) / (1000 * 60 * 60);
      if (hoursSinceGenerated < 24) {
        console.log('📦 Returning cached summary');
        return res.json({ success: true, summary: article.aiSummary, cached: true });
      }
    }

    console.log('🤖 Generating new AI summary...');
    const articleContent = article.body || article.summary || article.title;
    const prompt = `Summarize this news article in 2-3 concise sentences: ${articleContent.substring(0, 3000)}`;

    const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
    console.log('📡 Calling Gemini API...');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: {
            parts: [{
                text: "You are a news summarization engine. Your task is to generate a concise, neutral, 2-3 sentence summary of the provided article content. Output only the summary text."
            }]
        },
        generationConfig: { temperature: 0.3, maxOutputTokens: 512 },
        safetySettings: [
          { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
          { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
        ]
      })
    });

    const data = await response.json();
    console.log('📡 Gemini API response status:', response.status);

    if (!response.ok) {
        console.error('❌ Gemini API error:', JSON.stringify(data, null, 2));
        throw new Error(data.error?.message || 'Gemini API error');
    }
    
    if (!data.candidates || data.candidates.length === 0) {
        console.warn('⚠️ Gemini returned no candidates. Block Reason:', data.promptFeedback?.blockReason);
        throw new Error(`Summary generation failed. The model blocked the response.`);
    }
    
    const summary = data.candidates[0]?.content?.parts?.[0]?.text?.trim() || 'Unable to generate summary.';
    console.log('✅ Summary generated:', summary.substring(0, 50) + '...');

    if (summary === 'Unable to generate summary.') {
        throw new Error('The model returned an empty summary text.');
    }

    article.aiSummary = summary;
    article.aiSummaryGeneratedAt = Date.now();
    await article.save();

    res.json({ success: true, summary, cached: false });

  } catch (error) {
    console.error('❌ Error generating summary:', error.message);
    res.status(500).json({ success: false, message: error.message || 'Error generating summary' });
  }
};

// @desc    Chat with AI about news
exports.chatWithBot = async (req, res) => {
    try {
        const { message } = req.body;
        if (!GEMINI_API_KEY) throw new Error('AI service not configured.');
        
        const recentArticles = await Article.find({ expiresAt: { $gt: new Date() } }).sort({ publishedAt: -1 }).limit(100).select('title summary source publishedAt category');
        const queryLower = message.toLowerCase();
        const keywords = queryLower.split(' ').filter(word => word.length > 3);
        let relevantArticles = recentArticles.filter(article => {
          const articleText = (article.title + ' ' + (article.summary || '')).toLowerCase();
          return keywords.some(keyword => articleText.includes(keyword));
        });

        if (relevantArticles.length === 0) {
            if (queryLower.includes('tech')) relevantArticles = recentArticles.filter(a => a.category === 'technology');
            else if (queryLower.includes('sport')) relevantArticles = recentArticles.filter(a => a.category === 'sports');
            else if (queryLower.includes('business')) relevantArticles = recentArticles.filter(a => a.category === 'business');
            else if (queryLower.includes('politic')) relevantArticles = recentArticles.filter(a => a.category === 'politics');
            else relevantArticles = recentArticles.slice(0, 10);
        }

        const newsContext = relevantArticles.slice(0, 15).map(article => `- "${article.title}" from ${article.source}`).join('\n');
        const prompt = `User question: "${message}"\n\nRecent news:\n${newsContext || 'No specific articles found on this topic.'}`;
        
        const apiUrl = `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`;
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: { parts: [{ text: "You are NewsPulse AI, a helpful news assistant. Answer the user's question based on the recent news articles provided. Be conversational, concise (2-3 sentences), and do not make up information. If no relevant news is found, politely say so." }] },
            generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
            safetySettings: [
              { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
              { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" }
            ]
          })
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error?.message || 'Gemini API error');
        if (!data.candidates || data.candidates.length === 0) throw new Error('The model could not process the chat request.');

        const botResponse = data.candidates[0]?.content?.parts?.[0]?.text?.trim() || "I'm having trouble understanding that. Please rephrase.";
        res.json({ success: true, response: botResponse, articlesFound: relevantArticles.length });
      } catch (error) {
        console.error('❌ Error in chat:', error.message);
        res.status(500).json({ success: false, message: error.message, response: 'Sorry, I encountered an error.' });
      }
};