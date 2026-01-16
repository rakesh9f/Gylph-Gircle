
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
    rawMetrics: any;
    textReading: string;
}

// --- CHAT CAPABILITY ---
export const createSageSession = (contextReading: string, topic: string) => {
    const ai = getAi();
    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            systemInstruction: `You are Sage Vashishtha, an ancient Vedic Rishi and guide.
            
            CURRENT CONTEXT:
            The user has just received a ${topic} reading.
            Reading Content Summary: "${contextReading.substring(0, 8000)}..."
            
            INSTRUCTIONS:
            1. Answer follow-up questions based on the reading above.
            2. Keep answers concise (under 50 words) unless asked to elaborate.
            3. Use a mystical, compassionate, yet authoritative tone.
            4. Incorporate Sanskrit terms (e.g., Karma, Dharma, Graha, Prana) where appropriate.
            5. If the user asks about something unrelated, gently guide them back to their spiritual path.
            
            Always sign off with a short blessing like "Om Shanti" or "Subham Astu" occasionally.`
        }
    });
};

export const getPalmReading = async (imageFile: File, language: string = 'English'): Promise<PalmMetricResponse> => {
  const ai = getAi();
  const base64Data = await fileToBase64(imageFile);
  
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
        textReading: { type: Type.STRING, description: "Detailed Vedic summary in " + language }
    }
  };

  const prompt = `You are a Vedic Palmistry (Hasta Rekha) expert. Analyze this palm.
  
  REQUIREMENTS:
  1. Identify lines (Life/Jeevan, Head/Matri, Heart/Hridaya) and Mounts (Parvatas).
  2. Return JSON schema.
  3. 'textReading' MUST use **Bullet Points** and **Bold** headers.
  4. Incorporate Vedic terms (e.g., 'Shukra Parvata' for Venus Mount).
  5. Structure: 
     - **Prana & Vitality** (Life Line)
     - **Manas & Intellect** (Head Line)
     - **Bhavana & Emotions** (Heart Line)
     - **Karma & Destiny** (Fate Line)`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ inlineData: { mimeType: imageFile.type, data: base64Data } }, { text: prompt }] },
      config: { responseMimeType: "application/json", responseSchema: schema }
    });
    const json = JSON.parse(response.text || "{}");
    return { rawMetrics: json, textReading: json.textReading || "Analysis complete." };
  } catch (error) {
    throw new Error("Failed to generate reading.");
  }
};

export interface FaceMetricResponse {
    rawMetrics: any;
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
            textReading: { type: Type.STRING, description: "Vedic summary in " + language }
        },
        required: ["forehead", "eyes", "nose", "cheeks", "mouth", "chin", "jaw", "symmetry", "skin", "textReading"]
    };

    const prompt = `You are a Mukha Samudrika (Vedic Face Reading) expert.
    
    1. Analyze face metrics.
    2. 'textReading' MUST be bulleted and structured.
    3. Use Vedic concepts: Three Zones (Triloka), Elements (Tattvas).
    4. Sections: **Intellect (Upper)**, **Emotion (Middle)**, **Willpower (Lower)**.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [{ inlineData: { mimeType: imageFile.type, data: base64Data } }, { text: prompt }] },
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        const json = JSON.parse(response.text || "{}");
        return { rawMetrics: json, textReading: json.textReading || "Analysis complete." };
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
            reading: { type: Type.STRING, description: `Comprehensive bulleted reading in ${lang}` }
        },
        required: ["reading"]
    };

    const context = details.mode === 'astrology' ? 'Vedic Astrology (Jyotish)' : 'Vedic Numerology (Sankhya Sastra)';
    const prompt = `You are a Grand Master in ${context}. 
    User: ${details.name}, DOB: ${details.dob}, Place: ${details.pob}, Time: ${details.tob}. 
    
    Generate a HIGHLY STRUCTURED reading in ${lang}.
    
    FORMATTING RULES:
    1. Use **Bold Headers** for sections.
    2. Use Bullet Points (•) for all details.
    3. Include Sanskrit terms (e.g., Dharma, Artha, Kama, Moksha).
    ${details.mode === 'numerology' ? `
    4. Include a dedicated section **Key Insights** at the very top.
    5. Discuss the Missing Numbers from the birth chart.
    6. Provide a 'Yearly Prediction' for the current year.
    ` : ''}
    
    Sections:
    1. **Key Insights** (Executive Summary)
    2. **Prarabdha Karma** (Destiny & Life Path)
    3. **Svabhava** (Nature & Personality)
    4. **Artha & Karma** (Career & Finance)
    5. **Sambandha** (Relationships)
    6. **Upaya** (Spiritual Remedies)`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        const result = JSON.parse(response.text || "{}");
        return { reading: result.reading || "No response." };
    } catch (error) {
        throw new Error("Failed to generate reading.");
    }
};

export const getTarotReading = async (cardName: string, language: string = 'English'): Promise<string> => {
    const ai = getAi();
    const prompt = `You are a Vedic Tarot Master. Card: "${cardName}".
    
    Provide a reading in ${language}.
    
    FORMAT:
    - **Visual Symbolism (Drishti)**: Bullet points on imagery.
    - **Tattva (Element)**: Fire/Water/Air/Earth connection.
    - **Graha (Planetary Influence)**: Which planet rules this card.
    - **Phala (Prediction)**: What will happen (Love, Career).
    - **Upaya (Guidance)**: Spiritual advice.
    
    Use bullet points strictly.`;

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
    const prompt = `You are a Vedic Guru. User concern: "${concern}".
    
    Provide remedies in ${language}.
    
    FORMAT:
    - **Dosha Analysis**: Which dosha (Vata/Pitta/Kapha) is aggravated?
    - **Mantra Therapy**: Specific mantra to chant.
    - **Gemstone/Yantra**: Recommendation.
    - **Lifestyle (Vihara)**: Practical changes.
    
    Use bullet points.`;

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

export interface DreamAnalysisResponse {
    meaning: string;
    luckyNumbers: number[];
    symbols: string[];
}

export const analyzeDream = async (dreamText: string, language: string = 'English'): Promise<DreamAnalysisResponse> => {
    const ai = getAi();
    const schema = {
        type: Type.OBJECT,
        properties: {
            meaning: { type: Type.STRING, description: "Bulleted interpretation" },
            luckyNumbers: { type: Type.ARRAY, items: { type: Type.INTEGER } },
            symbols: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["meaning", "luckyNumbers", "symbols"]
    };

    const prompt = `You are a Swapna Shastra (Vedic Dream) expert. Dream: "${dreamText}"
    
    1. Interpret using Vedic symbolism.
    2. Identify **Chakra** affected.
    3. Identify **Omen** (Shubha/Ashubha).
    4. Provide 'meaning' in ${language} using bullet points.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
            config: { responseMimeType: "application/json", responseSchema: schema }
        });
        return JSON.parse(response.text || "{}");
    } catch (error) {
        throw new Error("Failed to interpret dream.");
    }
};
