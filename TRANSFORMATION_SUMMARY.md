# News Credibility and Media Literacy Platform - Transformation Summary

## Overview
This document outlines the changes made to transform NewsPulse from a news aggregation platform into a comprehensive News Credibility and Media Literacy Platform.

## What Has Been Implemented

### 1. New Database Models

#### Article Model (Enhanced)
**File**: `models/Article.js`

Added credibility-focused fields:
- `credibilityScore` (0-100): Overall credibility rating
- `verificationStatus`: unverified, verified, disputed, or false
- `factCheckResults`: Array of external fact-check results
- `submittedBy`: User who submitted the article
- `approvalStatus`: pending, approved, or rejected
- `reviewedBy`: Admin who reviewed the submission
- `sourceMetadata`: Link to Source model

#### Source Model (New)
**File**: `models/Source.js`

Comprehensive news source database with:
- Basic info: name, URL, description, logo
- Credibility metrics:
  - `reputationScore` (0-100)
  - `biasRating`: left, left-center, center, right-center, right, unknown
  - `reliabilityRating`: very-high, high, medium, low, very-low, unknown
- Metadata: ownership, funding, country, founded date
- Statistics: articles count, average credibility score
- Verification info and status (active, suspended, blacklisted)

#### Review Model (New)
**File**: `models/Review.js`

Detailed review system for articles and sources:
- Review target (article or source)
- Overall rating (1-5 stars)
- Credibility rating (0-100)
- Title and detailed comment
- Specific ratings: accuracy, sourcing, bias (1-5 each)
- Helpful votes system
- Moderation status

#### User Model (Enhanced)
**File**: `models/User.js`

Added:
- `role`: user, admin, or moderator
- `reputationScore` (0-100): User's trust score
- `contributionStats`:
  - articlesSubmitted count
  - reviewsPosted count
  - helpfulReviews count

#### MediaLiteracy Model (New)
**File**: `models/MediaLiteracy.js`

Educational content system:
- Categories: credibility-basics, fact-checking, bias-detection, source-evaluation, misinformation-tactics, methodology
- Full content with summary
- Tips and examples arrays
- Related topics linking
- View counter

### 2. New Controllers

#### Credibility Controller
**File**: `controllers/credibilityController.js`

Handles credibility scoring and article submissions:
- `GET /api/credibility/article/:articleId` - Get article credibility data
- `POST /api/credibility/submit` - Submit article for review (authenticated)
- `GET /api/credibility/source/:sourceId` - Get source credibility data

**Credibility Calculation Algorithm**:
```
Score = (Source Reputation × 30%) + 
        (Community Feedback × 40%) + 
        (Fact-Check Results × 20%) + 
        (Verification Status × 10%)
```

#### Review Controller
**File**: `controllers/reviewController.js`

Manages user reviews and ratings:
- `POST /api/reviews` - Submit review (authenticated)
- `GET /api/reviews/article/:articleId` - Get article reviews
- `GET /api/reviews/source/:sourceId` - Get source reviews
- `PUT /api/reviews/:id/vote` - Vote review helpful/not helpful (authenticated)

Features:
- One review per user per article/source
- Automatic credibility score updates
- User reputation tracking

#### Admin Controller
**File**: `controllers/adminController.js`

Admin and moderator tools:
- `GET /api/admin/articles/pending` - Get pending submissions
- `PUT /api/admin/articles/:id/review` - Approve/reject articles
- `GET /api/admin/sources` - List all sources
- `POST /api/admin/sources` - Create/update source
- `DELETE /api/admin/sources/:id` - Delete source
- `GET /api/admin/reviews/flagged` - Get flagged reviews
- `PUT /api/admin/reviews/:id/moderate` - Approve/reject reviews
- `GET /api/admin/stats` - Dashboard statistics

#### Media Literacy Controller
**File**: `controllers/mediaLiteracyController.js`

Educational content management:
- `GET /api/media-literacy` - List all content (with category filter)
- `GET /api/media-literacy/:slug` - Get single article
- `POST /api/media-literacy` - Create content (admin only)

### 3. Enhanced Middleware

#### Auth Middleware (Enhanced)
**File**: `middleware/auth.js`

Added:
- `authorize(...roles)` - Role-based access control
- Supports admin, moderator, and user roles

### 4. New Routes

All routes integrated into `server.js`:
- `/api/credibility` - Credibility scoring and submissions
- `/api/reviews` - Review management
- `/api/admin` - Admin dashboard operations
- `/api/media-literacy` - Educational content

## Key Features

### 1. Community-Driven Credibility Assessment
- Users can rate and review both articles and sources
- Reviews include specific ratings for accuracy, sourcing, and bias
- Helpful voting system for reviews
- User reputation scores based on contribution quality

### 2. Multi-Factor Credibility Scoring
- Source reputation (30%)
- Community feedback from reviews (40%)
- External fact-check results (20%)
- Verification status (10%)

### 3. User Article Submission
- Authenticated users can submit articles for review
- Articles go through admin approval queue
- Submission tracking in user profile

### 4. Comprehensive Source Database
- Detailed metadata for news sources
- Bias and reliability ratings
- Ownership and funding transparency
- Status management (active/suspended/blacklisted)

### 5. Admin Dashboard
- Review pending article submissions
- Manage source database
- Moderate flagged reviews
- View platform statistics
- Role-based access control

