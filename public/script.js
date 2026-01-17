
        // API Configuration
        const API_BASE_URL = 'http://localhost:5000/api';

        // Global state
        let currentLanguage = 'en';
        let currentUser = null;
        let authToken = null;
        let allArticles = [];
        let userBookmarks = [];
        let articleReactions = {};
        let sentimentChart = null;
        let sourceChart = null;
        let categoryChart = null;
        let analysisSentimentChart = null;
        let analysisSourceChart = null;
        let isFromCache = false;

    

        // Helper function to truncate text
        function truncateText(text, maxLength) {
            if (!text) return '';
            if (text.length <= maxLength) return text;
            return text.substr(0, maxLength).trim() + '...';
        }


        const translations = {
    en: {
        // Navbar
        logo: '📊 NewsPulse',
        forYou: 'For You',
        trending: 'Trending',
        analysis: 'Analysis',
        login: 'Login',
        logout: 'Logout',
        searchPlaceholder: 'Search headlines...',
        lightMode: 'Light Mode',
        darkMode: 'Dark Mode',
        
        // Auth Modal
        welcomeBack: 'Welcome Back!',
        loginSubtitle: 'Login to access your personalized news feed',
        email: 'Email',
        password: 'Password',
        fullName: 'Full Name',
        loginButton: 'Login',
        signupButton: 'Sign Up',
        dontHaveAccount: "Don't have an account?",
        alreadyHaveAccount: 'Already have an account?',
        createAccount: 'Create Account',
        joinNewsPulse: 'Join NewsPulse to stay updated',
        
        // Daily Mix
        dailyMix: '✨ Your Daily Mix',
        dailyMixSubtitle: 'Personalized news recommendations',
        recommended: 'Recommended',
        unlockDailyMix: 'Unlock Your Daily Mix',
        loginForRecommendations: 'Login to get personalized news recommendations',
        loginNow: 'Login Now',
        startBuildingMix: 'Start Building Your Mix',
        likeArticlesForRecs: 'Like articles to get personalized recommendations',
        exploreNews: 'Explore News',
        
        // Categories
        filterByCategory: 'Filter by Category',
        all: 'All',
        business: 'Business',
        technology: 'Technology',
        sports: 'Sports',
        politics: 'Politics',
        entertainment: 'Entertainment',
        health: 'Health',
        science: 'Science',
        
        // News Section
        trendingNews: 'Trending News',
        latestNews: 'Latest News',
        readMore: 'Read More',
        similar: 'Similar',
        readFullStory: 'Read Full Story',
        cached: '📦 Cached',
        fresh: '🆕 Fresh',
        
        // Sidebar
        trendingTopics: 'TRENDING TOPICS',
        filters: 'FILTERS',
        country: 'Country:',
        language: 'Language:',
        bookmarkedArticles: 'BOOKMARKED ARTICLES',
        newsletter: '📬 NEWSLETTER',
        loginToViewBookmarks: 'Login to view bookmarks',
        noBookmarks: 'No bookmarked articles yet',
        
        // Newsletter
        getDailyHeadlines: 'Get daily top headlines delivered to your inbox every morning! 📬',
        subscribeNow: 'Subscribe Now',
        subscribed: '✅ Subscribed!',
        youllReceiveUpdates: "You'll receive %s updates",
        frequency: 'Frequency:',
        categories: 'Categories:',
        managePreferences: 'Manage Preferences',
        unsubscribe: 'Unsubscribe',
        daily: 'daily',
        weekly: 'weekly',
        
        // Pages
        mostPopularStories: 'Most Popular Stories',
        sentimentTrends: 'SENTIMENT TRENDS',
        newsAnalyticsDashboard: 'News Analytics Dashboard',
        totalArticles: 'Total Articles',
        positiveNews: 'Positive News',
        negativeNews: 'Negative News',
        neutralNews: 'Neutral News',
        sentimentDistribution: 'Sentiment Distribution',
        categoryDistribution: 'Category Distribution',
        newsSourceDistribution: 'News Source Distribution',
        topKeywords: 'Top Keywords',
        keyInsights: 'KEY INSIGHTS',
        
        // Similar Articles
        similarArticles: 'Similar Articles',
        noSimilarArticles: 'No similar articles found',
        
        // Sentiment & Time
        positive: 'Positive',
        negative: 'Negative',
        neutral: 'Neutral',
        recently: 'Recently',
        minutesAgo: 'minutes ago',
        hoursAgo: 'hours ago',
        daysAgo: 'days ago',
        
        // Messages
        noArticlesFound: 'No articles found',
        analyzingData: 'Analyzing data...',
        
        // Footer
        aboutNewsPulse: 'About NewsPulse',
        aboutDescription: 'Bringing you trending headlines with AI-powered sentiment analysis and insights.',
        contact: 'Contact',
        followUs: 'Follow Us',
        footerCopyright: '© 2025 NewsPulse. All rights reserved. Powered by NewsAPI.ai'
    },
    
    hi: {
        logo: '📊 न्यूज़पल्स',
        forYou: 'आपके लिए',
        trending: 'ट्रेंडिंग',
        analysis: 'विश्लेषण',
        login: 'लॉगिन',
        logout: 'लॉगआउट',
        searchPlaceholder: 'सुर्खियां खोजें...',
        lightMode: 'लाइट मोड',
        darkMode: 'डार्क मोड',
        welcomeBack: 'वापसी पर स्वागत है!',
        loginSubtitle: 'अपने व्यक्तिगत समाचार फ़ीड तक पहुँचने के लिए लॉगिन करें',
        email: 'ईमेल',
        password: 'पासवर्ड',
        fullName: 'पूरा नाम',
        loginButton: 'लॉगिन करें',
        signupButton: 'साइन अप करें',
        dontHaveAccount: 'खाता नहीं है?',
        alreadyHaveAccount: 'पहले से खाता है?',
        createAccount: 'खाता बनाएं',
        joinNewsPulse: 'अपडेट रहने के लिए न्यूज़पल्स से जुड़ें',
        dailyMix: '✨ आपका दैनिक मिश्रण',
        dailyMixSubtitle: 'व्यक्तिगत समाचार सिफारिशें',
        recommended: 'अनुशंसित',
        unlockDailyMix: 'अपना दैनिक मिश्रण अनलॉक करें',
        loginForRecommendations: 'व्यक्तिगत समाचार सिफारिशें प्राप्त करने के लिए लॉगिन करें',
        loginNow: 'अभी लॉगिन करें',
        startBuildingMix: 'अपना मिश्रण बनाना शुरू करें',
        likeArticlesForRecs: 'व्यक्तिगत सिफारिशें प्राप्त करने के लिए लेखों को लाइक करें',
        exploreNews: 'समाचार एक्सप्लोर करें',
        filterByCategory: 'श्रेणी के अनुसार फ़िल्टर करें',
        all: 'सभी',
        business: 'व्यवसाय',
        technology: 'प्रौद्योगिकी',
        sports: 'खेल',
        politics: 'राजनीति',
        entertainment: 'मनोरंजन',
        health: 'स्वास्थ्य',
        science: 'विज्ञान',
        trendingNews: 'ट्रेंडिंग समाचार',
        latestNews: 'नवीनतम समाचार',
        readMore: 'और पढ़ें',
        similar: 'समान',
        readFullStory: 'पूरी कहानी पढ़ें',
        cached: '📦 कैश्ड',
        fresh: '🆕 ताजा',
        trendingTopics: 'ट्रेंडिंग विषय',
        filters: 'फ़िल्टर',
        country: 'देश:',
        language: 'भाषा:',
        bookmarkedArticles: 'बुकमार्क किए गए लेख',
        newsletter: '📬 न्यूज़लेटर',
        loginToViewBookmarks: 'बुकमार्क देखने के लिए लॉगिन करें',
        noBookmarks: 'अभी तक कोई बुकमार्क नहीं',
        getDailyHeadlines: 'हर सुबह अपने इनबॉक्स में शीर्ष सुर्खियां प्राप्त करें! 📬',
        subscribeNow: 'अभी सब्सक्राइब करें',
        subscribed: '✅ सब्सक्राइब किया!',
        youllReceiveUpdates: 'आप %s अपडेट प्राप्त करेंगे',
        frequency: 'आवृत्ति:',
        categories: 'श्रेणियां:',
        managePreferences: 'प्राथमिकताएं प्रबंधित करें',
        unsubscribe: 'सदस्यता समाप्त करें',
        daily: 'दैनिक',
        weekly: 'साप्ताहिक',
        mostPopularStories: 'सबसे लोकप्रिय कहानियां',
        sentimentTrends: 'भावना रुझान',
        newsAnalyticsDashboard: 'समाचार विश्लेषण डैशबोर्ड',
        totalArticles: 'कुल लेख',
        positiveNews: 'सकारात्मक समाचार',
        negativeNews: 'नकारात्मक समाचार',
        neutralNews: 'तटस्थ समाचार',
        sentimentDistribution: 'भावना वितरण',
        categoryDistribution: 'श्रेणी वितरण',
        newsSourceDistribution: 'समाचार स्रोत वितरण',
        topKeywords: 'शीर्ष कीवर्ड',
        keyInsights: 'मुख्य अंतर्दृष्टि',
        similarArticles: 'समान लेख',
        noSimilarArticles: 'कोई समान लेख नहीं मिला',
        positive: 'सकारात्मक',
        negative: 'नकारात्मक',
        neutral: 'तटस्थ',
        recently: 'हाल ही में',
        minutesAgo: 'मिनट पहले',
        hoursAgo: 'घंटे पहले',
        daysAgo: 'दिन पहले',
        noArticlesFound: 'कोई लेख नहीं मिला',
        analyzingData: 'डेटा का विश्लेषण...',
        aboutNewsPulse: 'न्यूज़पल्स के बारे में',
        aboutDescription: 'एआई-संचालित भावना विश्लेषण और अंतर्दृष्टि के साथ ट्रेंडिंग सुर्खियां लाना।',
        contact: 'संपर्क',
        followUs: 'हमें फॉलो करें',
        footerCopyright: '© 2025 न्यूज़पल्स। सर्वाधिकार सुरक्षित। NewsAPI.ai द्वारा संचालित'
    },
    
    mr: {
        logo: '📊 न्यूजपल्स',
        forYou: 'तुमच्यासाठी',
        trending: 'ट्रेंडिंग',
        analysis: 'विश्लेषण',
        login: 'लॉगिन',
        logout: 'लॉगआउट',
        searchPlaceholder: 'मथळे शोधा...',
        lightMode: 'लाइट मोड',
        darkMode: 'डार्क मोड',
        welcomeBack: 'परत आपले स्वागत!',
        loginSubtitle: 'तुमच्या वैयक्तिक बातम्यांच्या फीडसाठी लॉगिन करा',
        email: 'ईमेल',
        password: 'पासवर्ड',
        fullName: 'पूर्ण नाव',
        loginButton: 'लॉगिन करा',
        signupButton: 'साइन अप करा',
        dontHaveAccount: 'खाते नाही?',
        alreadyHaveAccount: 'आधीच खाते आहे?',
        createAccount: 'खाते तयार करा',
        joinNewsPulse: 'अपडेट राहण्यासाठी न्यूजपल्समध्ये सामील व्हा',
        dailyMix: '✨ तुमचा दैनिक मिश्र',
        dailyMixSubtitle: 'वैयक्तिक बातम्या शिफारसी',
        recommended: 'शिफारस केलेले',
        unlockDailyMix: 'तुमचा दैनिक मिश्र अनलॉक करा',
        loginForRecommendations: 'वैयक्तिक बातम्या शिफारसी मिळवण्यासाठी लॉगिन करा',
        loginNow: 'आता लॉगिन करा',
        startBuildingMix: 'तुमचा मिश्र तयार करणे सुरू करा',
        likeArticlesForRecs: 'वैयक्तिक शिफारसी मिळवण्यासाठी लेख लाइक करा',
        exploreNews: 'बातम्या एक्सप्लोर करा',
        filterByCategory: 'श्रेणीनुसार फिल्टर करा',
        all: 'सर्व',
        business: 'व्यवसाय',
        technology: 'तंत्रज्ञान',
        sports: 'क्रीडा',
        politics: 'राजकारण',
        entertainment: 'मनोरंजन',
        health: 'आरोग्य',
        science: 'विज्ञान',
        trendingNews: 'ट्रेंडिंग बातम्या',
        latestNews: 'ताज्या बातम्या',
        readMore: 'अधिक वाचा',
        similar: 'समान',
        readFullStory: 'संपूर्ण कथा वाचा',
        cached: '📦 कॅश केलेले',
        fresh: '🆕 ताजे',
        trendingTopics: 'ट्रेंडिंग विषय',
        filters: 'फिल्टर',
        country: 'देश:',
        language: 'भाषा:',
        bookmarkedArticles: 'बुकमार्क केलेले लेख',
        newsletter: '📬 वृत्तपत्र',
        loginToViewBookmarks: 'बुकमार्क पाहण्यासाठी लॉगिन करा',
        noBookmarks: 'अद्याप कोणतेही बुकमार्क नाहीत',
        getDailyHeadlines: 'दररोज सकाळी तुमच्या इनबॉक्समध्ये शीर्ष मथळे मिळवा! 📬',
        subscribeNow: 'आता सदस्यता घ्या',
        subscribed: '✅ सदस्यता घेतली!',
        youllReceiveUpdates: 'तुम्हाला %s अपडेट मिळतील',
        frequency: 'वारंवारता:',
        categories: 'श्रेणी:',
        managePreferences: 'प्राधान्ये व्यवस्थापित करा',
        unsubscribe: 'सदस्यता रद्द करा',
        daily: 'दैनिक',
        weekly: 'साप्ताहिक',
        mostPopularStories: 'सर्वाधिक लोकप्रिय कथा',
        sentimentTrends: 'भावना ट्रेंड',
        newsAnalyticsDashboard: 'बातम्या विश्लेषण डॅशबोर्ड',
        totalArticles: 'एकूण लेख',
        positiveNews: 'सकारात्मक बातम्या',
        negativeNews: 'नकारात्मक बातम्या',
        neutralNews: 'तटस्थ बातम्या',
        sentimentDistribution: 'भावना वितरण',
        categoryDistribution: 'श्रेणी वितरण',
        newsSourceDistribution: 'बातम्या स्रोत वितरण',
        topKeywords: 'शीर्ष कीवर्ड',
        keyInsights: 'मुख्य अंतर्दृष्टी',
        similarArticles: 'समान लेख',
        noSimilarArticles: 'कोणतेही समान लेख आढळले नाहीत',
        positive: 'सकारात्मक',
        negative: 'नकारात्मक',
        neutral: 'तटस्थ',
        recently: 'अलीकडे',
        minutesAgo: 'मिनिटांपूर्वी',
        hoursAgo: 'तासांपूर्वी',
        daysAgo: 'दिवसांपूर्वी',
        noArticlesFound: 'कोणतेही लेख सापडले नाहीत',
        analyzingData: 'डेटा विश्लेषण...',
        aboutNewsPulse: 'न्यूजपल्स बद्दल',
        aboutDescription: 'एआय-संचालित भावना विश्लेषण आणि अंतर्दृष्टीसह ट्रेंडिंग मथळे आणत आहे.',
        contact: 'संपर्क',
        followUs: 'आम्हाला फॉलो करा',
        footerCopyright: '© 2025 न्यूजपल्स। सर्व हक्क राखीव। NewsAPI.ai द्वारे समर्थित'
    },
    
    ta: {
        logo: '📊 நியூஸ்பல்ஸ்',
        forYou: 'உங்களுக்காக',
        trending: 'டிரெண்டிங்',
        analysis: 'பகுப்பாய்வு',
        login: 'உள்நுழைய',
        logout: 'வெளியேறு',
        searchPlaceholder: 'தலைப்புச் செய்திகளைத் தேடு...',
        lightMode: 'லைட் மோட்',
        darkMode: 'டார்க் மோட்',
        welcomeBack: 'மீண்டும் வரவேற்கிறோம்!',
        loginSubtitle: 'உங்கள் தனிப்பயன் செய்தி ஊட்டத்தை அணுக உள்நுழைக',
        email: 'மின்னஞ்சல்',
        password: 'கடவுச்சொல்',
        fullName: 'முழு பெயர்',
        loginButton: 'உள்நுழைய',
        signupButton: 'பதிவு செய்ய',
        dontHaveAccount: 'கணக்கு இல்லையா?',
        alreadyHaveAccount: 'ஏற்கனவே கணக்கு உள்ளதா?',
        createAccount: 'கணக்கை உருவாக்கு',
        joinNewsPulse: 'புதுப்பித்த நிலையில் இருக்க நியூஸ்பல்ஸ் இல் சேரவும்',
        dailyMix: '✨ உங்கள் தினசரி கலவை',
        dailyMixSubtitle: 'தனிப்பயனாக்கப்பட்ட செய்தி பரிந்துரைகள்',
        recommended: 'பரிந்துரைக்கப்பட்டது',
        unlockDailyMix: 'உங்கள் தினசரி கலவையைத் திறக்கவும்',
        loginForRecommendations: 'தனிப்பயன் செய்தி பரிந்துரைகளைப் பெற உள்நுழைக',
        loginNow: 'இப்போது உள்நுழைக',
        startBuildingMix: 'உங்கள் கலவையை உருவாக்கத் தொடங்குங்கள்',
        likeArticlesForRecs: 'பரிந்துரைகளைப் பெற கட்டுரைகளை விரும்பவும்',
        exploreNews: 'செய்திகளை ஆராயுங்கள்',
        filterByCategory: 'வகையின்படி வடிகட்டு',
        all: 'அனைத்தும்',
        business: 'வணிகம்',
        technology: 'தொழில்நுட்பம்',
        sports: 'விளையாட்டு',
        politics: 'அரசியல்',
        entertainment: 'பொழுதுபோக்கு',
        health: 'சுகாதாரம்',
        science: 'அறிவியல்',
        trendingNews: 'டிரெண்டிங் செய்திகள்',
        latestNews: 'சமீபத்திய செய்திகள்',
        readMore: 'மேலும் படிக்க',
        similar: 'ஒத்த',
        readFullStory: 'முழு கதையைப் படிக்கவும்',
        cached: '📦 சேமித்த',
        fresh: '🆕 புதிய',
        trendingTopics: 'டிரெண்டிங் தலைப்புகள்',
        filters: 'வடிப்பான்கள்',
        country: 'நாடு:',
        language: 'மொழி:',
        bookmarkedArticles: 'புக்மார்க் செய்யப்பட்ட கட்டுரைகள்',
        newsletter: '📬 செய்திமடல்',
        loginToViewBookmarks: 'புக்மார்க்குகளைக் காண உள்நுழைக',
        noBookmarks: 'இதுவரை புக்மார்க்குகள் இல்லை',
        getDailyHeadlines: 'தினமும் காலையில் உங்கள் இன்பாக்ஸில் முக்கிய தலைப்புச் செய்திகளைப் பெறுங்கள்! 📬',
        subscribeNow: 'இப்போது குழுசேர்',
        subscribed: '✅ குழுசேர்ந்தீர்கள்!',
        youllReceiveUpdates: 'நீங்கள் %s புதுப்பிப்புகளைப் பெறுவீர்கள்',
        frequency: 'அதிர்வெண்:',
        categories: 'வகைகள்:',
        managePreferences: 'விருப்பத்தேர்வுகளை நிர்வகிக்கவும்',
        unsubscribe: 'குழுவிலகு',
        daily: 'தினசரி',
        weekly: 'வாராந்திர',
        mostPopularStories: 'மிகவும் பிரபலமான கதைகள்',
        sentimentTrends: 'உணர்வு போக்குகள்',
        newsAnalyticsDashboard: 'செய்தி பகுப்பாய்வு டாஷ்போர்டு',
        totalArticles: 'மொத்த கட்டுரைகள்',
        positiveNews: 'நேர்மறை செய்திகள்',
        negativeNews: 'எதிர்மறை செய்திகள்',
        neutralNews: 'நடுநிலை செய்திகள்',
        sentimentDistribution: 'உணர்வு விநியோகம்',
        categoryDistribution: 'வகை விநியோகம்',
        newsSourceDistribution: 'செய்தி மூல விநியோகம்',
        topKeywords: 'முதன்மை முக்கிய சொற்கள்',
        keyInsights: 'முக்கிய நுண்ணறிவுகள்',
        similarArticles: 'ஒத்த கட்டுரைகள்',
        noSimilarArticles: 'ஒத்த கட்டுரைகள் எதுவும் கிடைக்கவில்லை',
        positive: 'நேர்மறை',
        negative: 'எதிர்மறை',
        neutral: 'நடுநிலை',
        recently: 'சமீபத்தில்',
        minutesAgo: 'நிமிடங்களுக்கு முன்',
        hoursAgo: 'மணிநேரங்களுக்கு முன்',
        daysAgo: 'நாட்களுக்கு முன்',
        noArticlesFound: 'கட்டுரைகள் எதுவும் கிடைக்கவில்லை',
        analyzingData: 'தரவுகளை பகுப்பாய்வு செய்கிறது...',
        aboutNewsPulse: 'நியூஸ்பல்ஸ் பற்றி',
        aboutDescription: 'AI-இயக்கப்படும் உணர்வு பகுப்பாய்வு மற்றும் நுண்ணறிவுடன் டிரெண்டிங் தலைப்புச் செய்திகளை கொண்டு வருகிறது.',
        contact: 'தொடர்பு',
        followUs: 'எங்களைப் பின்தொடருங்கள்',
        footerCopyright: '© 2025 நியூஸ்பல்ஸ். அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை. NewsAPI.ai மூலம் இயக்கப்படுகிறது'
    },
    
    es: {
        logo: '📊 NewsPulse',
        forYou: 'Para Ti',
        trending: 'Tendencias',
        analysis: 'Análisis',
        login: 'Iniciar Sesión',
        logout: 'Cerrar Sesión',
        searchPlaceholder: 'Buscar titulares...',
        lightMode: 'Modo Claro',
        darkMode: 'Modo Oscuro',
        welcomeBack: '¡Bienvenido de Nuevo!',
        loginSubtitle: 'Inicia sesión para acceder a tu feed personalizado',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        fullName: 'Nombre Completo',
        loginButton: 'Iniciar Sesión',
        signupButton: 'Registrarse',
        dontHaveAccount: '¿No tienes cuenta?',
        alreadyHaveAccount: '¿Ya tienes cuenta?',
        createAccount: 'Crear Cuenta',
        joinNewsPulse: 'Únete a NewsPulse para mantenerte actualizado',
        dailyMix: '✨ Tu Mezcla Diaria',
        dailyMixSubtitle: 'Recomendaciones de noticias personalizadas',
        recommended: 'Recomendado',
        unlockDailyMix: 'Desbloquea Tu Mezcla Diaria',
        loginForRecommendations: 'Inicia sesión para obtener recomendaciones',
        loginNow: 'Iniciar Sesión Ahora',
        startBuildingMix: 'Comienza a Construir Tu Mezcla',
        likeArticlesForRecs: 'Dale me gusta a artículos para obtener recomendaciones',
        exploreNews: 'Explorar Noticias',
        filterByCategory: 'Filtrar por Categoría',
        all: 'Todos',
        business: 'Negocios',
        technology: 'Tecnología',
        sports: 'Deportes',
        politics: 'Política',
        entertainment: 'Entretenimiento',
        health: 'Salud',
        science: 'Ciencia',
        trendingNews: 'Noticias en Tendencia',
        latestNews: 'Últimas Noticias',
        readMore: 'Leer Más',
        similar: 'Similar',
        readFullStory: 'Leer Historia Completa',
        cached: '📦 Caché',
        fresh: '🆕 Nuevo',
        trendingTopics: 'TEMAS POPULARES',
        filters: 'FILTROS',
        country: 'País:',
        language: 'Idioma:',
        bookmarkedArticles: 'ARTÍCULOS GUARDADOS',
        newsletter: '📬 BOLETÍN',
        loginToViewBookmarks: 'Inicia sesión para ver marcadores',
        noBookmarks: 'No hay artículos guardados',
        getDailyHeadlines: '¡Recibe titulares principales cada mañana! 📬',
        subscribeNow: 'Suscribirse Ahora',
        subscribed: '✅ ¡Suscrito!',
        youllReceiveUpdates: 'Recibirás actualizaciones %s',
        frequency: 'Frecuencia:',
        categories: 'Categorías:',
        managePreferences: 'Gestionar Preferencias',
        unsubscribe: 'Cancelar Suscripción',
        daily: 'diario',
        weekly: 'semanal',
        mostPopularStories: 'Historias Más Populares',
        sentimentTrends: 'TENDENCIAS DE SENTIMIENTO',
        newsAnalyticsDashboard: 'Panel de Análisis de Noticias',
        totalArticles: 'Artículos Totales',
        positiveNews: 'Noticias Positivas',
        negativeNews: 'Noticias Negativas',
        neutralNews: 'Noticias Neutrales',
        sentimentDistribution: 'Distribución de Sentimiento',
        categoryDistribution: 'Distribución de Categorías',
        newsSourceDistribution: 'Distribución de Fuentes',
        topKeywords: 'Palabras Clave Principales',
        keyInsights: 'INFORMACIÓN CLAVE',
        similarArticles: 'Artículos Similares',
        noSimilarArticles: 'No se encontraron artículos similares',
        positive: 'Positivo',
        negative: 'Negativo',
        neutral: 'Neutral',
        recently: 'Recientemente',
        minutesAgo: 'minutos atrás',
        hoursAgo: 'horas atrás',
        daysAgo: 'días atrás',
        noArticlesFound: 'No se encontraron artículos',
        analyzingData: 'Analizando datos...',
        aboutNewsPulse: 'Acerca de NewsPulse',
        aboutDescription: 'Trayendo titulares de tendencia con análisis de sentimiento impulsado por IA.',
        contact: 'Contacto',
        followUs: 'Síguenos',
        footerCopyright: '© 2025 NewsPulse. Todos los derechos reservados. Powered by NewsAPI.ai'
    },
    
    fr: {
        logo: '📊 NewsPulse',
        forYou: 'Pour Vous',
        trending: 'Tendances',
        analysis: 'Analyse',
        login: 'Connexion',
        logout: 'Déconnexion',
        searchPlaceholder: 'Rechercher des titres...',
        lightMode: 'Mode Clair',
        darkMode: 'Mode Sombre',
        welcomeBack: 'Bon Retour!',
        loginSubtitle: 'Connectez-vous pour accéder à votre flux personnalisé',
        email: 'E-mail',
        password: 'Mot de passe',
        fullName: 'Nom Complet',
        loginButton: 'Connexion',
        signupButton: "S'inscrire",
        dontHaveAccount: "Pas de compte?",
        alreadyHaveAccount: 'Déjà un compte?',
        createAccount: 'Créer un Compte',
        joinNewsPulse: 'Rejoignez NewsPulse pour rester à jour',
        dailyMix: '✨ Votre Mix Quotidien',
        dailyMixSubtitle: 'Recommandations de nouvelles personnalisées',
        recommended: 'Recommandé',
        unlockDailyMix: 'Déverrouillez Votre Mix Quotidien',
        loginForRecommendations: 'Connectez-vous pour obtenir des recommandations',
        loginNow: 'Se Connecter Maintenant',
        startBuildingMix: 'Commencez à Construire Votre Mix',
        likeArticlesForRecs: "Aimez des articles pour obtenir des recommandations",
        exploreNews: 'Explorer les Nouvelles',
        filterByCategory: 'Filtrer par Catégorie',
        all: 'Tous',
        business: 'Affaires',
        technology: 'Technologie',
        sports: 'Sports',
        politics: 'Politique',
        entertainment: 'Divertissement',
        health: 'Santé',
        science: 'Science',
        trendingNews: 'Nouvelles Tendance',
        latestNews: 'Dernières Nouvelles',
        readMore: 'Lire Plus',
        similar: 'Similaire',
        readFullStory: "Lire l'Histoire Complète",
        cached: '📦 En Cache',
        fresh: '🆕 Nouveau',
        trendingTopics: 'SUJETS TENDANCE',
        filters: 'FILTRES',
        country: 'Pays:',
        language: 'Langue:',
        bookmarkedArticles: 'ARTICLES FAVORIS',
        newsletter: '📬 BULLETIN',
        loginToViewBookmarks: 'Connectez-vous pour voir les favoris',
        noBookmarks: 'Aucun article favori',
        getDailyHeadlines: 'Recevez les principaux titres chaque matin! 📬',
        subscribeNow: "S'abonner Maintenant",
        subscribed: '✅ Abonné!',
        youllReceiveUpdates: 'Vous recevrez des mises à jour %s',
        frequency: 'Fréquence:',
        categories: 'Catégories:',
        managePreferences: 'Gérer les Préférences',
        unsubscribe: 'Se Désabonner',
        daily: 'quotidien',
        weekly: 'hebdomadaire',
        mostPopularStories: 'Histoires les Plus Populaires',
        sentimentTrends: 'TENDANCES DE SENTIMENT',
        newsAnalyticsDashboard: "Tableau de Bord d'Analyse des Nouvelles",
        totalArticles: 'Articles Totaux',
        positiveNews: 'Nouvelles Positives',
        negativeNews: 'Nouvelles Négatives',
        neutralNews: 'Nouvelles Neutres',
        sentimentDistribution: 'Distribution du Sentiment',
        categoryDistribution: 'Distribution des Catégories',
        newsSourceDistribution: 'Distribution des Sources',
        topKeywords: 'Mots-clés Principaux',
        keyInsights: 'INFORMATIONS CLÉS',
        similarArticles: 'Articles Similaires',
        noSimilarArticles: 'Aucun article similaire trouvé',
        positive: 'Positif',
        negative: 'Négatif',
        neutral: 'Neutre',
        recently: 'Récemment',
        minutesAgo: 'minutes il y a',
        hoursAgo: 'heures il y a',
        daysAgo: 'jours il y a',
        noArticlesFound: 'Aucun article trouvé',
        analyzingData: 'Analyse des données...',
        aboutNewsPulse: 'À Propos de NewsPulse',
        aboutDescription: "Apporter des titres tendance avec l'analyse de sentiment IA.",
        contact: 'Contact',
        followUs: 'Suivez-nous',
        footerCopyright: '© 2025 NewsPulse. Tous droits réservés. Powered by NewsAPI.ai'
    }
};

