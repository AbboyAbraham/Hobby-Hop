// @ts-nocheck

export const getHobbySuggestions = async (currentProjects) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("API Key is missing!");
    return [];
  }

  const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
  const promptText = `
    Suggest 5 hobbies based on: ${existingHobbies || "General interests"}.
    Return ONLY a JSON array with this structure:
    [{"title": "Title", "description": "Desc", "estimatedCost": "$", "difficulty": "Level", "tags": []}]
  `;

  try {
    // 1. Ask Google for the list of ALL available models
    console.log("Fetching model list...");
    const listResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const listData = await listResponse.json();

    if (!listData.models) throw new Error("No models found for this API Key.");

    // 2. Sort the models: Put 'flash' first (fastest/free), then 'pro', then everything else.
    // This ensures we try the likely free ones before hitting the 'gemini-3' trap.
    const sortedModels = listData.models.sort((a, b) => {
      if (a.name.includes("flash")) return -1;
      if (b.name.includes("flash")) return 1;
      return 0;
    });

    // 3. THE SMART LOOP: Try them one by one.
    for (const model of sortedModels) {
      if (!model.supportedGenerationMethods.includes("generateContent")) continue;

      try {
        console.log(`Trying model: ${model.name}...`);
        
        const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${model.name}:generateContent?key=${apiKey}`;
        const response = await fetch(generateUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        });

        const data = await response.json();

        // If this specific model fails (like gemini-3-pro), just Log it and CONTINUE to the next one.
        if (data.error) {
          console.warn(`Skipping ${model.name}: ${data.error.message}`);
          continue; 
        }

        // SUCCESS! We found a working model.
        const rawText = data.candidates[0].content.parts[0].text;
        const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const jsonStart = cleanText.indexOf('[');
        const jsonEnd = cleanText.lastIndexOf(']') + 1;
        
        if (jsonStart !== -1) {
          console.log(`Success with ${model.name}!`);
          return JSON.parse(cleanText.substring(jsonStart, jsonEnd));
        }

      } catch (innerError) {
        // Ignore errors for individual models and keep looping
        console.warn(`Model ${model.name} crashed, trying next...`);
      }
    }

    throw new Error("All available models failed.");

  } catch (error) {
    console.error("Critical Error:", error);
    alert(`App Error: ${error.message}`);
    return [];
  }
};
