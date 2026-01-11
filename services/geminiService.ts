import { GoogleGenAI } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateMarketingPlan = async (goals: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Marketing roadmap for goals: ${goals}`,
  });
  return response.text || "Failed to generate marketing plan.";
};
