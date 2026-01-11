'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        router.push('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#00d4aa] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Top Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Boleta Scanner"
            width={36}
            height={36}
            className="rounded-lg"
          />
          <span className="text-lg font-semibold">Boleta Scanner</span>
        </div>
        
        <div className="flex items-center gap-4">
          {user?.photoURL && (
            <Image
              src={user.photoURL}
              alt="Profile"
              width={36}
              height={36}
              className="rounded-full"
            />
          )}
          <span className="text-gray-300 hidden sm:block">{user?.displayName || user?.email}</span>
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 md:p-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Hola, {user?.displayName?.split(' ')[0] || 'Usuario'} 👋
          </h1>
          <p className="text-gray-400">
            Aquí puedes ver y gestionar todos tus gastos
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Gastos este mes</p>
            <p className="text-3xl font-bold text-[#00d4aa]">$0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Boletas escaneadas</p>
            <p className="text-3xl font-bold">0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Promedio por compra</p>
            <p className="text-3xl font-bold">$0</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <p className="text-gray-400 text-sm mb-2">Categoría top</p>
            <p className="text-3xl font-bold">-</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center">
          <div className="text-6xl mb-6">📸</div>
          <h2 className="text-2xl font-bold mb-3">¡Escanea tu primera boleta!</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Toma una foto de una boleta y nuestra IA extraerá automáticamente todos los datos.
          </p>
          <button className="inline-flex items-center gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(0,212,170,0.4)]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Escanear Boleta
          </button>
        </div>

        {/* Table Placeholder */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4">Historial de gastos</h2>
          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-white/10 text-gray-400 text-sm font-medium">
              <span>Fecha</span>
              <span>Tienda</span>
              <span>Categoría</span>
              <span>Total</span>
              <span>Acciones</span>
            </div>
            <div className="p-8 text-center text-gray-500">
              No hay boletas registradas aún
            </div>
          </div>
        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#00d4aa] hover:bg-[#00b894] rounded-full shadow-lg shadow-[#00d4aa]/30 flex items-center justify-center transition-all hover:scale-110">
        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>
    </div>
  );
}
