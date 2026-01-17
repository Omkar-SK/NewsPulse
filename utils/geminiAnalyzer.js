const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Keep your current model URL (use the one that is working for your summary route if needed).
// If you already have a working GEMINI_API_URL in your project, keep it consistent.
// IMPORTANT: this file uses Gemini only if available; otherwise it falls back safely.
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

// Cooldown handling when Gemini quota is exceeded
let GEMINI_COOLDOWN_UNTIL = 0; // timestamp in ms

/**
 * Analyze article content using Gemini AI.
 * If quota is exceeded (429), enter cooldown and use heuristic analysis.
 */
async function analyzeArticleContent(title, content, fullArticleText = null) {
  try {
    const fullContent = content && content.length > 50 ? content : title;

    // If we are in cooldown, skip Gemini calls to avoid spamming quota errors
    if (Date.now() < GEMINI_COOLDOWN_UNTIL) {
      console.log("⏳ Gemini cooldown active. Skipping Gemini call.");
      return analyzeWithHeuristics(title, content, fullArticleText);
    }

    if (!GEMINI_API_KEY) {
      console.log("⚠️ GEMINI_API_KEY missing. Using heuristic analysis.");
      return analyzeWithHeuristics(title, content, fullArticleText);
    }

    // We prefer full article text if available, but keep it bounded
    const textToAnalyze = (fullArticleText && typeof fullArticleText === "string" && fullArticleText.length > 200)
      ? fullArticleText.substring(0, 1200)
      : fullContent.substring(0, 800);

    // Ultra-compact prompt to avoid truncation + reduce tokens
    const prompt = `Rate this news article on 5 metrics (0-100 each). Return ONLY 5 numbers separated by commas.

Title: ${title}
Text: ${textToAnalyze}

Metrics (0=best,100=worst):
1 sensationalism
2 emotional manipulation
3 clickbait
4 bias
5 lack of evidence

Format: 30,20,45,25,40`;

    console.log(`📤 Sending request to Gemini...`);

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 80,
          candidateCount: 1
        }
      })
    });

    const data = await response.json();

    // Handle quota exceeded / rate limit
    if (!response.ok) {
      const msg = data?.error?.message || `Gemini API error (status ${response.status})`;
      // If Gemini returns quota exhausted / 429, enter cooldown
      if (response.status === 429 || msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded")) {
        GEMINI_COOLDOWN_UNTIL = Date.now() + 60_000; // 60 seconds
        console.log("🧊 Gemini quota hit. Cooling down for 60s.");
      }
      throw new Error(msg);
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) throw new Error("No response text from Gemini");

    console.log(`📥 AI response: ${text}`);

    // Parse 5 numbers
    const numbers = text.match(/\d+/g);
    if (!numbers || numbers.length < 5) {
      throw new Error("Incomplete response");
    }

    const analysis = {
      sensationalism: clampInt(numbers[0], 0, 100, 50),
      emotionalManipulation: clampInt(numbers[1], 0, 100, 50),
      clickbaitProbability: clampInt(numbers[2], 0, 100, 50),
      biasIndicators: clampInt(numbers[3], 0, 100, 50),
      evidenceQuality: clampInt(numbers[4], 0, 100, 50)
    };

    console.log(
      `✅ AI scores: S:${analysis.sensationalism} E:${analysis.emotionalManipulation} C:${analysis.clickbaitProbability} B:${analysis.biasIndicators} Ev:${analysis.evidenceQuality}`
    );

    return analysis;
  } catch (error) {
    const msg = error?.message || "";

    // If the thrown error contains quota exhaustion, cooldown
    if (msg.includes("RESOURCE_EXHAUSTED") || msg.includes("Quota exceeded") || msg.includes("429")) {
      GEMINI_COOLDOWN_UNTIL = Date.now() + 60_000;
      console.log("🧊 Gemini quota hit (catch). Cooling down for 60s.");
    }

    console.error(`❌ AI Error: ${msg}`);
    console.log(`⚠️ Using heuristic analysis...`);
    return analyzeWithHeuristics(title, content, fullArticleText);
  }
}

