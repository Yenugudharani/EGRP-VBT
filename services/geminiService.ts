import { GoogleGenAI } from "@google/genai";

// IMPORTANT: Ideally, this key comes from a secure backend. 
// For this frontend-only demo, we rely on the environment variable being set in the user's build environment.
const apiKey = process.env.API_KEY || '';

export const analyzeGrievance = async (description: string, subject: string): Promise<string> => {
  if (!apiKey) {
    return "API Key not configured. Unable to perform AI analysis.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const prompt = `
      You are an expert academic administrator assistant. 
      Analyze the following student grievance description regarding the subject "${subject}".
      
      Description: "${description}"
      
      Please provide a concise summary (max 2 sentences) and a recommended initial action for the administrator.
      Format: "Summary: [Summary]. Recommendation: [Action]."
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "Could not generate analysis.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI service.";
  }
};
