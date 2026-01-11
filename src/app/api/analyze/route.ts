/**
 * API Route: Analizar boleta con Gemini Vision
 * POST /api/analyze
 * 
 * Body: { image: string (base64), mimeType: string }
 * Returns: { success: boolean, data?: BoletaExtraida, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Modelos verificados (enero 2026)
// Primary: mejor calidad para OCR
// Fallback: más cuota gratuita disponible
const MODELS = {
  primary: 'gemini-3-flash-preview',
  fallback: 'gemini-2.5-flash-lite',
};

// Prompt optimizado para boletas chilenas
const BOLETA_PROMPT = `Analiza esta imagen de una boleta o recibo chileno y extrae la información en formato JSON.

IMPORTANTE: 
- Si algún campo no es legible o no existe, usa null
- Los montos deben ser números sin símbolos ($, puntos de miles)
- La fecha debe estar en formato YYYY-MM-DD
- Sugiere una categoría basada en el tipo de tienda

Responde SOLO con un JSON válido con esta estructura:
{
  "tienda": "nombre del comercio",
  "rutTienda": "RUT (XX.XXX.XXX-X) o null",
  "direccion": "dirección o null",
  "numeroBoleta": "número de boleta o null",
  "fecha": "YYYY-MM-DD",
  "hora": "HH:MM:SS o null",
  "items": [
    {
      "cantidad": 1,
      "descripcion": "descripción del producto",
      "precioUnitario": 1000,
      "subtotal": 1000
    }
  ],
  "total": 1000,
  "iva": 160,
  "metodoPago": "efectivo|debito|credito|transferencia|otro",
  "categoriaSugerida": "supermercado|farmacia|restaurante|transporte|servicios|entretenimiento|ropa|tecnologia|hogar|salud|educacion|alimentos|otro",
  "confianza": 85
}`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, mimeType = 'image/jpeg' } = body;

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'No se proporcionó imagen' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'API key de Gemini no configurada' },
        { status: 500 }
      );
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Intentar con modelo principal
    let result = await tryAnalyze(genAI, MODELS.primary, image, mimeType);
    
    // Si falla, intentar con fallback
    if (!result.success && MODELS.fallback) {
      console.log('Modelo principal falló, intentando fallback...');
      result = await tryAnalyze(genAI, MODELS.fallback, image, mimeType);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en API analyze:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

async function tryAnalyze(
  genAI: GoogleGenerativeAI,
  modelName: string,
  imageBase64: string,
  mimeType: string
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string; modelo?: string }> {
  try {
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

    // Extraer JSON de la respuesta
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer JSON de la respuesta');
    }

    const data = JSON.parse(jsonMatch[0]);
    return { success: true, data, modelo: modelName };
  } catch (error) {
    console.error(`Error con modelo ${modelName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
}
