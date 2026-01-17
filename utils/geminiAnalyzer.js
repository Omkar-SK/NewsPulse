const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

/**
 * Analyze FULL article content using Gemini AI
 */
async function analyzeArticleContent(title, content, fullArticleText = null) {
  try {
    // Use full article if available, otherwise use cached summary
    const textToAnalyze = fullArticleText && fullArticleText.length > content.length 
      ? fullArticleText.substring(0, 3000) // Use first 3000 chars of full article
      : content;

    console.log(`\n🤖 Analyzing: ${title.substring(0, 60)}...`);
    console.log(`📄 Content source: ${fullArticleText ? 'FULL ARTICLE' : 'cached summary'} (${textToAnalyze.length} chars)`);

    // Enhanced prompt for full article analysis
    const prompt = `You are a professional fact-checker. Analyze this news article for credibility indicators.

Title: ${title}

Article Text:
${textToAnalyze}

Rate these 5 aspects (0-100, where 0=best, 100=worst):

1. Sensationalism - Exaggerated/dramatic language vs factual reporting
2. Emotional Manipulation - Appeals to fear/anger vs neutral presentation
3. Clickbait - Misleading/teasing headline vs informative title
4. Bias - One-sided reporting vs balanced coverage
5. Evidence Quality - Lack of sources/citations (0=well-sourced, 100=no evidence)

Additional checks:
- Does it cite sources, studies, or officials?
- Does it include quotes from experts?
- Does it provide context and background?
- Are there verifiable facts?

Return ONLY 5 numbers separated by commas (e.g., 25,30,15,40,20)`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 150,
          candidateCount: 1
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "API error");
    }

    if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
      throw new Error("No response from AI");
    }

    const text = data.candidates[0].content.parts[0].text.trim();
    console.log(`📥 AI response: ${text}`);

    // Parse comma-separated numbers
    const numbers = text.match(/\d+/g);
    
    if (!numbers || numbers.length < 5) {
      throw new Error("Incomplete response");
    }

    const analysis = {
      sensationalism: parseInt(numbers[0]) || 50,
      emotionalManipulation: parseInt(numbers[1]) || 50,
      clickbaitProbability: parseInt(numbers[2]) || 50,
      biasIndicators: parseInt(numbers[3]) || 50,
      evidenceQuality: parseInt(numbers[4]) || 50
    };

    // Clamp values
    Object.keys(analysis).forEach(key => {
      analysis[key] = Math.max(0, Math.min(100, analysis[key]));
    });

    console.log(`✅ S:${analysis.sensationalism} E:${analysis.emotionalManipulation} C:${analysis.clickbaitProbability} B:${analysis.biasIndicators} Ev:${analysis.evidenceQuality}`);

    return analysis;

  } catch (error) {
    console.error(`❌ AI Error: ${error.message}`);
    
    // Fallback to heuristic analysis
    return analyzeWithHeuristics(title, content, fullArticleText);
  }
}

/**
 * Enhanced heuristic analysis with full article support
 */
function analyzeWithHeuristics(title, content, fullArticleText = null) {
  console.log(`⚠️ Using heuristic analysis...`);
  
  const titleLower = title.toLowerCase();
  const text = (fullArticleText || content || title).toLowerCase();
  
  let sensationalism = 30;
  let emotional = 30;
  let clickbait = 30;
  let bias = 40;
  let evidence = 50;
  
  // Sensational words
  const sensationalWords = ['shocking', 'unbelievable', 'outrageous', 'devastating', 'horrific', 'stunning', 'massive', 'explosive', 'breaking', 'bombshell'];
  sensationalWords.forEach(word => {
    if (titleLower.includes(word)) sensationalism += 15;
  });
  
  // Emotional words
  const emotionalWords = ['terrifying', 'furious', 'outraged', 'heartbreaking', 'tragic', 'horrible', 'nightmare', 'crisis', 'disaster'];
  emotionalWords.forEach(word => {
    if (titleLower.includes(word)) emotional += 15;
  });
  
  // Clickbait patterns
  if (titleLower.includes('what happens next')) clickbait += 30;
  if (titleLower.includes("you won't believe")) clickbait += 40;
  if (titleLower.includes('this is why')) clickbait += 20;
  if (titleLower.includes('will shock you')) clickbait += 35;
  if (title.includes('?') && !title.match(/who|what|when|where|why|how/i)) clickbait += 25;
  
  // All caps words
  const capsWords = title.match(/\b[A-Z]{3,}\b/g);
  if (capsWords && capsWords.length > 2) {
    sensationalism += 20;
    clickbait += 15;
  }
  
  // Exclamation marks
  const exclamations = (title.match(/!/g) || []).length;
  sensationalism += exclamations * 15;
  emotional += exclamations * 15;
  
  // Numbered lists in headline
  if (titleLower.match(/\d+\s+(reasons|ways|things|facts|secrets|tips)/)) {
    clickbait += 25;
  }
  
  // Check for evidence/citations (ENHANCED FOR FULL ARTICLE)
  const citationPhrases = [
    'according to',
    'reported',
    'study shows',
    'research',
    'officials',
    'sources say',
    'data from',
    'published in',
    'journal',
    'university',
    'institute',
    'spokesman',
    'statement',
    'confirmed'
  ];
  
  let citationCount = 0;
  citationPhrases.forEach(phrase => {
    const matches = text.match(new RegExp(phrase, 'g'));
    if (matches) citationCount += matches.length;
  });
  
  // Evidence quality improves with citations
  if (citationCount >= 5) evidence -= 30; // Many citations
  else if (citationCount >= 3) evidence -= 20; // Some citations
  else if (citationCount >= 1) evidence -= 10; // Few citations
  else evidence += 20; // No citations
  
  // Check for quotes (indicates primary sources)
  const quoteCount = (text.match(/["'""][\w\s,\.!?]+["'"\"]/g) || []).length;
  if (quoteCount >= 3) evidence -= 15;
  
  // Check for unnamed sources (reduces credibility)
  if (text.includes('unnamed source') || text.includes('anonymous')) {
    evidence += 15;
    bias += 10;
  }
  
  // Bias indicators
  const biasedWords = ['always', 'never', 'everyone knows', 'obviously', 'clearly', 'undeniable', 'unprecedented'];
  biasedWords.forEach(word => {
    if (text.includes(word)) bias += 10;
  });
  
  // Check for balanced reporting
  if (text.includes('however') || text.includes('on the other hand') || text.includes('meanwhile')) {
    bias -= 15; // Shows multiple perspectives
  }
  
  // Clamp all values
  const analysis = {
    sensationalism: Math.min(100, Math.max(0, sensationalism)),
    emotionalManipulation: Math.min(100, Math.max(0, emotional)),
    clickbaitProbability: Math.min(100, Math.max(0, clickbait)),
    biasIndicators: Math.min(100, Math.max(0, bias)),
    evidenceQuality: Math.min(100, Math.max(0, evidence))
  };
  
  console.log(`📊 Heuristic: S:${analysis.sensationalism} E:${analysis.emotionalManipulation} C:${analysis.clickbaitProbability} B:${analysis.biasIndicators} Ev:${analysis.evidenceQuality} (${citationCount} citations found)`);
  
  return analysis;
}

function calculateAIScore(signals) {
  const avgSignal = (
    signals.sensationalism * 0.20 +
    signals.emotionalManipulation * 0.20 +
    signals.clickbaitProbability * 0.20 +
    signals.biasIndicators * 0.20 +
    signals.evidenceQuality * 0.20
  );

  return Math.round(100 - avgSignal);
}

module.exports = {
  analyzeArticleContent,
  calculateAIScore
};