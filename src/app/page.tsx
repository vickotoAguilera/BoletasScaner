import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden">
      {/* Gradient Glow Effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-radial from-[#00d4aa]/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-12 lg:px-20">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Boleta Scanner"
            width={40}
            height={40}
            className="rounded-lg"
          />
          <span className="text-xl font-semibold">Boleta Scanner</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-gray-400 hover:text-white transition-colors">
            Características
          </a>
          <a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">
            Cómo Funciona
          </a>
          <a href="#pricing" className="text-gray-400 hover:text-white transition-colors">
            Precios
          </a>
        </div>
        
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-gray-400 hover:text-white transition-colors hidden sm:block"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/register"
            className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-medium px-5 py-2.5 rounded-full transition-colors"
          >
            Comenzar Gratis
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center px-6 pt-20 pb-32 text-center">
        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 mb-8">
          <span className="w-2 h-2 bg-[#00d4aa] rounded-full animate-pulse" />
          <span className="text-sm text-gray-400">Potenciado por IA de Google</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-4xl leading-tight mb-6">
          Escanea tus boletas y
          <span className="bg-gradient-to-r from-[#00d4aa] to-[#00b894] bg-clip-text text-transparent"> organiza tus gastos</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10">
          Usa la cámara de tu teléfono para escanear boletas. 
          Nuestra IA extrae los datos automáticamente y los organiza en un Excel que puedes descargar o sincronizar con Google Drive.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/register"
            className="group flex items-center gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(0,212,170,0.4)]"
          >
            <span>Comenzar Gratis</span>
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
          <button className="flex items-center justify-center gap-2 border border-white/20 hover:border-white/40 text-white font-medium px-8 py-4 rounded-full transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Ver Tutorial</span>
          </button>
        </div>

        {/* Phone Mockup */}
        <div className="relative w-full max-w-lg">
          <div className="absolute inset-0 bg-gradient-to-b from-[#00d4aa]/20 to-transparent blur-3xl" />
          <div className="relative bg-gradient-to-b from-[#1a1a1a] to-[#0a0a0a] rounded-[3rem] p-3 border border-white/10 shadow-2xl">
            <div className="bg-[#0a0a0a] rounded-[2.5rem] overflow-hidden">
              {/* Phone Header */}
              <div className="flex items-center justify-center py-3 border-b border-white/10">
                <div className="w-20 h-5 bg-black rounded-full" />
              </div>
              {/* Phone Content */}
              <div className="p-6 min-h-[400px] flex flex-col">
                <div className="text-left mb-6">
                  <p className="text-gray-500 text-sm">Bienvenido de vuelta</p>
                  <h3 className="text-xl font-semibold">Tus Gastos</h3>
                </div>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-white/5 rounded-2xl p-4">
                    <p className="text-gray-500 text-xs mb-1">Este mes</p>
                    <p className="text-2xl font-bold text-[#00d4aa]">$245.800</p>
                  </div>
                  <div className="bg-white/5 rounded-2xl p-4">
                    <p className="text-gray-500 text-xs mb-1">Boletas</p>
                    <p className="text-2xl font-bold">42</p>
                  </div>
                </div>
                
                {/* Recent Transactions */}
                <div className="flex-1 space-y-3">
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <span className="text-lg">🛒</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Supermercado Líder</p>
                        <p className="text-gray-500 text-xs">Hace 2 horas</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">-$32.450</p>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <span className="text-lg">💊</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">Farmacia Cruz Verde</p>
                        <p className="text-gray-500 text-xs">Ayer</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">-$8.990</p>
                  </div>
                  <div className="flex items-center justify-between bg-white/5 rounded-xl p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-orange-500/20 rounded-full flex items-center justify-center">
                        <span className="text-lg">🍔</span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm">McDonald&apos;s</p>
                        <p className="text-gray-500 text-xs">Hace 2 días</p>
                      </div>
                    </div>
                    <p className="font-semibold text-sm">-$6.500</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-24 bg-[#0f0f0f]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Todo lo que necesitas para
            <span className="text-[#00d4aa]"> organizar tus gastos</span>
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-16">
            Potenciado por inteligencia artificial de Google Gemini para extraer datos de tus boletas con precisión.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#00d4aa]/50 transition-colors">
              <div className="w-14 h-14 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Escaneo Inteligente</h3>
              <p className="text-gray-400">
                Solo toma una foto de tu boleta y nuestra IA extrae automáticamente tienda, productos, precios y totales.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#00d4aa]/50 transition-colors">
              <div className="w-14 h-14 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Vista Tipo Excel</h3>
              <p className="text-gray-400">
                Todos tus gastos organizados en una tabla interactiva. Filtra, busca y ordena como quieras.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:border-[#00d4aa]/50 transition-colors">
              <div className="w-14 h-14 bg-[#00d4aa]/20 rounded-xl flex items-center justify-center mb-6">
                <svg className="w-7 h-7 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Exportar y Sincronizar</h3>
              <p className="text-gray-400">
                Descarga tus datos en Excel o sincroniza automáticamente con tu Google Drive.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-24">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            ¿Listo para organizar tus gastos?
          </h2>
          <p className="text-gray-400 text-lg mb-10">
            Comienza gratis hoy. No necesitas tarjeta de crédito.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold px-10 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(0,212,170,0.4)]"
          >
            Crear Cuenta Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-12">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Boleta Scanner"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold">Boleta Scanner</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Boleta Scanner. Creado por <span className="text-[#00d4aa]">vickoto</span>
          </p>
        </div>
      </footer>
    </div>
  );
}