// Translation Helper Function
function t(key) {
    return translations[currentLanguage]?.[key] || translations['en'][key] || key;
}

// Update ALL UI with translations
function updateUILanguage() {
    console.log('🌍 Updating UI language to:', currentLanguage);
    
    // Navbar
    const logo = document.querySelector('.logo');
    if (logo) logo.textContent = t('logo');
    
    document.querySelectorAll('.nav-link').forEach(link => {
        const page = link.dataset.page;
        if (page === 'for-you') link.textContent = t('forYou');
        if (page === 'trending') link.textContent = t('trending');
        if (page === 'analysis') link.textContent = t('analysis');
    });
    
    const loginBtn = document.getElementById('show-auth-btn');
    if (loginBtn) loginBtn.textContent = t('login');
    
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = t('searchPlaceholder');
    
    const modeLabel = document.getElementById('mode-label');
    if (modeLabel) {
        const isDark = document.getElementById('mode-toggle').checked;
        modeLabel.textContent = isDark ? t('darkMode') : t('lightMode');
    }
    
    // Auth Modal
    updateAuthModal();
    
    // Daily Mix
    updateDailyMixSection();
    
    // Categories
    updateCategories();
    
    // News Sections
    updateNewsSections();
    
    // Sidebar
    updateSidebar();
    
    // Pages
    updatePages();
    
    // Footer
    updateFooter();
    
    // Dynamic content
    updateDynamicContent();
}

