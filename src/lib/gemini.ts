/**
 * Configuración de Gemini AI
 * 
 * Usado para análisis de imágenes de boletas (OCR inteligente)
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar cliente de Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Modelos disponibles actualizados (Marzo 2026)
// gemini-3.1-flash-lite-preview: El más rápido y eficiente para visión/OCR a escala.
const MODELS = {
  primary: 'gemini-3.1-flash-lite-preview',
  fallback: 'gemini-3-flash-preview',
};

// Prompt optimizado para boletas chilenas con IVA detallado
const BOLETA_PROMPT = `Analiza esta imagen de una boleta o recibo chileno y extrae la información en formato JSON.

REGLAS DE NEGOCIO:
- Los montos deben ser números sin símbolos ($, puntos de miles).
- La fecha debe estar en formato YYYY-MM-DD.
- En Chile el IVA es 19%. 
- Si la boleta NO especifica el IVA, calcúlalo: totalBruto / 1.19 = totalNeto; totalBruto - totalNeto = iva.
- Para cada producto, intenta extraer o calcular su precioNeto e IVA individual.
- Sugiere una categoría lógica basada en el comercio.

ESTRUCTURA JSON REQUERIDA:
{
  "tienda": "nombre del comercio",
  "rutTienda": "RUT (XX.XXX.XXX-X) o null",
  "direccion": "dirección completa o null",
  "ciudad": "ciudad donde está la tienda o null",
  "numeroBoleta": "número de boleta o null",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM:SS o null",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "descripción del producto",
      "precioUnitario": 1190,
      "precioNeto": 1000,
      "iva": 190,
      "subtotal": 1190,
      "subtotalNeto": 1000
    }
  ],
  "totalBruto": 1190,
  "totalNeto": 1000,
  "iva": 190,
  "metodoPago": "efectivo|debito|credito|transferencia|otro",
  "categoriaSugerida": "supermercado|farmacia|restaurante|transporte|servicios|entretenimiento|ropa|tecnologia|hogar|salud|educacion|alimentos|otro",
  "confianza": 85
}

Responde SOLO con el JSON válido.`;

/**
 * Analiza una imagen de boleta y extrae los datos
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
  if (!process.env.GEMINI_API_KEY) {
    return { success: false, error: 'API key de Gemini no configurada' };
  }

  // Intentar con el modelo Lite (más eficiente para visión a escala)
  try {
    const result = await analizarConModelo(MODELS.primary, imageBase64, mimeType);
    return { success: true, data: result, modelo: MODELS.primary };
  } catch (error) {
    console.warn(`Gemini ${MODELS.primary} falló, intentando con fallback...`, error);
  }

  // Fallback al modelo Flash estándar
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
