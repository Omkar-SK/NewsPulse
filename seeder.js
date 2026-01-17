const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load env vars
dotenv.config();

// Load models
const User = require('./models/User');
const Source = require('./models/Source');
const MediaLiteracy = require('./models/MediaLiteracy');

// Connect to DB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Sample data
// NOTE: These passwords are for development/testing only
// In production, use strong passwords via environment variables
const users = [
  {
    name: 'Admin User',
    email: 'admin@newspulse.com',
    password: process.env.ADMIN_PASSWORD || 'admin123456', // Change in production!
    role: 'admin',
    reputationScore: 100
  },
  {
    name: 'Moderator User',
    email: 'moderator@newspulse.com',
    password: process.env.MODERATOR_PASSWORD || 'moderator123456', // Change in production!
    role: 'moderator',
    reputationScore: 85
  }
];

const sources = [
  {
    name: 'BBC News',
    url: 'https://www.bbc.com/news',
    description: 'British Broadcasting Corporation - UK public service broadcaster',
    reputationScore: 85,
    biasRating: 'center',
    reliabilityRating: 'very-high',
    ownership: 'BBC (Public Corporation)',
    country: 'United Kingdom',
    founded: new Date('1922-01-01')
  },
  {
    name: 'Reuters',
    url: 'https://www.reuters.com',
    description: 'International news organization owned by Thomson Reuters',
    reputationScore: 90,
    biasRating: 'center',
    reliabilityRating: 'very-high',
    ownership: 'Thomson Reuters',
    country: 'United Kingdom',
    founded: new Date('1851-01-01')
  },
  {
    name: 'Associated Press',
    url: 'https://apnews.com',
    description: 'American not-for-profit news agency',
    reputationScore: 92,
    biasRating: 'center',
    reliabilityRating: 'very-high',
    ownership: 'Nonprofit cooperative',
    country: 'United States',
    founded: new Date('1846-01-01')
  },
  {
    name: 'The New York Times',
    url: 'https://www.nytimes.com',
    description: 'American newspaper based in New York City',
    reputationScore: 80,
    biasRating: 'left-center',
    reliabilityRating: 'high',
    ownership: 'The New York Times Company',
    country: 'United States',
    founded: new Date('1851-09-18')
  },
  {
    name: 'The Wall Street Journal',
    url: 'https://www.wsj.com',
    description: 'American business-focused international daily newspaper',
    reputationScore: 82,
    biasRating: 'right-center',
    reliabilityRating: 'high',
    ownership: 'News Corp',
    country: 'United States',
    founded: new Date('1889-07-08')
  },
  {
    name: 'The Guardian',
    url: 'https://www.theguardian.com',
    description: 'British daily newspaper',
    reputationScore: 78,
    biasRating: 'left-center',
    reliabilityRating: 'high',
    ownership: 'Guardian Media Group',
    country: 'United Kingdom',
    founded: new Date('1821-05-05')
  },
  {
    name: 'CNN',
    url: 'https://www.cnn.com',
    description: 'American news-based pay television channel',
    reputationScore: 70,
    biasRating: 'left-center',
    reliabilityRating: 'medium',
    ownership: 'Warner Bros. Discovery',
    country: 'United States',
    founded: new Date('1980-06-01')
  },
  {
    name: 'Fox News',
    url: 'https://www.foxnews.com',
    description: 'American multinational conservative news and political commentary television channel',
    reputationScore: 65,
    biasRating: 'right',
    reliabilityRating: 'medium',
    ownership: 'Fox Corporation',
    country: 'United States',
    founded: new Date('1996-10-07')
  },
  {
    name: 'Al Jazeera',
    url: 'https://www.aljazeera.com',
    description: 'Qatari state-owned Arabic-language international news television network',
    reputationScore: 75,
    biasRating: 'center',
    reliabilityRating: 'high',
    ownership: 'Al Jazeera Media Network (Qatar government)',
    country: 'Qatar',
    founded: new Date('1996-11-01')
  },
  {
    name: 'NPR',
    url: 'https://www.npr.org',
    description: 'American public radio organization',
    reputationScore: 83,
    biasRating: 'left-center',
    reliabilityRating: 'high',
    ownership: 'Nonprofit membership organization',
    country: 'United States',
    founded: new Date('1970-02-26')
  }
];