function updateAuthModal() {
    // Login form
    const loginHeader = document.querySelector('#login-form .auth-header h2');
    if (loginHeader) loginHeader.textContent = t('welcomeBack');
    
    const loginSubtitle = document.querySelector('#login-form .auth-header p');
    if (loginSubtitle) loginSubtitle.textContent = t('loginSubtitle');
    
    // Signup form
    const signupHeader = document.querySelector('#signup-form .auth-header h2');
    if (signupHeader) signupHeader.textContent = t('createAccount');
    
    const signupSubtitle = document.querySelector('#signup-form .auth-header p');
    if (signupSubtitle) signupSubtitle.textContent = t('joinNewsPulse');
    
    // Labels
    document.querySelectorAll('label[for*="email"]').forEach(label => {
        label.textContent = t('email');
    });
    
    document.querySelectorAll('label[for*="password"]').forEach(label => {
        label.textContent = t('password');
    });
    
    const nameLabel = document.querySelector('label[for="signup-name"]');
    if (nameLabel) nameLabel.textContent = t('fullName');
    
    // Buttons
    const loginButton = document.getElementById('login-btn');
    if (loginButton && !loginButton.disabled) {
        loginButton.textContent = t('loginButton');
    }
    
    const signupButton = document.getElementById('signup-btn');
    if (signupButton && !signupButton.disabled) {
        signupButton.textContent = t('signupButton');
    }
    
    // Auth switches
    const loginSwitchDiv = document.querySelector('#login-form .auth-switch');
    if (loginSwitchDiv) {
        loginSwitchDiv.innerHTML = t('dontHaveAccount') + ' <a id="show-signup">' + t('signupButton') + '</a>';
        // Re-attach event listener
        document.getElementById('show-signup').addEventListener('click', () => {
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('signup-form').style.display = 'block';
        });
    }
    
    const signupSwitchDiv = document.querySelector('#signup-form .auth-switch');
    if (signupSwitchDiv) {
        signupSwitchDiv.innerHTML = t('alreadyHaveAccount') + ' <a id="show-login">' + t('loginButton') + '</a>';
        // Re-attach event listener
        document.getElementById('show-login').addEventListener('click', () => {
            document.getElementById('signup-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });
    }
}

function updateDailyMixSection() {
    const dailyMixTitle = document.querySelector('.daily-mix-title h2');
    if (dailyMixTitle) dailyMixTitle.textContent = t('dailyMix');
    
    const dailyMixSubtitle = document.querySelector('.daily-mix-subtitle');
    if (dailyMixSubtitle) dailyMixSubtitle.textContent = t('dailyMixSubtitle');
    
    // Update Daily Mix empty states
    const dailyMixEmpty = document.querySelector('.daily-mix-empty');
    if (dailyMixEmpty) {
        const h3 = dailyMixEmpty.querySelector('h3');
        const p = dailyMixEmpty.querySelector('p');
        const btn = dailyMixEmpty.querySelector('.btn');
        
        if (h3) {
            if (h3.textContent.includes('Unlock')) h3.textContent = t('unlockDailyMix');
            if (h3.textContent.includes('Start')) h3.textContent = t('startBuildingMix');
        }
        if (p) {
            if (p.textContent.includes('Login')) p.textContent = t('loginForRecommendations');
            if (p.textContent.includes('Like')) p.textContent = t('likeArticlesForRecs');
        }
        if (btn) {
            if (btn.textContent.includes('Login')) btn.textContent = t('loginNow');
            if (btn.textContent.includes('Explore')) btn.textContent = t('exploreNews');
        }
    }
    
    // Update "Recommended" badges
    document.querySelectorAll('.daily-mix-recommended-badge').forEach(badge => {
        const icon = badge.querySelector('i');
        badge.textContent = t('recommended');
        if (icon) badge.prepend(icon);
    });
}

function updateCategories() {
    const categoryHeader = document.querySelector('.category-section h2');
    if (categoryHeader) categoryHeader.textContent = t('filterByCategory');
    
    document.querySelectorAll('.category-btn').forEach(btn => {
        const category = btn.dataset.category;
        btn.textContent = t(category);
    });
}

function updateNewsSections() {
    // Update section headers
    document.querySelectorAll('.section-header h2').forEach(header => {
        const text = header.textContent.trim();
        let cacheSpan = header.querySelector('span');
        
        if (text.includes('Trending News') || text.includes('ट्रेंडिंग') || text.includes('டிரெண்டிங்')) {
            header.textContent = t('trendingNews') + ' ';
            if (cacheSpan) header.appendChild(cacheSpan);
        } else if (text.includes('Latest News') || text.includes('नवीनतम') || text.includes('சமீபத்திய')) {
            header.textContent = t('latestNews') + ' ';
            if (cacheSpan) header.appendChild(cacheSpan);
        }
    });
}

function updateSidebar() {
    document.querySelectorAll('.sidebar-widget h3').forEach(h3 => {
        const text = h3.textContent.trim();
        if (text.includes('TRENDING') || text.includes('ट्रेंडिंग') || text.includes('டிரெண்டிங்')) {
            h3.textContent = t('trendingTopics');
        }
        if (text.includes('FILTER') || text.includes('फ़िल्टर') || text.includes('வடிப்பான்')) {
            h3.textContent = t('filters');
        }
        if (text.includes('BOOKMARK') || text.includes('बुकमार्क') || text.includes('புக்மார்க்')) {
            h3.textContent = t('bookmarkedArticles');
        }
        if (text.includes('NEWSLETTER') || text.includes('न्यूज़लेटर') || text.includes('செய்திமடல்')) {
            h3.textContent = t('newsletter');
        }
    });
    
    // Filter labels
    const countryLabel = document.querySelector('label[for="country-select"]');
    if (countryLabel) countryLabel.textContent = t('country');
    
    const langLabel = document.querySelector('label[for="lang-select"]');
    if (langLabel) langLabel.textContent = t('language');
}

function updatePages() {
    // Trending Page
    const trendingHeader = document.querySelector('#trending-page .section-header h2');
    if (trendingHeader) trendingHeader.textContent = t('mostPopularStories');
    
    const sentimentTrendsHeader = document.querySelector('#trending-page .sidebar-widget h3');
    if (sentimentTrendsHeader && sentimentTrendsHeader.textContent.includes('SENTIMENT')) {
        sentimentTrendsHeader.textContent = t('sentimentTrends');
    }
    
    // Analysis Page
    const analyticsHeader = document.querySelector('#analysis-page h2');
    if (analyticsHeader && (analyticsHeader.textContent.includes('Analytics') || analyticsHeader.textContent.includes('विश्लेषण'))) {
        analyticsHeader.textContent = t('newsAnalyticsDashboard');
    }
    
    // Stat cards
    document.querySelectorAll('.stat-card h3').forEach(h3 => {
        const text = h3.textContent.trim();
        if (text.includes('Total') || text.includes('कुल') || text.includes('மொத்த')) {
            h3.textContent = t('totalArticles');
        }
        if (text.includes('Positive') || text.includes('सकारात्मक') || text.includes('நேர்மறை')) {
            h3.textContent = t('positiveNews');
        }
        if (text.includes('Negative') || text.includes('नकारात्मक') || text.includes('எதிர்மறை')) {
            h3.textContent = t('negativeNews');
        }
        if (text.includes('Neutral') || text.includes('तटस्थ') || text.includes('நடுநிலை')) {
            h3.textContent = t('neutralNews');
        }
    });
    
    // Analysis cards
    document.querySelectorAll('.analysis-card h3').forEach(h3 => {
        const text = h3.textContent.trim();
        if (text.includes('Sentiment Distribution')) h3.textContent = t('sentimentDistribution');
        if (text.includes('Category Distribution')) h3.textContent = t('categoryDistribution');
        if (text.includes('Source Distribution')) h3.textContent = t('newsSourceDistribution');
        if (text.includes('Keywords')) h3.textContent = t('topKeywords');
    });
}

function updateFooter() {
    document.querySelectorAll('.footer-col h4').forEach(h4 => {
        const text = h4.textContent.trim();
        if (text.includes('About')) h4.textContent = t('aboutNewsPulse');
        if (text === 'Contact') h4.textContent = t('contact');
        if (text.includes('Follow')) h4.textContent = t('followUs');
    });
    
    const aboutDesc = document.querySelector('.footer-col p');
    if (aboutDesc && aboutDesc.textContent.includes('Bringing')) {
        aboutDesc.textContent = t('aboutDescription');
    }
    
    const footerCopyright = document.querySelector('.footer-bottom p');
    if (footerCopyright) footerCopyright.textContent = t('footerCopyright');
}

function updateDynamicContent() {
    // Update Read More buttons
    document.querySelectorAll('.read-more').forEach(btn => {
        if (btn.textContent.includes('Read More') || btn.textContent.includes('और') || btn.textContent.includes('Leer')) {
            btn.textContent = t('readMore');
        }
        if (btn.textContent.includes('Full Story') || btn.textContent.includes('पूरी') || btn.textContent.includes('முழு')) {
            btn.textContent = t('readFullStory');
        }
    });
    
    // Update Similar buttons
    document.querySelectorAll('.find-similar, .btn-similar').forEach(btn => {
        btn.textContent = t('similar');
    });
    
    // Update cache indicators
    document.querySelectorAll('.cache-indicator').forEach(indicator => {
        if (indicator.textContent.includes('Cached') || indicator.textContent.includes('कैश')) {
            indicator.textContent = t('cached');
        } else if (indicator.textContent.includes('Fresh') || indicator.textContent.includes('ताजा')) {
            indicator.textContent = t('fresh');
        }
    });
    
    // Update empty states
    document.querySelectorAll('.empty-state').forEach(state => {
        const text = state.textContent.trim();
        if (text.includes('No articles')) state.textContent = t('noArticlesFound');
        if (text.includes('Login to view')) state.textContent = t('loginToViewBookmarks');
        if (text.includes('No bookmarked')) state.textContent = t('noBookmarks');
        if (text.includes('Analyzing')) state.textContent = t('analyzingData');
    });
}

// Override getSentimentLabel function
function getSentimentLabel(sentiment) {
    if (sentiment > 0.1) return t('positive');
    if (sentiment < -0.1) return t('negative');
    return t('neutral');
}

// Override formatTime function
function formatTime(dateString) {
    if (!dateString) return t('recently');
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    return date.toLocaleDateString();
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', function() {
    // Load saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang && translations[savedLang]) {
        currentLanguage = savedLang;
        const langSelect = document.getElementById('lang-select');
        if (langSelect) langSelect.value = savedLang;
        updateUILanguage();
    }
});

// Language selector change handler
function setupLanguageSelector() {
    const langSelect = document.getElementById('lang-select');
    if (!langSelect) return;
    
    // Store original change handler
    const originalOnChange = langSelect.onchange;
    
    langSelect.addEventListener('change', function() {
        const newLang = this.value;
        console.log('🌍 Language changed to:', newLang);
        
        // Update current language
        currentLanguage = newLang;
        
        // Save preference
        localStorage.setItem('preferredLanguage', newLang);
        
        // Update all UI text
        updateUILanguage();
        
        // Call original handler if exists (for news filtering)
        if (originalOnChange) {
            originalOnChange.call(this);
        }
    });
}

// Call this in your main initialization
console.log('✅ i18n Translation System Loaded');
setupLanguageSelector();



        // Initialize the application
        document.addEventListener('DOMContentLoaded', function() {
            checkAuthStatus();
            setupEventListeners();
            initializeCharts();
            initAISummaries(); // <-- ADD THIS LINE
            initChatbot(); 
        });

        // Auth Functions
        function checkAuthStatus() {
            const token = localStorage.getItem('authToken');
            const user = localStorage.getItem('user');

            if (token && user) {
                authToken = token;
                currentUser = JSON.parse(user);
                updateUIForLoggedInUser();
                loadUserBookmarks().then(() => {
                    loadNewsFromAPI();
                    loadDailyMix();
                });
            } else {
                updateUIForLoggedOutUser();
                loadNewsFromAPI();
                showDailyMixLoginPrompt();
            }
        }

        function updateUIForLoggedInUser() {
            document.getElementById('show-auth-btn').style.display = 'none';
            document.getElementById('user-menu').style.display = 'block';
            document.getElementById('nav-links').style.display = 'flex';
            document.getElementById('search-bar').style.display = 'flex';

            const userAvatar = document.getElementById('user-avatar');
            const userNameText = document.getElementById('user-name-text');
            
            userAvatar.textContent = currentUser.name.charAt(0).toUpperCase();
            userNameText.textContent = currentUser.name;
        }

        function updateUIForLoggedOutUser() {
            document.getElementById('show-auth-btn').style.display = 'block';
            document.getElementById('user-menu').style.display = 'none';
            document.getElementById('nav-links').style.display = 'flex';
            document.getElementById('search-bar').style.display = 'flex';

            const bookmarksContainer = document.getElementById('bookmarked-articles');
            bookmarksContainer.innerHTML = '<p class="empty-state">Login to view bookmarks</p>';
        }

        async function handleSignup(e) {
            e.preventDefault();
            
            const name = document.getElementById('signup-name').value;
            const email = document.getElementById('signup-email').value;
            const password = document.getElementById('signup-password').value;
            const errorDiv = document.getElementById('signup-error');
            const submitBtn = document.getElementById('signup-btn');

            errorDiv.classList.remove('active');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating Account...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Signup failed');
                }

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                authToken = data.token;
                currentUser = data.user;

                document.getElementById('auth-overlay').classList.remove('active');
                updateUIForLoggedInUser();
                
                await loadUserBookmarks();
                await loadNewsFromAPI();
                await loadDailyMix();

            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.add('active');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Sign Up';
            }
        }

        async function handleLogin(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            const errorDiv = document.getElementById('login-error');
            const submitBtn = document.getElementById('login-btn');

            errorDiv.classList.remove('active');
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';

            try {
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data.message || 'Login failed');
                }

                localStorage.setItem('authToken', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                authToken = data.token;
                currentUser = data.user;

                document.getElementById('auth-overlay').classList.remove('active');
                updateUIForLoggedInUser();
                
                await loadUserBookmarks();
                await loadNewsFromAPI();
                await loadDailyMix();

            } catch (error) {
                errorDiv.textContent = error.message;
                errorDiv.classList.add('active');
            } finally {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        }

        function handleLogout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            authToken = null;
            currentUser = null;
            userBookmarks = [];
            articleReactions = {};

            updateUIForLoggedOutUser();
            loadNewsFromAPI();
            showDailyMixLoginPrompt();
        }

        // ========== DAILY MIX FUNCTIONS ========== 
        
        async function loadDailyMix() {
            if (!authToken) {
                showDailyMixLoginPrompt();
                return;
            }

            const loadingDiv = document.getElementById('daily-mix-loading');
            const contentDiv = document.getElementById('daily-mix-content');

            loadingDiv.style.display = 'flex';
            contentDiv.innerHTML = '';

            try {
                console.log('🎯 Fetching Daily Mix recommendations...');
                
                const response = await fetch(`${API_BASE_URL}/recommendations?limit=15`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                const data = await response.json();

                loadingDiv.style.display = 'none';

                if (data.success && data.recommendations && data.recommendations.length > 0) {
                    console.log(`✅ Loaded ${data.recommendations.length} recommendations`);
                    displayDailyMix(data.recommendations);
                } else {
                    console.log('⚠️ No recommendations available');
                    showDailyMixEmpty();
                }
            } catch (error) {
                console.error('❌ Error loading daily mix:', error);
                loadingDiv.style.display = 'none';
                showDailyMixEmpty();
            }
        }

        function displayDailyMix(recommendations) {
            const contentDiv = document.getElementById('daily-mix-content');
            
            const carouselWrapper = document.createElement('div');
            carouselWrapper.className = 'daily-mix-carousel-wrapper';
            
            const carouselContainer = document.createElement('div');
            carouselContainer.className = 'daily-mix-carousel-container';
            
            const carousel = document.createElement('div');
            carousel.className = 'daily-mix-carousel';
            carousel.id = 'daily-mix-carousel';
            
            recommendations.forEach((article, index) => {
                const card = createDailyMixCard(article, index);
                carousel.appendChild(card);
            });
            
            carouselContainer.appendChild(carousel);
            carouselWrapper.appendChild(carouselContainer);
            
            // Add scroll buttons OUTSIDE the carousel container
            const leftBtn = document.createElement('div');
            leftBtn.className = 'daily-mix-scroll-btn daily-mix-scroll-left';
            leftBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
            leftBtn.onclick = () => scrollDailyMix('left');
            
            const rightBtn = document.createElement('div');
            rightBtn.className = 'daily-mix-scroll-btn daily-mix-scroll-right';
            rightBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
            rightBtn.onclick = () => scrollDailyMix('right');
            
            carouselWrapper.appendChild(leftBtn);
            carouselWrapper.appendChild(rightBtn);
            
            contentDiv.appendChild(carouselWrapper);
            
            // Initial button state update
            setTimeout(() => {
                updateDailyMixScrollButtons();
            }, 100);
            
            // Add scroll listener
            carousel.addEventListener('scroll', updateDailyMixScrollButtons);
        }

        function createDailyMixCard(article, index) {
            const card = document.createElement('div');
            card.className = 'daily-mix-card';
            
            const sentiment = getSentimentLabel(article.sentiment);
            const sentimentEmoji = sentiment === 'Positive' ? '😊' : sentiment === 'Negative' ? '😟' : '😐';
            
            // Truncate title and summary
            const truncatedTitle = truncateText(article.title, 80);
            const truncatedSummary = truncateText(article.summary, 120);
            
            card.innerHTML = `
                <div class="daily-mix-card-image">
                    <img src="${article.image || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'}" 
                         alt="${article.title}" 
                         onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'">
                    <div class="daily-mix-recommended-badge">
                        <i class="fas fa-star"></i> Recommended
                    </div>
                </div>
                <div class="daily-mix-card-content">
                    <h3 title="${article.title}">${truncatedTitle}</h3>
                    <p title="${article.summary}">${truncatedSummary}</p>
                    <div class="daily-mix-meta">
                        <span class="daily-mix-category">${article.category || 'General'}</span>
                        <span>${sentimentEmoji} ${sentiment}</span>
                    </div>
                </div>
            `;
            
            card.onclick = () => window.open(article.url, '_blank');
            
            return card;
        }

        function scrollDailyMix(direction) {
            const carousel = document.getElementById('daily-mix-carousel');
            if (!carousel) return;
            
            const scrollAmount = 320; // card width + gap
            
            if (direction === 'left') {
                carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
            
            // Update buttons after scroll
            setTimeout(updateDailyMixScrollButtons, 300);
        }

        function updateDailyMixScrollButtons() {
            const carousel = document.getElementById('daily-mix-carousel');
            const leftBtn = document.querySelector('.daily-mix-scroll-left');
            const rightBtn = document.querySelector('.daily-mix-scroll-right');
            
            if (!carousel || !leftBtn || !rightBtn) return;
            
            const isAtStart = carousel.scrollLeft <= 10;
            const isAtEnd = carousel.scrollLeft >= (carousel.scrollWidth - carousel.clientWidth - 10);
            
            leftBtn.classList.toggle('disabled', isAtStart);
            rightBtn.classList.toggle('disabled', isAtEnd);
        }

        function showDailyMixLoginPrompt() {
            const contentDiv = document.getElementById('daily-mix-content');
            contentDiv.innerHTML = `
                <div class="daily-mix-empty">
                    <i class="fas fa-lock"></i>
                    <h3>Unlock Your Daily Mix</h3>
                    <p>Login to get personalized news recommendations</p>
                    <button class="btn" onclick="document.getElementById('auth-overlay').classList.add('active')">
                        Login Now
                    </button>
                </div>
            `;
        }

        function showDailyMixEmpty() {
            const contentDiv = document.getElementById('daily-mix-content');
            contentDiv.innerHTML = `
                <div class="daily-mix-empty">
                    <i class="fas fa-heart"></i>
                    <h3>Start Building Your Mix</h3>
                    <p>Like articles to get personalized recommendations</p>
                    <button class="btn" onclick="document.querySelector('.news-section').scrollIntoView({ behavior: 'smooth' })">
                        Explore News
                    </button>
                </div>
            `;
        }

        // ========== END DAILY MIX FUNCTIONS ========== 
        async function loadUserBookmarks() {
            if (!authToken) {
                userBookmarks = [];
                return;
            }

            try {
                const response = await fetch(`${API_BASE_URL}/bookmarks`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                const data = await response.json();

                if (data.success) {
                    userBookmarks = data.bookmarks;
                    console.log('Loaded bookmarks:', userBookmarks.length);
                    updateBookmarksUI();
                }
            } catch (error) {
                console.error('Error loading bookmarks:', error);
                userBookmarks = [];
            }
        }


        async function loadNewsletterStatus() {
    const widget = document.getElementById('newsletter-content');
    
    if (!authToken) {
        widget.innerHTML = `
            <div class="newsletter-login-prompt">
                <i class="fas fa-envelope"></i>
                <p>Login to subscribe to our daily newsletter</p>
                <button class="btn-newsletter btn-subscribe" onclick="document.getElementById('auth-overlay').classList.add('active')">
                    Login to Subscribe
                </button>
            </div>
        `;
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            if (data.subscribed) {
                displaySubscribedNewsletter(data.preferences);
            } else {
                displayUnsubscribedNewsletter();
            }
        }
    } catch (error) {
        console.error('Error loading newsletter status:', error);
        widget.innerHTML = '<p class="empty-state">Error loading newsletter</p>';
    }
}

function displaySubscribedNewsletter(preferences) {
    const widget = document.getElementById('newsletter-content');
    
    const categories = preferences.categories.join(', ');
    const frequency = preferences.frequency.charAt(0).toUpperCase() + preferences.frequency.slice(1);
    
    widget.innerHTML = `
        <div class="newsletter-subscribed">
            <i class="fas fa-check-circle"></i>
            <h4>✅ Subscribed!</h4>
            <p>You'll receive ${frequency.toLowerCase()} updates</p>
            
            <div class="newsletter-preferences">
                <p><strong>Frequency:</strong> ${frequency}</p>
                <p><strong>Categories:</strong> ${categories}</p>
            </div>
            
            <button class="btn-newsletter btn-manage" onclick="openNewsletterModal()">
                <i class="fas fa-cog"></i> Manage Preferences
            </button>
            
            <button class="btn-newsletter btn-unsubscribe" onclick="unsubscribeNewsletter()">
                Unsubscribe
            </button>
        </div>
    `;
}

function displayUnsubscribedNewsletter() {
    const widget = document.getElementById('newsletter-content');
    
    widget.innerHTML = `
        <div class="newsletter-section">
            <p>Get daily top headlines delivered to your inbox every morning! 📬</p>
            <button class="btn-newsletter btn-subscribe" onclick="subscribeNewsletter()">
                <i class="fas fa-envelope"></i> Subscribe Now
            </button>
        </div>
    `;
}

async function subscribeNewsletter() {
    if (!authToken) {
        document.getElementById('auth-overlay').classList.add('active');
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                frequency: 'daily',
                categories: ['all']
            })
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Successfully subscribed to newsletter!');
            loadNewsletterStatus();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error subscribing:', error);
        alert('❌ Failed to subscribe');
    }
}

