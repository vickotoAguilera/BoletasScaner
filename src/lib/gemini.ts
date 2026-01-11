/**
 * Configuración de Gemini AI
 * 
 * Usado para análisis de imágenes de boletas (OCR inteligente)
 * 
 * Estrategia de fallback:
 * 1. Gemini 3 Flash (mejor calidad) - ~100 req/día gratis
 * 2. Gemini 2.5 Flash Lite (backup) - ~1000 req/día gratis
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modelos disponibles
const MODELS = {
  primary: 'gemini-3-flash-preview',
  fallback: 'gemini-2.5-flash-lite',
};

// Prompt para análisis de boletas
const BOLETA_PROMPT = `Analiza esta imagen de una boleta/recibo chileno y extrae la siguiente información en formato JSON:

{
  "tienda": "nombre del comercio",
  "rutTienda": "RUT del comercio (formato XX.XXX.XXX-X)",
  "direccion": "dirección del comercio",
  "numeroBoleta": "número de la boleta",
  "fecha": "fecha en formato YYYY-MM-DD",
  "hora": "hora en formato HH:MM:SS",
  "items": [
    {
      "cantidad": número,
      "descripcion": "descripción del producto",
      "precioUnitario": número,
      "subtotal": número
    }
  ],
  "total": número (monto total),
  "iva": número (monto del IVA),
  "metodoPago": "efectivo|debito|credito|transferencia|otro",
  "categoriaSugerida": "alimentos|supermercado|farmacia|transporte|servicios|entretenimiento|ropa|tecnologia|hogar|salud|educacion|restaurante|otro",
  "confianza": número del 0 al 100 indicando qué tan seguro estás de la extracción
}

Si algún campo no es legible o no está presente, usa null.
Responde SOLO con el JSON, sin texto adicional.`;

/**
 * Analiza una imagen de boleta y extrae los datos
 * @param imageBase64 - Imagen en formato base64
 * @param mimeType - Tipo MIME de la imagen (image/jpeg, image/png, etc.)
 * @returns Datos extraídos de la boleta
 */
export async function analizarBoleta(
  imageBase64: string,
  mimeType: string = 'image/jpeg'
): Promise<{
  success: boolean;
  data?: Record<string, unknown>;
  error?: string;
  modelo?: string;
}> {
  // Intentar con el modelo principal
  try {
    const result = await analizarConModelo(MODELS.primary, imageBase64, mimeType);
    return { success: true, data: result, modelo: MODELS.primary };
  } catch (error) {
    console.warn('Gemini 3 Flash falló, intentando con fallback...', error);
  }

  // Fallback al modelo secundario
  try {
    const result = await analizarConModelo(MODELS.fallback, imageBase64, mimeType);
    return { success: true, data: result, modelo: MODELS.fallback };
  } catch (error) {
    console.error('Ambos modelos de Gemini fallaron:', error);
    return {
      success: false,
      error: 'No se pudo analizar la boleta. Por favor, intenta de nuevo.',
    };
  }
}

/**
 * Analiza una imagen con un modelo específico
 */
async function analizarConModelo(
  modelName: string,
  imageBase64: string,
  mimeType: string
): Promise<Record<string, unknown>> {
  const model = genAI.getGenerativeModel({ model: modelName });

  const result = await model.generateContent([
    BOLETA_PROMPT,
    {
      inlineData: {
        mimeType,
        data: imageBase64,
      },
    },
  ]);

  const response = await result.response;
  const text = response.text();

  // Limpiar respuesta y parsear JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No se pudo extraer JSON de la respuesta');
  }

  return JSON.parse(jsonMatch[0]);
}

export { MODELS };
