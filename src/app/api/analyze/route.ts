/**
 * API Route: Analizar boleta con Gemini Vision
 * POST /api/analyze
 * 
 * Body: { image: string (base64), mimeType: string }
 * Returns: { success: boolean, data?: BoletaExtraida, error?: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { analizarBoleta } from '@/lib/gemini';

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

    const result = await analizarBoleta(image, mimeType);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error en API analyze:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
