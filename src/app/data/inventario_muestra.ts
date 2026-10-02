// ─────────────────────────────────────────────────────────────────────────────
// INVERGICA — Archivo de prueba: Inventario de Productos
// Estructura del reporte de Inventario del sistema A2
//
// COLUMNAS:
//   codigo        → Código del producto en A2
//   descripcion   → Nombre del producto
//   categoria     → Grupo/categoría del producto
//   existencia    → Unidades disponibles en stock
//   stockMinimo   → Mínimo recomendado antes de reponer
//   precioVenta   → Precio de venta al público (Bs.)
//   costo         → Precio de costo (Bs.)
//   ubicacion     → Zona del local (opcional)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProductoInventario {
  codigo:      string;
  descripcion: string;
  categoria:   string;
  existencia:  number;
  stockMinimo: number;
  precioVenta: number;
  costo:       number;
  ubicacion?:  string;
}

export type EstadoStock = "suficiente" | "bajo" | "agotado";

export function estadoStock(p: ProductoInventario): EstadoStock {
  if (p.existencia === 0)                    return "agotado";
  if (p.existencia < p.stockMinimo)          return "bajo";
  return "suficiente";
}

// ─────────────────────────────────────────────────────────────────────────────
// DATOS DE MUESTRA — Productos reales de Invergica
// ─────────────────────────────────────────────────────────────────────────────
export const inventarioMuestra: ProductoInventario[] = [
  // — Materiales Eléctricos —
  { codigo: "010093", descripcion: "RAMPLUG VERDE 1/4 X 1 1/4",         categoria: "Ferretería",   existencia: 85,  stockMinimo: 30,  precioVenta: 0.11,  costo: 0.026, ubicacion: "Góndola A" },
  { codigo: "010181", descripcion: "TORNILLO AUTOR C/PAN 8 X 1/2",      categoria: "Ferretería",   existencia: 120, stockMinimo: 50,  precioVenta: 0.11,  costo: 0.026, ubicacion: "Góndola A" },
  { codigo: "010245", descripcion: "CAJERA RECTANGULAR PLASTICA 2 X 4", categoria: "Eléctrico",    existencia: 18,  stockMinimo: 10,  precioVenta: 0.78,  costo: 0.12,  ubicacion: "Góndola B" },
  { codigo: "010302", descripcion: "PEGA LOKA 3",                        categoria: "Adhesivos",    existencia: 6,   stockMinimo: 10,  precioVenta: 0.26,  costo: 0.08,  ubicacion: "Góndola C" },
  { codigo: "010468", descripcion: "MANGUERA CULEBRA 1/2 X 100MTS",     categoria: "Plomería",     existencia: 3,   stockMinimo: 5,   precioVenta: 0.00103,costo: 0.000165, ubicacion: "Depósito" },
  { codigo: "010631", descripcion: "ABRAZADERA 25MM A/INOX N 25",       categoria: "Ferretería",   existencia: 45,  stockMinimo: 20,  precioVenta: 1.23,  costo: 0.195, ubicacion: "Góndola A" },
  { codigo: "010681", descripcion: "ESTAÑO TUBO 1.0 MM 16 GR BRUFER",  categoria: "Electrónica",  existencia: 12,  stockMinimo: 8,   precioVenta: 2.88,  costo: 0.19,  ubicacion: "Mostrador" },
  { codigo: "010745", descripcion: "TEIPE 3M 3/4 X 18.3MTS NEGRO",     categoria: "Eléctrico",    existencia: 22,  stockMinimo: 15,  precioVenta: 5.04,  costo: 0.79,  ubicacion: "Góndola B" },
  { codigo: "010839", descripcion: "BOMBILLO LED 12W ANGEL LIGHT",      categoria: "Iluminación",  existencia: 8,   stockMinimo: 10,  precioVenta: 1.92,  costo: 0.81,  ubicacion: "Góndola B" },
  { codigo: "010900", descripcion: "TEIPE COBRA 3/4 X 10M",             categoria: "Eléctrico",    existencia: 35,  stockMinimo: 20,  precioVenta: 1.74,  costo: 0.31,  ubicacion: "Góndola B" },
  { codigo: "010989", descripcion: "SOCATE DE GOMA C/PORCELANA",        categoria: "Eléctrico",    existencia: 0,   stockMinimo: 5,   precioVenta: 0.58,  costo: 0.28,  ubicacion: "Góndola B" },
  { codigo: "011023", descripcion: "PEGATAMKE 67 GR",                    categoria: "Adhesivos",    existencia: 4,   stockMinimo: 8,   precioVenta: 2.44,  costo: 0.09,  ubicacion: "Góndola C" },
  { codigo: "011203", descripcion: "TAPA TOMA SIMPLE 1 HUECO",          categoria: "Eléctrico",    existencia: 28,  stockMinimo: 15,  precioVenta: 0.70,  costo: 0.39,  ubicacion: "Góndola B" },
  { codigo: "011364", descripcion: "LIJA 220 3M",                        categoria: "Ferretería",   existencia: 50,  stockMinimo: 20,  precioVenta: 1.27,  costo: 0.11,  ubicacion: "Góndola A" },
  { codigo: "011397", descripcion: "PEGA LOCA COVO 3 GR",               categoria: "Adhesivos",    existencia: 14,  stockMinimo: 10,  precioVenta: 1.27,  costo: 0.20,  ubicacion: "Góndola C" },
  { codigo: "011660", descripcion: "TOMA CORRIENTE CHINO 220V TROEN",   categoria: "Eléctrico",    existencia: 2,   stockMinimo: 10,  precioVenta: 0.54,  costo: 0.35,  ubicacion: "Góndola B" },
  { codigo: "011846", descripcion: "SIFON EXTENSIBLE 1 1/2 FREGADERO", categoria: "Plomería",     existencia: 7,   stockMinimo: 5,   precioVenta: 1.71,  costo: 0.27,  ubicacion: "Depósito" },
  // — Cigarros y Tabaco —
  { codigo: "020003", descripcion: "CIGARROS CONSUL",                    categoria: "Tabaco",       existencia: 24,  stockMinimo: 20,  precioVenta: 1.27,  costo: 0.205, ubicacion: "Mostrador" },
  { codigo: "020005", descripcion: "CIGARROS TIME SILVER",               categoria: "Tabaco",       existencia: 8500,stockMinimo: 3000,precioVenta: 0.0014,costo: 0.00111, ubicacion: "Mostrador" },
  { codigo: "020007", descripcion: "CIGARROS TIME 2 CLIC",               categoria: "Tabaco",       existencia: 6200,stockMinimo: 2000,precioVenta: 0.0015,costo: 0.000738, ubicacion: "Mostrador" },
  { codigo: "020008", descripcion: "CIGARROS TIME 1 CLIC",               categoria: "Tabaco",       existencia: 4800,stockMinimo: 2000,precioVenta: 0.0024,costo: 0.00118, ubicacion: "Mostrador" },
  { codigo: "020009", descripcion: "CIGARROS UNIVERSAL",                 categoria: "Tabaco",       existencia: 5200,stockMinimo: 2000,precioVenta: 0.0022,costo: 0.00108, ubicacion: "Mostrador" },
  { codigo: "020013", descripcion: "YESQUERO",                           categoria: "Tabaco",       existencia: 1500,stockMinimo: 1000,precioVenta: 0.00196,costo: 0.00157, ubicacion: "Mostrador" },
  { codigo: "020019", descripcion: "CIGARROS LUCKY STRIKE ECLIPSE",      categoria: "Tabaco",       existencia: 15,  stockMinimo: 10,  precioVenta: 1.55,  costo: 0.31,  ubicacion: "Mostrador" },
  // — Víveres —
  { codigo: "030001", descripcion: "ARROZ DIANA 1KG",                    categoria: "Víveres",      existencia: 42,  stockMinimo: 20,  precioVenta: 1.20,  costo: 0.90,  ubicacion: "Góndola D" },
  { codigo: "030002", descripcion: "ACEITE VEGETAL MAZEITE 1L",          categoria: "Víveres",      existencia: 18,  stockMinimo: 15,  precioVenta: 2.40,  costo: 1.85,  ubicacion: "Góndola D" },
  { codigo: "030003", descripcion: "HARINA PAN 1KG",                     categoria: "Víveres",      existencia: 0,   stockMinimo: 20,  precioVenta: 1.10,  costo: 0.78,  ubicacion: "Góndola D" },
  { codigo: "030004", descripcion: "AZUCAR BLANCA 1KG",                  categoria: "Víveres",      existencia: 5,   stockMinimo: 15,  precioVenta: 0.85,  costo: 0.60,  ubicacion: "Góndola D" },
  { codigo: "030005", descripcion: "CAFE MADRID 200G",                   categoria: "Víveres",      existencia: 28,  stockMinimo: 10,  precioVenta: 1.90,  costo: 1.30,  ubicacion: "Góndola D" },
];

// ─────────────────────────────────────────────────────────────────────────────
// Función de resumen del inventario
// ─────────────────────────────────────────────────────────────────────────────
export function calcularResumenInventario(items: ProductoInventario[]) {
  const agotados   = items.filter(p => estadoStock(p) === "agotado");
  const bajos      = items.filter(p => estadoStock(p) === "bajo");
  const suficientes = items.filter(p => estadoStock(p) === "suficiente");

  const valorInventario = items.reduce((s, p) => s + p.existencia * p.costo, 0);
  const valorVenta      = items.reduce((s, p) => s + p.existencia * p.precioVenta, 0);

  return {
    total:        items.length,
    agotados:     agotados.length,
    bajos:        bajos.length,
    suficientes:  suficientes.length,
    productosAgotados:  agotados,
    productosBajos:     bajos,
    valorInventario:    +valorInventario.toFixed(2),
    valorVenta:         +valorVenta.toFixed(2),
  };
}