async function unsubscribeNewsletter() {
    if (!confirm('Are you sure you want to unsubscribe from the newsletter?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/unsubscribe`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Successfully unsubscribed');
            loadNewsletterStatus();
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('Error unsubscribing:', error);
        alert('❌ Failed to unsubscribe');
    }
}

function openNewsletterModal() {
    document.getElementById('newsletter-modal').classList.add('active');
    loadCurrentPreferences();
}

async function loadCurrentPreferences() {
    try {
        const response = await fetch(`${API_BASE_URL}/newsletter/status`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success && data.preferences) {
            document.getElementById('newsletter-frequency').value = data.preferences.frequency;
            
            // Uncheck all categories first
            document.querySelectorAll('[name="category"]').forEach(cb => cb.checked = false);
            
            // Check saved categories
            data.preferences.categories.forEach(cat => {
                const checkbox = document.querySelector(`[name="category"][value="${cat}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    } catch (error) {
        console.error('Error loading preferences:', error);
    }
}

// Newsletter modal event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Close modal
    const newsletterModalClose = document.querySelector('.newsletter-modal-close');
    if (newsletterModalClose) {
        newsletterModalClose.addEventListener('click', () => {
            document.getElementById('newsletter-modal').classList.remove('active');
        });
    }

    // Close modal on outside click
    const newsletterModal = document.getElementById('newsletter-modal');
    if (newsletterModal) {
        newsletterModal.addEventListener('click', (e) => {
            if (e.target === newsletterModal) {
                newsletterModal.classList.remove('active');
            }
        });
    }

    // Newsletter preferences form
    const newsletterForm = document.getElementById('newsletter-preferences-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const frequency = document.getElementById('newsletter-frequency').value;
            const categories = Array.from(document.querySelectorAll('[name="category"]:checked'))
                .map(cb => cb.value);
            
            if (categories.length === 0) {
                alert('Please select at least one category');
                return;
            }
            
            try {
                const response = await fetch(`${API_BASE_URL}/newsletter/preferences`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({ frequency, categories })
                });

                const data = await response.json();

                if (data.success) {
                    alert('✅ Preferences updated successfully!');
                    document.getElementById('newsletter-modal').classList.remove('active');
                    loadNewsletterStatus();
                } else {
                    alert('❌ Error: ' + data.message);
                }
            } catch (error) {
                console.error('Error updating preferences:', error);
                alert('❌ Failed to update preferences');
            }
        });
    }

    // Load newsletter status on page load
    setTimeout(loadNewsletterStatus, 500);
});


        function updateBookmarksUI() {
            const container = document.getElementById('bookmarked-articles');
            container.innerHTML = '';

            if (userBookmarks.length === 0) {
                container.innerHTML = '<p class="empty-state">No bookmarked articles yet</p>';
                return;
            }

            userBookmarks.slice(0, 5).forEach(bookmark => {
                const item = document.createElement('div');
                item.className = 'bookmark-item';
                item.innerHTML = `
                    <h4>${bookmark.title}</h4>
                    <span>${bookmark.source}</span>
                `;
                item.onclick = () => window.open(bookmark.url, '_blank');
                container.appendChild(item);
            });
        }

        async function toggleBookmark(article, btnElement) {
            if (!authToken) {
                document.getElementById('auth-overlay').classList.add('active');
                return;
            }

            const isBookmarked = btnElement.classList.contains('bookmarked');

            try {
                if (isBookmarked) {
                    const bookmark = userBookmarks.find(b => b.articleId === article.id);
                    if (bookmark) {
                        const response = await fetch(`${API_BASE_URL}/bookmarks/${bookmark._id}`, {
                            method: 'DELETE',
                            headers: {
                                'Authorization': `Bearer ${authToken}`
                            }
                        });

                        const data = await response.json();

                        if (data.success) {
                            userBookmarks = userBookmarks.filter(b => b._id !== bookmark._id);
                            btnElement.classList.remove('bookmarked');
                            btnElement.querySelector('i').classList.remove('fas');
                            btnElement.querySelector('i').classList.add('far');
                            updateBookmarksUI();
                            console.log('Bookmark removed');
                        }
                    }
                } else {
                    const response = await fetch(`${API_BASE_URL}/bookmarks`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${authToken}`
                        },
                        body: JSON.stringify({
                            articleId: article.id,
                            title: article.title,
                            summary: article.summary,
                            image: article.image,
                            source: article.source,
                            url: article.url,
                            category: article.category,
                            sentiment: article.sentiment
                        })
                    });

                    const data = await response.json();

                    if (data.success) {
                        userBookmarks.unshift(data.bookmark);
                        btnElement.classList.add('bookmarked');
                        btnElement.querySelector('i').classList.remove('far');
                        btnElement.querySelector('i').classList.add('fas');
                        updateBookmarksUI();
                        console.log('Bookmark added');
                    } else {
                        throw new Error(data.message);
                    }
                }
            } catch (error) {
                console.error('Error toggling bookmark:', error);
                alert('Error: ' + error.message);
            }
        }

        // Reaction Functions
        async function handleReaction(articleId, reactionType, btnElement) {
            if (!authToken) {
                document.getElementById('auth-overlay').classList.add('active');
                return;
            }

            console.log('🎯 Handling reaction:', { articleId, reactionType, user: currentUser?.email });

            try {
                const response = await fetch(`${API_BASE_URL}/reactions`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        articleId,
                        reactionType
                    })
                });

                const data = await response.json();

                if (data.success) {
                    console.log('✅ Server response:', data);
                    
                    // Update global article reactions
                    articleReactions[articleId] = data.counts;
                    
                    // Update the article in allArticles array
                    const articleIndex = allArticles.findIndex(a => a.id === articleId);
                    if (articleIndex !== -1) {
                        allArticles[articleIndex].reactions = data.counts;
                    }
                    
                    // Find ALL cards with this article ID and update them
                    const allCards = document.querySelectorAll(`[data-article-id="${articleId}"]`);
                    console.log(`📌 Found ${allCards.length} cards to update`);
                    
                    allCards.forEach(card => {
                        const reactionsContainer = card.querySelector('.reactions');
                        if (reactionsContainer) {
                            // Update button active states
                            const allReactionBtns = reactionsContainer.querySelectorAll('.reaction-btn');
                            allReactionBtns.forEach(btn => {
                                const btnType = btn.getAttribute('data-type');
                                if (btnType === reactionType) {
                                    btn.classList.add('active');
                                } else {
                                    btn.classList.remove('active');
                                }
                            });
                            
                            // Update counts
                            const likeCountSpan = reactionsContainer.querySelector('[data-type="like"] .reaction-count');
                            const dislikeCountSpan = reactionsContainer.querySelector('[data-type="dislike"] .reaction-count');
                            const neutralCountSpan = reactionsContainer.querySelector('[data-type="neutral"] .reaction-count');
                            
                            if (likeCountSpan) {
                                likeCountSpan.textContent = data.counts.like || 0;
                            }
                            if (dislikeCountSpan) {
                                dislikeCountSpan.textContent = data.counts.dislike || 0;
                            }
                            if (neutralCountSpan) {
                                neutralCountSpan.textContent = data.counts.neutral || 0;
                            }
                        }
                    });
                    
                    console.log('✅ All counts updated successfully!');
                    
                    // Reload daily mix after like reaction
                    if (reactionType === 'like') {
                        console.log('🔄 Reloading Daily Mix after like...');
                        setTimeout(() => loadDailyMix(), 500);
                    }
                } else {
                    console.error('❌ Server returned error:', data);
                }
            } catch (error) {
                console.error('❌ Error in handleReaction:', error);
            }
        }

        async function loadUserReaction(articleId) {
            if (!authToken) return null;

            try {
                const response = await fetch(`${API_BASE_URL}/reactions/user/${articleId}`, {
                    headers: {
                        'Authorization': `Bearer ${authToken}`
                    }
                });

                const data = await response.json();

                if (data.success && data.reaction) {
                    return data.reaction;
                }
            } catch (error) {
                console.error('Error loading user reaction:', error);
            }

            return null;
        }

        // News API Functions
        async function fetchNews(category = 'all', country = '', lang = 'en') {
            try {
                const params = new URLSearchParams({
                    category,
                    country,
                    lang
                });

                const response = await fetch(`${API_BASE_URL}/news?${params}`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.articles) {
                    isFromCache = data.fromCache;
                    
                    // Update cache indicator
                    const cacheStatus = document.getElementById('cache-status');
                    const cacheStatusCarousel = document.getElementById('cache-status-carousel');
                    
                    if (cacheStatus) {
                        cacheStatus.innerHTML = data.fromCache ? 
                            '<span class="cache-indicator cached">📦 Cached</span>' : 
                            '<span class="cache-indicator fresh">🆕 Fresh</span>';
                    }
                    
                    if (cacheStatusCarousel) {
                        cacheStatusCarousel.innerHTML = data.fromCache ? 
                            '<span class="cache-indicator cached">📦 Cached</span>' : 
                            '<span class="cache-indicator fresh">🆕 Fresh</span>';
                    }
                    
                    allArticles = data.articles.map(article => ({
                        id: article.articleId,
                        title: article.title,
                        summary: article.summary,
                        image: article.image,
                        source: article.source,
                        time: formatTime(article.publishedAt),
                        category: article.category,
                        url: article.url,
                        sentiment: article.sentiment,
                        dateTime: article.publishedAt,
                        shares: article.shares,
                        uri: article.uri,
                        lang: article.lang,
                        reactions: article.reactions || { like: 0, dislike: 0, neutral: 0, total: 0 }
                    }));
                    
                    // Store reactions in global object
                    allArticles.forEach(article => {
                        articleReactions[article.id] = article.reactions;
                    });
                    
                    console.log(`Loaded ${allArticles.length} articles (from ${data.fromCache ? 'cache' : 'API'})`);
                    return allArticles;
                } else {
                    throw new Error('No articles found');
                }
            } catch (error) {
                console.error('Error fetching news:', error);
                return [];
            }
        }

        async function searchNews(query) {
            try {
                const langSelect = document.getElementById('lang-select');
                const lang = langSelect ? langSelect.value : 'en';
                
                const params = new URLSearchParams({
                    query,
                    lang
                });

                const response = await fetch(`${API_BASE_URL}/news/search?${params}`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.articles) {
                    return data.articles.map(article => ({
                        id: article.articleId,
                        title: article.title,
                        summary: article.summary,
                        image: article.image,
                        source: article.source,
                        time: formatTime(article.publishedAt),
                        category: article.category,
                        url: article.url,
                        sentiment: article.sentiment,
                        dateTime: article.publishedAt,
                        shares: article.shares,
                        uri: article.uri,
                        reactions: article.reactions || { like: 0, dislike: 0, neutral: 0, total: 0 }
                    }));
                }
                
                return [];
            } catch (error) {
                console.error('Error searching news:', error);
                return [];
            }
        }

        async function findSimilarArticles(articleUri) {
            try {
                const response = await fetch(`${API_BASE_URL}/news/similar/${articleUri}`);
                
                if (!response.ok) {
                    throw new Error(`API error: ${response.status}`);
                }

                const data = await response.json();
                
                if (data.success && data.articles) {
                    return data.articles;
                }
                
                return [];
            } catch (error) {
                console.error('Error finding similar articles:', error);
                return [];
            }
        }

        // Display Functions
        async function loadNewsFromAPI(category = 'all', country = '', lang = 'en') {
            const container = document.getElementById('news-container');
            const loading = document.getElementById('news-loading');
            
            loading.style.display = 'flex';
            container.style.display = 'none';
            
            const articles = await fetchNews(category, country, lang);
            
            loading.style.display = 'none';
            container.style.display = 'grid';
            
            await displayNewsArticles(articles, 'news-container');
            updateAnalytics(articles);
            loadCarousel(articles.slice(0, 5));
        }

        async function loadTrendingArticles() {
            const container = document.getElementById('trending-news-container');
            const loading = document.getElementById('trending-loading');
            const langSelect = document.getElementById('lang-select');
            const lang = langSelect ? langSelect.value : 'en';
            
            loading.style.display = 'flex';
            container.style.display = 'none';
            
            const articles = await fetchNews('all', '', lang);
            const trending = articles.sort((a, b) => {
                const aScore = (a.reactions.total || 0) + (a.shares || 0);
                const bScore = (b.reactions.total || 0) + (b.shares || 0);
                return bScore - aScore;
            }).slice(0, 20);
            
            loading.style.display = 'none';
            container.style.display = 'grid';
            
            await displayNewsArticles(trending, 'trending-news-container');
        }

        async function displayNewsArticles(articles, containerId) {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            
            if (articles.length === 0) {
                container.innerHTML = '<p class="empty-state">No articles found</p>';
                return;
            }
            
            for (const article of articles) {
                const newsCard = await createNewsCard(article);
                container.appendChild(newsCard);
            }
        }

        async function createNewsCard(article) {
            const card = document.createElement('div');
            card.className = 'news-card';
            card.dataset.category = article.category;
            card.dataset.articleId = article.id;
            
            const sentiment = getSentimentLabel(article.sentiment);
            const sentimentClass = sentiment.toLowerCase();
            
            const isBookmarked = userBookmarks.some(b => b.articleId === article.id);
            
            const reactions = article.reactions || { like: 0, dislike: 0, neutral: 0, total: 0 };
            const userReaction = await loadUserReaction(article.id);
            
            let dominantSentiment = 'neutral';
            if (reactions.like > reactions.dislike && reactions.like > reactions.neutral) {
                dominantSentiment = 'positive';
            } else if (reactions.dislike > reactions.like && reactions.dislike > reactions.neutral) {
                dominantSentiment = 'negative';
            }
            
            card.innerHTML = `
                <div class="news-image">
                    <img src="${article.image}" alt="News image" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800'">
                    <span class="sentiment-badge sentiment-${dominantSentiment}">
                        ${dominantSentiment === 'positive' ? '😊' : dominantSentiment === 'negative' ? '😟' : '😐'} ${dominantSentiment.charAt(0).toUpperCase() + dominantSentiment.slice(1)}
                    </span>
                    ${authToken ? `
                    <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" data-article-id="${article.id}">
                        <i class="${isBookmarked ? 'fas' : 'far'} fa-bookmark"></i>
                    </button>
                    ` : ''}
                </div>
                <div class="news-content">
                    <h3>${article.title}</h3>
                    <p>${article.summary}</p>
                    <div class="news-meta">
                        <span class="source">${article.source}</span>
                        <span class="time">${article.time}</span>
                    </div>
                    <div class="news-actions">
                        <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                            <button class="btn btn-primary read-more" data-url="${article.url}">Read More</button>
                            <button class="btn btn-similar find-similar" data-uri="${article.uri}">Similar</button>
                        </div>
                        ${authToken ? `
                        <div class="reactions">
                            <button class="reaction-btn like ${userReaction === 'like' ? 'active' : ''}" data-article-id="${article.id}" data-type="like" title="Like">
                                👍 <span class="reaction-count" data-type="like">${reactions.like}</span>
                            </button>
                            <button class="reaction-btn dislike ${userReaction === 'dislike' ? 'active' : ''}" data-article-id="${article.id}" data-type="dislike" title="Dislike">
                                👎 <span class="reaction-count" data-type="dislike">${reactions.dislike}</span>
                            </button>
                            <button class="reaction-btn neutral ${userReaction === 'neutral' ? 'active' : ''}" data-article-id="${article.id}" data-type="neutral" title="Neutral">
                                😐 <span class="reaction-count" data-type="neutral">${reactions.neutral}</span>
                            </button>
                        </div>
                        ` : `
                        <div class="reactions">
                            <span style="font-size: 12px;">👍 ${reactions.like} 👎 ${reactions.dislike} 😐 ${reactions.neutral}</span>
                        </div>
                        `}
                    </div>
                </div>
            `;
            
            return card;
        }

        function loadCarousel(articles) {
            const carousel = document.getElementById('carousel');
            const indicators = document.getElementById('carousel-indicators');
            const container = document.getElementById('carousel-container');
            const loading = document.getElementById('carousel-loading');
            
            if (articles.length === 0) {
                loading.style.display = 'none';
                return;
            }
            
            carousel.innerHTML = '';
            indicators.innerHTML = '';
            
            articles.forEach((article, index) => {
                const item = document.createElement('div');
                item.className = 'carousel-item';
                item.innerHTML = `
                    <img src="${article.image}" alt="${article.title}" onerror="this.src='https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=1200'">
                    <div class="carousel-content">
                        <h3>${article.title}</h3>
                        <p>${article.summary}</p>
                        <button class="btn btn-primary read-more" data-url="${article.url}">Read Full Story</button>
                    </div>
                `;
                carousel.appendChild(item);
                
                const indicator = document.createElement('div');
                indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
                indicator.dataset.index = index;
                indicators.appendChild(indicator);
            });
            
            loading.style.display = 'none';
            container.style.display = 'block';
            
            initializeCarousel();
        }

        // Analytics Functions
        function updateAnalytics(articles) {
            if (articles.length === 0) return;
            
            const sentimentCounts = {
                positive: 0,
                negative: 0,
                neutral: 0
            };
            
            articles.forEach(article => {
                const label = getSentimentLabel(article.sentiment).toLowerCase();
                sentimentCounts[label]++;
            });
            
            document.getElementById('stat-total').textContent = articles.length;
            document.getElementById('stat-positive').textContent = sentimentCounts.positive;
            document.getElementById('stat-negative').textContent = sentimentCounts.negative;
            document.getElementById('stat-neutral').textContent = sentimentCounts.neutral;
            
            updateSentimentChart(sentimentCounts);
            
            const sources = {};
            articles.forEach(article => {
                sources[article.source] = (sources[article.source] || 0) + 1;
            });
            updateSourceChart(sources);
            
            const categories = {};
            articles.forEach(article => {
                const cat = article.category || 'General';
                categories[cat] = (categories[cat] || 0) + 1;
            });
            updateCategoryChart(categories);
            
            extractTrendingTopics(articles);
            generateWordCloud(articles);
        }

        function extractTrendingTopics(articles) {
            const words = {};
            const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
            
            articles.forEach(article => {
                const text = (article.title + ' ' + article.summary).toLowerCase();
                const tokens = text.match(/\b[a-z]{4,}\b/g) || [];
                
                tokens.forEach(word => {
                    if (!stopWords.includes(word)) {
                        words[word] = (words[word] || 0) + 1;
                    }
                });
            });
            
            const sortedWords = Object.entries(words)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 10);
            
            const container = document.getElementById('trending-topics');
            container.innerHTML = '';
            
            sortedWords.forEach(([word, count]) => {
                const tag = document.createElement('a');
                tag.href = '#';
                tag.textContent = `#${word} (${count})`;
                tag.onclick = (e) => {
                    e.preventDefault();
                    document.getElementById('search-input').value = word;
                    performSearch(word);
                };
                container.appendChild(tag);
            });
        }

        function generateWordCloud(articles) {
            const words = {};
            const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'been', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'];
            
            articles.forEach(article => {
                const text = (article.title + ' ' + article.summary).toLowerCase();
                const tokens = text.match(/\b[a-z]{4,}\b/g) || [];
                
                tokens.forEach(word => {
                    if (!stopWords.includes(word)) {
                        words[word] = (words[word] || 0) + 1;
                    }
                });
            });
            
            const sortedWords = Object.entries(words)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 20);
            
            const container = document.getElementById('analysis-word-cloud');
            container.innerHTML = '';
            
            sortedWords.forEach(([word, count], index) => {
                const wordElement = document.createElement('span');
                const size = index < 5 ? 'large' : index < 12 ? 'medium' : 'small';
                wordElement.className = `word word-${size}`;
                wordElement.textContent = word;
                wordElement.onclick = () => {
                    document.getElementById('search-input').value = word;
                    performSearch(word);
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.classList.remove('active');
                        if (link.dataset.page === 'for-you') {
                            link.classList.add('active');
                        }
                    });
                    document.querySelectorAll('.page-content').forEach(page => page.classList.remove('active'));
                    document.getElementById('for-you-page').classList.add('active');
                };
                container.appendChild(wordElement);
            });
        }

        // Chart Functions
        function initializeCharts() {
            const sentimentCtx = document.getElementById('sentiment-chart');
            if (sentimentCtx) {
                sentimentChart = new Chart(sentimentCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Positive', 'Negative', 'Neutral'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: ['#10b981', '#ef4444', '#64748b'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 12,
                                    font: { size: 10 }
                                }
                            }
                        }
                    }
                });
            }
            
            const sourceCtx = document.getElementById('source-chart');
            if (sourceCtx) {
                sourceChart = new Chart(sourceCtx.getContext('2d'), {
                    type: 'pie',
                    data: {
                        labels: [],
                        datasets: [{
                            data: [],
                            backgroundColor: ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b', '#10b981', '#6b7280'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom',
                                labels: {
                                    boxWidth: 12,
                                    font: { size: 10 }
                                }
                            }
                        }
                    }
                });
            }
            
            const analysisSentimentCtx = document.getElementById('analysis-sentiment-chart');
            if (analysisSentimentCtx) {
                analysisSentimentChart = new Chart(analysisSentimentCtx.getContext('2d'), {
                    type: 'doughnut',
                    data: {
                        labels: ['Positive', 'Negative', 'Neutral'],
                        datasets: [{
                            data: [0, 0, 0],
                            backgroundColor: ['#10b981', '#ef4444', '#64748b'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { position: 'bottom' }
                        }
                    }
                });
            }
            
            const categoryCtx = document.getElementById('category-chart');
            if (categoryCtx) {
                categoryChart = new Chart(categoryCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Articles',
                            data: [],
                            backgroundColor: '#4f46e5',
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            }
            
            const analysisSourceCtx = document.getElementById('analysis-source-chart');
            if (analysisSourceCtx) {
                analysisSourceChart = new Chart(analysisSourceCtx.getContext('2d'), {
                    type: 'bar',
                    data: {
                        labels: [],
                        datasets: [{
                            label: 'Articles',
                            data: [],
                            backgroundColor: '#7c3aed',
                            borderWidth: 0
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        indexAxis: 'y',
                        plugins: {
                            legend: { display: false }
                        },
                        scales: {
                            x: { beginAtZero: true }
                        }
                    }
                });
            }
        }

        function updateSentimentChart(sentimentCounts) {
            const data = [sentimentCounts.positive, sentimentCounts.negative, sentimentCounts.neutral];
            
            if (sentimentChart) {
                sentimentChart.data.datasets[0].data = data;
                sentimentChart.update();
            }
            
            if (analysisSentimentChart) {
                analysisSentimentChart.data.datasets[0].data = data;
                analysisSentimentChart.update();
            }
        }

        function updateSourceChart(sources) {
            const sortedSources = Object.entries(sources)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6);
            
            const labels = sortedSources.map(([source]) => source.substring(0, 20));
            const data = sortedSources.map(([, count]) => count);
            
            if (sourceChart) {
                sourceChart.data.labels = labels;
                sourceChart.data.datasets[0].data = data;
                sourceChart.update();
            }
            
            if (analysisSourceChart) {
                analysisSourceChart.data.labels = labels;
                analysisSourceChart.data.datasets[0].data = data;
                analysisSourceChart.update();
            }
        }

        function updateCategoryChart(categories) {
            const labels = Object.keys(categories);
            const data = Object.values(categories);
            
            if (categoryChart) {
                categoryChart.data.labels = labels;
                categoryChart.data.datasets[0].data = data;
                categoryChart.update();
            }
        }

        // Utility Functions
        function getSentimentLabel(sentiment) {
    if (sentiment > 0.1) return t('positive');
    if (sentiment < -0.1) return t('negative');
    return t('neutral');
}

        function formatTime(dateString) {
    if (!dateString) return t('recently');
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 60) return `${diffMins} ${t('minutesAgo')}`;
    if (diffHours < 24) return `${diffHours} ${t('hoursAgo')}`;
    if (diffDays < 7) return `${diffDays} ${t('daysAgo')}`;
    return date.toLocaleDateString();
}

        // Event Listeners
        function setupEventListeners() {
            setupLanguageSelector();
            // Auth Modal
            document.getElementById('show-auth-btn').addEventListener('click', () => {
                document.getElementById('auth-overlay').classList.add('active');
            });

            document.getElementById('auth-close').addEventListener('click', () => {
                document.getElementById('auth-overlay').classList.remove('active');
            });

            document.getElementById('show-signup').addEventListener('click', () => {
                document.getElementById('login-form').style.display = 'none';
                document.getElementById('signup-form').style.display = 'block';
            });

            document.getElementById('show-login').addEventListener('click', () => {
                document.getElementById('signup-form').style.display = 'none';
                document.getElementById('login-form').style.display = 'block';
            });

            document.getElementById('login-form-element').addEventListener('submit', handleLogin);
            document.getElementById('signup-form-element').addEventListener('submit', handleSignup);

            // User Menu
            document.getElementById('user-avatar').addEventListener('click', () => {
                document.getElementById('user-dropdown').classList.toggle('active');
            });

            document.getElementById('logout-btn').addEventListener('click', handleLogout);

            // Close user dropdown when clicking outside
            document.addEventListener('click', (e) => {
                const userMenu = document.getElementById('user-menu');
                const userDropdown = document.getElementById('user-dropdown');
                
                if (userMenu && !userMenu.contains(e.target)) {
                    userDropdown.classList.remove('active');
                }

                const authOverlay = document.getElementById('auth-overlay');
                if (e.target === authOverlay) {
                    authOverlay.classList.remove('active');
                }
            });

            // Navigation
            const navLinks = document.querySelectorAll('.nav-link');
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    navLinks.forEach(l => l.classList.remove('active'));
                    this.classList.add('active');
                    
                    const pageId = this.dataset.page + '-page';
                    document.querySelectorAll('.page-content').forEach(page => {
                        page.classList.remove('active');
                    });
                    document.getElementById(pageId).classList.add('active');
                    
                    if (pageId === 'trending-page') {
                        loadTrendingArticles();
                    } else if (pageId === 'for-you-page') {
                        loadNewsFromAPI();
                    }
                });
            });
            
            // Dark mode toggle
            const modeToggle = document.getElementById('mode-toggle');
            const modeLabel = document.getElementById('mode-label');
            
            modeToggle.addEventListener('change', function() {
                document.body.classList.toggle('dark-mode', this.checked);
                modeLabel.textContent = this.checked ? 'Dark Mode' : 'Light Mode';
                localStorage.setItem('darkMode', this.checked);
            });
            
            const savedDarkMode = localStorage.getItem('darkMode') === 'true';
            if (savedDarkMode) {
                modeToggle.checked = true;
                document.body.classList.add('dark-mode');
                modeLabel.textContent = 'Dark Mode';
            }
            
            // Category filters
            const categoryBtns = document.querySelectorAll('.category-btn');
            categoryBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    categoryBtns.forEach(b => b.classList.remove('active'));
                    this.classList.add('active');
                    
                    const category = this.dataset.category;
                    const countrySelect = document.getElementById('country-select');
                    const langSelect = document.getElementById('lang-select');
                    const country = countrySelect ? countrySelect.value : '';
                    const lang = langSelect ? langSelect.value : 'en';
                    
                    loadNewsFromAPI(category, country, lang);
                });
            });
            
            // Country filter
            const countrySelect = document.getElementById('country-select');
            if (countrySelect) {
                countrySelect.addEventListener('change', function() {
                    const categoryBtn = document.querySelector('.category-btn.active');
                    const category = categoryBtn ? categoryBtn.dataset.category : 'all';
                    const langSelect = document.getElementById('lang-select');
                    const lang = langSelect ? langSelect.value : 'en';
                    loadNewsFromAPI(category, this.value, lang);
                });
            }
            
            // Language filter
            const langSelect = document.getElementById('lang-select');
            if (langSelect) {
                langSelect.addEventListener('change', function() {
                    const categoryBtn = document.querySelector('.category-btn.active');
                    const category = categoryBtn ? categoryBtn.dataset.category : 'all';
                    const countrySelect = document.getElementById('country-select');
                    const country = countrySelect ? countrySelect.value : '';
                    loadNewsFromAPI(category, country, this.value);
                });
            }
            
            // Search functionality
            const searchInput = document.getElementById('search-input');
            searchInput.addEventListener('input', debounce(async function() {
                const query = this.value.trim();
                
                if (query.length > 2) {
                    await performSearch(query);
                } else if (query.length === 0) {
                    const categoryBtn = document.querySelector('.category-btn.active');
                    const category = categoryBtn ? categoryBtn.dataset.category : 'all';
                    const countrySelect = document.getElementById('country-select');
                    const langSelect = document.getElementById('lang-select');
                    const country = countrySelect ? countrySelect.value : '';
                    const lang = langSelect ? langSelect.value : 'en';
                    
                    loadNewsFromAPI(category, country, lang);
                }
            }, 500));
            
            // Global click handlers
            document.addEventListener('click', async function(e) {
                // Bookmark button
                if (e.target.closest('.bookmark-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const btn = e.target.closest('.bookmark-btn');
                    const articleId = btn.dataset.articleId;
                    const article = allArticles.find(a => a.id === articleId);
                    
                    if (article) {
                        await toggleBookmark(article, btn);
                    }
                    return;
                }
                
                // Reaction buttons
                if (e.target.closest('.reaction-btn')) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    const btn = e.target.closest('.reaction-btn');
                    const articleId = btn.dataset.articleId;
                    const reactionType = btn.dataset.type;
                    
                    await handleReaction(articleId, reactionType, btn);
                    return;
                }
                
                // Read more buttons
                if (e.target.classList.contains('read-more')) {
                    const url = e.target.dataset.url;
                    if (url && url !== '#') {
                        window.open(url, '_blank');
                    }
                    return;
                }
                
                // Find similar articles button
                if (e.target.classList.contains('find-similar')) {
                    const uri = e.target.dataset.uri;
                    await showSimilarArticles(uri);
                    return;
                }
                
                // Modal close
                if (e.target.classList.contains('modal-close')) {
                    document.getElementById('similar-modal').classList.remove('active');
                    return;
                }
            });
            
            // Close modal when clicking outside
            const modal = document.getElementById('similar-modal');
            modal.addEventListener('click', function(e) {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        }

        async function performSearch(query) {
            const container = document.getElementById('news-container');
            const loading = document.getElementById('news-loading');
            
            loading.style.display = 'flex';
            container.style.display = 'none';
            
            const articles = await searchNews(query);
            
            loading.style.display = 'none';
            container.style.display = 'grid';
            
            await displayNewsArticles(articles, 'news-container');
            if (articles.length > 0) {
                updateAnalytics(articles);
            }
        }

        async function showSimilarArticles(articleUri) {
            const modal = document.getElementById('similar-modal');
            const loading = document.getElementById('similar-loading');
            const list = document.getElementById('similar-articles-list');
            
            modal.classList.add('active');
            loading.style.display = 'flex';
            list.innerHTML = '';
            
            const similarArticles = await findSimilarArticles(articleUri);
            
            loading.style.display = 'none';
            
            if (similarArticles.length === 0) {
                list.innerHTML = '<p class="empty-state">No similar articles found</p>';
                return;
            }
            
            similarArticles.forEach(article => {
                const sentiment = getSentimentLabel(article.sentiment);
                const sentimentEmoji = sentiment === 'Positive' ? '😊' : sentiment === 'Negative' ? '😟' : '😐';
                const similarityPercent = Math.round(article.similarity * 100);
                
                const item = document.createElement('div');
                item.className = 'similar-article';
                item.innerHTML = `
                    <h4 style="font-size: 16px; margin-bottom: 8px;">${article.title}</h4>
                    <p style="font-size: 14px; color: var(--gray); margin-bottom: 8px;">
                        ${article.source} • ${sentimentEmoji} ${sentiment}
                        <span class="similarity-score">${similarityPercent}% similar</span>
                    </p>
                `;
                item.onclick = () => window.open(article.url, '_blank');
                list.appendChild(item);
            });
        }

        // Carousel Functions
        function initializeCarousel() {
            const carousel = document.querySelector('.carousel');
            if (!carousel) return;
            
            const carouselItems = carousel.querySelectorAll('.carousel-item');
            if (carouselItems.length === 0) return;
            
            const prevBtn = document.querySelector('.carousel-prev');
            const nextBtn = document.querySelector('.carousel-next');
            const indicators = document.querySelectorAll('.indicator');
            
            let currentIndex = 0;
            const totalItems = carouselItems.length;
            let startX = 0;
            let currentX = 0;
            let isDragging = false;
            let autoAdvanceInterval;
            
            function updateCarousel() {
                carousel.style.transform = `translateX(-${currentIndex * 100}%)`;
                
                indicators.forEach((indicator, index) => {
                    indicator.classList.toggle('active', index === currentIndex);
                });
            }
            
            function nextSlide() {
                currentIndex = (currentIndex + 1) % totalItems;
                updateCarousel();
            }
            
            function prevSlide() {
                currentIndex = (currentIndex - 1 + totalItems) % totalItems;
                updateCarousel();
            }
            
            function startAutoAdvance() {
                autoAdvanceInterval = setInterval(nextSlide, 5000);
            }
            
            function stopAutoAdvance() {
                clearInterval(autoAdvanceInterval);
            }
            
            if (prevBtn) prevBtn.addEventListener('click', () => {
                prevSlide();
                stopAutoAdvance();
                startAutoAdvance();
            });
            
            if (nextBtn) nextBtn.addEventListener('click', () => {
                nextSlide();
                stopAutoAdvance();
                startAutoAdvance();
            });
            
            carousel.addEventListener('touchstart', (e) => {
                startX = e.touches[0].clientX;
                isDragging = true;
                stopAutoAdvance();
            });
            
            carousel.addEventListener('touchmove', (e) => {
                if (!isDragging) return;
                currentX = e.touches[0].clientX;
                const diff = startX - currentX;
                
                if (Math.abs(diff) > 10) {
                    e.preventDefault();
                }
            });
            
            carousel.addEventListener('touchend', () => {
                if (!isDragging) return;
                
                const diff = startX - currentX;
                const swipeThreshold = 50;
                
                if (diff > swipeThreshold) {
                    nextSlide();
                } else if (diff < -swipeThreshold) {
                    prevSlide();
                }
                
                isDragging = false;
                startAutoAdvance();
            });
            
            carousel.addEventListener('mousedown', (e) => {
                startX = e.clientX;
                isDragging = true;
                stopAutoAdvance();
            });
            
            carousel.addEventListener('mousemove', (e) => {
                if (!isDragging) return;
                currentX = e.clientX;
            });
            
            carousel.addEventListener('mouseup', () => {
                if (!isDragging) return;
                
                const diff = startX - currentX;
                const swipeThreshold = 50;
                
                if (diff > swipeThreshold) {
                    nextSlide();
                } else if (diff < -swipeThreshold) {
                    prevSlide();
                }
                
                isDragging = false;
                startAutoAdvance();
            });
            
            carousel.addEventListener('mouseleave', () => {
                isDragging = false;
            });
            
            indicators.forEach((indicator, index) => {
                indicator.addEventListener('click', () => {
                    currentIndex = index;
                    updateCarousel();
                    stopAutoAdvance();
                    startAutoAdvance();
                });
            });
            
            carousel.addEventListener('mouseenter', stopAutoAdvance);
            carousel.addEventListener('mouseleave', startAutoAdvance);
            
            startAutoAdvance();
        }

        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func.apply(this, args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // ========== AI FEATURES LOGIC ========== 

// AI Summary
let summaryCache = {};
let summaryTimeout;
let hideTimeout;

function initAISummaries() {
    const tooltip = document.getElementById('ai-summary-tooltip');

    document.addEventListener('mouseover', (e) => {
        const card = e.target.closest('.news-card');
        if (card && !card.classList.contains('daily-mix-card')) {
            clearTimeout(hideTimeout);
            if (tooltip.dataset.activeCardId !== card.dataset.articleId) {
                clearTimeout(summaryTimeout);
                summaryTimeout = setTimeout(() => {
                    showAISummary(card, card.dataset.articleId);
                }, 600);
            }
        }
    });

    document.addEventListener('mouseout', (e) => {
        const card = e.target.closest('.news-card');
        if (card && !card.classList.contains('daily-mix-card')) {
            clearTimeout(summaryTimeout);
            hideTimeout = setTimeout(() => {
                hideAISummary();
            }, 300);
        }
    });

    tooltip.addEventListener('mouseover', () => clearTimeout(hideTimeout));
    tooltip.addEventListener('mouseout', () => {
        hideTimeout = setTimeout(() => { hideAISummary(); }, 300);
    });
}

async function showAISummary(card, articleId) {
    const tooltip = document.getElementById('ai-summary-tooltip');
    tooltip.dataset.activeCardId = articleId;

    const cardRect = card.getBoundingClientRect();
    const tooltipWidth = 340;
    const spaceOnRight = window.innerWidth - cardRect.right;
    
    let left = cardRect.right + 15;
    if (spaceOnRight < (tooltipWidth + 20)) {
        left = cardRect.left - tooltipWidth - 15;
    }
    
    tooltip.style.top = `${cardRect.top}px`;
    tooltip.style.left = `${left}px`;

    tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-robot fa-spin"></i> AI Summary</div><div class="ai-summary-loading"><span>Generating...</span><div class="typing-dots"><span class="dot"></span><span class="dot"></span><span class="dot"></span></div></div>`;
    tooltip.classList.add('active');

    try {
        if (summaryCache[articleId]) {
            tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-robot"></i> AI Summary</div><div class="ai-summary-content">${summaryCache[articleId]}</div>`;
            return;
        }

        const response = await fetch(`${API_BASE_URL}/ai/summary`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ articleId })
        });
        const data = await response.json();

        if (data.success) {
            summaryCache[articleId] = data.summary;
            tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-robot"></i> AI Summary</div><div class="ai-summary-content">${data.summary}</div>`;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        tooltip.innerHTML = `<div class="ai-summary-header"><i class="fas fa-exclamation-circle"></i> Summary Error</div><div class="ai-summary-content">${error.message}</div>`;
    }
}

