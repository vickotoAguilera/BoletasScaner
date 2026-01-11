/**
 * Tipos para boletas y gastos
 */

// Item individual de una boleta
export interface BoletaItem {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;
  subtotal: number;
}

// Boleta completa
export interface Boleta {
  id: string;
  fecha: Date;
  tienda: string;
  rutTienda: string;
  direccion: string;
  numeroBoleta: string;
  items: BoletaItem[];
  total: number;
  iva: number;
  metodoPago: 'efectivo' | 'debito' | 'credito' | 'transferencia' | 'otro';
  categoria: BoletaCategoria;
  imagenURL: string;
  createdAt: Date;
  updatedAt: Date;
}

// Categorías de gastos
export type BoletaCategoria =
  | 'alimentos'
  | 'supermercado'
  | 'farmacia'
  | 'transporte'
  | 'servicios'
  | 'entretenimiento'
  | 'ropa'
  | 'tecnologia'
  | 'hogar'
  | 'salud'
  | 'educacion'
  | 'restaurante'
  | 'otro';

// Datos extraídos por la IA (antes de guardar)
export interface BoletaExtraida {
  tienda: string;
  rutTienda: string;
  direccion: string;
  numeroBoleta: string;
  fecha: string;
  hora: string;
  items: BoletaItem[];
  total: number;
  iva: number;
  metodoPago: string;
  categoriaSugerida: BoletaCategoria;
  confianza: number; // 0-100 porcentaje de confianza de la IA
}

// Filtros para la tabla de boletas
export interface BoletaFiltros {
  fechaDesde?: Date;
  fechaHasta?: Date;
  categoria?: BoletaCategoria;
  tienda?: string;
  montoMinimo?: number;
  montoMaximo?: number;
}

// Estadísticas de gastos
export interface GastosEstadisticas {
  totalMes: number;
  totalSemana: number;
  totalHoy: number;
  porCategoria: Record<BoletaCategoria, number>;
  cantidadBoletas: number;
  promedioGasto: number;
}
