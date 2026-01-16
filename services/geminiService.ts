
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem } from "../types.ts";

export const analyzeReceipt = async (base64Image: string): Promise<{
  storeName: string;
  total: number;
  items: ExpenseItem[];
  date?: string;
} | null> => {
  // Intentamos obtener la clave de todas las fuentes posibles
  const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;

  if (!apiKey || apiKey === "") {
    throw new Error("API_KEY no detectada. Revisa las variables de entorno en Vercel y asegúrate de que el despliegue haya terminado con éxito.");
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
              text: "Analiza este ticket. Extrae: 1. Nombre de la tienda. 2. Total (número). 3. Lista de productos (nombre, precio, cantidad). Responde SOLO en JSON válido.",
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
      throw new Error("Error de autenticación: La API Key no es válida.");
    }
    throw new Error(`Error de la IA: ${error.message || 'Sin respuesta'}`);
  }
};
