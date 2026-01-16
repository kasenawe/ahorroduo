
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem } from "../types.ts";

export const analyzeReceipt = async (base64Image: string): Promise<{
  storeName: string;
  total: number;
  items: ExpenseItem[];
  date?: string;
} | null> => {
  // Acceso directo según las directrices del SDK y la configuración de Vite
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY no detectada. Por favor, asegúrate de haber configurado la variable de entorno 'API_KEY' en la sección de Environment Variables en el panel de Vercel.");
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
              text: "Analiza este ticket de compra. Extrae: 1. Nombre de la tienda. 2. Total pagado (número). 3. Lista de productos (nombre, precio unitario, cantidad). Responde estrictamente en JSON.",
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
  } catch (error: any) {
    console.error("Error Gemini:", error);
    if (error.message?.includes('403') || error.message?.includes('API key')) {
      throw new Error("Error de API Key: La clave configurada en Vercel no es válida o no tiene permisos.");
    }
    throw new Error(`Error de la IA: ${error.message || 'Error al procesar la imagen'}`);
  }
};
