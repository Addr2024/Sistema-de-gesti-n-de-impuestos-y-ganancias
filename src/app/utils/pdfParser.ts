// ─────────────────────────────────────────────────────────────────────────────
// INVERGICA — SIG-A · Lector de PDFs v2.0 (Refactorizado)
// Extrae texto con coordenadas, reconstruye filas de tabla, parsea ventas,
// inventario, lotes/vencimientos y métricas fiscales.
// ─────────────────────────────────────────────────────────────────────────────

import * as pdfjsLib from 'pdfjs-dist';
// Worker empaquetado localmente por Vite (NO desde CDN).
// El sufijo `?url` hace que Vite copie el worker al build y devuelva su URL
// con hash, por lo que funciona offline y desde una clonación limpia, sin
// depender de Internet ni de que la versión del CDN coincida con la API.
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  1. ARRANQUE GLOBAL Y CONFIGURACIÓN DEL WORKER                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/**
 * Asignar pdfjsLib al ámbito global (window) para evitar referencias huérfanas
 * a `pdfjs` o `pdfjsLib` desde otros módulos o scripts legacy.
 */
if (typeof window !== 'undefined') {
  (window as any).pdfjsLib = pdfjsLib;
  (window as any).pdfjs = pdfjsLib;
}

/**
 * Configuración del Worker de pdf.js.
 *
 * Se usa el worker empaquetado por Vite (import con sufijo `?url`), de modo
 * que viaje dentro del build y la versión del worker coincida siempre con la
 * API importada, sin depender de un CDN externo.
 */
// FIX: usar el worker empaquetado localmente (import `?url`) en lugar del CDN.
// El worker CDN fallaba en clonación limpia / sin conexión y bloqueaba la
// lectura de cualquier PDF. Con el worker local la carga es determinista y la
// versión del worker siempre coincide con la API importada.
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  2. INTERFACES EXPORTADAS                                                ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

// ── 2.1  Productos Vendidos (Reporte de Ventas A2) ────────────────────────────

export interface ProductoVendido {
  codigo:      string;
  descripcion: string;
  cantidad:    number;
  montoBruto:  number;
  descuentos:  number;
  iva:         number;
  costo:       number;
  utilidad:    number;
  pctUtilidad: number;
}

// ── 2.2  Inventario de Productos (Reporte de Existencias A2) ───────────────────

export interface ProductoInventario {
  codigo:      string;
  descripcion: string;
  categoria:   string;
  existencia:  number;
  stockMinimo: number;
  precioVenta: number;
  costo:       number;
}

// ── 2.3  Ventas Fiscales (Reporte A2 — Base Imponible / IVA / Divisas / IGTF) ─

export interface VentaRow {
  codigo:        string;
  descripcion:   string;
  cantidad:      number;
  baseImponible: number;
  iva:           number;
  totalBs:       number;
  divisasUsd:    number;
  igtf:          number;
}

// ── 2.4  Lotes y Vencimientos (DFD 3.3.3) ─────────────────────────────────────

export type SemaforoColor = 'verde' | 'amarillo' | 'rojo';

export interface LoteVencimiento {
  idLote:             string;
  producto:           string;
  fechaVencimientoISO: string;
  cantidad:           number;
  diasRestantes:      number;
  colorSemaforo:      SemaforoColor;
}

// ── 2.5  Estado de Stock ─────────────────────────────────────────────────────

export type EstadoStock = 'suficiente' | 'bajo' | 'agotado';

// ── 2.6  Merma de Lote (E-R LOTE → MERMA) ─────────────────────────────────────

export type MotivoMerma = 'Vencimiento' | 'Daño Físico' | 'Robo' | 'Otro';

