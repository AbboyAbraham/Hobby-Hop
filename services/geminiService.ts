// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("CRITICAL ERROR: API Key is missing! Check Vercel Settings.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects) => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  
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

  // RETRY LOGIC: Try Flash-001 first, then fallback to Pro
  try {
    // Attempt 1: Specific Flash Version
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-001" });
    const result = await model.generateContent(prompt);
    return parseResponse(result);
  } catch (error) {
    console.warn("Flash model failed, trying fallback...", error);
    
    try {
      // Attempt 2: Fallback to Gemini Pro (The "Old Reliable")
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const fallbackResult = await fallbackModel.generateContent(prompt);
      return parseResponse(fallbackResult);
    } catch (finalError) {
      console.error("All AI models failed:", finalError);
      alert("AI Service is temporarily unavailable. Please check your API Key limits.");
      return [];
    }
  }
};

// Helper to clean messy AI responses
const parseResponse = async (result) => {
  const response = await result.response;
  let text = response.text();
  
  // Remove markdown code blocks if present
  text = text.replace(/```json/g, '').replace(/```/g, '').trim();
  
  // Find the JSON array brackets to ignore any extra text
  const jsonStart = text.indexOf('[');
  const jsonEnd = text.lastIndexOf(']') + 1;
  
  if (jsonStart === -1 || jsonEnd === 0) return [];
  
  const cleanJson = text.substring(jsonStart, jsonEnd);
  return JSON.parse(cleanJson);
};
