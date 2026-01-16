
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem } from "../types";

export const analyzeReceipt = async (base64Image: string): Promise<{
  storeName: string;
  total: number;
  items: ExpenseItem[];
  date?: string;
} | null> => {
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === "") {
    alert("¡Atención! No se ha configurado la API_KEY en Vercel. Ve a Settings -> Environment Variables y añade API_KEY.");
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
              text: "Extract information from this receipt. Return ONLY JSON. If data is not found, use null or 0. Focus on store name, total amount, and a list of items with price and quantity.",
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
    alert("Hubo un error al leer el ticket. Revisa tu conexión o la API Key.");
    return null;
  }
};
