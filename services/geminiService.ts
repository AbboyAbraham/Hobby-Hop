import { GoogleGenerativeAI } from "@google/generative-ai";
import { Project, ExploreSuggestion } from '../types';

const getClient = () => {
  // @ts-ignore - Ignores potential import.meta errors
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

  const existingHobbies = currentProjects.map(p => p.title).join(", ");
  
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    // @ts-ignore - We force this config to pass even if types are old
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "ARRAY", // We use the string "ARRAY" instead of SchemaType.ARRAY
        items: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING" },
            description: { type: "STRING" },
            estimatedCost: { type: "STRING" },
            difficulty: { type: "STRING" },
            tags: { 
              type: "ARRAY",
              items: { type: "STRING" }
            },
          },
          required: ["title", "description", "estimatedCost", "difficulty", "tags"],
        },
      },
    },
  });

  const prompt = `
    ## ROLE
    You are an expert Creative Consultant and Hobby Matchmaker for the "Hobby Hop" app. 
     
    ## TASK
    The user is currently doing these projects: ${existingHobbies || "None yet"}. 
    Generate exactly 5 specific, actionable hobby project suggestions that align with these interests.

    ## CONSTRAINTS
    1. Provide specific projects, not general categories.
    2. Descriptions must be under 3 sentences.
    3. Return ONLY valid JSON.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      return JSON.parse(text) as ExploreSuggestion[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch hobby suggestions:", error);
    return [];
  }
};
