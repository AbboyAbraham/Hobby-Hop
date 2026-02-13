// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  const rawKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!rawKey) {
    alert("CRITICAL: API Key is missing in Vercel!");
    return null;
  }
  // SAFETY FIX: Remove accidental spaces from copy-pasting
  const apiKey = rawKey.trim();
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects) => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  
  // Use the standard Flash model
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
    let text = response.text();
    
    // Clean up response
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Extract JSON array
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    
    if (jsonStart === -1 || jsonEnd === 0) throw new Error("AI returned invalid data");
    
    const cleanJson = text.substring(jsonStart, jsonEnd);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("AI Error:", error);
    // This alert will now show the EXACT reason from Google
    alert(`Google AI Error: ${error.message}`);
    return [];
  }
};
