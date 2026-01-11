/**
 * Generador de archivos Excel con IVA detallado
 * 
 * Usa SheetJS (xlsx) para crear archivos Excel
 */

import * as XLSX from 'xlsx';
import type { Boleta, BoletaItem } from '@/types';

/**
 * Genera un archivo Excel a partir de las boletas
 */
export function generarExcel(
  boletas: Boleta[],
  nombreArchivo: string = 'mis-gastos'
): Uint8Array {
  const workbook = XLSX.utils.book_new();

  // Hoja 1: Resumen de boletas con IVA detallado
  const resumenData = boletas.map((b) => ({
    'Fecha': formatDate(b.fecha),
    'Tienda': b.tienda,
    'Ciudad': b.ciudad || '-',
    'RUT': b.rutTienda || '-',
    'N° Boleta': b.numeroBoleta || '-',
    'Categoría': b.categoria,
    'Neto': b.totalNeto,
    'IVA': b.iva,
    'Total Bruto': b.totalBruto,
    'Método Pago': b.metodoPago || '-',
  }));

  const resumenSheet = XLSX.utils.json_to_sheet(resumenData);
  resumenSheet['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 15 }, { wch: 12 },
    { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

  // Hoja 2: Detalle de productos con IVA por producto
  const detalleData: Record<string, unknown>[] = [];
  boletas.forEach((b) => {
    (b.items || []).forEach((item: BoletaItem) => {
      detalleData.push({
        'Fecha': formatDate(b.fecha),
        'Tienda': b.tienda,
        'Ciudad': b.ciudad || '-',
        'N° Boleta': b.numeroBoleta || '-',
        'Producto': item.descripcion,
        'Cantidad': item.cantidad,
        'Precio Neto': item.precioNeto || Math.round(item.precioUnitario / 1.19),
        'IVA Unit.': item.iva || Math.round(item.precioUnitario - item.precioUnitario / 1.19),
        'Precio c/IVA': item.precioUnitario,
        'Subtotal Neto': item.subtotalNeto || Math.round(item.subtotal / 1.19),
        'IVA Total': item.iva ? item.iva * item.cantidad : Math.round(item.subtotal - item.subtotal / 1.19),
        'Subtotal Bruto': item.subtotal,
      });
    });
  });

  const detalleSheet = XLSX.utils.json_to_sheet(detalleData);
  detalleSheet['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 35 },
    { wch: 10 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
    { wch: 10 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, detalleSheet, 'Detalle Productos');

  // Hoja 3: Gastos por categoría
  const porCategoria = calcularPorCategoria(boletas);
  const totalGeneral = boletas.reduce((sum, b) => sum + b.totalBruto, 0);
  const ivaGeneral = boletas.reduce((sum, b) => sum + b.iva, 0);
  const categoriaData = Object.entries(porCategoria).map(([cat, totales]) => ({
    'Categoría': cat,
    'Total Neto': totales.neto,
    'IVA': totales.iva,
    'Total Bruto': totales.bruto,
    'Porcentaje': `${((totales.bruto / totalGeneral) * 100).toFixed(1)}%`,
  }));

  // Agregar fila de totales
  categoriaData.push({
    'Categoría': 'TOTAL GENERAL',
    'Total Neto': totalGeneral - ivaGeneral,
    'IVA': ivaGeneral,
    'Total Bruto': totalGeneral,
    'Porcentaje': '100%',
  });

  const categoriaSheet = XLSX.utils.json_to_sheet(categoriaData);
  categoriaSheet['!cols'] = [
    { wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, categoriaSheet, 'Por Categoría');

  // Hoja 4: Gastos por ciudad
  const porCiudad = calcularPorCiudad(boletas);
  const ciudadData = Object.entries(porCiudad).map(([ciudad, totales]) => ({
    'Ciudad': ciudad,
    'Boletas': totales.cantidad,
    'Total Neto': totales.neto,
    'IVA': totales.iva,
    'Total Bruto': totales.bruto,
  }));

  const ciudadSheet = XLSX.utils.json_to_sheet(ciudadData);
  XLSX.utils.book_append_sheet(workbook, ciudadSheet, 'Por Ciudad');

  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new Uint8Array(buffer);
}

/**
 * Descarga el archivo Excel en el navegador
 */
export function descargarExcel(boletas: Boleta[], nombreArchivo: string = 'mis-gastos'): void {
  const buffer = generarExcel(boletas, nombreArchivo);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombreArchivo}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// Helpers
function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('es-CL');
}

interface TotalesCategoria {
  neto: number;
  iva: number;
  bruto: number;
}

function calcularPorCategoria(boletas: Boleta[]): Record<string, TotalesCategoria> {
  return boletas.reduce((acc, b) => {
    if (!acc[b.categoria]) {
      acc[b.categoria] = { neto: 0, iva: 0, bruto: 0 };
    }
    acc[b.categoria].neto += b.totalNeto;
    acc[b.categoria].iva += b.iva;
    acc[b.categoria].bruto += b.totalBruto;
    return acc;
  }, {} as Record<string, TotalesCategoria>);
}

interface TotalesCiudad {
  cantidad: number;
  neto: number;
  iva: number;
  bruto: number;
}

function calcularPorCiudad(boletas: Boleta[]): Record<string, TotalesCiudad> {
  return boletas.reduce((acc, b) => {
    const ciudad = b.ciudad || 'Sin especificar';
    if (!acc[ciudad]) {
      acc[ciudad] = { cantidad: 0, neto: 0, iva: 0, bruto: 0 };
    }
    acc[ciudad].cantidad += 1;
    acc[ciudad].neto += b.totalNeto;
    acc[ciudad].iva += b.iva;
    acc[ciudad].bruto += b.totalBruto;
    return acc;
  }, {} as Record<string, TotalesCiudad>);
}

export { XLSX };
