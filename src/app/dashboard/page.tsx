'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import ScannerModal from '@/components/scanner/ScannerModal';

interface BoletaItem {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  precioNeto: number;
  iva: number;
  subtotal: number;
  subtotalNeto: number;
}

interface Boleta {
  id: string;
  tienda: string;
  ciudad: string;
  fecha: Date;
  totalBruto: number;
  totalNeto: number;
  iva: number;
  categoria: string;
  imagenURL: string;
  items: BoletaItem[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [stats, setStats] = useState({
    totalMes: 0,
    ivaTotalMes: 0,
    cantidadBoletas: 0,
    promedio: 0,
    categoriaTop: '-'
  });

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

  // Cargar boletas del usuario
  useEffect(() => {
    if (!user) return;

    const boletasRef = collection(db, 'boletas');
    const q = query(
      boletasRef,
      where('userId', '==', user.uid),
      orderBy('fecha', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boletasData: Boleta[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        boletasData.push({
          id: doc.id,
          tienda: data.tienda,
          ciudad: data.ciudad || '-',
          fecha: data.fecha?.toDate() || new Date(),
          totalBruto: data.totalBruto || data.total || 0,
          totalNeto: data.totalNeto || Math.round((data.totalBruto || data.total || 0) / 1.19),
          iva: data.iva || 0,
          categoria: data.categoria,
          imagenURL: data.imagenURL,
          items: data.items || [],
        });
      });
      setBoletas(boletasData);

      // Calcular estadísticas
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const boletasMes = boletasData.filter(b => b.fecha >= firstDayOfMonth);
      const totalMes = boletasMes.reduce((sum, b) => sum + b.totalBruto, 0);
      const ivaTotalMes = boletasMes.reduce((sum, b) => sum + b.iva, 0);
      const promedio = boletasMes.length > 0 ? totalMes / boletasMes.length : 0;

      const categorias: Record<string, number> = {};
      boletasMes.forEach(b => {
        categorias[b.categoria] = (categorias[b.categoria] || 0) + 1;
      });
      const categoriaTop = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      setStats({
        totalMes,
        ivaTotalMes,
        cantidadBoletas: boletasData.length,
        promedio: Math.round(promedio),
        categoriaTop
      });
    }, (error) => {
      console.error('Error loading boletas:', error);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const handleSaveBoleta = useCallback(async (data: {
    tienda: string;
    fecha: string;
    totalBruto: number;
    totalNeto: number;
    iva: number;
    categoriaSugerida: string;
    ciudad?: string | null;
    items?: BoletaItem[];
    rutTienda?: string | null;
    direccion?: string | null;
    numeroBoleta?: string | null;
    metodoPago?: string;
  }, imageUrl: string) => {
    if (!user) return;

    try {
      await addDoc(collection(db, 'boletas'), {
        userId: user.uid,
        tienda: data.tienda,
        ciudad: data.ciudad || 'Sin especificar',
        rutTienda: data.rutTienda || null,
        direccion: data.direccion || null,
        numeroBoleta: data.numeroBoleta || null,
        fecha: Timestamp.fromDate(new Date(data.fecha)),
        items: data.items || [],
        totalBruto: data.totalBruto,
        totalNeto: data.totalNeto,
        iva: data.iva,
        metodoPago: data.metodoPago || 'otro',
        categoria: data.categoriaSugerida,
        imagenURL: imageUrl,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error('Error saving boleta:', error);
    }
  }, [user]);

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
        <Link href="/" className="flex items-center gap-3">
          <Image src="/logo.png" alt="Boleta Scanner" width={36} height={36} className="rounded-lg" />
          <span className="text-lg font-semibold">Boleta Scanner</span>
        </Link>
        
        <div className="flex items-center gap-4">
          {user?.photoURL && <Image src={user.photoURL} alt="Profile" width={36} height={36} className="rounded-full" />}
          <span className="text-gray-300 hidden sm:block">{user?.displayName || user?.email}</span>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors">Salir</button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="p-6 md:p-10">
        {/* Welcome Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Hola, {user?.displayName?.split(' ')[0] || 'Usuario'} 👋</h1>
          <p className="text-gray-400">Aquí puedes ver y gestionar todos tus gastos</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Gastos este mes</p>
            <p className="text-2xl font-bold text-[#00d4aa]">${stats.totalMes.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">IVA del mes</p>
            <p className="text-2xl font-bold text-orange-400">${stats.ivaTotalMes.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Boletas</p>
            <p className="text-2xl font-bold">{stats.cantidadBoletas}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Promedio</p>
            <p className="text-2xl font-bold">${stats.promedio.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">Categoría top</p>
            <p className="text-2xl font-bold capitalize">{stats.categoriaTop}</p>
          </div>
        </div>

        {/* Content */}
        {boletas.length === 0 ? (
          <div className="bg-white/5 border border-white/10 border-dashed rounded-2xl p-12 text-center">
            <div className="text-6xl mb-6">📸</div>
            <h2 className="text-2xl font-bold mb-3">¡Escanea tu primera boleta!</h2>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">Toma una foto de una boleta y nuestra IA extraerá automáticamente todos los datos.</p>
            <button onClick={() => setShowScanner(true)} className="inline-flex items-center gap-2 bg-[#00d4aa] hover:bg-[#00b894] text-black font-semibold px-8 py-4 rounded-full transition-all hover:shadow-[0_0_30px_rgba(0,212,170,0.4)]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Escanear Boleta
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Historial de gastos</h2>
              <button onClick={() => setShowScanner(true)} className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Boleta
              </button>
            </div>
            
            {/* Table with IVA columns */}
            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400">
                    <th className="text-left p-4 font-medium">Fecha</th>
                    <th className="text-left p-4 font-medium">Tienda</th>
                    <th className="text-left p-4 font-medium">Ciudad</th>
                    <th className="text-left p-4 font-medium">Categoría</th>
                    <th className="text-right p-4 font-medium">Neto</th>
                    <th className="text-right p-4 font-medium">IVA</th>
                    <th className="text-right p-4 font-medium">Total</th>
                    <th className="text-center p-4 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {boletas.map((boleta) => (
                    <tr key={boleta.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="p-4">{boleta.fecha.toLocaleDateString('es-CL')}</td>
                      <td className="p-4 font-medium">{boleta.tienda}</td>
                      <td className="p-4 text-gray-400">{boleta.ciudad}</td>
                      <td className="p-4 capitalize">{boleta.categoria}</td>
                      <td className="p-4 text-right">${boleta.totalNeto.toLocaleString('es-CL')}</td>
                      <td className="p-4 text-right text-orange-400">${boleta.iva.toLocaleString('es-CL')}</td>
                      <td className="p-4 text-right text-[#00d4aa] font-medium">${boleta.totalBruto.toLocaleString('es-CL')}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button className="text-gray-400 hover:text-white transition-colors p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button className="text-gray-400 hover:text-red-400 transition-colors p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <button onClick={() => setShowScanner(true)} className="fixed bottom-8 right-8 w-16 h-16 bg-[#00d4aa] hover:bg-[#00b894] rounded-full shadow-lg shadow-[#00d4aa]/30 flex items-center justify-center transition-all hover:scale-110">
        <svg className="w-8 h-8 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Scanner Modal */}
      <ScannerModal isOpen={showScanner} onClose={() => setShowScanner(false)} onSave={handleSaveBoleta} />
    </div>
  );
}
