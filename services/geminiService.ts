import { GoogleGenerativeAI } from "@google/generative-ai";
// @ts-ignore
import { Project, ExploreSuggestion } from '../types';

const getClient = () => {
  // @ts-ignore
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing.");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

// @ts-ignore
export const getHobbySuggestions = async (currentProjects: any[]): Promise<any[]> => {
  const genAI = getClient();
  if (!genAI) return [];

  // @ts-ignore
  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
You are an expert Creative Consultant for a hobby app.
The user is currently doing these projects: ${existingHobbies || "None yet"}.

Generate exactly 5 specific, actionable hobby project suggestions.

RETURN ONLY RAW JSON. Do not use Markdown formatting.

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
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (error) {
    console.error(error);
    return [];
  }
};
