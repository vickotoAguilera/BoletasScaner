/**
 * Script rápido para probar modelos específicos acordados
 * Primary: gemini-3-flash-preview
 * Fallback: gemini-2.5-flash-lite
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('❌ GEMINI_API_KEY no encontrada');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Modelos acordados para el proyecto
const modelsToTest = [
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash-lite-preview',
  // También probamos estos por si acaso
  'models/gemini-2.5-flash-preview-05-20',
  'gemini-2.5-pro-preview-05-06',
];

async function testModel(modelName: string): Promise<boolean> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Responde con "OK"');
    const text = (await result.response).text();
    return text.length > 0;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Probando modelos acordados para Boleta Scanner...\n');
  
  for (const model of modelsToTest) {
    process.stdout.write(`${model}... `);
    const works = await testModel(model);
    console.log(works ? '✅' : '❌');
  }
}

main();
