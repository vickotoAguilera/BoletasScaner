/**
 * Script de prueba para verificar modelos de Gemini disponibles
 * Ejecutar con: npx tsx scripts/test-gemini-models.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ GEMINI_API_KEY no encontrada en .env.local');
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

// Modelos a probar (basados en la documentación de Google)
const modelsToTest = [
  'gemini-2.0-flash',
  'gemini-2.0-flash-exp',
  'gemini-1.5-flash',
  'gemini-1.5-flash-latest',
  'gemini-1.5-pro',
  'gemini-1.5-pro-latest',
  'gemini-pro',
  'gemini-pro-vision',
  // Modelos experimentales/preview
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview',
  'gemini-3-flash',
  'gemini-3-flash-preview',
];

async function testModel(modelName: string): Promise<{ name: string; works: boolean; error?: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    
    // Prueba simple de texto
    const result = await model.generateContent('Responde solo con "OK"');
    const response = await result.response;
    const text = response.text();
    
    if (text) {
      return { name: modelName, works: true };
    } else {
      return { name: modelName, works: false, error: 'Sin respuesta' };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return { name: modelName, works: false, error: errorMessage.substring(0, 100) };
  }
}

async function main() {
  console.log('🔍 Probando modelos de Gemini...\n');
  console.log(`API Key: ${apiKey?.substring(0, 10)}...${apiKey?.substring(apiKey.length - 4)}\n`);
  
  const results: Array<{ name: string; works: boolean; error?: string }> = [];
  
  for (const model of modelsToTest) {
    process.stdout.write(`Testing ${model}... `);
    const result = await testModel(model);
    results.push(result);
    
    if (result.works) {
      console.log('✅ FUNCIONA');
    } else {
      console.log(`❌ Error: ${result.error}`);
    }
  }
  
  console.log('\n📊 Resumen:');
  console.log('============');
  
  const working = results.filter(r => r.works);
  const notWorking = results.filter(r => !r.works);
  
  console.log(`\n✅ Modelos funcionando (${working.length}):`);
  working.forEach(r => console.log(`   - ${r.name}`));
  
  console.log(`\n❌ Modelos no disponibles (${notWorking.length}):`);
  notWorking.forEach(r => console.log(`   - ${r.name}`));
  
  // Guardar resultados
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  console.log(`\n📝 Modelos recomendados para la app:`);
  if (working.length > 0) {
    console.log(`   Primary: ${working[0].name}`);
    if (working.length > 1) {
      console.log(`   Fallback: ${working[1].name}`);
    }
  } else {
    console.log('   ⚠️ Ningún modelo funcionó. Verifica tu API key.');
  }
  
  return working;
}

main().catch(console.error);
