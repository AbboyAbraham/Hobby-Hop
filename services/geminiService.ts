import { GoogleGenerativeAI } from "@google/generative-ai";
import { Project, ExploreSuggestion } from '../types';

const getClient = () => {
  // @ts-ignore - Ignores potential env variable issues
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will not work.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects: Project[]): Promise<ExploreSuggestion[]> => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.name).join(", ");
  
  // FIXED: Removed 'responseMimeType' and 'responseSchema' which were causing the crash
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
  });

  const prompt = `
    You are an expert Creative Consultant for a hobby app.
    The user is currently doing these projects: ${existingHobbies || "None yet"}.
    
    Generate exactly 5 specific, actionable hobby project suggestions.
    
    RETURN ONLY RAW JSON. Do not use Markdown formatting (no \`\`\`json or \`\`\`).
    
    The JSON must be a list of objects with this structure:
    [
      {
        "title": "Project Name",
        "description": "Short description",
        "estimatedCost": "$20-50",
        "difficulty": "Beginner",
        "tags": ["tag1", "tag2"]
      }
    ]
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up the text just in case the AI adds Markdown
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(text) as ExploreSuggestion[];
  } catch (error) {
    console.error("Failed to fetch hobby suggestions:", error);
    return [];
  }
};
