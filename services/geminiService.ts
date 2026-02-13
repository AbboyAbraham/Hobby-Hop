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
    Suggest 5 hobbies based on: ${existingHobbies}.
    Return JSON array with title, description, estimatedCost, difficulty, tags.
    No markdown.
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
