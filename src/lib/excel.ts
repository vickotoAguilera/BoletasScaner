/**
 * Generador de archivos Excel con IVA detallado
 * Ordenado cronológicamente (más antiguo primero)
 * 
 * Usa SheetJS (xlsx) para crear archivos Excel
 */

import * as XLSX from 'xlsx';
import type { Boleta, BoletaItem } from '@/types';

/**
 * Genera un archivo Excel a partir de las boletas
 * Ordenado por fecha (más antigua primero para seguir orden cronológico)
 */
export function generarExcel(
  boletas: Boleta[],
  nombreArchivo: string = 'mis-gastos'
): Uint8Array {
  const workbook = XLSX.utils.book_new();

  // Ordenar por fecha (más antigua primero)
  const boletasOrdenadas = [...boletas].sort((a, b) => 
    new Date(a.fecha).getTime() - new Date(b.fecha).getTime()
  );

  // Hoja 1: Resumen de boletas con IVA detallado
  const resumenData = boletasOrdenadas.map((b, index) => ({
    '#': index + 1,
    'Fecha': formatDate(b.fecha),
    'Hora': formatTime(b.fecha),
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
    { wch: 5 }, { wch: 12 }, { wch: 8 }, { wch: 25 }, { wch: 15 }, 
    { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 10 }, 
    { wch: 12 }, { wch: 15 },
  ];
  XLSX.utils.book_append_sheet(workbook, resumenSheet, 'Resumen');

  // Hoja 2: Detalle de productos con IVA por producto
  const detalleData: Record<string, unknown>[] = [];
  boletasOrdenadas.forEach((b) => {
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
  const categoriaData = Object.entries(porCategoria)
    .sort((a, b) => b[1].bruto - a[1].bruto) // Ordenar por total descendente
    .map(([cat, totales]) => ({
      'Categoría': cat.charAt(0).toUpperCase() + cat.slice(1),
      'Cantidad': totales.cantidad,
      'Total Neto': totales.neto,
      'IVA': totales.iva,
      'Total Bruto': totales.bruto,
      'Porcentaje': `${((totales.bruto / totalGeneral) * 100).toFixed(1)}%`,
    }));

  // Agregar fila de totales
  categoriaData.push({
    'Categoría': '📊 TOTAL GENERAL',
    'Cantidad': boletas.length,
    'Total Neto': totalGeneral - ivaGeneral,
    'IVA': ivaGeneral,
    'Total Bruto': totalGeneral,
    'Porcentaje': '100%',
  });

  const categoriaSheet = XLSX.utils.json_to_sheet(categoriaData);
  categoriaSheet['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, categoriaSheet, 'Por Categoría');

  // Hoja 4: Gastos por ciudad
  const porCiudad = calcularPorCiudad(boletas);
  const ciudadData = Object.entries(porCiudad)
    .sort((a, b) => b[1].bruto - a[1].bruto)
    .map(([ciudad, totales]) => ({
      'Ciudad': ciudad,
      'Boletas': totales.cantidad,
      'Total Neto': totales.neto,
      'IVA': totales.iva,
      'Total Bruto': totales.bruto,
      'Porcentaje': `${((totales.bruto / totalGeneral) * 100).toFixed(1)}%`,
    }));

  const ciudadSheet = XLSX.utils.json_to_sheet(ciudadData);
  ciudadSheet['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, ciudadSheet, 'Por Ciudad');

  // Hoja 5: Resumen por mes (gastos mensuales)
  const porMes = calcularPorMes(boletas);
  const mesData = Object.entries(porMes)
    .sort((a, b) => a[0].localeCompare(b[0])) // Ordenar cronológicamente
    .map(([mes, totales]) => ({
      'Mes': formatMes(mes),
      'Boletas': totales.cantidad,
      'Total Neto': totales.neto,
      'IVA': totales.iva,
      'Total Bruto': totales.bruto,
      'Promedio': Math.round(totales.bruto / totales.cantidad),
    }));

  const mesSheet = XLSX.utils.json_to_sheet(mesData);
  mesSheet['!cols'] = [
    { wch: 18 }, { wch: 10 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, mesSheet, 'Por Mes');

  // Hoja 6: Estadísticas generales
  const fechas = boletas.map(b => new Date(b.fecha));
  const fechaMin = new Date(Math.min(...fechas.map(d => d.getTime())));
  const fechaMax = new Date(Math.max(...fechas.map(d => d.getTime())));
  const promedioGasto = boletas.length > 0 ? totalGeneral / boletas.length : 0;
  const gastoMayor = Math.max(...boletas.map(b => b.totalBruto), 0);
  const gastoMenor = Math.min(...boletas.map(b => b.totalBruto), 0);

  const statsData = [
    { 'Estadística': '📅 Período', 'Valor': `${formatDate(fechaMin)} - ${formatDate(fechaMax)}` },
    { 'Estadística': '📝 Total de boletas', 'Valor': boletas.length },
    { 'Estadística': '💰 Gasto total (bruto)', 'Valor': `$${totalGeneral.toLocaleString('es-CL')}` },
    { 'Estadística': '💵 Total neto', 'Valor': `$${(totalGeneral - ivaGeneral).toLocaleString('es-CL')}` },
    { 'Estadística': '🧾 IVA total pagado', 'Valor': `$${ivaGeneral.toLocaleString('es-CL')}` },
    { 'Estadística': '📊 Promedio por compra', 'Valor': `$${Math.round(promedioGasto).toLocaleString('es-CL')}` },
    { 'Estadística': '⬆️ Compra más alta', 'Valor': `$${gastoMayor.toLocaleString('es-CL')}` },
    { 'Estadística': '⬇️ Compra más baja', 'Valor': `$${gastoMenor.toLocaleString('es-CL')}` },
    { 'Estadística': '🏆 Categoría más frecuente', 'Valor': Object.entries(porCategoria).sort((a, b) => b[1].cantidad - a[1].cantidad)[0]?.[0] || '-' },
    { 'Estadística': '🏙️ Ciudad con más gastos', 'Valor': Object.entries(porCiudad).sort((a, b) => b[1].bruto - a[1].bruto)[0]?.[0] || '-' },
  ];

  const statsSheet = XLSX.utils.json_to_sheet(statsData);
  statsSheet['!cols'] = [{ wch: 30 }, { wch: 30 }];
  XLSX.utils.book_append_sheet(workbook, statsSheet, 'Estadísticas');

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

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
}

function formatMes(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  const meses = ['', 'Enero', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${meses[parseInt(month)]} ${year}`;
}

interface TotalesCategoria {
  cantidad: number;
  neto: number;
  iva: number;
  bruto: number;
}

function calcularPorCategoria(boletas: Boleta[]): Record<string, TotalesCategoria> {
  return boletas.reduce((acc, b) => {
    if (!acc[b.categoria]) {
      acc[b.categoria] = { cantidad: 0, neto: 0, iva: 0, bruto: 0 };
    }
    acc[b.categoria].cantidad += 1;
    acc[b.categoria].neto += b.totalNeto;
    acc[b.categoria].iva += b.iva;
    acc[b.categoria].bruto += b.totalBruto;
    return acc;
  }, {} as Record<string, TotalesCategoria>);
}

function calcularPorCiudad(boletas: Boleta[]): Record<string, TotalesCategoria> {
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
  }, {} as Record<string, TotalesCategoria>);
}

function calcularPorMes(boletas: Boleta[]): Record<string, TotalesCategoria> {
  return boletas.reduce((acc, b) => {
    const fecha = new Date(b.fecha);
    const yearMonth = `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, '0')}`;
    if (!acc[yearMonth]) {
      acc[yearMonth] = { cantidad: 0, neto: 0, iva: 0, bruto: 0 };
    }
    acc[yearMonth].cantidad += 1;
    acc[yearMonth].neto += b.totalNeto;
    acc[yearMonth].iva += b.iva;
    acc[yearMonth].bruto += b.totalBruto;
    return acc;
  }, {} as Record<string, TotalesCategoria>);
}

export { XLSX };
