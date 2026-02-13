// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("CRITICAL: API Key is missing in Vercel!");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects) => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  
  // CHANGED: We are using 'gemini-pro' because it is the most stable and available model.
  // If 'flash' gives you a 404, this is the fix.
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `
    You are a hobby expert.
    The user likes: ${existingHobbies || "Nothing yet"}.
    
    Suggest 5 new hobbies.
    Return ONLY a raw JSON array. Do not use Markdown blocks.
    
    JSON Format:
    [
      {
        "title": "Hobby Name",
        "description": "Short description",
        "estimatedCost": "$20-50",
        "difficulty": "Beginner",
        "tags": ["Creative", "Relaxing"]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean text (Gemini Pro loves adding markdown, so we strip it)
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse JSON
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    
    if (jsonStart === -1) throw new Error("Invalid JSON format");
    
    const cleanJson = text.substring(jsonStart, jsonEnd);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Gemini Error:", error);
    alert(`AI Error: ${error.message}`);
    return [];
  }
};