export interface RegistroMerma {
  idMerma:     string;
  idLote:      string;
  cantidad:    number;
  motivo:      MotivoMerma;
  fechaISO:    string;
  observacion: string;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  3. TIPOS INTERNOS                                                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

interface RawItem {
  str: string;
  x:   number;
  y:   number;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  4. EXTRACCIÓN DE TEXTO CON COORDENADAS                                  ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/**
 * Extrae todos los ítems de texto de un PDF junto con sus coordenadas (x, y)
 * para reconstruir la disposición tabular del documento original.
 */
async function extractItems(file: File): Promise<RawItem[]> {
  const buffer = await file.arrayBuffer();

  // ── FIX PRINCIPAL: usar pdfjsLib (importado), NO la variable inexistente pdfjs
  const loadingTask = pdfjsLib.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  const items: RawItem[] = [];

  for (let p = 1; p <= doc.numPages; p++) {
    const page    = await doc.getPage(p);
    const content = await page.getTextContent();

    for (const item of content.items) {
      if ('str' in item && item.str.trim()) {
        items.push({
          str: item.str.trim(),
          x:   Math.round(item.transform[4]),
          y:   Math.round(item.transform[5]),
        });
      }
    }
  }

  return items;
}

/**
 * Versión simplificada: extrae todo el texto del PDF como cadena plana.
 * Útil para parsers basados en regex que no necesitan coordenadas.
 */
export async function extractTextFromPdf(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();

      // FIX: reconstruir una línea por fila usando la coordenada Y (tol. 3px).
      // Antes se unia TODA la página con ' ' y solo se agregaba un '\n' por
      // página, por lo que los parsers que dividen por '\n' (ventas fiscales,
      // lotes/vencimientos) recibian la página entera como una sola línea y no
      // detectaban ninguna fila.
      const lineItems = (textContent.items as any[])
        .filter(it => 'str' in it && it.str.trim())
        .map(it => ({ str: it.str.trim(), x: it.transform[4], y: it.transform[5] }))
        .sort((a, b) => b.y - a.y || a.x - b.x);

      let refY: number | null = null;
      let linea: string[] = [];
      for (const it of lineItems) {
        if (refY === null || Math.abs(it.y - refY) <= 3) {
          linea.push(it.str);
          refY = refY === null ? it.y : refY;
        } else {
          fullText += linea.join(' ') + '\n';
          linea = [it.str];
          refY = it.y;
        }
      }
      if (linea.length) fullText += linea.join(' ') + '\n';
    }