### 6. Media Literacy Education
- Categorized educational content
- Tips and examples for each topic
- Related topics linking
- View tracking

### 7. Transparent Methodology
- Clear scoring algorithm
- Factor-based credibility breakdown
- Review history and voting
- Audit trails for admin actions

## API Endpoints Summary

### Public Endpoints
```
GET  /api/credibility/article/:articleId     - Get article credibility
GET  /api/credibility/source/:sourceId       - Get source credibility
GET  /api/reviews/article/:articleId         - Get article reviews
GET  /api/reviews/source/:sourceId           - Get source reviews
GET  /api/media-literacy                     - List educational content
GET  /api/media-literacy/:slug               - Get educational article
```

### Authenticated User Endpoints
```
POST /api/credibility/submit                 - Submit article for review
POST /api/reviews                            - Submit review
PUT  /api/reviews/:id/vote                   - Vote on review
```

### Admin/Moderator Endpoints
```
GET    /api/admin/articles/pending           - Get pending submissions
PUT    /api/admin/articles/:id/review        - Approve/reject article
GET    /api/admin/sources                    - List sources
POST   /api/admin/sources                    - Create/update source
DELETE /api/admin/sources/:id                - Delete source
GET    /api/admin/reviews/flagged            - Get flagged reviews
PUT    /api/admin/reviews/:id/moderate       - Moderate review
GET    /api/admin/stats                      - Dashboard stats
POST   /api/media-literacy                   - Create educational content
```

## Next Steps for Frontend Implementation

### Phase 2: UI Components Needed

1. **Credibility Badges**
   - Add visual score indicators on article cards
   - Color-coded badges (green=high, yellow=medium, red=low)
   - Verification status icons

2. **Article Submission Form**
   - Modal or page for submitting articles
   - Fields: title, URL, source, summary, category
   - Success/error feedback

3. **Review System UI**
   - Review submission modal/form
   - Star ratings for overall and specific factors
   - Display existing reviews with voting buttons
   - Review statistics (average ratings, counts)

4. **Admin Dashboard**
   - Pending articles queue
   - Source management interface
   - Review moderation panel
   - Statistics dashboard with charts

5. **Source Information Display**
   - Source profile pages
   - Bias and reliability indicators
   - Metadata display (ownership, funding)
   - Source reviews section

6. **Media Literacy Pages**
   - Category navigation
   - Article content display
   - Related topics sidebar
   - Tips and examples formatting

7. **User Profile Enhancements**
   - Reputation score display
   - Contribution history
   - Submitted articles status
   - Reviews posted

8. **Credibility Explanations**
   - Tooltips explaining scores
   - "How We Calculate" modal
   - Factor breakdown visualization
   - Methodology documentation link

## Database Seeding Recommendations

To make the platform immediately useful, consider seeding:

1. **Popular News Sources** (10-20 sources)
   - Major newspapers: NYT, WSJ, Washington Post, BBC, Reuters, AP
   - Include metadata: bias ratings, reputation scores
   - Add logos and descriptions

2. **Media Literacy Content** (5-10 articles)
   - "How to Evaluate News Credibility"
   - "Understanding Media Bias"
   - "Fact-Checking Techniques"
   - "Common Misinformation Tactics"
   - "How Our Scoring System Works"

3. **Test Admin Account**
   - Create one admin user for testing
   - Email: admin@newspulse.com
   - Password: (set securely)

## Backward Compatibility

All existing features remain functional:
- News aggregation from external API
- Bookmarks
- Reactions (like/dislike/neutral)
- Recommendations
- Newsletter
- AI summaries and chatbot
- User authentication

The new credibility features are additive and don't break existing functionality.

## Testing Recommendations

1. **Test Article Submission Flow**
   - Create test user account
   - Submit sample article
   - Login as admin to approve/reject
   - Verify status updates

2. **Test Review System**
   - Submit reviews for articles and sources
   - Vote reviews as helpful
   - Check reputation score updates
   - Verify one-review-per-user constraint

3. **Test Admin Dashboard**
   - Access all admin endpoints
   - Verify role-based access control
   - Test CRUD operations on sources
   - Check statistics accuracy

4. **Test Credibility Calculations**
   - Add reviews with different ratings
   - Verify score updates
   - Check factor breakdowns
   - Test with various source types

## Deployment Notes

- Ensure MongoDB indexes are created (automatic with Mongoose)
- Set environment variables for admin credentials
- Consider adding rate limiting for public endpoints
- Add input validation and sanitization (basic validation is in place)
- Set up logging for admin actions (audit trail)

## Configuration

No additional environment variables required. The system uses existing:
- `MONGODB_URI` - Database connection
- `JWT_SECRET` - Authentication
- `JWT_EXPIRE` - Token expiration

## Summary

The transformation adds a comprehensive credibility assessment layer to NewsPulse while maintaining all existing features. The backend is complete with:
- ✅ 4 new models (Source, Review, MediaLiteracy + enhancements to Article and User)
- ✅ 4 new controllers (Credibility, Review, Admin, MediaLiteracy)
- ✅ 4 new route files
- ✅ Enhanced authentication middleware
- ✅ Credibility scoring algorithm
- ✅ Admin tools and moderation system
- ✅ Educational content system

The frontend now needs UI components to expose these features to users through an intuitive interface.
