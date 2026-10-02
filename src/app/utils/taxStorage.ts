// ─────────────────────────────────────────────────────────────────────────────
// taxStorage.ts — Persistencia fiscal en localStorage
// Implementa los almacenes del DFD Nivel 1 (D1: BD Transaccional)
// Proceso 2.0 Gestión Tributaria: Base Imponible → IVA × 0.16 / IGTF × 0.03
// ─────────────────────────────────────────────────────────────────────────────

export interface VentasDia {
  fecha:             string;  // "YYYY-MM-DD"
  totalVentas:       number;  // Base imponible bruta del día
  totalCosto:        number;  // Costo total
  totalUtilidad:     number;  // Utilidad neta
  cantidadProductos: number;  // Ítems distintos
  divisas:           number;  // Monto pagado en divisas (USD/IGTF) — se edita manualmente
  cargadoEn:         string;  // ISO timestamp de cuando se importó
}

export interface ResumenMes {
  mes:               string;  // "YYYY-MM"
  diasConDatos:      number;
  baseImponible:     number;  // suma totalVentas
  ivaDeuda:          number;  // baseImponible × 0.16
  divisas:           number;  // suma divisas
  igtfDeuda:         number;  // divisas × 0.03
  totalDeuda:        number;  // ivaDeuda + igtfDeuda
  utilidadNeta:      number;  // suma totalUtilidad
  costosTotal:       number;  // suma totalCosto
  dias:              VentasDia[];
}

// ── Constantes DFD ────────────────────────────────────────────────────────────
export const IVA_RATE  = 0.16;  // Proceso 2.2.2: × 0.16
export const IGTF_RATE = 0.03;  // Proceso 2.2.3: × 0.03

const PREFIX = "invergica_ventas_";

// ── Claves localStorage ───────────────────────────────────────────────────────

function claveDelDia(fecha: string): string {
  return `${PREFIX}${fecha}`;
}

// ── Guardar ventas del día (llamado desde VentasPanel al cargar PDF) ──────────

export function guardarVentasDia(
  fecha: string,
  totalVentas: number,
  totalCosto: number,
  totalUtilidad: number,
  cantidadProductos: number,
): void {
  const existente = leerVentasDia(fecha);
  const entrada: VentasDia = {
    fecha,
    totalVentas,
    totalCosto,
    totalUtilidad,
    cantidadProductos,
    divisas:    existente?.divisas ?? 0,  // preserva divisas ingresadas manualmente
    cargadoEn: new Date().toISOString(),
  };
  localStorage.setItem(claveDelDia(fecha), JSON.stringify(entrada));
}

// ── Actualizar monto de divisas (edición manual del admin) ───────────────────

export function actualizarDivisas(fecha: string, divisas: number): void {
  const existente = leerVentasDia(fecha);
  if (!existente) return;
  existente.divisas = Math.max(0, divisas);
  localStorage.setItem(claveDelDia(fecha), JSON.stringify(existente));
}

// ── Leer un día ───────────────────────────────────────────────────────────────

export function leerVentasDia(fecha: string): VentasDia | null {
  const raw = localStorage.getItem(claveDelDia(fecha));
  if (!raw) return null;
  try { return JSON.parse(raw) as VentasDia; } catch { return null; }
}

// ── Leer todos los días de un mes "YYYY-MM" ───────────────────────────────────

export function leerVentasMes(mes: string): VentasDia[] {
  const resultado: VentasDia[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    try {
      const v = JSON.parse(raw) as VentasDia;
      if (v.fecha.startsWith(mes)) resultado.push(v);
    } catch { /* ignorar entradas corruptas */ }
  }
  return resultado.sort((a, b) => a.fecha.localeCompare(b.fecha));
}

// ── Calcular resumen mensual (Proceso 4: Consolidación Fiscal) ────────────────

export function calcularResumenMes(mes: string): ResumenMes {
  const dias = leerVentasMes(mes);

  const baseImponible = dias.reduce((s, d) => s + d.totalVentas,   0);
  const divisas       = dias.reduce((s, d) => s + d.divisas,       0);
  const utilidad      = dias.reduce((s, d) => s + d.totalUtilidad, 0);
  const costos        = dias.reduce((s, d) => s + d.totalCosto,    0);

  const ivaDeuda  = +(baseImponible * IVA_RATE).toFixed(2);
  const igtfDeuda = +(divisas       * IGTF_RATE).toFixed(2);

  return {
    mes,
    diasConDatos:  dias.length,
    baseImponible: +baseImponible.toFixed(2),
    ivaDeuda,
    divisas:       +divisas.toFixed(2),
    igtfDeuda,
    totalDeuda:    +(ivaDeuda + igtfDeuda).toFixed(2),
    utilidadNeta:  +utilidad.toFixed(2),
    costosTotal:   +costos.toFixed(2),
    dias,
  };
}

// ── Listar meses con datos ────────────────────────────────────────────────────

export function mesesConDatos(): string[] {
  const meses = new Set<string>();
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key?.startsWith(PREFIX)) continue;
    const fecha = key.replace(PREFIX, "");
    meses.add(fecha.slice(0, 7)); // "YYYY-MM"
  }
  return [...meses].sort().reverse();
}

// ── Formatear mes en español ──────────────────────────────────────────────────

export function formatearMes(mes: string): string {
  const [anio, m] = mes.split("-");
  const nombres = [
    "", "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
  ];
  return `${nombres[parseInt(m)]} ${anio}`;
}

// ── Día de vencimiento SENIAT (15 del mes siguiente) ─────────────────────────

export function vencimientoSENIAT(mes: string): string {
  const [anio, m] = mes.split("-").map(Number);
  const mesNext   = m === 12 ? 1 : m + 1;
  const anioNext  = m === 12 ? anio + 1 : anio;
  return `${String(anioNext).padStart(4,"0")}-${String(mesNext).padStart(2,"0")}-15`;
}

// ── Días restantes para vencimiento ──────────────────────────────────────────

export function diasParaVencimiento(mes: string): number {
  const venc  = new Date(vencimientoSENIAT(mes));
  const hoy   = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.ceil((venc.getTime() - hoy.getTime()) / 86_400_000);
}