function hideAISummary() {
    const tooltip = document.getElementById('ai-summary-tooltip');
    tooltip.classList.remove('active');
    tooltip.dataset.activeCardId = null;
}

// AI Chatbot
let chatMessages = [];
let isTyping = false;

function initChatbot() {
    const chatButton = document.createElement('div');
    chatButton.className = 'ai-chat-button';
    chatButton.innerHTML = `<i class="fas fa-comments"></i><span class="pulse"></span>`;
    chatButton.onclick = openAIChat;

    const chatWindow = document.createElement('div');
    chatWindow.className = 'ai-chat-window';
    chatWindow.id = 'aiChat';
    chatWindow.innerHTML = `<div class="chat-header"><h3>🤖 NewsPulse AI</h3><button onclick="closeChat()">✕</button></div><div class="chat-messages" id="chatMessages"></div><div class="chat-input"><input type="text" id="chatInput" placeholder="Ask about the news..." onkeypress="if(event.key === 'Enter') sendMessage()"><button onclick="sendMessage()">Send</button></div>`;

    document.body.appendChild(chatButton);
    document.body.appendChild(chatWindow);
}

function openAIChat() {
    const chatWindow = document.getElementById('aiChat');
    chatWindow.classList.add('active');
    if (chatMessages.length === 0) {
        addMessage('bot', 'Hi! 👋 How may I help you with the news today?');
    }
}

