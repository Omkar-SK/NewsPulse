#  NewsPulse: AI-Powered News Credibility Platform

NewsPulse is a modern, full-stack web application designed to combat misinformation and improve media literacy. It leverages cutting-edge AI to analyze news articles for credibility, bias, and sentiment, while providing a community-driven space for transparent news verification.

![NewsPulse Preview](https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200)

## 🌟 Key Features

### 🔍 AI Analysis Engine
- **URL Submission**: Seamlessly analyze news articles by simply pasting a link. Powered by **Jina AI Reader API**.
- **Manual Submission**: Fallback for paywalled or restricted sites—paste content directly for analysis.
- **Deep Insights**: Get credibility scores, risk levels, and AI-generated explanation tags based on sentiment, bias, and source trust.
- **Gemini Integration**: Uses Google's **Gemini Pro** for high-accuracy content verification.

### 🌐 Community platform
- **Public Feed**: Share your analyzed articles to the global community.
- **Interactive Reviews**: Like, dislike, and comment on shared articles to promote healthy discussion.
- **Transparency**: Every shared post includes the original AI credibility score for context.
- **Post Management**: Full control over your contributions with the ability to delete your own posts.

### 🍱 Modern UX/UI
- **Premium Aesthetics**: Glassmorphic design with smooth micro-animations.
- **Dark Mode Support**: Seamlessly switch between light and dark themes.
- **Responsive Design**: Optimized for desktops, tablets, and mobile devices.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla JS, HTML5, CSS3 (Custom Design System)
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI/APIs**: 
  - Google Gemini AI (Content Analysis)
  - Jina AI Reader (Article Scraping)
  - NewsAPI.ai (Cross-source verification)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)
- API Keys for Google Gemini and Jina AI

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/newspulse.git
   cd newspulse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**
   Create a `.env` file in the root directory and add:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_key
   JINA_API_KEY=your_jina_key (optional for basic usage)
   ```

4. **Run the application**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

---

## 📂 Project Structure

```text
├── config/             # Database & environment config
├── controllers/        # Business logic for routes
├── middleware/         # Auth & error handling
├── models/             # Mongoose schemas
├── public/             # Frontend assets (HTML, CSS, JS)
├── routes/             # API endpoints
├── utils/              # AI Engines, Scrapers & Helpers
└── server.js           # Main entry point
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙌 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

*Built with ❤️ for a more informed world.*