const mediaLiteracyContent = [
  {
    title: 'Understanding News Credibility',
    slug: 'understanding-news-credibility',
    category: 'credibility-basics',
    summary: 'Learn the fundamentals of evaluating news credibility and why it matters in today\'s media landscape.',
    content: `
# Understanding News Credibility

News credibility refers to the trustworthiness and reliability of news sources and the information they provide. In today's digital age, where misinformation can spread rapidly, understanding how to evaluate news credibility is more important than ever.

## What Makes News Credible?

Credible news typically has the following characteristics:

1. **Accuracy**: Information is factually correct and verified
2. **Transparency**: Sources are clearly cited and methods are disclosed
3. **Objectivity**: Facts are presented without bias or agenda
4. **Accountability**: Errors are corrected and admitted
5. **Professional Standards**: Journalists follow ethical guidelines

## Why Credibility Matters

- **Informed Decision-Making**: Credible news helps you make better decisions about voting, health, finances, and more
- **Democratic Participation**: A well-informed citizenry is essential for democracy
- **Personal Safety**: Accurate news can help you stay safe during emergencies
- **Trust in Institutions**: Credible journalism builds trust in media and other institutions

## Our Credibility Assessment Approach

NewsPulse uses a multi-factor approach to assess news credibility:

- **Source Reputation** (30%): Historical reliability and professional standards
- **Community Feedback** (40%): Reviews and ratings from verified users
- **Fact-Check Results** (20%): Verification from independent fact-checkers
- **Verification Status** (10%): Our editorial team's assessment

By combining these factors, we provide you with a comprehensive credibility score to help guide your news consumption.
    `,
    icon: 'fa-shield-alt',
    order: 1,
    tips: [
      {
        title: 'Check Multiple Sources',
        description: 'Don\'t rely on a single source. Cross-reference information across multiple credible outlets.'
      },
      {
        title: 'Look for Attribution',
        description: 'Credible articles cite their sources and provide links to original documents or studies.'
      },
      {
        title: 'Consider the Date',
        description: 'Make sure the information is current and hasn\'t been superseded by newer developments.'
      }
    ],
    examples: []
  },
  {
    title: 'How to Fact-Check News',
    slug: 'how-to-fact-check-news',
    category: 'fact-checking',
    summary: 'Learn practical techniques for verifying news stories and identifying misinformation.',
    content: `
# How to Fact-Check News

Fact-checking is a critical skill in the digital age. Here's how you can verify information before sharing it.

## Step-by-Step Fact-Checking Process

### 1. Check the Source
- Is it a known, reputable news organization?
- Does the source have a history of accurate reporting?
- Check our source reliability ratings

### 2. Look for Evidence
- Are claims supported by credible sources?
- Are expert opinions attributed to real, qualified people?
- Are statistics from reliable organizations?

### 3. Verify Images and Videos
- Use reverse image search (Google Images, TinEye)
- Check if media has been manipulated or taken out of context
- Look for the original source of visual content

### 4. Consult Fact-Checking Organizations
- FactCheck.org
- Snopes.com
- PolitiFact
- International Fact-Checking Network members

### 5. Check the Date
- Is the story recent or old news being recirculated?
- Has the situation changed since publication?

## Red Flags to Watch For

- **Clickbait Headlines**: Sensational titles that don't match the content
- **Anonymous Sources**: Claims without attribution
- **Emotional Language**: Excessive use of emotional appeals
- **Spelling/Grammar Issues**: Poor quality writing may indicate unreliable source
- **Missing Author**: No byline or author information
- **Suspicious URLs**: Mimic legitimate news sites with slight variations

## Tools for Fact-Checking

- Google Reverse Image Search
- Snopes
- FactCheck.org
- Media Bias/Fact Check
- AllSides
- NewsGuard
    `,
    icon: 'fa-search',
    order: 2,
    tips: [
      {
        title: 'Verify Before Sharing',
        description: 'Take a moment to fact-check before sharing news on social media.'
      },
      {
        title: 'Use Multiple Tools',
        description: 'Combine different fact-checking resources for comprehensive verification.'
      }
    ],
    examples: []
  },
  {
    title: 'Identifying Media Bias',
    slug: 'identifying-media-bias',
    category: 'bias-detection',
    summary: 'Understand different types of media bias and how to recognize them in news coverage.',
    content: `
# Identifying Media Bias

All media has some degree of bias, whether intentional or not. Learning to recognize it helps you consume news more critically.

## Types of Media Bias

### 1. Selection Bias
- Choosing which stories to cover or ignore
- Deciding which facts to include or omit

### 2. Story Placement Bias
- Prominence given to certain stories
- Front page vs. buried in back sections

### 3. Source Bias
- Over-reliance on certain types of sources
- Ignoring alternative perspectives

### 4. Labeling Bias
- Using loaded language or labels
- Framing people or groups with specific terminology

### 5. Spin
- Tone and presentation of facts
- Emphasis on certain aspects over others

## Political Bias Spectrum

Sources can lean:
- **Left**: Progressive, liberal perspectives
- **Left-Center**: Slightly left-leaning
- **Center**: Balanced, minimal bias
- **Right-Center**: Slightly right-leaning
- **Right**: Conservative perspectives

## How to Spot Bias

1. **Analyze Language**: Look for emotional or loaded words
2. **Check Sources**: Note which experts or studies are cited
3. **Compare Coverage**: Read the same story from different outlets
4. **Identify Omissions**: What information might be missing?
5. **Consider Context**: Is full context provided?

## Consuming Biased News Responsibly

- **Diversify Your Sources**: Read across the political spectrum
- **Separate News from Opinion**: Know when you're reading analysis vs. reporting
- **Focus on Facts**: Identify the objective facts separate from spin
- **Check Original Sources**: Go to primary documents when possible

Remember: Recognizing bias doesn't mean dismissing the source. It means reading more critically and seeking balance.
    `,
    icon: 'fa-balance-scale',
    order: 3,
    tips: [
      {
        title: 'Read Across the Spectrum',
        description: 'Regularly consume news from sources with different political leanings.'
      },
      {
        title: 'Question Your Own Bias',
        description: 'Be aware of confirmation bias - the tendency to favor information that confirms your beliefs.'
      }
    ],
    examples: []
  },
  {
    title: 'How Our Credibility Scoring Works',
    slug: 'how-credibility-scoring-works',
    category: 'methodology',
    summary: 'Detailed explanation of our transparent credibility assessment methodology.',
    content: `
# How Our Credibility Scoring Works

NewsPulse uses a transparent, multi-factor approach to assess the credibility of news articles and sources.

## Our Scoring System

Every article receives a credibility score from 0-100 based on four key factors:

### 1. Source Reputation (30% weight)
We maintain a comprehensive database of news sources with reputation scores based on:
- Historical accuracy
- Professional standards
- Editorial policies
- Ownership transparency
- Industry recognition

### 2. Community Feedback (40% weight)
Our users contribute credibility assessments through:
- Overall credibility ratings (0-100)
- Detailed reviews with specific criteria:
  - Accuracy rating
  - Sourcing quality
  - Bias assessment
- User reputation affects weight of their reviews

### 3. Fact-Check Results (20% weight)
Integration with independent fact-checking organizations:
- Claims verified or debunked
- Ratings from trusted fact-checkers
- Number and consistency of fact-checks

### 4. Verification Status (10% weight)
Our editorial team assigns verification status:
- **Verified** (100 points): Claims confirmed by multiple sources
- **Unverified** (50 points): Default status, awaiting verification
- **Disputed** (25 points): Conflicting information exists
- **False** (0 points): Confirmed misinformation

## Calculation Example

For an article with:
- Source reputation: 85/100
- Community feedback average: 78/100
- Fact-check score: 90/100 (positive checks)
- Verification status: Verified (100/100)

**Final Score = (85 × 0.30) + (78 × 0.40) + (90 × 0.20) + (100 × 0.10) = 83.7**

## Score Interpretation

- **80-100**: High credibility - Strong evidence supports claims
- **60-79**: Good credibility - Generally reliable with minor concerns
- **40-59**: Mixed credibility - Some concerns, verify independently
- **20-39**: Low credibility - Significant concerns, high skepticism warranted
- **0-19**: Very low credibility - Likely misinformation

## Transparency Principles

1. **Open Methodology**: Our scoring system is fully documented
2. **Factor Breakdown**: Users can see how each factor contributes
3. **Community Participation**: Everyone can contribute reviews
4. **Regular Updates**: Scores update as new information emerges
5. **Appeal Process**: Sources can dispute ratings with evidence

## Limitations

Our system aims to be helpful but is not perfect:
- New sources may not have enough data
- Rapidly evolving stories may need time for assessment
- No system can catch all misinformation
- Community input can be influenced by biases

**Best Practice**: Use our scores as one tool among many in your news evaluation process.
    `,
    icon: 'fa-calculator',
    order: 4,
    tips: [
      {
        title: 'Consider All Factors',
        description: 'Look at the breakdown of how each factor contributes to the final score.'
      },
      {
        title: 'Check Review Details',
        description: 'Read user reviews to understand specific concerns or strengths.'
      }
    ],
    examples: []
  },
  {
    title: 'Common Misinformation Tactics',
    slug: 'common-misinformation-tactics',
    category: 'misinformation-tactics',
    summary: 'Recognize common techniques used to spread false or misleading information.',
    content: `
# Common Misinformation Tactics

Understanding how misinformation spreads helps you recognize and avoid it.

## Common Tactics

### 1. False Context
- **What it is**: Genuine content shared with false contextual information
- **Example**: Old photos presented as current events
- **How to spot**: Check dates, use reverse image search

### 2. Manipulated Content
- **What it is**: Genuine information manipulated to deceive
- **Example**: Edited images, clipped videos, doctored documents
- **How to spot**: Look for inconsistencies, check original sources

### 3. Imposter Content
- **What it is**: Impersonating genuine sources
- **Example**: Fake websites mimicking real news outlets
- **How to spot**: Check URLs carefully, verify through official channels

### 4. Misleading Headlines
- **What it is**: Headlines that don't match content
- **Example**: Clickbait that oversimplifies or misrepresents
- **How to spot**: Always read the full article

### 5. Cherry-Picking Data
- **What it is**: Selecting specific data while ignoring context
- **Example**: Showing partial statistics that support a narrative
- **How to spot**: Look for full datasets and context

### 6. False Connection
- **What it is**: Headlines, visuals, or captions don't match content
- **Example**: Using unrelated photos for emotional impact
- **How to spot**: Verify that all elements of the story connect logically

### 7. Satire Misrepresented
- **What it is**: Satirical content presented as real news
- **Example**: The Onion articles shared as fact
- **How to spot**: Check if the source is known for satire

### 8. Fabricated Content
- **What it is**: 100% false content designed to deceive
- **Example**: Completely made-up stories, fake quotes
- **How to spot**: Can't find it reported anywhere credible

## Psychological Tricks

### Appeal to Emotion
- Uses strong emotions (fear, anger, joy) to bypass critical thinking
- **Defense**: Pause when feeling strong emotion, fact-check before reacting

### Confirmation Bias
- We tend to believe information that confirms our existing beliefs
- **Defense**: Actively seek out opposing viewpoints

### Repetition
- Repeated misinformation can start to feel true
- **Defense**: Track claims back to original sources

### Authority
- False attribution to experts or official sources
- **Defense**: Verify credentials and actual statements

## Protecting Yourself

1. **Slow Down**: Don't share immediately, take time to verify
2. **Check Sources**: Go to the original source of claims
3. **Be Skeptical**: Especially of sensational claims
4. **Diversify**: Get news from multiple sources
5. **Educate Others**: Share fact-checking when you see misinformation

## Red Flags Checklist

- ⚠️ Extreme emotional language
- ⚠️ Claims that seem too good/bad to be true
- ⚠️ No author or source attribution
- ⚠️ Spelling and grammar errors
- ⚠️ Suspicious URLs
- ⚠️ Lack of dates
- ⚠️ No other coverage of major claims
- ⚠️ Request for immediate action/sharing

Remember: Misinformation thrives on quick, emotional reactions. Taking time to verify can stop its spread.
    `,
    icon: 'fa-exclamation-triangle',
    order: 5,
    tips: [
      {
        title: 'Pause Before Sharing',
        description: 'Take 30 seconds to verify before sharing anything on social media.'
      },
      {
        title: 'Report Misinformation',
        description: 'Use platform reporting tools when you encounter false information.'
      }
    ],
    examples: []
  }
];