function closeChat() {
    document.getElementById('aiChat').classList.remove('active');
}

function addMessage(sender, text) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    const time = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    messageDiv.innerHTML = `${text}<div class="message-time">${time}</div>`;
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    if(sender === 'user') chatMessages.push({ role: 'user', content: text });
    else chatMessages.push({ role: 'assistant', content: text });
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatMessages');
    if(document.getElementById('typingIndicator')) return;
    const typingDiv = document.createElement('div');
    typingDiv.className = 'typing-indicator';
    typingDiv.id = 'typingIndicator';
    typingDiv.innerHTML = `<span class="dot"></span><span class="dot"></span><span class="dot"></span>`;
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) indicator.remove();
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    if (!message || isTyping) return;
    addMessage('user', message);
    input.value = '';
    isTyping = true;
    showTypingIndicator();
    
    try {
        const response = await fetch(`${API_BASE_URL}/ai/chat`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message })
        });
        const data = await response.json();
        removeTypingIndicator();
        if (data.success) {
            addMessage('bot', data.response);
        } else {
            addMessage('bot', data.response || 'Sorry, I encountered an error.');
        }
    } catch (error) {
        removeTypingIndicator();
        addMessage('bot', 'Sorry, connection issues. Please try again.');
    }
    isTyping = false;
}
// ========== END AI FEATURES LOGIC ==========
    


        // Continue with rest of JavaScript (Bookmarks, Reactions, News API, etc.)
        // Due to length limit, I'm providing the structure - the rest remains EXACTLY the same as before
        
        // [REST OF THE JAVASCRIPT CODE REMAINS EXACTLY THE SAME - Include all previous functions for:]
        // - loadUserBookmarks()
        // - toggleBookmark()
        // - handleReaction()
        // - loadUserReaction()
        // - fetchNews()
        // - searchNews()
        // - findSimilarArticles()
        // - loadNewsFromAPI()
        // - displayNewsArticles()
        // - createNewsCard()
        // - loadCarousel()
        // - initializeCarousel()
        // - updateAnalytics()
        // - initializeCharts()
        // - setupEventListeners()
        // - etc.

// [COPY ALL THE REMAINING JAVASCRIPT FROM YOUR WORKING VERSION HERE - Starting from loadUserBookmarks() onwards]
// I cannot include it here due to character limit, but keep ALL existing JavaScript functions as they were
