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
  
  // We use the most standard model name. 
  // If this fails with 404, the API Key permissions are definitely the issue.
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Suggest 5 hobbies based on: ${existingHobbies}.
    Return raw JSON array with title, description, estimatedCost, difficulty, tags.
    No markdown.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean text
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Parse JSON
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    if (jsonStart === -1) throw new Error("Invalid JSON format");
    
    return JSON.parse(text.substring(jsonStart, jsonEnd));

  } catch (error) {
    console.error("Gemini Error:", error);
    
    // EXPLAINING THE ERROR TO YOU
    if (error.message.includes("404")) {
      alert("Error 404: AI Error ");
    } else if (error.message.includes("429")) {
      alert("Error 429: You have hit the AI Studio API Free Tier Limit! Wait 60 seconds and try again.");
    } else {
      alert(`Unknown Error: ${error.message}`);
    }
    return [];
  }
};
