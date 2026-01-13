
import React, { createContext, useState, useCallback, useEffect } from 'react';

// --- TYPES ---
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'es' | 'fr' | 'ar' | 'pt';
export type Currency = 'INR' | 'USD' | 'EUR' | 'SAR' | 'BRL';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  isRTL: boolean;
  currency: Currency;
  getRegionalPrice: (baseINR: number) => { price: number; symbol: string; display: string };
}

// --- DICTIONARIES ---
const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    welcomeToPath: "Welcome to Your Path",
    chooseService: "Choose a service to begin your mystical journey.",
    tarotReading: "Tarot Reading",
    numerology: "Numerology",
    astrology: "Astrology",
    palmistry: "Palmistry",
    faceReading: "Face Reading",
    backToHome: "Back to Home",
    readMore: "Unlock Full Reading",
    paymentPrompt: "One-time payment of {price}",
    login: "Login",
    logout: "Logout",
    "The Fool": "The Fool",
    "The Magician": "The Magician",
    "The Star": "The Star",
    "The Sun": "The Sun",
    "The Moon": "The Moon"
  },
  hi: {
    welcomeToPath: "आपकी खोज की यात्रा",
    chooseService: "अपनी रहस्यमयी यात्रा शुरू करने के लिए एक सेवा चुनें।",
    tarotReading: "टैरो कार्ड रीडिंग",
    numerology: "अंक ज्योतिष",
    astrology: "वैदिक ज्योतिष",
    palmistry: "हस्तरेखा शास्त्र",
    faceReading: "मुख सामुद्रिक",
    backToHome: "मुख्य पृष्ठ",
    readMore: "पूरी रिपोर्ट देखें",
    paymentPrompt: "केवल {price} का भुगतान करें",
    login: "लॉग इन",
    logout: "लॉग आउट",
    "The Fool": "मूर्ख (The Fool)",
    "The Magician": "जादूगर (The Magician)",
    "The Star": "तारा (The Star)",
    "The Sun": "सूर्य (The Sun)",
    "The Moon": "चंद्रमा (The Moon)"
  },
  ta: {
    welcomeToPath: "உங்கள் கண்டுபிடிப்பு பாதை",
    chooseService: "உங்கள் ஆன்மீக பயணத்தைத் தொடங்க ஒரு சேவையைத் தேர்வுசெய்க.",
    tarotReading: "டாரோட் வாசிப்பு",
    numerology: "எண் கணிதம்",
    astrology: "ஜோதிடம்",
    palmistry: "கைரேகை ஜோதிடம்",
    faceReading: "முக வாசிப்பு",
    backToHome: "முகப்பு",
    readMore: "முழு அறிக்கை",
    paymentPrompt: "கட்டணம் {price} மட்டும்",
    login: "உள்நுழைய",
    logout: "வெளியேறு",
    "The Fool": "முட்டாள்",
    "The Magician": " மந்திரவாதி",
    "The Star": "நட்சத்திரம்",
    "The Sun": "சூரியன்",
    "The Moon": "நிலவு"
  },
  te: {
    welcomeToPath: "మీ ఆవిష్కరణ మార్గం",
    chooseService: "మీ ఆధ్యాత్మిక ప్రయాణాన్ని ప్రారంభించడానికి ఒక సేవను ఎంచుకోండి.",
    tarotReading: "టారో రీడింగ్",
    numerology: "సంఖ్యాశాస్త్రం",
    astrology: "జ్యోతిష్యం",
    palmistry: "హస్త సాముద్రికం",
    faceReading: "ముఖ పఠనం",
    backToHome: "హోమ్",
    readMore: "పూర్తి నివేదిక",
    paymentPrompt: "చెల్లింపు {price} మాత్రమే",
    login: "లాగిన్",
    logout: "లాగౌట్",
    "The Fool": "ది ఫూల్",
    "The Magician": "మాంత్రికుడు",
    "The Star": "నక్షత్రం",
    "The Sun": "సూర్యుడు",
    "The Moon": "చంద్రుడు"
  },
  bn: {
    welcomeToPath: "আপনার আবিষ্কারের পথ",
    chooseService: "আপনার রহস্যময় যাত্রা শুরু করতে একটি পরিষেবা বেছে নিন।",
    tarotReading: "ট্যারোট রিডিং",
    numerology: "সংখ্যা তত্ত্ব",
    astrology: "জ্যোতিষশাস্ত্র",
    palmistry: "হস্তরেখা বিচার",
    faceReading: "মুখ দেখে বিচার",
    backToHome: "হোম",
    readMore: "সম্পূর্ণ রিপোর্ট",
    paymentPrompt: "মুল্য {price} মাত্র",
    login: "লগইন",
    logout: "লগআউট",
    "The Fool": "বোকা (The Fool)",
    "The Magician": "জাদুকর",
    "The Star": "তারা",
    "The Sun": "সূর্য",
    "The Moon": "চাঁদ"
  },
  mr: {
    welcomeToPath: "तुमचा शोधाचा मार्ग",
    chooseService: "तुमचा आध्यात्मिक प्रवास सुरू करण्यासाठी सेवा निवडा.",
    tarotReading: "टॅरो वाचन",
    numerology: "अंकशास्त्र",
    astrology: "ज्योतिष",
    palmistry: "हस्तरेषा",
    faceReading: "चेहरा वाचन",
    backToHome: "मुख्यपृष्ठ",
    readMore: "पूर्ण अहवाल",
    paymentPrompt: "किंमत फक्त {price}",
    login: "लॉग इन",
    logout: "लॉग आउट",
    "The Fool": "मूर्ख (The Fool)",
    "The Magician": "जादूगार",
    "The Star": "तारा",
    "The Sun": "सूर्य",
    "The Moon": "चंद्र"
  },
  es: {
    welcomeToPath: "Tu Camino de Descubrimiento",
    chooseService: "Elige un servicio para comenzar tu viaje místico.",
    tarotReading: "Lectura de Tarot",
    numerology: "Numerología",
    astrology: "Astrología",
    palmistry: "Quiromancia",
    faceReading: "Lectura de Rostro",
    backToHome: "Volver",
    readMore: "Desbloquear",
    paymentPrompt: "Pago único de {price}",
    login: "Acceso",
    logout: "Salir",
    "The Fool": "El Loco",
    "The Magician": "El Mago",
    "The Star": "La Estrella",
    "The Sun": "El Sol",
    "The Moon": "La Luna"
  },
  fr: {
    welcomeToPath: "Votre Chemin de Découverte",
    chooseService: "Choisissez un service pour commencer votre voyage mystique.",
    tarotReading: "Lecture de Tarot",
    numerology: "Numérologie",
    astrology: "Astrologie",
    palmistry: "Chiromancie",
    faceReading: "Lecture du Visage",
    backToHome: "Retour",
    readMore: "Débloquer",
    paymentPrompt: "Paiement unique de {price}",
    login: "Connexion",
    logout: "Déconnexion",
    "The Fool": "Le Fou",
    "The Magician": "Le Magicien",
    "The Star": "L'Étoile",
    "The Sun": "Le Soleil",
    "The Moon": "La Lune"
  },
  ar: {
    welcomeToPath: "مسار اكتشافك",
    chooseService: "اختر خدمة لبدء رحلتك الصوفية.",
    tarotReading: "قراءة التارو",
    numerology: "علم الأعداد",
    astrology: "علم التنجيم",
    palmistry: "قراءة الكف",
    faceReading: "قراءة الوجه",
    backToHome: "عودة",
    readMore: "فتح القراءة الكاملة",
    paymentPrompt: "دفع لمرة واحدة {price}",
    login: "تسجيل الدخول",
    logout: "خروج",
    "The Fool": "الأبله",
    "The Magician": "الساحر",
    "The Star": "النجم",
    "The Sun": "الشمس",
    "The Moon": "القمر"
  },
  pt: {
    welcomeToPath: "Seu Caminho de Descoberta",
    chooseService: "Escolha um serviço para iniciar sua jornada mística.",
    tarotReading: "Leitura de Tarô",
    numerology: "Numerologia",
    astrology: "Astrologia",
    palmistry: "Quiromancia",
    faceReading: "Leitura Facial",
    backToHome: "Voltar",
    readMore: "Desbloquear",
    paymentPrompt: "Pagamento único de {price}",
    login: "Entrar",
    logout: "Sair",
    "The Fool": "O Louco",
    "The Magician": "O Mago",
    "The Star": "A Estrela",
    "The Sun": "O Sol",
    "The Moon": "A Lua"
  }
};

