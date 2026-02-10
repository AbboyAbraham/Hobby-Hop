import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";
import { Project, ExploreSuggestion } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will not work.");
    return null;
  }
  // Fixed: Use GoogleGenerativeAI and pass the string directly
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects: Project[]): Promise<ExploreSuggestion[]> => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.title).join(", ");
  
  // Fixed: Use gemini-1.5-flash (stable and fast)
  const model = genAI.getGenerativeModel({
    model: "gemini-1.5-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: {
        type: SchemaType.ARRAY,
        items: {
          type: SchemaType.OBJECT,
          properties: {
            title: { type: SchemaType.STRING },
            description: { type: SchemaType.STRING },
            estimatedCost: { type: SchemaType.STRING },
            difficulty: { type: SchemaType.STRING },
            tags: { 
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING }
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
