import { GoogleGenAI } from "@google/genai";
import { Meal } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key missing");
  return new GoogleGenAI({ apiKey });
};

export const GeminiService = {
  getChefTips: async (meal: Meal): Promise<string> => {
    try {
      const client = getClient();
      const prompt = `
        You are a world-class Michelin star chef. 
        I am preparing "${meal.strMeal}". 
        The category is ${meal.strCategory} and the cuisine is ${meal.strArea}.
        
        Please provide:
        1. A brief, appetizing description of this dish.
        2. Three professional "Chef's Secrets" or tips to make this specific recipe taste better or look more professional.
        3. A recommended wine or beverage pairing with a short explanation why.
        
        Keep the tone encouraging and professional. Format with clear Markdown headings.
      `;

      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      return response.text || "Sorry, the chef is busy right now!";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "I couldn't reach the chef right now. Please check your API key configuration.";
    }
  },

  askChef: async (question: string, contextMealName?: string): Promise<string> => {
    try {
        const client = getClient();
        let prompt = `You are a helpful culinary assistant. Answer the following question: "${question}"`;
        if (contextMealName) {
            prompt += `\nContext: The user is currently viewing the recipe for "${contextMealName}".`;
        }

        const response = await client.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text || "I have no words for that.";
    } catch (error) {
        console.error("Gemini Error:", error);
        return "Service unavailable.";
    }
  }
};