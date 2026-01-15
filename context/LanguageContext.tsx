
import React, { createContext, useState, useCallback, useEffect } from 'react';

// Import Locale Objects directly
import en from '../locales/en';
import hi from '../locales/hi';
// For others, we can either create .ts files or use a fallback mechanism.
// To keep it simple and working for the demo, we will use EN for others until converted.
const other = en; 

// --- TYPES ---
export type Language = 'en' | 'hi' | 'ta' | 'te' | 'bn' | 'mr' | 'es' | 'fr' | 'ar' | 'pt' | 'de' | 'ru' | 'ja' | 'zh';
export type Currency = 'INR' | 'USD' | 'EUR' | 'SAR' | 'BRL' | 'RUB' | 'JPY' | 'CNY';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
  isRTL: boolean;
  currency: Currency;
  getRegionalPrice: (baseINR: number) => { price: number; symbol: string; display: string };
  isLoading: boolean;
}

// --- DICTIONARIES ---
// Partial translations for regional languages (kept inline for now)
const ta_dict = {
    welcomeToPath: "உங்கள் கண்டுபிடிப்பு பாதை",
    chooseService: "உங்கள் ஆன்மீக பயணத்தைத் தொடங்க ஒரு சேவையைத் தேர்வுசெய்க.",
    matchmaking: "திருமண பொருத்தம்",
    backToHome: "முகப்பு",
    login: "உள்நுழைய",
    logout: "வெளியேறு"
};

const te_dict = {
    welcomeToPath: "మీ ఆవిష్కరణ మార్గం",
    chooseService: "మీ ఆధ్యాత్మిక ప్రయాణాన్ని ప్రారంభించడానికి ఒక సేవను ఎంచుకోండి.",
    matchmaking: "వివాహ పొంతన",
    backToHome: "హోమ్",
    login: "లాగిన్",
    logout: "లాగౌట్"
};

const TRANSLATIONS: Record<string, any> = {
  en: en,
  hi: hi,
  ta: { ...en, ...ta_dict },
  te: { ...en, ...te_dict },
  // Map others to EN for now to prevent crash, can be expanded later
  es: en, fr: en, ar: en, pt: en, de: en, ru: en, ja: en, zh: en, bn: en, mr: en
};

// --- HELPER LOGIC ---
const CURRENCY_MAP: Record<Language, Currency> = {
  en: 'USD', hi: 'INR', ta: 'INR', te: 'INR', bn: 'INR', mr: 'INR',
  es: 'EUR', fr: 'EUR', ar: 'SAR', pt: 'BRL', de: 'EUR', ru: 'RUB',
  ja: 'JPY', zh: 'CNY'
};

const RTL_LANGUAGES = ['ar', 'he'];

export const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const detectLanguage = (): Language => {
    const browserLang = navigator.language.split('-')[0];
    return (TRANSLATIONS[browserLang] ? browserLang : 'en') as Language;
  };

  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('glyph_language') as Language) || detectLanguage();
  });

  const setLanguageCallback = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('glyph_language', lang);
    const dir = RTL_LANGUAGES.includes(lang) ? 'rtl' : 'ltr';
    document.documentElement.dir = dir;
    document.documentElement.lang = lang;
  }, []);

  const t = useCallback((key: string, replacements: Record<string, string> = {}): string => {
    // 1. Get Dictionary
    const dict = TRANSLATIONS[language] || TRANSLATIONS['en'];
    // 2. Get Value or Key as Fallback
    let translation = dict[key] || TRANSLATIONS['en'][key] || key;
    
    // 3. Replace Placeholders
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
        case 'USD': price = 0.99; symbol = '$'; break;
        case 'EUR': price = 0.99; symbol = '€'; break;
        case 'SAR': price = 3.99; symbol = 'ر.س'; break;
        case 'BRL': price = 4.99; symbol = 'R$'; break;
        case 'RUB': price = 99.00; symbol = '₽'; break;
        case 'JPY': price = 150; symbol = '¥'; break;
        case 'CNY': price = 7.00; symbol = '¥'; break;
        default: price = baseINR; symbol = '₹';
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
      getRegionalPrice,
      isLoading: false
    }}>
      {children}
    </LanguageContext.Provider>
  );
};
