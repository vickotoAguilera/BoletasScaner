/**
 * Configuración de Groq AI
 * 
 * Usado para el asistente de chat/ayuda
 * (Groq es muy rápido y tiene límites generosos)
 */

import Groq from 'groq-sdk';

// Inicializar cliente de Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Modelos disponibles en Groq
const MODELS = {
  fast: 'llama-3.3-70b-versatile',
  balanced: 'mixtral-8x7b-32768',
};

// Contexto del sistema para el asistente
const SYSTEM_PROMPT = `Eres el asistente de Boleta Scanner, una aplicación para escanear y organizar boletas/recibos.

Tu rol es:
1. Ayudar a los usuarios a usar la aplicación
2. Responder preguntas sobre funcionalidades
3. Dar consejos sobre organización de gastos
4. Explicar cómo funcionan las características

Características de la app:
- Escanear boletas con la cámara o subir fotos
- La IA extrae automáticamente los datos (tienda, productos, totales)
- Los gastos se organizan en una tabla tipo Excel
- Se pueden exportar a archivo .xlsx
- Sincronización con Google Drive
- Categorización automática de gastos

Sé amable, conciso y útil. Responde en español chileno cuando sea apropiado.
Si no sabes algo específico de la app, sugiere contactar soporte.`;

/**
 * Chat con el asistente IA
 * @param messages - Historial de mensajes
 * @returns Respuesta del asistente
 */
export async function chatWithAssistant(
  messages: Array<{ role: 'user' | 'assistant'; content: string }>
): Promise<{
  success: boolean;
  message?: string;
  error?: string;
}> {
  try {
    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      model: MODELS.fast,
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = completion.choices[0]?.message?.content;

    if (!response) {
      throw new Error('No se recibió respuesta del asistente');
    }

    return { success: true, message: response };
  } catch (error) {
    console.error('Error en chat con Groq:', error);
    return {
      success: false,
      error: 'No se pudo conectar con el asistente. Intenta de nuevo.',
    };
  }
}

/**
 * Genera un tutorial contextual
 * @param context - Contexto de dónde está el usuario
 * @returns Tutorial personalizado
 */
export async function generateTutorial(
  context: 'landing' | 'dashboard' | 'scanner' | 'export' | 'profile'
): Promise<string> {
  const tutorials: Record<string, string> = {
    landing: `¡Bienvenido a Boleta Scanner! 👋

Para empezar:
1. Inicia sesión con tu cuenta de Google o crea una cuenta
2. Ve al Dashboard para ver tus gastos
3. Usa el botón "Escanear" para agregar tu primera boleta

¿Tienes dudas? ¡Pregúntame lo que quieras!`,

    dashboard: `Este es tu Dashboard 📊

Aquí puedes:
• Ver todas tus boletas en una tabla
• Filtrar por fecha, categoría o tienda
• Ver estadísticas de tus gastos
• Exportar a Excel

Tip: Usa el botón flotante (+) para escanear una nueva boleta`,

    scanner: `Escáner de Boletas 📸

Para mejores resultados:
• Usa buena iluminación
• Mantén la boleta plana
• Incluye toda la boleta en la foto
• Evita sombras y reflejos

La IA extraerá automáticamente los datos. Podrás editarlos antes de guardar.`,

    export: `Exportar Datos 📥

Opciones disponibles:
• Descargar Excel (.xlsx) - archivo completo
• Sincronizar con Google Drive - respaldo automático
• Exportar por rango de fechas

Tip: Conecta tu Google Drive en el perfil para respaldos automáticos`,

    profile: `Tu Perfil ⚙️

Desde aquí puedes:
• Conectar/desconectar Google Drive
• Cambiar preferencias de la app
• Ver estadísticas de uso
• Cerrar sesión`,
  };

  return tutorials[context] || tutorials.landing;
}

export { MODELS, SYSTEM_PROMPT };
