/**
 * Generador de archivos Excel
 * 
 * Usa SheetJS (xlsx) para crear archivos Excel
 */

import * as XLSX from 'xlsx';
import type { Boleta } from '@/types';

/**
 * Genera un archivo Excel a partir de las boletas
 * @param boletas - Array de boletas
 * @param nombreArchivo - Nombre del archivo (sin extensión)
 * @returns Buffer del archivo Excel
 */
export function generarExcel(
  boletas: Boleta[],
  nombreArchivo: string = 'mis-gastos'
): Uint8Array {
  // Crear libro de trabajo
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Resumen de boletas
  const resumenData = boletas.map((b) => ({
    'Fecha': formatDate(b.fecha),
    'Tienda': b.tienda,
    'RUT': b.rutTienda,
    'N° Boleta': b.numeroBoleta,
    'Categoría': b.categoria,
    'Subtotal': b.total - b.iva,
    'IVA': b.iva,
    'Total': b.total,
    'Método Pago': b.metodoPago,
  }));

  const resumenSheet = XLSX.utils.json_to_sheet(resumenData);
  
  // Ajustar ancho de columnas
  resumenSheet['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 25 }, // Tienda
    { wch: 15 }, // RUT
    { wch: 12 }, // N° Boleta
    { wch: 15 }, // Categoría
    { wch: 12 }, // Subtotal
    { wch: 10 }, // IVA
    { wch: 12 }, // Total
    { wch: 15 }, // Método Pago
  ];

  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

  // Hoja 2: Detalle de productos
  const detalleData: Record<string, unknown>[] = [];
  boletas.forEach((b) => {
    b.items.forEach((item) => {
      detalleData.push({
        'Fecha': formatDate(b.fecha),
        'Tienda': b.tienda,
        'N° Boleta': b.numeroBoleta,
        'Producto': item.descripcion,
        'Cantidad': item.cantidad,
        'Precio Unit.': item.precioUnitario,
        'Subtotal': item.subtotal,
      });
    });
  });

  const detalleSheet = XLSX.utils.json_to_sheet(detalleData);
  detalleSheet['!cols'] = [
    { wch: 12 }, // Fecha
    { wch: 25 }, // Tienda
    { wch: 12 }, // N° Boleta
    { wch: 35 }, // Producto
    { wch: 10 }, // Cantidad
    { wch: 12 }, // Precio Unit.
    { wch: 12 }, // Subtotal
  ];

  XLSX.utils.book_append_sheet(workbook, detalleSheet, 'Detalle Productos');

  // Hoja 3: Gastos por categoría
  const porCategoria = calcularPorCategoria(boletas);
  const totalGeneral = boletas.reduce((sum, b) => sum + b.total, 0);
  const categoriaData = Object.entries(porCategoria).map(([cat, total]) => ({
    'Categoría': cat,
    'Total': total,
    'Porcentaje': `${((total / totalGeneral) * 100).toFixed(1)}%`,
  }));

  const categoriaSheet = XLSX.utils.json_to_sheet(categoriaData);
  XLSX.utils.book_append_sheet(workbook, categoriaSheet, 'Por Categoría');

  // Generar buffer
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(buffer);
}

/**
 * Descarga el archivo Excel en el navegador
 */
export function descargarExcel(boletas: Boleta[], nombreArchivo: string = 'mis-gastos'): void {
  const workbook = XLSX.utils.book_new();

  // Crear hojas (mismo proceso que arriba pero para cliente)
  const resumenData = boletas.map((b) => ({
    'Fecha': formatDate(b.fecha),
    'Tienda': b.tienda,
    'RUT': b.rutTienda,
    'N° Boleta': b.numeroBoleta,
    'Categoría': b.categoria,
    'Subtotal': b.total - b.iva,
    'IVA': b.iva,
    'Total': b.total,
    'Método Pago': b.metodoPago,
  }));

  const resumenSheet = XLSX.utils.json_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

  // Descargar
  XLSX.writeFile(workbook, `${nombreArchivo}.xlsx`);
}

// Helpers
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-CL');
}

function calcularPorCategoria(boletas: Boleta[]): Record<string, number> {
  return boletas.reduce((acc, b) => {
    acc[b.categoria] = (acc[b.categoria] || 0) + b.total;
    return acc;
  }, {} as Record<string, number>);
}

export { XLSX };
