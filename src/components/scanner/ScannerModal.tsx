'use client';

import { useState, useRef, useCallback } from 'react';
import Image from 'next/image';

interface BoletaItem {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  precioNeto: number;
  iva: number;
  subtotal: number;
  subtotalNeto: number;
}

interface BoletaData {
  tienda: string;
  rutTienda: string | null;
  direccion: string | null;
  ciudad: string | null;
  numeroBoleta: string | null;
  fecha: string;
  hora: string | null;
  items: BoletaItem[];
  totalBruto: number;
  totalNeto: number;
  iva: number;
  metodoPago: string;
  categoriaSugerida: string;
  confianza: number;
}

interface ScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BoletaData, imageUrl: string) => void;
}

// Lista de ciudades comunes de Chile
const CIUDADES_CHILE = [
  'Santiago', 'Valparaíso', 'Viña del Mar', 'Concepción', 'Antofagasta',
  'Temuco', 'Rancagua', 'La Serena', 'Puerto Montt', 'Iquique',
  'Talca', 'Arica', 'Chillán', 'Valdivia', 'Osorno', 'Coquimbo',
  'Copiapó', 'Punta Arenas', 'Los Ángeles', 'Calama', 'Otra'
];

export default function ScannerModal({ isOpen, onClose, onSave }: ScannerModalProps) {
  const [step, setStep] = useState<'capture' | 'analyzing' | 'review'>('capture');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [boletaData, setBoletaData] = useState<BoletaData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [usingCamera, setUsingCamera] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  const resetState = useCallback(() => {
    setStep('capture');
    setImagePreview(null);
    setBoletaData(null);
    setError(null);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setUsingCamera(false);
  }, [stream]);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      await analyzeImage(base64.split(',')[1], file.type);
    };
    reader.readAsDataURL(file);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      setUsingCamera(true);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0);
      const base64 = canvas.toDataURL('image/jpeg');
      setImagePreview(base64);
      
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
      setUsingCamera(false);
      
      analyzeImage(base64.split(',')[1], 'image/jpeg');
    }
  };

  const analyzeImage = async (base64: string, mimeType: string) => {
    setStep('analyzing');
    setError(null);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, mimeType }),
      });

      const result = await response.json();

      if (result.success && result.data) {
        // Normalizar datos si vienen con formato antiguo
        const data = result.data;
        if (data.total && !data.totalBruto) {
          data.totalBruto = data.total;
          data.totalNeto = Math.round(data.total / 1.19);
          data.iva = data.totalBruto - data.totalNeto;
        }
        setBoletaData(data);
        setStep('review');
      } else {
        setError(result.error || 'No se pudo analizar la imagen');
        setStep('capture');
      }
    } catch (err) {
      console.error('Error analyzing:', err);
      setError('Error al conectar con el servidor');
      setStep('capture');
    }
  };

  const handleSave = () => {
    if (boletaData && imagePreview) {
      onSave(boletaData, imagePreview);
      handleClose();
    }
  };

  const updateField = (field: keyof BoletaData, value: string | number) => {
    if (boletaData) {
      setBoletaData({ ...boletaData, [field]: value });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#141414] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold">
            {step === 'capture' && 'Escanear Boleta'}
            {step === 'analyzing' && 'Analizando...'}
            {step === 'review' && 'Revisar Datos'}
          </h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          {/* Step: Capture */}
          {step === 'capture' && (
            <div className="space-y-6">
              {usingCamera ? (
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-xl bg-black" />
                  <button
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-16 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <div className="w-12 h-12 bg-[#00d4aa] rounded-full" />
                  </button>
                </div>
              ) : imagePreview ? (
                <Image src={imagePreview} alt="Preview" width={600} height={400} className="w-full rounded-xl object-contain max-h-80" />
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={startCamera} className="flex flex-col items-center justify-center gap-3 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[#00d4aa]/50 transition-colors">
                    <div className="w-16 h-16 bg-[#00d4aa]/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <span className="font-medium">Usar Cámara</span>
                  </button>
                  <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center gap-3 p-8 bg-white/5 border border-white/10 rounded-2xl hover:border-[#00d4aa]/50 transition-colors">
                    <div className="w-16 h-16 bg-[#00d4aa]/20 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-[#00d4aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <span className="font-medium">Subir Imagen</span>
                  </button>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelect} className="hidden" />
            </div>
          )}

          {/* Step: Analyzing */}
          {step === 'analyzing' && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 border-4 border-[#00d4aa] border-t-transparent rounded-full animate-spin mb-6" />
              <p className="text-gray-400">Analizando boleta con IA...</p>
              <p className="text-gray-500 text-sm mt-2">Calculando IVA y totales</p>
            </div>
          )}

          {/* Step: Review */}
          {step === 'review' && boletaData && (
            <div className="space-y-5">
              {/* Confidence */}
              <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl">
                <div className={`w-3 h-3 rounded-full ${boletaData.confianza >= 80 ? 'bg-green-500' : boletaData.confianza >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} />
                <span className="text-sm text-gray-400">Confianza: <span className="text-white font-medium">{boletaData.confianza}%</span></span>
              </div>

              {/* Image preview small */}
              {imagePreview && (
                <div className="flex justify-center">
                  <Image src={imagePreview} alt="Boleta" width={150} height={200} className="rounded-xl object-contain max-h-32" />
                </div>
              )}

              {/* Form fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Tienda</label>
                  <input type="text" value={boletaData.tienda || ''} onChange={(e) => updateField('tienda', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d4aa] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Ciudad</label>
                  <select value={boletaData.ciudad || ''} onChange={(e) => updateField('ciudad', e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00d4aa] focus:outline-none appearance-none cursor-pointer" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300d4aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}>
                    <option value="" className="bg-[#1a1a1a] text-gray-400">Seleccionar...</option>
                    {CIUDADES_CHILE.map(c => <option key={c} value={c} className="bg-[#1a1a1a] text-white">{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Fecha</label>
                  <input type="date" value={boletaData.fecha || ''} onChange={(e) => updateField('fecha', e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-[#00d4aa] focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Categoría</label>
                  <select value={boletaData.categoriaSugerida || 'otro'} onChange={(e) => updateField('categoriaSugerida', e.target.value)} className="w-full bg-[#1a1a1a] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-[#00d4aa] focus:outline-none appearance-none cursor-pointer" style={{backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2300d4aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem'}}>
                    <option value="supermercado" className="bg-[#1a1a1a] text-white">Supermercado</option>
                    <option value="farmacia" className="bg-[#1a1a1a] text-white">Farmacia</option>
                    <option value="restaurante" className="bg-[#1a1a1a] text-white">Restaurante</option>
                    <option value="transporte" className="bg-[#1a1a1a] text-white">Transporte</option>
                    <option value="servicios" className="bg-[#1a1a1a] text-white">Servicios</option>
                    <option value="entretenimiento" className="bg-[#1a1a1a] text-white">Entretenimiento</option>
                    <option value="ropa" className="bg-[#1a1a1a] text-white">Ropa</option>
                    <option value="tecnologia" className="bg-[#1a1a1a] text-white">Tecnología</option>
                    <option value="hogar" className="bg-[#1a1a1a] text-white">Hogar</option>
                    <option value="salud" className="bg-[#1a1a1a] text-white">Salud</option>
                    <option value="educacion" className="bg-[#1a1a1a] text-white">Educación</option>
                    <option value="alimentos" className="bg-[#1a1a1a] text-white">Alimentos</option>
                    <option value="otro" className="bg-[#1a1a1a] text-white">Otro</option>
                  </select>
                </div>
              </div>

              {/* Totales con IVA */}
              <div className="bg-white/5 rounded-xl p-4">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Resumen de Montos</h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-xs text-gray-400">Neto</p>
                    <p className="text-lg font-bold">${(boletaData.totalNeto || 0).toLocaleString('es-CL')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">IVA (19%)</p>
                    <p className="text-lg font-bold text-orange-400">${(boletaData.iva || 0).toLocaleString('es-CL')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Total Bruto</p>
                    <p className="text-lg font-bold text-[#00d4aa]">${(boletaData.totalBruto || 0).toLocaleString('es-CL')}</p>
                  </div>
                </div>
              </div>

              {/* Items con IVA detallado */}
              <div>
                <label className="block text-xs text-gray-400 mb-2">Productos ({boletaData.items?.length || 0})</label>
                <div className="space-y-2 max-h-36 overflow-y-auto">
                  {boletaData.items?.map((item, index) => (
                    <div key={index} className="bg-white/5 rounded-lg px-3 py-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.cantidad}x {item.descripcion}</span>
                        <span className="text-[#00d4aa]">${(item.subtotal || 0).toLocaleString('es-CL')}</span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Neto: ${(item.subtotalNeto || Math.round((item.subtotal || 0) / 1.19)).toLocaleString('es-CL')}</span>
                        <span>IVA: ${(item.iva || Math.round((item.subtotal || 0) - (item.subtotal || 0) / 1.19)).toLocaleString('es-CL')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-white/10">
          {step === 'capture' && imagePreview && (
            <button onClick={resetState} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Volver</button>
          )}
          {step === 'review' && (
            <>
              <button onClick={() => setStep('capture')} className="px-4 py-2 text-gray-400 hover:text-white transition-colors">Escanear otra</button>
              <button onClick={handleSave} className="bg-[#00d4aa] hover:bg-[#00b894] text-black font-medium px-6 py-2 rounded-lg transition-colors">Guardar Boleta</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