// Import data
const importData = async () => {
  try {
    console.log('Starting data import...');

    // Hash passwords for users
    for (let user of users) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }

    // Clear existing data (optional - comment out if you want to preserve data)
    // await User.deleteMany({ role: { $in: ['admin', 'moderator'] } });
    // await Source.deleteMany();
    // await MediaLiteracy.deleteMany();

    // Insert users
    const createdUsers = await User.insertMany(users);
    console.log(`✅ Created ${createdUsers.length} users`);

    // Insert sources
    const createdSources = await Source.insertMany(sources);
    console.log(`✅ Created ${createdSources.length} sources`);

    // Add createdBy to media literacy content (use first admin user)
    const adminUser = createdUsers.find(u => u.role === 'admin');
    const contentWithCreator = mediaLiteracyContent.map(content => ({
      ...content,
      createdBy: adminUser._id
    }));

    // Insert media literacy content
    const createdContent = await MediaLiteracy.insertMany(contentWithCreator);
    console.log(`✅ Created ${createdContent.length} media literacy articles`);

    console.log('\n🎉 Data import completed successfully!');
    console.log('\n📝 Login Credentials:');
    console.log('Admin: admin@newspulse.com / admin123456');
    console.log('Moderator: moderator@newspulse.com / moderator123456');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    console.log('Deleting data...');
    
    await User.deleteMany({ role: { $in: ['admin', 'moderator'] } });
    await Source.deleteMany();
    await MediaLiteracy.deleteMany();
    
    console.log('✅ Data deleted successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error deleting data:', error);
    process.exit(1);
  }
};

// Run based on command line argument
if (process.argv[2] === '-i') {
  importData();
} else if (process.argv[2] === '-d') {
  deleteData();
} else {
  console.log('Usage:');
  console.log('  Import data: node seeder.js -i');
  console.log('  Delete data: node seeder.js -d');
  process.exit(0);
}
