
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

export interface PalmMetricResponse {
    rawMetrics: any; // The PalmInput structure
    textReading: string;
}

export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<PalmMetricResponse> => {
  const ai = getAi();
  const base64Data = await fileToBase64(imageFile);
  
  // Define Schema for Structured Extraction
  const schema = {
    type: Type.OBJECT,
    properties: {
        handType: { type: Type.STRING, enum: ['Elementary', 'Square', 'Conic', 'Pointed', 'Mixed'] },
        lines: {
            type: Type.OBJECT,
            properties: {
                life: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, clarity: { type: Type.NUMBER }, breaks: { type: Type.NUMBER }, islands: { type: Type.NUMBER }, forks: { type: Type.NUMBER } } },
                head: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, clarity: { type: Type.NUMBER }, breaks: { type: Type.NUMBER }, islands: { type: Type.NUMBER }, forks: { type: Type.NUMBER } } },
                heart: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, clarity: { type: Type.NUMBER }, breaks: { type: Type.NUMBER }, islands: { type: Type.NUMBER }, forks: { type: Type.NUMBER } } },
                fate: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, clarity: { type: Type.NUMBER }, breaks: { type: Type.NUMBER }, islands: { type: Type.NUMBER }, forks: { type: Type.NUMBER } } },
                sun: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, depth: { type: Type.NUMBER }, clarity: { type: Type.NUMBER }, breaks: { type: Type.NUMBER }, islands: { type: Type.NUMBER }, forks: { type: Type.NUMBER } } }
            }
        },
        mounts: {
            type: Type.OBJECT,
            properties: {
                jupiter: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } },
                saturn: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } },
                apollo: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } },
                mercury: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } },
                venus: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } },
                moon: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } },
                mars: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, firmness: { type: Type.NUMBER } } }
            }
        },
        fingers: {
            type: Type.OBJECT,
            properties: {
                thumbIndexRatio: { type: Type.STRING, enum: ['Long', 'Short', 'Equal'] }
            }
        },
        marks: { type: Type.ARRAY, items: { type: Type.STRING } },
        textReading: { type: Type.STRING, description: "A summary reading in " + language }
    }
  };

  const prompt = `You are a Vedic Palmistry expert. Analyze this palm image. 
  1. Estimate scores (0-10) for major lines (Length, Depth, Clarity).
  2. Estimate mount prominence (Height, Firmness/Fullness 0-10).
  3. Identify any special marks like Triangle, Star, Island, etc.
  4. Provide a structured JSON response fitting the schema.
  5. Also provide a 'textReading' in ${language}. 
     - **CRITICAL**: Do NOT use a single paragraph. 
     - Use Markdown formatting.
     - Use bullet points for key traits.
     - Surround important terms or predictions with **double asterisks** for bold highlighting.
     - Structure it as: Vitality (Life Line), Mindset (Head Line), Emotions (Heart Line), and Destiny (Fate Line).
  
  Assume 'length' 10 is very long (reaching end of palm), 'depth' 10 is very deep cut.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { 
          parts: [
              { inlineData: { mimeType: imageFile.type, data: base64Data } }, 
              { text: prompt }
          ] 
      },
      config: {
          responseMimeType: "application/json",
          responseSchema: schema
      }
    });
    
    const json = JSON.parse(response.text || "{}");
    return {
        rawMetrics: json,
        textReading: json.textReading || "Analysis complete."
    };
  } catch (error) {
    console.error(error);
    throw new Error("Failed to generate reading.");
  }
};

export interface FaceMetricResponse {
    rawMetrics: any; // FaceMetrics structure
    textReading: string;
}

export const getFaceReading = async (imageFile: File, language: string = 'English'): Promise<FaceMetricResponse> => {
    const ai = getAi();
    const base64Data = await fileToBase64(imageFile);

    const schema = {
        type: Type.OBJECT,
        properties: {
            forehead: { type: Type.OBJECT, properties: { height: { type: Type.NUMBER }, width: { type: Type.NUMBER }, wrinkles: { type: Type.NUMBER }, shape: { type: Type.STRING, enum: ['High/Broad', 'Low/Narrow', 'Rounded', 'Square'] } } },
            eyes: { type: Type.OBJECT, properties: { size: { type: Type.NUMBER }, spacing: { type: Type.STRING, enum: ['Wide', 'Close', 'Normal'] }, shape: { type: Type.STRING, enum: ['Almond', 'Round', 'Deep-set', 'Protruding'] } } },
            nose: { type: Type.OBJECT, properties: { length: { type: Type.NUMBER }, width: { type: Type.NUMBER }, shape: { type: Type.STRING, enum: ['Straight', 'Hooked', 'Bulbous', 'Snub'] } } },
            cheeks: { type: Type.OBJECT, properties: { prominence: { type: Type.NUMBER } } },
            mouth: { type: Type.OBJECT, properties: { lipFullness: { type: Type.NUMBER } } },
            chin: { type: Type.OBJECT, properties: { shape: { type: Type.STRING, enum: ['Round', 'Square', 'Pointed', 'Receding'] }, prominence: { type: Type.NUMBER } } },
            jaw: { type: Type.OBJECT, properties: { strength: { type: Type.NUMBER }, type: { type: Type.STRING, enum: ['Square/Strong', 'Round/Soft', 'Pointed'] } } },
            symmetry: { type: Type.NUMBER },
            skin: { type: Type.OBJECT, properties: { texture: { type: Type.NUMBER } } },
            textReading: { type: Type.STRING, description: "A structured Vedic summary in " + language }
        },
        required: ["forehead", "eyes", "nose", "cheeks", "mouth", "chin", "jaw", "symmetry", "skin", "textReading"]
    };

    const prompt = `You are a Mukha Samudrika Shastra (Vedic Face Reading) expert. Analyze this face image.
    
    1. Estimate facial metrics on a 0-10 scale (where 10 is very prominent/large/strong).
    2. Estimate Symmetry score (0-100).
    3. Identify Shapes (Forehead, Nose, Jaw, etc.).
    4. Return a structured JSON matching the schema exactly.
    5. Also provide a 'textReading' in ${language}.
       - Use Markdown with **Bold** terms.
       - Focus on the 3 Zones: Mental (Forehead), Emotional (Eyes/Nose), Practical (Mouth/Jaw).`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { 
                parts: [
                    { inlineData: { mimeType: imageFile.type, data: base64Data } },
                    { text: prompt }
                ] 
            },
            config: {
                responseMimeType: "application/json",
                responseSchema: schema
            }
        });
        const json = JSON.parse(response.text || "{}");
        return {
            rawMetrics: json,
            textReading: json.textReading || "Analysis complete."
        };
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
    
    const schema = {
        type: Type.OBJECT,
        properties: {
            reading: {
                type: Type.STRING,
                description: `A comprehensive, structured reading in ${lang} language. Use bullet points for lists.`
            }
        },
        required: ["reading"]
    };

    const context = details.mode === 'astrology' ? 'Vedic Astrology Kundali' : 'Numerology';
    const prompt = `You are a Grand Master in ${context}. 
    User Details: Name: ${details.name}, DOB: ${details.dob}, Place: ${details.pob}, Time: ${details.tob}. 
    
    Generate a HIGHLY DETAILED and INSIGHTFUL reading.
    
    CRITICAL INSTRUCTIONS FOR LANGUAGE AND FORMAT:
    1. **LANGUAGE**: The entire output MUST be in **${lang}**. Do not use English unless the user name is English.
    2. **FORMAT**: Structure the text using clear paragraphs and bullet points.
    3. **HEADERS**: Use **Bold** syntax (double asterisks) for Section Titles. Do NOT use markdown headers (#).
    4. **LISTS**: Use the bullet character '•' for list items to ensure proper formatting.

    Structure the reading into these sections (Titles in Bold):
    1. **Core Essence & Personality**
    2. **Key Strengths** (Use bullet points)
    3. **Challenges** (Use bullet points)
    4. **Predictions for the coming year**
    5. **Spiritual Advice**
    
    ${details.mode === 'astrology' ? 'Focus on the interpretation of the chart based on the provided birth details.' : ''}`;

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
