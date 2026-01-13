
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAi = (): GoogleGenAI => {
  if (ai) {
    return ai;
  }
  if (!process.env.API_KEY) {
      throw new Error("API_KEY environment variable not set.");
  }
  ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai;
}

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

// Helper to get language context safely without React hooks
const getLanguageContext = () => {
    const langCode = localStorage.getItem('glyph_language') || 'en';
    const langMap: Record<string, string> = {
        en: 'English',
        hi: 'Hindi',
        ta: 'Tamil',
        te: 'Telugu',
        bn: 'Bengali',
        mr: 'Marathi',
        es: 'Spanish',
        fr: 'French',
        ar: 'Arabic',
        pt: 'Portuguese'
    };
    return langMap[langCode] || 'English';
};

export const getPalmReading = async (imageFile: File): Promise<string> => {
  const ai = getAi();
  const base64Data = await fileToBase64(imageFile);
  const lang = getLanguageContext();
  
  const prompt = `You are an expert Vedic palm reader. Analyze this image of a palm. Provide a short, insightful 2-3 line reading focusing on heart, head, and life lines. IMPORTANT: Provide the response in ${lang} language.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
          parts: [
              { inlineData: { mimeType: imageFile.type, data: base64Data } }, 
              { text: prompt }
          ] 
      },
    });
    return response.text || "No response generated.";
  } catch (error) {
    throw new Error("Failed to generate reading.");
  }
};

export const getFaceReading = async (imageFile: File): Promise<string> => {
    const ai = getAi();
    const base64Data = await fileToBase64(imageFile);
    const lang = getLanguageContext();

    const prompt = `You are an expert physiognomist. Analyze this face image. Provide a short 2-3 line personality insight based on features. IMPORTANT: Provide the response in ${lang} language.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { 
                parts: [
                    { inlineData: { mimeType: imageFile.type, data: base64Data } },
                    { text: prompt }
                ] 
            },
        });
        return response.text || "No response generated.";
    } catch (error) {
        throw new Error("Failed to generate reading.");
    }
};

interface AstroNumeroDetails {
    mode: 'numerology' | 'astrology';
    name: string;
    dob: string;
    pob: string;
    tob: string;
}

export const getAstroNumeroReading = async (details: AstroNumeroDetails): Promise<string> => {
    const ai = getAi();
    const lang = getLanguageContext();
    
    const context = details.mode === 'astrology' ? 'Vedic Astrology Kundali' : 'Numerology';
    const prompt = `You are an expert in ${context}. Details: Name: ${details.name}, DOB: ${details.dob}, Place: ${details.pob}, Time: ${details.tob}. Provide a short, mystical 2-3 line summary. IMPORTANT: Provide the response in ${lang} language.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "No response.";
    } catch (error) {
        throw new Error("Failed to generate reading.");
    }
};

export const getTarotReading = async (cardName: string): Promise<string> => {
    const ai = getAi();
    const lang = getLanguageContext();
    const prompt = `You are a mystical tarot reader. Provide a short, 2-3 line interpretation for the "${cardName}" card. Focus on its core meaning. IMPORTANT: Provide the response in ${lang} language.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "No response.";
    } catch (error) {
        throw new Error("Failed to generate reading.");
    }
};

export const getRemedy = async (concern: string): Promise<string> => {
    const ai = getAi();
    const lang = getLanguageContext();
    const prompt = `You are a wise spiritual guide. The user has this concern: "${concern}". Provide a short, comforting Vedic remedy or guidance (2-3 lines). IMPORTANT: Provide the response in ${lang} language.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });
        return response.text || "No response.";
    } catch (error) {
        throw new Error("Failed to generate guidance.");
    }
};
