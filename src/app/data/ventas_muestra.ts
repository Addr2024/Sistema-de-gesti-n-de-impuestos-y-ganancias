// ─────────────────────────────────────────────────────────────────────────────
// INVERGICA — Archivo de prueba: Productos Vendidos
// Estructura idéntica al reporte "Productos vendidos" del sistema A2
//
// COLUMNAS:
//   codigo       → Código del producto en A2
//   descripcion  → Nombre del producto
//   cantidad     → Unidades vendidas en el período
//   montoBruto   → Total cobrado al cliente (Bs.)
//   descuentos   → Descuentos aplicados (Bs.)
//   iva          → Porcentaje de IVA aplicado
//   costo        → Costo del producto para el negocio (Bs.)
//   utilidad     → Ganancia = montoBruto - costo (Bs.)
//   pctUtilidad  → Porcentaje de ganancia sobre el costo
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductoVendido {
  codigo:       string;
  descripcion:  string;
  cantidad:     number;
  montoBruto:   number;
  descuentos:   number;
  iva:          number;
  costo:        number;
  utilidad:     number;
  pctUtilidad:  number;
}

export interface ReporteVentas {
  periodo:    { desde: string; hasta: string };
  operaciones: string[];
  productos:  ProductoVendido[];
}

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE MUESTRA — Basados en la factura real del 22/06/2026
// ─────────────────────────────────────────────────────────────────────────────
export const ventasMuestra: ReporteVentas = {
  periodo:     { desde: "22/06/2026", hasta: "22/06/2026" },
  operaciones: ["Facturas", "Devoluciones"],
  productos: [
    { codigo: "010093", descripcion: "RAMPLUG VERDE 1/4 X 1 1/4",          cantidad: 15,    montoBruto: 1.65,  descuentos: 0.00, iva: 0, costo: 0.26,  utilidad: 1.46,  pctUtilidad: 88.62 },
    { codigo: "010181", descripcion: "TORNILLO AUTOR C/PAN 8 X 1/2",       cantidad: 15,    montoBruto: 1.65,  descuentos: 0.00, iva: 0, costo: 0.26,  utilidad: 1.46,  pctUtilidad: 88.62 },
    { codigo: "010245", descripcion: "CAJERA RECTANGULAR PLASTICA 2 X 4",  cantidad: 1,     montoBruto: 0.78,  descuentos: 0.00, iva: 0, costo: 0.12,  utilidad: 1.58,  pctUtilidad: 96.04 },
    { codigo: "010302", descripcion: "PEGA LOKA 3",                         cantidad: 2,     montoBruto: 0.52,  descuentos: 0.00, iva: 0, costo: 0.08,  utilidad: 0.71,  pctUtilidad: 90.40 },
    { codigo: "010468", descripcion: "MANGUERA CULEBRA 1/2 X 100MTS",      cantidad: 10000, montoBruto: 10.30, descuentos: 0.00, iva: 0, costo: 1.65,  utilidad: 0.29,  pctUtilidad: 55.33 },
    { codigo: "010631", descripcion: "ABRAZADERA 25MM A/INOX N 25",        cantidad: 2,     montoBruto: 2.46,  descuentos: 0.00, iva: 0, costo: 0.39,  utilidad: 9.05,  pctUtilidad: 87.89 },
    { codigo: "010681", descripcion: "ESTAÑO TUBO 1.0 MM 16 GR BRUFER",    cantidad: 1,     montoBruto: 2.88,  descuentos: 0.00, iva: 0, costo: 0.19,  utilidad: 2.27,  pctUtilidad: 92.29 },
    { codigo: "010745", descripcion: "TEIPE 3M 3/4 X 18.3MTS NEGRO",       cantidad: 1,     montoBruto: 5.04,  descuentos: 0.00, iva: 0, costo: 0.79,  utilidad: 2.09,  pctUtilidad: 72.51 },
    { codigo: "010839", descripcion: "BOMBILLO LED 12W ANGEL LIGHT",       cantidad: 1,     montoBruto: 1.92,  descuentos: 0.00, iva: 0, costo: 0.81,  utilidad: 3.08,  pctUtilidad: 61.11 },
    { codigo: "010900", descripcion: "TEIPE COBRA 3/4 X 10M",              cantidad: 1,     montoBruto: 1.74,  descuentos: 0.00, iva: 0, costo: 0.31,  utilidad: 1.18,  pctUtilidad: 61.63 },
    { codigo: "010989", descripcion: "SOCATE DE GOMA C/PORCELANA",         cantidad: 1,     montoBruto: 0.58,  descuentos: 0.00, iva: 0, costo: 0.28,  utilidad: 0.94,  pctUtilidad: 53.85 },
    { codigo: "011023", descripcion: "PEGATAMKE 67 GR",                     cantidad: 1,     montoBruto: 2.44,  descuentos: 0.00, iva: 0, costo: 0.09,  utilidad: 0.50,  pctUtilidad: 86.72 },
    { codigo: "011203", descripcion: "TAPA TOMA SIMPLE 1 HUECO",           cantidad: 1,     montoBruto: 0.70,  descuentos: 0.00, iva: 0, costo: 0.39,  utilidad: 1.31,  pctUtilidad: 53.62 },
    { codigo: "011364", descripcion: "LIJA 220 3M",                         cantidad: 1,     montoBruto: 1.27,  descuentos: 0.00, iva: 0, costo: 0.11,  utilidad: 0.68,  pctUtilidad: 97.53 },
    { codigo: "011397", descripcion: "PEGA LOCA COVO 3 GR",                cantidad: 1,     montoBruto: 1.27,  descuentos: 0.00, iva: 0, costo: 0.20,  utilidad: 1.14,  pctUtilidad: 89.54 },
    { codigo: "011660", descripcion: "TOMA CORRIENTE CHINO 220V TROEN",    cantidad: 4,     montoBruto: 2.16,  descuentos: 0.00, iva: 0, costo: 0.35,  utilidad: 1.53,  pctUtilidad: 71.00 },
    { codigo: "011846", descripcion: "SIFON EXTENSIBLE 1 1/2 FREGADERO",  cantidad: 1,     montoBruto: 1.71,  descuentos: 0.00, iva: 0, costo: 0.27,  utilidad: 1.54,  pctUtilidad: 90.22 },
    { codigo: "020003", descripcion: "CIGARROS CONSUL",                     cantidad: 2,     montoBruto: 2.54,  descuentos: 0.00, iva: 0, costo: 0.41,  utilidad: 1.85,  pctUtilidad: 72.74 },
    { codigo: "020005", descripcion: "CIGARROS TIME SILVER",                cantidad: 5500,  montoBruto: 7.70,  descuentos: 0.00, iva: 0, costo: 6.12,  utilidad: 1.58,  pctUtilidad: 20.54 },
    { codigo: "020007", descripcion: "CIGARROS TIME 2 CLIC",                cantidad: 4500,  montoBruto: 6.75,  descuentos: 0.00, iva: 0, costo: 3.32,  utilidad: 3.43,  pctUtilidad: 50.82 },
    { codigo: "020008", descripcion: "CIGARROS TIME 1 CLIC",                cantidad: 2500,  montoBruto: 6.00,  descuentos: 0.00, iva: 0, costo: 2.95,  utilidad: 3.05,  pctUtilidad: 50.82 },
    { codigo: "020009", descripcion: "CIGARROS UNIVERSAL",                  cantidad: 3500,  montoBruto: 7.70,  descuentos: 0.00, iva: 0, costo: 3.79,  utilidad: 3.91,  pctUtilidad: 50.83 },
    { codigo: "020013", descripcion: "YESQUERO",                            cantidad: 3000,  montoBruto: 5.88,  descuentos: 0.00, iva: 0, costo: 4.71,  utilidad: 1.17,  pctUtilidad: 19.93 },
    { codigo: "020019", descripcion: "CIGARROS LUCKY STRIKE ECLIPSE",       cantidad: 5,     montoBruto: 7.75,  descuentos: 0.00, iva: 0, costo: 1.55,  utilidad: 0.38,  pctUtilidad: 66.38 },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// Funciones de cálculo (para el Semáforo de Rendimiento)
// ─────────────────────────────────────────────────────────────────────────────

export function calcularResumen(reporte: ReporteVentas) {
  const p = reporte.productos;
  const totalVentas    = p.reduce((s, x) => s + x.montoBruto,   0);
  const totalCosto     = p.reduce((s, x) => s + x.costo,        0);
  const totalUtilidad  = p.reduce((s, x) => s + x.utilidad,     0);
  const margenPromedio = totalVentas > 0 ? (totalUtilidad / totalVentas) * 100 : 0;

  const mejores  = [...p].sort((a, b) => b.pctUtilidad - a.pctUtilidad).slice(0, 3);
  const peores   = [...p].sort((a, b) => a.pctUtilidad - b.pctUtilidad).slice(0, 3);
  const masVendidos = [...p].sort((a, b) => b.montoBruto - a.montoBruto).slice(0, 3);

  return {
    totalVentas:    +totalVentas.toFixed(2),
    totalCosto:     +totalCosto.toFixed(2),
    totalUtilidad:  +totalUtilidad.toFixed(2),
    margenPromedio: +margenPromedio.toFixed(1),
    mejores,
    peores,
    masVendidos,
    cantidadProductos: p.length,
  };
}

export type SemaforoColor = "verde" | "amarillo" | "rojo";

export function semaforoMargen(pct: number): SemaforoColor {
  if (pct >= 60) return "verde";
  if (pct >= 30) return "amarillo";
  return "rojo";
}
