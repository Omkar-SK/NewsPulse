const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  // For development, use a test account or your SMTP settings
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Generate HTML email template
const generateNewsletterHTML = (userName, articles, date) => {
  const articlesHTML = articles.map(article => {
    const sentimentEmoji = article.sentiment > 0.1 ? '😊' : article.sentiment < -0.1 ? '😟' : '😐';
    const sentimentLabel = article.sentiment > 0.1 ? 'Positive' : article.sentiment < -0.1 ? 'Negative' : 'Neutral';
    
    return `
      <div style="background: #ffffff; border-radius: 12px; overflow: hidden; margin-bottom: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <img src="${article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'}" 
             alt="${article.title}" 
             style="width: 100%; height: 200px; object-fit: cover;">
        <div style="padding: 20px;">
          <div style="display: inline-block; background: #4f46e5; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; margin-bottom: 10px;">
            ${article.category || 'General'}
          </div>
          <h2 style="font-size: 20px; margin: 10px 0; color: #1e293b;">
            ${article.title}
          </h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 10px 0;">
            ${article.summary}
          </p>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; padding-top: 15px; border-top: 1px solid #e2e8f0;">
            <span style="font-size: 12px; color: #64748b;">
              ${sentimentEmoji} ${sentimentLabel} • ${article.source}
            </span>
            <a href="${article.url}" 
               style="background: #4f46e5; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-size: 14px; font-weight: 600;">
              Read More
            </a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NewsPulse Daily Digest</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="text-align: center; padding: 30px 0;">
      <h1 style="font-size: 32px; font-weight: 700; color: #4f46e5; margin: 0;">
        📊 NewsPulse
      </h1>
      <p style="color: #64748b; font-size: 14px; margin: 10px 0 0 0;">
        Your Daily News Digest
      </p>
    </div>

    <!-- Greeting -->
    <div style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; color: white; text-align: center;">
      <h2 style="margin: 0 0 10px 0; font-size: 24px;">
        Good Morning, ${userName}! ☀️
      </h2>
      <p style="margin: 0; opacity: 0.9; font-size: 16px;">
        Here are today's top headlines - ${new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </p>
    </div>

    <!-- Articles -->
    ${articlesHTML}

    <!-- Footer -->
    <div style="text-align: center; padding: 30px 20px; color: #64748b; font-size: 12px;">
      <p style="margin: 0 0 10px 0;">
        You're receiving this email because you subscribed to NewsPulse Newsletter.
      </p>
      <p style="margin: 0 0 10px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
           style="color: #4f46e5; text-decoration: none;">
          Manage Preferences
        </a> | 
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5000'}" 
           style="color: #4f46e5; text-decoration: none;">
          Unsubscribe
        </a>
      </p>
      <p style="margin: 10px 0 0 0;">
        © 2025 NewsPulse. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

// Send newsletter email
exports.sendNewsletterEmail = async (userEmail, userName, articles) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"NewsPulse Newsletter" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: `📰 NewsPulse Daily Digest - ${new Date().toLocaleDateString()}`,
      html: generateNewsletterHTML(userName, articles, new Date())
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    
    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('❌ Email error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Test email connection
exports.testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('✅ Email server is ready');
    return true;
  } catch (error) {
    console.error('❌ Email server error:', error);
    return false;
  }
};