// @ts-nocheck

export const getHobbySuggestions = async (currentProjects) => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    alert("API Key is missing!");
    return [];
  }

  try {
    // STEP 1: Dynamically find a valid model
    // We ask Google: "What models are available to THIS key?"
    const listUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const listResponse = await fetch(listUrl);
    const listData = await listResponse.json();

    if (!listData.models) {
      throw new Error("API Key is valid, but no models are available. Check Google Cloud Console.");
    }

    // specific logic to find the best model you have access to
    // We look for 'flash' first (fastest), then 'pro' (standard), then any gemini model.
    let activeModel = listData.models.find(m => 
      m.name.includes("gemini-1.5-flash") && m.supportedGenerationMethods.includes("generateContent")
    );

    if (!activeModel) {
      activeModel = listData.models.find(m => 
        m.name.includes("gemini-pro") && m.supportedGenerationMethods.includes("generateContent")
      );
    }

    // Fallback: Just take the first one that works
    if (!activeModel) {
      activeModel = listData.models.find(m => 
        m.name.includes("gemini") && m.supportedGenerationMethods.includes("generateContent")
      );
    }

    if (!activeModel) {
      throw new Error("No Gemini models found for this API Key.");
    }

    console.log("FOUND WORKING MODEL:", activeModel.name); // Check your console to see which one it picked!

    // STEP 2: Use that exact model to generate content
    const generateUrl = `https://generativelanguage.googleapis.com/v1beta/${activeModel.name}:generateContent?key=${apiKey}`;
    
    const existingHobbies = currentProjects.map(p => p.name || p.title).join(", ");
    const promptText = `
      Suggest 5 hobbies based on: ${existingHobbies || "General interests"}.
      Return ONLY a JSON array with this structure:
      [{"title": "Title", "description": "Desc", "estimatedCost": "$", "difficulty": "Level", "tags": []}]
    `;

    const response = await fetch(generateUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: promptText }] }]
      })
    });

    const data = await response.json();
    
    // Check for errors in the response body
    if (data.error) {
      throw new Error(data.error.message);
    }

    // STEP 3: Parse the result
    const rawText = data.candidates[0].content.parts[0].text;
    const cleanText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonStart = cleanText.indexOf('[');
    const jsonEnd = cleanText.lastIndexOf(']') + 1;
    
    if (jsonStart !== -1) {
      return JSON.parse(cleanText.substring(jsonStart, jsonEnd));
    }
    return [];

  } catch (error) {
    console.error("Auto-Discovery Failed:", error);
    alert(`Error: ${error.message}`);
    return [];
  }
};
