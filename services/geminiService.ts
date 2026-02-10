import { GoogleGenerativeAI } from "@google/generative-ai";
import { Project, ExploreSuggestion } from '../types';

const getClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("API_KEY is missing. Gemini features will not work.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

export const getHobbySuggestions = async (currentProjects: Project[]): Promise<ExploreSuggestion[]> => {
  const ai = getClient();
  if (!ai) return [];

  const existingHobbies = currentProjects.map(p => p.title).join(", ");
  
  const prompt = `
    ## ROLE
    You are an expert Creative Consultant and Hobby Matchmaker powering the "Explore" tab of an app called Hobby Hop. 
    Your tone is encouraging, inspiring, and highly practical.

    ## TASK
    The user lists these current interests/projects: ${existingHobbies || "None yet, looking for something new"}. 
    Your job is to generate exactly 5 specific, actionable hobby project suggestions that blend or align with these interests.

    ## CONSTRAINTS & RULES
    1. Do not provide vague hobbies (e.g., "Gardening"). Provide specific *projects* (e.g., "Build an Indoor Automated Herb Planter").
    2. Keep descriptions under 3 sentences. They must be punchy and exciting.
    3. Provide a realistic estimated cost in USD based on required materials.
    4. ONLY return valid JSON. Do not include introductory text.

    ## OUTPUT FORMAT
    You must respond strictly with a JSON array containing 5 objects following the schema provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedCost: { type: Type.STRING },
              difficulty: { type: Type.STRING },
              tags: { 
                type: Type.ARRAY,
                items: { type: Type.STRING }
              },
            },
            required: ["title", "description", "estimatedCost", "difficulty", "tags"],
          },
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as ExploreSuggestion[];
    }
    return [];
  } catch (error) {
    console.error("Failed to fetch hobby suggestions:", error);
    return [];
  }
};
