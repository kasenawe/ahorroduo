
import { GoogleGenAI, Type } from "@google/genai";
import { ExpenseItem } from "../types.ts";

export const analyzeReceipt = async (base64Image: string): Promise<{
  storeName: string;
  total: number;
  items: ExpenseItem[];
  date?: string;
} | null> => {
  // Intentamos obtener la clave de la forma más directa posible
  // @ts-ignore
  const apiKey = (typeof process !== 'undefined' && process.env?.API_KEY) || 
                 (window as any).process?.env?.API_KEY;

  if (!apiKey) {
    throw new Error("API_KEY no detectada. Por favor, asegúrate de configurar la variable de entorno API_KEY en Vercel.");
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
      throw new Error("Error de API Key: La clave configurada no parece ser válida o no tiene permisos.");
    }
    throw new Error(`Error de la IA: ${error.message || 'Error al procesar la imagen'}`);
  }
};
