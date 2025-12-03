import { GoogleGenAI } from "@google/genai";
import { PRODUCT_CATALOG } from '../constants';
import { CartItem } from '../types';

const apiKey = process.env.API_KEY;

if (!apiKey) {
  console.error("API_KEY is missing in process.env");
}

const ai = new GoogleGenAI({ apiKey: apiKey });

const BASE_SYSTEM_INSTRUCTION = `
You are ShopGenie, a hyper-personalized shopping assistant.
You have access to a specific LOCAL CATALOG of Indian D2C products.

Your Goal:
1. Understand the user's intent.
2. DECIDE: Is this request best served by the LOCAL CATALOG or a GOOGLE SEARCH?
   - If the user asks for specific D2C categories we have (Healthy Snacks, Ethnic Wear) -> Use the Local Catalog.
   - If the user asks for generic items (e.g., "McDonald's", "Nike", "Laptops") or products NOT in the catalog -> Use Google Search tool.

RESPONSE STRATEGY:
- If using Google Search: The system will automatically provide search results (URLs/Titles). You must SUMMARIZE these results clearly in your text response first. "Here are the top results for [Product]..."
- AFTER addressing the user's direct request with search results, you MAY suggest a relevant product from the LOCAL CATALOG as a "Healthy Alternative" or "Style Match" if appropriate.
- Example: User asks for "McDonald's Burger". 
  1. You search Google. 
  2. You reply: "I found several McDonald's locations nearby. You can order directly from their site..." 
  3. You ADD a local recommendation: "However, if you're looking for a healthy crunch, try our Spicy Ragi Chips instead!"

The LOCAL CATALOG:
${JSON.stringify(PRODUCT_CATALOG)}

Rules:
- ALWAYS append a JSON block at the VERY END if you are recommending ANY local products (primary or alternative).
- The JSON block must ONLY contain items from the LOCAL CATALOG.

JSON Schema for Local Catalog items ONLY:
\`\`\`json
[
  {
    "id": "product_id_from_catalog",
    "matchScore": 95,
    "reason": "Short reason why this is a good match or alternative."
  }
]
\`\`\`
`;

export const sendMessageToGemini = async (
  history: { role: string; parts: { text?: string; inlineData?: any }[] }[], 
  message: string,
  imageBase64?: string,
  cartContext: CartItem[] = [],
  currentMood?: string
) => {
  try {
    const model = 'gemini-2.5-flash';
    
    // Dynamic System Instruction additions
    let dynamicSystemInstruction = BASE_SYSTEM_INSTRUCTION;

    // 1. Add Mood Context
    if (currentMood) {
      dynamicSystemInstruction += `\n\nUSER MOOD CONTEXT: The user is feeling "${currentMood}". Adjust your tone and recommendations to fit this mood. For "Stressed", suggest comfort food or relaxing visuals. For "Party", suggest bold fashion or energy snacks.`;
    }

    // 2. Add Cart/Memory Context
    if (cartContext.length > 0) {
      const cartSummary = cartContext.map(i => `${i.name} (${i.brand})`).join(", ");
      dynamicSystemInstruction += `\n\nUSER HISTORY / CART CONTEXT: The user currently has these items in their cart: [${cartSummary}]. 
      - Use this information to suggest complementary items.
      - Acknowledge their current selection in your response to show you remember their choices.`;
    }
    
    // Construct the current message content
    const currentMessageParts: any[] = [];
    
    if (imageBase64) {
      currentMessageParts.push({
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageBase64
        }
      });
    }
    
    if (message) {
      currentMessageParts.push({ text: message });
    }

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: dynamicSystemInstruction,
        temperature: 0.7,
        tools: [{ googleSearch: {} }]
      },
      history: history
    });

    // Send the message
    const result = await chat.sendMessage({ 
      message: currentMessageParts.length === 1 && currentMessageParts[0].text 
        ? currentMessageParts[0].text 
        : currentMessageParts 
    });
    
    // Extract Text
    const text = result.text || "";

    // Extract Grounding Metadata
    const groundingChunks = result.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const webResults = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri
      }));

    const uniqueWebResults = Array.from(new Map(webResults.map((item:any) => [item.uri, item])).values());

    return {
      text,
      webResults: uniqueWebResults as { title: string; uri: string }[]
    };
  } catch (error) {
    console.error("Error calling Gemini:", error);
    throw error;
  }
};