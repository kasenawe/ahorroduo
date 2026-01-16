
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem } from "../types.ts";

export const analyzeReceipt = async (base64Image: string): Promise<{
  storeName: string;
  total: number;
  items: ExpenseItem[];
  date?: string;
} | null> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "") {
    console.warn("API_KEY no configurada");
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64Image,
              },
            },
            {
              text: "Extract info from receipt: store name, total amount, and list of items. Return ONLY JSON.",
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            storeName: { type: Type.STRING },
            total: { type: Type.NUMBER },
            date: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  quantity: { type: Type.NUMBER },
                },
                required: ["name", "price"]
              },
            },
          },
          required: ["storeName", "total"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text.trim());
    }
    return null;
  } catch (error) {
    console.error("Error analyzing receipt:", error);
    return null;
  }
};