    return fullText;
  } catch (error) {
    console.error('Error procesando PDF:', error);
    throw new Error(
      'No se pudo extraer el texto del archivo PDF. Verifique que no esté protegido o dañado.'
    );
  }
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  5. AGRUPACIÓN POR FILAS                                                 ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/**
 * Agrupa ítems en filas lógicas basándose en la coordenada Y con tolerancia.
 * Los ítems se ordenan de arriba → abajo, izquierda → derecha.
 */
function groupByRows(items: RawItem[], tol = 4): RawItem[][] {
  const sorted = [...items].sort((a, b) => b.y - a.y || a.x - b.x);
  const rows: RawItem[][] = [];
  let cur: RawItem[] = [];
  let refY: number | null = null;

  for (const item of sorted) {
    if (refY === null || Math.abs(item.y - refY) <= tol) {
      cur.push(item);
      refY = refY === null ? item.y : refY;
    } else {
      if (cur.length) rows.push([...cur].sort((a, b) => a.x - b.x));
      cur  = [item];
      refY = item.y;
    }
  }
  if (cur.length) rows.push([...cur].sort((a, b) => a.x - b.x));

  return rows;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  6. HELPERS NUMÉRICOS                                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

const toNum  = (s: string) => parseFloat(s.replace(/\./g, '').replace(',', '.')) || 0;
const isNum  = (s: string) => /^[\d.,]+$/.test(s);
const isCode = (s: string) => /^\d{5,6}$/.test(s);

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  7. PARSER: PRODUCTOS VENDIDOS (Ventas A2)                               ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
//
// Columnas esperadas:
// Código | Descripción | Cantidad | Monto Bruto | Descuentos | IVA% | Costo |
// Utilidad | %Utilidad
//

function parseVentasRows(rows: RawItem[][]): ProductoVendido[] {
  const productos: ProductoVendido[] = [];

  for (const row of rows) {
    if (!row.length || !isCode(row[0].str)) continue;

    const codigo = row[0].str;
    const rest   = row.slice(1);
    const nums   = rest.filter(r => isNum(r.str));
    const words  = rest.filter(r => !isNum(r.str));
    const desc   = words.map(w => w.str).join(' ').trim();

    if (nums.length < 6) continue;

    productos.push({
      codigo,
      descripcion: desc || '(Sin descripción)',
      cantidad:    toNum(nums[0]?.str ?? '0'),
      montoBruto:  toNum(nums[1]?.str ?? '0'),
      descuentos:  toNum(nums[2]?.str ?? '0'),
      iva:         toNum(nums[3]?.str ?? '0'),
      costo:       toNum(nums[4]?.str ?? '0'),
      utilidad:    toNum(nums[5]?.str ?? '0'),
      pctUtilidad: toNum(nums[6]?.str ?? '0'),
    });
  }

  return productos;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  8. PARSER: INVENTARIO DE PRODUCTOS (Existencias A2)                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
//
// Columnas esperadas:
// Código | Descripción | Existencia | Stock Mín | Precio Venta | Costo
//

function parseInventarioRows(rows: RawItem[][]): ProductoInventario[] {
  const productos: ProductoInventario[] = [];

  for (const row of rows) {
    if (!row.length || !isCode(row[0].str)) continue;

    const codigo = row[0].str;
    const rest   = row.slice(1);
    const nums   = rest.filter(r => isNum(r.str));
    const words  = rest.filter(r => !isNum(r.str));
    const desc   = words.map(w => w.str).join(' ').trim();

    if (nums.length < 2) continue;

    productos.push({
      codigo,
      descripcion: desc || '(Sin descripción)',
      categoria:   'General',
      existencia:  toNum(nums[0]?.str ?? '0'),
      stockMinimo: toNum(nums[1]?.str ?? '0'),
      precioVenta: toNum(nums[2]?.str ?? '0'),
      costo:       toNum(nums[3]?.str ?? '0'),
    });
  }

  return productos;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  9. PARSER: VENTAS FISCALES (Base Imponible / IVA / Divisas / IGTF)      ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
//
// Requiere mínimo 6 columnas numéricas:
// Código | Descripción | Cantidad | Base Imponible | IVA | Total Bs |
// Divisas USD | IGTF
//

export function parseVentaFiscalRows(pdfText: string): VentaRow[] {
  const lineas = pdfText.split('\n');
  const resultados: VentaRow[] = [];

  for (const linea of lineas) {
    const tokens = linea.trim().split(/\s+/);
    const nums   = tokens
      .filter(t => !isNaN(parseFloat(t)) && isFinite(Number(t)))
      .map(Number);

    if (nums.length >= 6) {
      resultados.push({
        codigo:        tokens[0] || 'N/A',
        descripcion:   tokens.slice(1, tokens.length - 6).join(' ') || 'Producto A2',
        cantidad:      nums[0],
        baseImponible: nums[1],
        iva:           nums[2],
        totalBs:       nums[3],
        divisasUsd:    nums[4],
        igtf:          nums[5],
      });
    }
  }

  return resultados;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  10. PARSER: LOTES Y VENCIIMIENTOS (DFD 3.3.3)                           ║
// ╚══════════════════════════════════════════════════════════════════════════════╝
//
// Patrón esperado por línea:
// LOTE-XXX | Nombre Producto | YYYY-MM-DD | Cantidad
//

export function parseVencimientosLotes(pdfText: string): LoteVencimiento[] {
  const lineas = pdfText.split('\n');
  const lotes: LoteVencimiento[] = [];
  const hoy = new Date();

  for (const linea of lineas) {
    const match = linea.match(
      /(LOTE-\w+)\s+(.+?)\s+(\d{4}-\d{2}-\d{2})\s+(\d+)/i
    );
    if (match) {
      const fechaVenc      = new Date(match[3].trim());
      const diffTime        = fechaVenc.getTime() - hoy.getTime();
      const diasRestantes  = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let colorSemaforo: SemaforoColor = 'verde';
      if (diasRestantes <= 0) {
        colorSemaforo = 'rojo';
      } else if (diasRestantes <= 30) {
        colorSemaforo = 'amarillo';
      }

      lotes.push({
        idLote:              match[1].trim(),
        producto:            match[2].trim(),
        fechaVencimientoISO: match[3].trim(),
        cantidad:            parseInt(match[4], 10),
        diasRestantes,
        colorSemaforo,
      });
    }
  }

  return lotes;
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  11. FUNCIONES PÚBLICAS DE ALTO NIVEL                                     ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/** Lee un PDF de ventas y devuelve las filas parseadas. */
export async function leerVentasPdf(file: File): Promise<ProductoVendido[]> {
  const items = await extractItems(file);
  const rows  = groupByRows(items);
  return parseVentasRows(rows);
}

/** Lee un PDF de inventario y devuelve las filas parseadas. */
export async function leerInventarioPdf(file: File): Promise<ProductoInventario[]> {
  const items = await extractItems(file);
  const rows  = groupByRows(items);
  return parseInventarioRows(rows);
}

/** Lee un PDF de ventas fiscales y devuelve las filas con base imponible/IGTF. */
export async function leerVentasFiscalPdf(file: File): Promise<VentaRow[]> {
  const text = await extractTextFromPdf(file);
  return parseVentaFiscalRows(text);
}

/** Lee un PDF de lotes/vencimientos y devuelve las filas con semáforo. */
export async function leerLotesPdf(file: File): Promise<LoteVencimiento[]> {
  const text = await extractTextFromPdf(file);
  return parseVencimientosLotes(text);
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  12. FUNCIONES DE SEMÁFORO Y ESTADO                                       ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/** Semáforo de margen de utilidad (ventas). */
export function colorMargen(pct: number): SemaforoColor {
  if (pct >= 60) return 'verde';
  if (pct >= 30) return 'amarillo';
  return 'rojo';
}

/** Estado de stock para un producto de inventario. */
export function estadoStock(p: ProductoInventario): EstadoStock {
  if (p.existencia === 0)            return 'agotado';
  if (p.existencia < p.stockMinimo)  return 'bajo';
  return 'suficiente';
}

// ╔══════════════════════════════════════════════════════════════════════════════╗
// ║  13. FUNCIONES DE RESUMEN / AGREGACIÓN                                    ║
// ╚══════════════════════════════════════════════════════════════════════════════╝

/** Resumen consolidado de ventas. */
export function resumenVentas(prods: ProductoVendido[]) {
  const totalVentas   = prods.reduce((s, p) => s + p.montoBruto,  0);
  const totalCosto    = prods.reduce((s, p) => s + p.costo,       0);
  const totalUtilidad = prods.reduce((s, p) => s + p.utilidad,    0);
  const margen        = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;

  return {
    totalVentas:    +totalVentas.toFixed(2),
    totalCosto:     +totalCosto.toFixed(2),
    totalUtilidad:  +totalUtilidad.toFixed(2),
    margenPromedio: +margen.toFixed(1),
    cantidad:       prods.length,
    mejores:        [...prods].sort((a, b) => b.pctUtilidad - a.pctUtilidad).slice(0, 3),
    peores:         [...prods].sort((a, b) => a.pctUtilidad - b.pctUtilidad).slice(0, 3),
  };
}

/** Resumen consolidado de inventario. */
export function resumenInventario(prods: ProductoInventario[]) {
  const agotados    = prods.filter(p => estadoStock(p) === 'agotado');
  const bajos       = prods.filter(p => estadoStock(p) === 'bajo');
  const suficientes = prods.filter(p => estadoStock(p) === 'suficiente');

  return {
    total:         prods.length,
    agotados:      agotados.length,
    bajos:         bajos.length,
    suficientes:   suficientes.length,
    listaAgotados: agotados,
    listaBajos:    bajos,
    valorCosto:    +prods.reduce((s, p) => s + p.existencia * p.costo,       0).toFixed(2),
    valorVenta:    +prods.reduce((s, p) => s + p.existencia * p.precioVenta, 0).toFixed(2),
  };
}

/** Resumen fiscal (Base Imponible, Débito IVA, Acumulado Divisas, IGTF). */
export function resumenFiscal(rows: VentaRow[], tasaIva = 16, tasaIgtf = 3) {
  const totalBase      = rows.reduce((s, r) => s + r.baseImponible, 0);
  const totalIva       = rows.reduce((s, r) => s + r.iva,  0);
  const totalDivisas  = rows.reduce((s, r) => s + r.divisasUsd, 0);
  const totalIgtf     = rows.reduce((s, r) => s + r.igtf, 0);
  const debitoIva     = +(totalBase * (tasaIva / 100)).toFixed(2);
  const calculoIgtf   = +(totalDivisas * (tasaIgtf / 100)).toFixed(2);

  return {
    totalBaseImponible:  +totalBase.toFixed(2),
    debitoIva,
    totalDivisasUsd:     +totalDivisas.toFixed(2),
    totalIgtf,
    calculoIgtf:         calculoIgtf,
    tasaIva,
    tasaIgtf,
    cantidadRegistros:   rows.length,
  };
}
