// @ts-nocheck

export const getHobbySuggestions = async (currentProjects) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("API Key is missing!");
    return [];
  }

  // THE SAFE LIST: We only try models that are confirmed to be free.
  // We try Flash first (fastest), then Pro (fallback).
  const safeModels = [
    "models/gemini-1.5-flash",
    "models/gemini-1.5-flash-001",
    "models/gemini-1.5-pro",
    "models/gemini-1.0-pro"
  ];

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  const promptText = `
    Suggest 5 hobbies based on: ${existingHobbies || "General interests"}.
    Return ONLY a JSON array with this structure:
    [{"title": "Title", "description": "Desc", "estimatedCost": "$", "difficulty": "Level", "tags": []}]
  `;

  // Loop through the Safe List until one works
  for (const modelName of safeModels) {
    try {
      console.log(`Attempting to use: ${modelName}...`);
      
      const url = `https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      });

      const data = await response.json();

      // If specific model fails (e.g. 404 or Quota 0), we skip to the next one
      if (!response.ok || data.error) {
        console.warn(`Model ${modelName} failed:`, data.error?.message);
        continue; 
      }

      // SUCCESS! Parse the result
      const rawText = data.candidates[0].content.parts[0].text;
      const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonStart = cleanText.indexOf('[');
      const jsonEnd = cleanText.lastIndexOf(']') + 1;
      
      if (jsonStart !== -1) {
        return JSON.parse(cleanText.substring(jsonStart, jsonEnd));
      }

    } catch (error) {
      console.error(`Error with ${modelName}:`, error);
      // Continue to next model...
    }
  }

  alert("All safe models failed. Please check your internet connection.");
  return [];
};
