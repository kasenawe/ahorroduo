
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
    console.error("CRÍTICO: La API_KEY no está configurada en el entorno.");
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
              text: "Act as a receipt scanner. Extract: 1. Store/Merchant name. 2. Total amount (as number). 3. List of items (name, price, quantity). If you can't find a store name, use 'Compra General'. Return ONLY valid JSON.",
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
      const data = JSON.parse(response.text.trim());
      console.log("IA Analysis Success:", data);
      return data;
    }
    return null;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
