import { GoogleGenAI } from "@google/genai";
import { Product } from '../types';

// Strict initialization using process.env.API_KEY directly as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateProductDescription = async (productName: string, category: string): Promise<string> => {
  if (!process.env.API_KEY) return "API Key missing for AI generation.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Task: Write a SUPER FUN, EXCITING, and KID-FRIENDLY product description for a toy.
        Product Name: "${productName}"
        Category: "${category}"
        Style: Use emojis 🚀, exciting words, and make it sound like the coolest toy ever. Max 2 short sentences.
      `,
    });
    return response.text ? response.text.trim() : "";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Could not generate description at this time.";
  }
};

export const getGiftRecommendation = async (query: string, availableProducts: Product[]): Promise<string> => {
  if (!process.env.API_KEY) return "I can't access my brain right now! (API Key missing)";

  const productContext = availableProducts.map(p => `${p.name} (₹${p.price}, ${p.category})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        You are "Toy Geni", the most magical and fun shopping assistant for a kids' toy store! 🧞‍♂️✨
        
        Here is our treasure chest of toys:
        ${productContext}

        Friend's Query: "${query}"

        Task: Recommend 1-2 specific toys from our list. Explain why they are AWESOME! Be super enthusiastic, use emojis, and keep it brief (under 50 words). If nothing matches perfectly, suggest the next most fun thing! Prices are in Indian Rupees (₹).
      `,
    });
    return response.text ? response.text.trim() : "I couldn't think of anything to say.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm having trouble thinking of a recommendation right now. Try browsing the categories!";
  }
};