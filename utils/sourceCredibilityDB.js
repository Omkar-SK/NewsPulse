const sourceData = require('../data/sourceCredibility.json');

/**
 * Extract domain from URL or source name
 */
function extractDomain(sourceNameOrUrl) {
    if (!sourceNameOrUrl) return null;
    
    // Try URL parsing first
    try {
        const urlObj = new URL(sourceNameOrUrl);
        return urlObj.hostname.replace('www.', '');
    } catch (error) {
        // Not a URL, treat as source name
        const lowerSource = sourceNameOrUrl.toLowerCase();
        
        // Direct domain extraction from source name
        if (lowerSource.includes('.com') || lowerSource.includes('.co.') || lowerSource.includes('.org')) {
            const domainMatch = sourceNameOrUrl.match(/([a-z0-9-]+\.[a-z.]+)/i);
            if (domainMatch) {
                return domainMatch[1].replace('www.', '');
            }
        }
        
        return null;
    }
}

/**
 * Get source credibility metadata
 */
function getSourceCredibility(sourceNameOrUrl) {
    if (!sourceNameOrUrl) {
        return { ...sourceData['default'], domain: 'unknown' };
    }

    // Try extracting domain
    const domain = extractDomain(sourceNameOrUrl);
    
    if (domain && sourceData[domain]) {
        return { ...sourceData[domain], domain };
    }

    // Try matching by source name (case-insensitive partial match)
    const sourceLower = sourceNameOrUrl.toLowerCase().trim();
    
    // Check for exact matches first
    for (const [key, value] of Object.entries(sourceData)) {
        if (key === 'default') continue;
        
        if (key.toLowerCase() === sourceLower) {
            return { ...value, domain: key };
        }
    }
    
    // Check for partial matches
    for (const [key, value] of Object.entries(sourceData)) {
        if (key === 'default') continue;
        
        const keyLower = key.toLowerCase();
        const nameLower = value.name.toLowerCase();
        
        // Match if source contains key or vice versa
        if (
            sourceLower.includes(keyLower) ||
            keyLower.includes(sourceLower) ||
            sourceLower.includes(nameLower) ||
            nameLower.includes(sourceLower)
        ) {
            return { ...value, domain: key };
        }
    }

    // Return default if no match with actual source name
    console.log(`⚠️ Unknown source: "${sourceNameOrUrl}" - using default credibility`);
    return { 
        ...sourceData['default'], 
        domain: 'unknown',
        name: sourceNameOrUrl // Keep original name
    };
}

/**
 * Calculate source credibility score (0-100)
 */
function calculateSourceScore(sourceMetadata) {
    const trust = sourceMetadata.trust || 50;
    const transparency = sourceMetadata.transparency || 50;
    
    // Weighted average
    const score = (trust * 0.6) + (transparency * 0.4);
    
    return Math.round(score);
}

module.exports = {
    getSourceCredibility,
    calculateSourceScore,
    extractDomain
};