
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getStorageAdvice = async (itemName: string, category: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a very short (max 20 words), practical storage tip in Indonesian for this item: "${itemName}" in category "${category}". Focus on longevity.`,
    });
    return response.text || "Simpan di tempat sejuk dan kering.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Simpan sesuai petunjuk kemasan.";
  }
};