// --- HELPER LOGIC ---
const CURRENCY_MAP: Record<Language, Currency> = {
  en: 'USD',
  hi: 'INR',
  ta: 'INR',
  te: 'INR',
  bn: 'INR',
  mr: 'INR',
  es: 'EUR',
  fr: 'EUR',
  ar: 'SAR',
  pt: 'BRL'
};

const RTL_LANGUAGES = ['ar', 'he'];

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Auto-detect browser language
  const detectLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang in TRANSLATIONS) return browserLang as Language;
    return 'en'; // Default
  };

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('glyph_language') as Language) || detectLanguage();
  });

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('glyph_language', lang);
    
    // Set Document Direction
    const dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, []);

  // Update effect for initial load
  useEffect(() => {
    const dir = RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
  }, [language]);

  const t = useCallback((key: string, replacements: Record<string, string> = {}): string => {
    let translation = TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;
    
    // Fallback for Tarot cards not explicitly listed in minimal dictionary
    if (!TRANSLATIONS[language]?.[key] && key.startsWith('The ')) {
       // Keep English for unlisted cards in non-English to avoid breakage
       translation = key; 
    }

    Object.keys(replacements).forEach(placeholder => {
        translation = translation.replace(`{${placeholder}}`, replacements[placeholder]);
    });
    return translation;
  }, [language]);

  const getRegionalPrice = useCallback((baseINR: number) => {
    const currency = CURRENCY_MAP[language];
    let price = baseINR;
    let symbol = '₹';

    switch (currency) {
        case 'USD':
            price = 0.99; // Fixed tier
            symbol = '$';
            break;
        case 'EUR':
            price = 0.99;
            symbol = '€';
            break;
        case 'SAR':
            price = 3.99;
            symbol = 'ر.س';
            break;
        case 'BRL':
            price = 4.99;
            symbol = 'R$';
            break;
        default: // INR
            price = baseINR;
            symbol = '₹';
    }

    return {
        price,
        symbol,
        display: language === 'ar' ? `${price} ${symbol}` : `${symbol}${price}`
    };
  }, [language]);

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage: setLanguageCallback, 
      t,
      isRTL: RTL_LANGUAGES.includes(language),
      currency: CURRENCY_MAP[language],
      getRegionalPrice
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
