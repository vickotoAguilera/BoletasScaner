'use client';

import Image from 'next/image';
import Link from 'next/link';

export default function AyudaPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Boleta Scanner" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-semibold">Boleta Scanner</span>
        </Link>
        <Link href="/dashboard" className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-medium px-5 py-2 rounded-full transition-colors">
          Ir al Dashboard
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">
            ¿Cómo usar <span className="text-[#00d4aa]">Boleta Scanner</span>?
          </h1>
          <p className="text-gray-400 text-lg">
            Guía completa para organizar tus gastos de forma inteligente
          </p>
        </div>

        {/* Pasos */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center text-[#00d4aa]">📋</span>
            Pasos para Usar la App
          </h2>

          <div className="space-y-6">
            {/* Paso 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00d4aa]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#00d4aa] rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Crea tu cuenta gratis</h3>
                  <p className="text-gray-400 mb-3">
                    Regístrate con tu correo electrónico o usa tu cuenta de Google para un acceso más rápido.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Ve a «Comenzar Gratis» en la página principal</li>
                    <li>• Ingresa tu correo y contraseña, o haz clic en «Continuar con Google»</li>
                    <li>• ¡Listo! Ya tienes acceso a tu Dashboard</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00d4aa]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#00d4aa] rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Escanea tu primera boleta</h3>
                  <p className="text-gray-400 mb-3">
                    Usa tu cámara o sube una imagen de la boleta que quieras registrar.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Haz clic en el botón verde «+» o «Nueva Boleta»</li>
                    <li>• Elige «Usar Cámara» para tomar foto o «Subir Imagen» para una existente</li>
                    <li>• Nuestra IA analizará la boleta automáticamente</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00d4aa]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#00d4aa] rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Revisa y confirma los datos</h3>
                  <p className="text-gray-400 mb-3">
                    La IA extrae toda la información. Tú solo verificas que esté correcto.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Verifica tienda, fecha, productos y totales</li>
                    <li>• Selecciona la ciudad donde hiciste la compra</li>
                    <li>• Elige o confirma la categoría sugerida</li>
                    <li>• Haz clic en «Guardar Boleta»</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Paso 4 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00d4aa]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#00d4aa] rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Visualiza tus gastos</h3>
                  <p className="text-gray-400 mb-3">
                    Ve todas tus boletas organizadas en una tabla con estadísticas en tiempo real.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Dashboard con gastos totales, IVA pagado y promedios</li>
                    <li>• Tabla ordenada por fecha con todos los detalles</li>
                    <li>• Haz clic en el ojo 👁️ para ver el detalle y la imagen</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Paso 5 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-[#00d4aa]/30 transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-[#00d4aa] rounded-xl flex items-center justify-center text-black font-bold text-xl shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Exporta a Excel o Google Drive</h3>
                  <p className="text-gray-400 mb-3">
                    Descarga tus datos o súbelos directamente a tu Google Drive.
                  </p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• Botón «Descargar» → Excel con 6 hojas de análisis</li>
                    <li>• Botón «Subir a Drive» → Guarda en tu nube de Google</li>
                    <li>• El Excel incluye resumen, detalle por producto, categoría, ciudad y estadísticas</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beneficios */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold mb-8 flex items-center gap-3">
            <span className="w-10 h-10 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center text-[#00d4aa]">⭐</span>
            Beneficios de Usar Boleta Scanner
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-[#00d4aa]/10 to-transparent border border-[#00d4aa]/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-lg font-semibold mb-2">IA que Trabaja por Ti</h3>
              <p className="text-gray-400 text-sm">
                Nuestra inteligencia artificial de Google Gemini extrae automáticamente tienda, productos, precios, IVA y más. Sin digitación manual.
              </p>
            </div>

            <div className="bg-gradient-to-br from-blue-500/10 to-transparent border border-blue-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-lg font-semibold mb-2">Excel Profesional</h3>
              <p className="text-gray-400 text-sm">
                Genera reportes Excel con 6 hojas: Resumen, Detalle, Por Categoría, Por Ciudad, Por Mes y Estadísticas completas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">🧾</div>
              <h3 className="text-lg font-semibold mb-2">Control del IVA</h3>
              <p className="text-gray-400 text-sm">
                Ve cuánto IVA has pagado por producto, por boleta y en total. Perfecto para emprendedores y freelancers en Chile.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-transparent border border-purple-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">☁️</div>
              <h3 className="text-lg font-semibold mb-2">Sincroniza con Drive</h3>
              <p className="text-gray-400 text-sm">
                Sube tus reportes Excel directamente a Google Drive. Accede desde cualquier dispositivo, siempre respaldado.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">📱</div>
              <h3 className="text-lg font-semibold mb-2">Usa tu Celular</h3>
              <p className="text-gray-400 text-sm">
                Escanea boletas al instante con la cámara de tu teléfono. También puedes subir fotos que ya tengas.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500/10 to-transparent border border-green-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">🏙️</div>
              <h3 className="text-lg font-semibold mb-2">Organiza por Ciudad</h3>
              <p className="text-gray-400 text-sm">
                Registra en qué ciudad hiciste cada compra. Ideal para viajes de trabajo o compras online de otras ciudades.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/10 to-transparent border border-yellow-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">🔍</div>
              <h3 className="text-lg font-semibold mb-2">Zoom a tus Boletas</h3>
              <p className="text-gray-400 text-sm">
                Haz clic en cualquier boleta para ver la imagen escaneada en grande. Nunca pierdas un comprobante.
              </p>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/20 rounded-2xl p-6">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-lg font-semibold mb-2">100% Gratis</h3>
              <p className="text-gray-400 text-sm">
                Sin costos ocultos, sin suscripciones. Usa todas las funciones sin pagar nada.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-white/5 border border-white/10 rounded-2xl p-10">
          <h2 className="text-2xl font-bold mb-4">¿Listo para empezar?</h2>
          <p className="text-gray-400 mb-6">
            Organiza tus gastos en minutos con la ayuda de inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold px-8 py-3 rounded-full transition-colors">
              Crear Cuenta Gratis
            </Link>
            <Link href="/" className="border border-white/20 hover:border-white/40 text-white font-medium px-8 py-3 rounded-full transition-colors">
              Volver al Inicio
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-8 mt-12">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Boleta Scanner" width={24} height={24} className="rounded" />
            <span className="text-sm text-gray-500">Boleta Scanner</span>
          </div>
          <p className="text-gray-500 text-sm">© 2026 - Creado por <span className="text-[#00d4aa]">vickoto</span></p>
        </div>
      </footer>
    </div>
  );
}
