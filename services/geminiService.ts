// @ts-nocheck

export const getHobbySuggestions = async (currentProjects) => {
  // 1. Get the Key safely
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("API Key is missing!");
    return [];
  }

  // 2. Prepare the Prompt
  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  const promptText = `
    Suggest 5 hobbies based on: ${existingHobbies || "General interests"}.
    Return JSON array: [{"title": "Name", "description": "Desc", "estimatedCost": "$", "difficulty": "Level", "tags": []}].
    No markdown.
  `;

  // 3. The "Direct Line" - We call Google's server directly, bypassing the broken library
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: promptText }]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error.message || "Server Error");
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;

    // 4. Clean and Parse
    let cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonStart = cleanText.indexOf('[');
    const jsonEnd = cleanText.lastIndexOf(']') + 1;
    
    if (jsonStart !== -1) {
      return JSON.parse(cleanText.substring(jsonStart, jsonEnd));
    }
    return [];

  } catch (error) {
    console.error("Direct Fetch Error:", error);
    alert(`Connection Failed: ${error.message}`);
    return [];
  }
};
