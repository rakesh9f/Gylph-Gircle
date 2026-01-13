
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
      // Remove the data URL prefix e.g. "data:image/png;base64,"
      resolve(result.split(',')[1]);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getPalmReading = async (imageFile: File): Promise<string> => {
  const ai = getAi();
  const base64Data = await fileToBase64(imageFile);
  const imagePart = {
    inlineData: {
      mimeType: imageFile.type,
      data: base64Data,
    },
  };

  const textPart = {
    text: "You are an expert palm reader with knowledge of ancient Vedic traditions. Analyze this image of a palm and provide a short, insightful 2-3 line palmistry reading. Focus on the main lines like the heart line, head line, and life line. Keep the tone mystical and encouraging."
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });
    
    if (response.text) {
        return response.text;
    } else {
        throw new Error("The model did not return a valid response.");
    }

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate reading from the AI model.");
  }
};

export const getFaceReading = async (imageFile: File): Promise<string> => {
    const ai = getAi();
    const base64Data = await fileToBase64(imageFile);
    const imagePart = {
        inlineData: {
            mimeType: imageFile.type,
            data: base64Data,
        },
    };

    const textPart = {
        text: "You are an expert in physiognomy (face reading) with knowledge of ancient Vedic traditions. Analyze this image of a face and provide a short, insightful 2-3 line face reading. Focus on key features like eyes, nose, forehead, and chin. Keep the tone mystical and encouraging."
    };

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: { parts: [imagePart, textPart] },
        });

        if (response.text) {
            return response.text;
        } else {
            throw new Error("The model did not return a valid response.");
        }

    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate reading from the AI model.");
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
    
    const prompt = details.mode === 'astrology'
      ? `You are an expert Vedic astrologer. Based on the following details, provide a short, 2-3 line summary for a Kundali chart. Name: ${details.name}, Date of Birth: ${details.dob}, Place of Birth: ${details.pob}, Time of Birth: ${details.tob}. Keep the tone mystical and encouraging.`
      : `You are an expert numerologist. Based on the following details, provide a short, 2-3 line summary for a numerology chart. Name: ${details.name}, Date of Birth: ${details.dob}, Place of Birth: ${details.pob}, Time of Birth: ${details.tob}. Focus on the Life Path Number and Destiny Number. Keep the tone mystical and encouraging.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        if (response.text) {
            return response.text;
        } else {
            throw new Error("The model did not return a valid response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate reading from the AI model.");
    }
};

export const getTarotReading = async (cardName: string): Promise<string> => {
    const ai = getAi();
    const prompt = `You are a mystical tarot reader. Provide a short, 2-3 line interpretation for the "${cardName}" card. Focus on its core meaning and offer a piece of wisdom.`;

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        if (response.text) {
            return response.text;
        } else {
            throw new Error("The model did not return a valid response.");
        }
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to generate reading from the AI model.");
    }
};