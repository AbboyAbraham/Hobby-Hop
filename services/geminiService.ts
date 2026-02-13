// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("CRITICAL ERROR: API Key is missing! Check Vercel Settings.");
    console.error("VITE_GEMINI_API_KEY is undefined.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects) => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    const text = response.text();
    
    console.log("AI Raw Response:", text); // Check your browser console to see this

    // ROBUST CLEANING: Find the actual JSON array inside the text
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) {
      throw new Error("AI did not return a valid list.");
    }

    const cleanJson = text.substring(jsonStart, jsonEnd);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Generation Failed:", error);
    alert(`AI Error: ${error.message}`); // This will tell you why it failed on screen
    return [];
  }
};
