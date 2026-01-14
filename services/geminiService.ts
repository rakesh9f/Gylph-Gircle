
import { GoogleGenAI, Type } from "@google/genai";

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

export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<string> => {
  const ai = getAi();
  const base64Data = await fileToBase64(imageFile);
  
  const prompt = `You are an expert Vedic palm reader. Analyze this image of a palm. Provide a short, insightful 2-3 line reading focusing on heart, head, and life lines. 
  
  CRITICAL RULES:
  1. Output STRICTLY in ${language} language.
  2. Do NOT use markdown headers (like # or ##).
  3. Use **Bold** for key terms only.`;

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

export const getFaceReading = async (imageFile: File, language: string = 'English'): Promise<string> => {
    const ai = getAi();
    const base64Data = await fileToBase64(imageFile);

    const prompt = `You are an expert physiognomist. Analyze this face image. Provide a short 2-3 line personality insight based on features.
    
    CRITICAL RULES:
    1. Output STRICTLY in ${language} language.
    2. Do NOT use markdown headers (like # or ##).
    3. Use **Bold** for key terms only.`;

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
    language?: string;
}

export const getAstroNumeroReading = async (details: AstroNumeroDetails): Promise<{ reading: string; chartData?: any }> => {
    const ai = getAi();
    const lang = details.language || 'English';
    
    // Schema definition for structured output
    const schema = {
        type: Type.OBJECT,
        properties: {
            reading: {
                type: Type.STRING,
                description: "A comprehensive, structured reading formatted in clean text with bold highlights."
            },
            // For Astrology: Return planetary positions for 12 houses
            houses: {
                type: Type.OBJECT,
                description: "Map of House numbers (1-12) to list of planets in that house. Only for astrology mode.",
                properties: {
                    "1": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "2": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "3": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "4": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "5": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "6": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "7": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "8": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "9": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "10": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "11": { type: Type.ARRAY, items: { type: Type.STRING } },
                    "12": { type: Type.ARRAY, items: { type: Type.STRING } },
                }
            }
        },
        required: ["reading"]
    };

    const context = details.mode === 'astrology' ? 'Vedic Astrology Kundali' : 'Numerology';
    const prompt = `You are a Grand Master in ${context}. 
    User Details: Name: ${details.name}, DOB: ${details.dob}, Place: ${details.pob}, Time: ${details.tob}. 
    
    Generate a HIGHLY DETAILED and INSIGHTFUL reading.
    
    CRITICAL RULES:
    1. Output STRICTLY in ${lang} language.
    2. Do NOT use markdown headers (like #, ##, ###).
    3. Use **Bold** for Section Titles and key terms.
    4. Format with clear paragraph breaks.
    
    Structure the reading into these sections (Titles in Bold):
    1. Core Essence & Personality
    2. Key Strengths
    3. Challenges
    4. Predictions for the coming year
    5. Spiritual Advice
    
    ${details.mode === 'astrology' ? 'Also calculate/estimate the North Indian chart planetary positions (Sun, Moon, Mars, Mercury, Jupiter, Venus, Saturn, Rahu, Ketu) in the 12 houses based on the date and time provided.' : ''}`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        
        const result = JSON.parse(response.text || "{}");
        return {
            reading: result.reading || "No response.",
            chartData: result.houses
        };
    } catch (error) {
        console.error(error);
        throw new Error("Failed to generate reading.");
    }
};

export const getTarotReading = async (cardName: string, language: string = 'English'): Promise<string> => {
    const ai = getAi();
    const prompt = `You are a mystical tarot reader. Provide a detailed interpretation for the "${cardName}" card. Cover its general meaning, love, career, and advice. 
    
    CRITICAL RULES:
    1. Output STRICTLY in ${language} language.
    2. Do NOT use markdown headers (like #).
    3. Use **Bold** for titles.`;

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

export const getRemedy = async (concern: string, language: string = 'English'): Promise<string> => {
    const ai = getAi();
    const prompt = `You are a wise spiritual guide. The user has this concern: "${concern}". Provide a detailed and comforting Vedic remedy, mantra, and practical guidance.
    
    CRITICAL RULES:
    1. Output STRICTLY in ${language} language.
    2. Do NOT use markdown headers (like #).
    3. Use **Bold** for titles.`;

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
