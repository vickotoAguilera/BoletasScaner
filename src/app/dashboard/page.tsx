'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { collection, query, where, orderBy, onSnapshot, addDoc, deleteDoc, doc, Timestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import ScannerModal from '@/components/scanner/ScannerModal';
import { descargarExcel, generarExcel } from '@/lib/excel';
import { uploadExcelToDrive } from '@/lib/googleDrive';
import type { Boleta as BoletaType } from '@/types';

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
  rutTienda?: string;
  direccion?: string;
  numeroBoleta?: string;
  metodoPago?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [boletas, setBoletas] = useState<Boleta[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [selectedBoleta, setSelectedBoleta] = useState<Boleta | null>(null);
  const [showZoom, setShowZoom] = useState(false);
  const [driveUploading, setDriveUploading] = useState(false);
  const [stats, setStats] = useState({
    totalGeneral: 0,
    ivaTotal: 0,
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
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        boletasData.push({
          id: docSnap.id,
          tienda: data.tienda,
          ciudad: data.ciudad || '-',
          fecha: data.fecha?.toDate() || new Date(),
          totalBruto: data.totalBruto || data.total || 0,
          totalNeto: data.totalNeto || Math.round((data.totalBruto || data.total || 0) / 1.19),
          iva: data.iva || Math.round((data.totalBruto || data.total || 0) - (data.totalBruto || data.total || 0) / 1.19),
          categoria: data.categoria,
          imagenURL: data.imagenURL,
          items: data.items || [],
          rutTienda: data.rutTienda,
          direccion: data.direccion,
          numeroBoleta: data.numeroBoleta,
          metodoPago: data.metodoPago,
        });
      });
      setBoletas(boletasData);

      // Calcular estadísticas (total general, no solo del mes)
      const totalGeneral = boletasData.reduce((sum, b) => sum + b.totalBruto, 0);
      const ivaTotal = boletasData.reduce((sum, b) => sum + b.iva, 0);
      const promedio = boletasData.length > 0 ? totalGeneral / boletasData.length : 0;

      const categorias: Record<string, number> = {};
      boletasData.forEach(b => {
        categorias[b.categoria] = (categorias[b.categoria] || 0) + 1;
      });
      const categoriaTop = Object.entries(categorias).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';

      setStats({
        totalGeneral,
        ivaTotal,
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

  const handleDeleteBoleta = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta boleta?')) return;
    try {
      await deleteDoc(doc(db, 'boletas', id));
    } catch (error) {
      console.error('Error deleting boleta:', error);
    }
  };

  const handleExportExcel = () => {
    if (boletas.length === 0) {
      alert('No hay boletas para exportar');
      return;
    }
    // Convertir a formato requerido por excel
    const boletasExport: BoletaType[] = boletas.map(b => ({
      id: b.id,
      tienda: b.tienda,
      ciudad: b.ciudad,
      fecha: b.fecha,
      totalBruto: b.totalBruto,
      totalNeto: b.totalNeto,
      iva: b.iva,
      categoria: b.categoria as BoletaType['categoria'],
      imagenURL: b.imagenURL,
      items: b.items,
      rutTienda: b.rutTienda || '',
      direccion: b.direccion || '',
      numeroBoleta: b.numeroBoleta || '',
      metodoPago: (b.metodoPago || 'otro') as BoletaType['metodoPago'],
      createdAt: new Date(),
      updatedAt: new Date(),
    }));
    descargarExcel(boletasExport, `boletas-${new Date().toISOString().split('T')[0]}`);
  };

  const handleUploadToDrive = async () => {
    if (boletas.length === 0) {
      alert('No hay boletas para exportar');
      return;
    }

    setDriveUploading(true);

    try {
      // Obtener access token con scope de Drive mediante re-autenticación
      const provider = new GoogleAuthProvider();
      provider.addScope('https://www.googleapis.com/auth/drive.file');
      
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const accessToken = credential?.accessToken;

      if (!accessToken) {
        throw new Error('No se pudo obtener acceso a Google Drive');
      }

      // Convertir boletas al formato requerido
      const boletasExport: BoletaType[] = boletas.map(b => ({
        id: b.id,
        tienda: b.tienda,
        ciudad: b.ciudad,
        fecha: b.fecha,
        totalBruto: b.totalBruto,
        totalNeto: b.totalNeto,
        iva: b.iva,
        categoria: b.categoria as BoletaType['categoria'],
        imagenURL: b.imagenURL,
        items: b.items,
        rutTienda: b.rutTienda || '',
        direccion: b.direccion || '',
        numeroBoleta: b.numeroBoleta || '',
        metodoPago: (b.metodoPago || 'otro') as BoletaType['metodoPago'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Generar Excel
      const excelBuffer = generarExcel(boletasExport);
      const fileName = `boletas-${new Date().toISOString().split('T')[0]}`;

      // Subir a Drive
      const uploadResult = await uploadExcelToDrive(accessToken, excelBuffer, fileName);

      if (uploadResult.success && uploadResult.fileId) {
        // Mostrar éxito con enlaces
        const openFile = confirm(
          `✅ Excel subido exitosamente!\n\n` +
          `📁 Carpeta: "Boleta Scanner" en tu Drive\n` +
          `📄 Archivo: ${fileName}.xlsx\n\n` +
          `¿Quieres abrir el archivo en Google Drive?`
        );
        
        if (openFile) {
          window.open(`https://drive.google.com/file/d/${uploadResult.fileId}/view`, '_blank');
        }
      } else {
        throw new Error(uploadResult.error || 'Error al subir');
      }
    } catch (error) {
      console.error('Error uploading to Drive:', error);
      if (error instanceof Error && error.message.includes('popup')) {
        alert('Por favor permite el popup para conectar con Google Drive');
      } else if (error instanceof Error && error.message.includes('Acceso denegado')) {
        alert('⚠️ ' + error.message);
      } else {
        alert('Error al subir a Google Drive: ' + (error instanceof Error ? error.message : 'Intenta de nuevo'));
      }
    } finally {
      setDriveUploading(false);
    }
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
            <p className="text-gray-400 text-xs mb-1">Gastos totales</p>
            <p className="text-2xl font-bold text-[#00d4aa]">${stats.totalGeneral.toLocaleString('es-CL')}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <p className="text-gray-400 text-xs mb-1">IVA total</p>
            <p className="text-2xl font-bold text-orange-400">${stats.ivaTotal.toLocaleString('es-CL')}</p>
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
            <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
              <h2 className="text-xl font-semibold">Historial de gastos</h2>
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar
                </button>
                <button onClick={handleUploadToDrive} disabled={driveUploading} className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  {driveUploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M7.71 3.5L1.15 15l4.58 7.5h13.54l4.58-7.5L17.29 3.5H7.71zm.79 1.5h7l5.14 8.5-2.28 3.75H6.64L4.36 13.5 8.5 5z"/>
                    </svg>
                  )}
                  {driveUploading ? 'Subiendo...' : 'Subir a Drive'}
                </button>
                <button onClick={() => setShowScanner(true)} className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Nueva Boleta
                </button>
              </div>
            </div>
            
            {/* Table */}
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
                          <button onClick={() => setSelectedBoleta(boleta)} className="text-gray-400 hover:text-[#00d4aa] transition-colors p-1" title="Ver detalle">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button onClick={() => handleDeleteBoleta(boleta.id)} className="text-gray-400 hover:text-red-400 transition-colors p-1" title="Eliminar">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

      {/* Detail Modal */}
      {selectedBoleta && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#141414] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10">
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h2 className="text-xl font-semibold">Detalle de Boleta</h2>
              <button onClick={() => setSelectedBoleta(null)} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Imagen con zoom */}
                <div className="relative">
                  {selectedBoleta.imagenURL && (
                    <>
                      <Image 
                        src={selectedBoleta.imagenURL} 
                        alt="Boleta" 
                        width={400} 
                        height={600} 
                        className="rounded-xl object-contain w-full max-h-80 bg-white/5 cursor-zoom-in hover:opacity-90 transition-opacity" 
                        onClick={() => setShowZoom(true)}
                      />
                      <p className="text-xs text-gray-500 text-center mt-2">Clic para ampliar</p>
                    </>
                  )}
                </div>
                {/* Datos */}
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-gray-400">Tienda</p>
                    <p className="text-lg font-medium">{selectedBoleta.tienda}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Fecha</p>
                      <p>{selectedBoleta.fecha.toLocaleDateString('es-CL')}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Ciudad</p>
                      <p>{selectedBoleta.ciudad}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Categoría</p>
                      <p className="capitalize">{selectedBoleta.categoria}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">N° Boleta</p>
                      <p>{selectedBoleta.numeroBoleta || '-'}</p>
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-xl p-4">
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div>
                        <p className="text-xs text-gray-400">Neto</p>
                        <p className="text-lg font-bold">${selectedBoleta.totalNeto.toLocaleString('es-CL')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">IVA</p>
                        <p className="text-lg font-bold text-orange-400">${selectedBoleta.iva.toLocaleString('es-CL')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total</p>
                        <p className="text-lg font-bold text-[#00d4aa]">${selectedBoleta.totalBruto.toLocaleString('es-CL')}</p>
                      </div>
                    </div>
                  </div>
                  {selectedBoleta.items && selectedBoleta.items.length > 0 && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Productos ({selectedBoleta.items.length})</p>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {selectedBoleta.items.map((item, i) => (
                          <div key={i} className="bg-white/5 rounded-lg px-3 py-2 text-sm flex justify-between">
                            <span>{item.cantidad}x {item.descripcion}</span>
                            <span className="text-[#00d4aa]">${item.subtotal.toLocaleString('es-CL')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Zoom Modal */}
      {showZoom && selectedBoleta?.imagenURL && (
        <div 
          className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setShowZoom(false)}
        >
          <button 
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 bg-white/10 rounded-full"
            onClick={() => setShowZoom(false)}
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <Image 
            src={selectedBoleta.imagenURL} 
            alt="Boleta ampliada" 
            width={1200} 
            height={1600} 
            className="max-w-full max-h-[95vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">Clic fuera para cerrar o usa la X</p>
        </div>
      )}
    </div>
  );
}