/**
 * Fallback: Analyze using heuristics when AI fails or is rate-limited
 */
function analyzeWithHeuristics(title, content, fullArticleText = null) {
  const titleLower = (title || "").toLowerCase();
  const text = ((fullArticleText && typeof fullArticleText === "string" ? fullArticleText : content) || title || "").toLowerCase();

  let sensationalism = 30;
  let emotional = 30;
  let clickbait = 30;
  let bias = 40;
  let evidence = 50;

  const sensationalWords = ["shocking", "unbelievable", "outrageous", "devastating", "horrific", "stunning", "massive", "explosive", "breaking", "bombshell"];
  sensationalWords.forEach(w => { if (titleLower.includes(w)) sensationalism += 15; });

  const emotionalWords = ["terrifying", "furious", "outraged", "heartbreaking", "tragic", "horrible", "nightmare", "crisis", "disaster"];
  emotionalWords.forEach(w => { if (titleLower.includes(w)) emotional += 15; });

  if (titleLower.includes("what happens next")) clickbait += 30;
  if (titleLower.includes("you won't believe")) clickbait += 40;
  if (titleLower.includes("this is why")) clickbait += 20;
  if (titleLower.includes("will shock you")) clickbait += 35;

  const exclamations = ((title || "").match(/!/g) || []).length;
  sensationalism += exclamations * 15;
  emotional += exclamations * 15;

  if ((title || "").match(/\d+\s+(reasons|ways|things|facts|secrets|tips)/i)) clickbait += 25;

  // Evidence detection
  const citationPhrases = [
    "according to", "reported", "study", "research", "officials", "data from",
    "published in", "journal", "university", "institute", "statement", "confirmed"
  ];
  let citationCount = 0;
  citationPhrases.forEach(p => {
    const m = text.match(new RegExp(p, "g"));
    if (m) citationCount += m.length;
  });

  if (citationCount >= 5) evidence -= 30;
  else if (citationCount >= 3) evidence -= 20;
  else if (citationCount >= 1) evidence -= 10;
  else evidence += 20;

  if (text.includes("anonymous") || text.includes("unnamed source")) {
    evidence += 15;
    bias += 10;
  }

  if (text.includes("however") || text.includes("on the other hand") || text.includes("meanwhile")) {
    bias -= 15;
  }

  const analysis = {
    sensationalism: clampInt(sensationalism, 0, 100, 30),
    emotionalManipulation: clampInt(emotional, 0, 100, 30),
    clickbaitProbability: clampInt(clickbait, 0, 100, 30),
    biasIndicators: clampInt(bias, 0, 100, 40),
    evidenceQuality: clampInt(evidence, 0, 100, 50)
  };

  console.log(`📊 Heuristic: S:${analysis.sensationalism} E:${analysis.emotionalManipulation} C:${analysis.clickbaitProbability} B:${analysis.biasIndicators} Ev:${analysis.evidenceQuality} (${citationCount} citations)`);

  return analysis;
}

/**
 * Boosted AI score so AI contributes more positively:
 * rawCredibility = 100 - avgBadness
 * boosted = map [0..100] -> [50..100] (never below 50)
 */
function calculateAIScore(signals) {
  const avgSignal = (
    signals.sensationalism * 0.20 +
    signals.emotionalManipulation * 0.20 +
    signals.clickbaitProbability * 0.20 +
    signals.biasIndicators * 0.20 +
    signals.evidenceQuality * 0.20
  );

  const rawCredibility = 100 - avgSignal;
  const boostedCredibility = (rawCredibility + 100) / 2;
  const finalAiScore = Math.round(boostedCredibility);

  console.log(`🧮 AI Score Calculation:`);
  console.log(`   Avg signal: ${avgSignal.toFixed(1)}`);
  console.log(`   Raw AI credibility: ${rawCredibility.toFixed(1)}`);
  console.log(`   Boosted AI score: ${finalAiScore}/100`);

  return finalAiScore;
}

function clampInt(v, min, max, fallback) {
  const n = parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

module.exports = {
  analyzeArticleContent,
  calculateAIScore
};