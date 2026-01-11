/**
 * Tipos para boletas y gastos
 */

// Item individual de una boleta con IVA detallado
export interface BoletaItem {
  cantidad: number;
  descripcion: string;
  precioUnitario: number;   // Precio unitario con IVA
  precioNeto: number;       // Precio sin IVA
  iva: number;              // IVA del producto
  subtotal: number;         // Total con IVA (cantidad * precioUnitario)
  subtotalNeto: number;     // Total sin IVA
}

// Boleta completa
export interface Boleta {
  id: string;
  fecha: Date;
  tienda: string;
  rutTienda: string;
  direccion: string;
  ciudad: string;           // Ciudad donde se realizó la compra
  numeroBoleta: string;
  items: BoletaItem[];
  totalBruto: number;       // Total con IVA
  totalNeto: number;        // Total sin IVA
  iva: number;              // IVA total
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
  ciudad: string;
  numeroBoleta: string;
  fecha: string;
  hora: string;
  items: BoletaItem[];
  totalBruto: number;       // Total con IVA
  totalNeto: number;        // Total sin IVA
  iva: number;              // IVA total
  metodoPago: string;
  categoriaSugerida: BoletaCategoria;
  confianza: number;
}

// Filtros para la tabla de boletas
export interface BoletaFiltros {
  fechaDesde?: Date;
  fechaHasta?: Date;
  categoria?: BoletaCategoria;
  tienda?: string;
  ciudad?: string;
  montoMinimo?: number;
  montoMaximo?: number;
}

// Estadísticas de gastos
export interface GastosEstadisticas {
  totalMes: number;
  totalSemana: number;
  totalHoy: number;
  ivaTotalMes: number;
  porCategoria: Record<BoletaCategoria, number>;
  cantidadBoletas: number;
  promedioGasto: number;
}
