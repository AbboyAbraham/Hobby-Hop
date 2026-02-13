// @ts-nocheck
import { GoogleGenerativeAI } from "@google/generative-ai";

const getClient = () => {
  
  const apiKey = "AIzaSyDJBvOhvs7B0i6_YNrwlz2UFBxV-DmnNEY"; 

  console.log("Using Hardcoded Key:", apiKey.substring(0, 10) + "..."); // Debug log

  if (!apiKey) {
    alert("Key is missing!");
    return null;
  }
  return new GoogleGenerativeAI(apiKey);
};

export const getHobbySuggestions = async (currentProjects) => {
  const genAI = getClient();
  if (!genAI) return [];

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  
  // We use the standard 'gemini-1.5-flash' which is definitely available in India
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const prompt = `Suggest 5 hobbies. Return JSON array.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Quick clean to ensure valid JSON
    const jsonStart = text.indexOf('[');
    const jsonEnd = text.lastIndexOf(']') + 1;
    const cleanJson = text.substring(jsonStart, jsonEnd);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Hardcoded Test Failed:", error);
    alert(`TEST FAILED: ${error.message}`);
    return [];
  }
};
