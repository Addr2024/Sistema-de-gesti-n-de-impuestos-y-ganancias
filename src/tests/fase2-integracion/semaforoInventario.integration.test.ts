// ─────────────────────────────────────────────────────────────────────────────
// FASE 2 — PRUEBAS DE INTEGRACIÓN: Semáforo de Inventario + Vencimientos
// DFD Nivel 2: Procesos 3.1 Monitorear Vencimientos → 3.2 Evaluar Alertas
// DFD Nivel 3: 3.3.1 Leer Fecha → 3.3.2 Restar Días → 3.3.3 Asignar Color
// E-R: PRODUCTO ←Pertenece_A→ LOTE (vencimiento, color_alerta) →Genera→ MERMA
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  estadoStock,
  resumenInventario,
  type ProductoInventario,
} from "../../app/utils/pdfParser";

// ── Helpers de lote / vencimiento (DFD 3.3.1→3.3.2→3.3.3) ───────────────────

type ColorAlerta = "verde" | "amarillo" | "rojo";

function colorAlertaLote(vencimientoISO: string): ColorAlerta {
  const hoy   = new Date();
  const venc  = new Date(vencimientoISO + "T12:00:00");
  const diasR = Math.ceil((venc.getTime() - hoy.getTime()) / 86_400_000);
  if (diasR <= 0)  return "rojo";    // vencido o hoy
  if (diasR <= 30) return "amarillo"; // próximo a vencer
  return "verde";
}

function diasHastaVencimiento(vencimientoISO: string): number {
  const hoy  = new Date();
  hoy.setHours(0, 0, 0, 0);
  const venc = new Date(vencimientoISO + "T12:00:00");
  return Math.ceil((venc.getTime() - hoy.getTime()) / 86_400_000);
}

// ── Datos de prueba: escenario bodega del abasto ─────────────────────────────

const inventarioBodega: ProductoInventario[] = [
  // Suficientes
  { codigo: "100001", descripcion: "Arroz 1kg",         categoria: "Alimentos", existencia: 120, stockMinimo: 20, precioVenta: 45,  costo: 30  },
  { codigo: "100006", descripcion: "Café 250g",          categoria: "Bebidas",   existencia:  40, stockMinimo: 10, precioVenta: 70,  costo: 48  },
  { codigo: "100007", descripcion: "Jabón x3",           categoria: "Higiene",   existencia:  90, stockMinimo: 20, precioVenta: 25,  costo: 17  },
  // Bajos
  { codigo: "100002", descripcion: "Aceite 1L",          categoria: "Alimentos", existencia:   3, stockMinimo:  5, precioVenta: 85,  costo: 55  },
  { codigo: "100008", descripcion: "Papel Higiénico x4", categoria: "Higiene",   existencia:   2, stockMinimo: 10, precioVenta: 40,  costo: 27  },
  // Agotados
  { codigo: "100003", descripcion: "Harina 1kg",         categoria: "Alimentos", existencia:   0, stockMinimo: 10, precioVenta: 38,  costo: 25  },
  { codigo: "100005", descripcion: "Azúcar 1kg",         categoria: "Alimentos", existencia:   0, stockMinimo:  5, precioVenta: 30,  costo: 20  },
];

// ── Tests: estadoStock individual ────────────────────────────────────────────
describe("estadoStock — Clasificación individual de productos (E-R: LOTE.color_alerta)", () => {
  it("clasifica todos los suficientes correctamente", () => {
    const suficientes = inventarioBodega.filter(p => p.existencia >= p.stockMinimo && p.existencia > 0);
    suficientes.forEach(p => expect(estadoStock(p)).toBe("suficiente"));
  });

  it("clasifica todos los bajos correctamente", () => {
    const bajos = inventarioBodega.filter(p => p.existencia > 0 && p.existencia < p.stockMinimo);
    bajos.forEach(p => expect(estadoStock(p)).toBe("bajo"));
  });

  it("clasifica todos los agotados correctamente", () => {
    const agotados = inventarioBodega.filter(p => p.existencia === 0);
    agotados.forEach(p => expect(estadoStock(p)).toBe("agotado"));
  });
});

// ── Tests: resumenInventario integrado ───────────────────────────────────────
describe("resumenInventario — Vista consolidada del almacén (E-R: PRODUCTO + LOTE)", () => {
  it("conteo correcto de cada estado", () => {
    const r = resumenInventario(inventarioBodega);
    expect(r.total).toBe(7);
    expect(r.suficientes).toBe(3);
    expect(r.bajos).toBe(2);
    expect(r.agotados).toBe(2);
  });

  it("las listas contienen los productos correctos", () => {
    const r = resumenInventario(inventarioBodega);
    const codsAgotados = r.listaAgotados.map(p => p.codigo).sort();
    expect(codsAgotados).toEqual(["100003", "100005"].sort());
    const codsBajos = r.listaBajos.map(p => p.codigo).sort();
    expect(codsBajos).toEqual(["100002", "100008"].sort());
  });

  it("valorVenta > valorCosto (margen positivo general)", () => {
    const r = resumenInventario(inventarioBodega);
    expect(r.valorVenta).toBeGreaterThan(r.valorCosto);
  });

  it("productos agotados no suman valor (existencia 0)", () => {
    const soloAgotados: ProductoInventario[] = [
      { codigo: "X", descripcion: "Test", categoria: "G", existencia: 0, stockMinimo: 5, precioVenta: 100, costo: 70 },
    ];
    const r = resumenInventario(soloAgotados);
    expect(r.valorCosto).toBe(0);
    expect(r.valorVenta).toBe(0);
  });
});

// ── Tests: colorAlertaLote (DFD 3.3.3 Asignar Color de Alerta) ───────────────
describe("colorAlertaLote — Semáforo de vencimiento por lote (LOTE.color_alerta)", () => {
  it("lote ya vencido → rojo", () => {
    expect(colorAlertaLote("2020-01-01")).toBe("rojo");
    expect(colorAlertaLote("2024-06-15")).toBe("rojo");
  });

  it("lote que vence en los próximos 30 días → amarillo", () => {
    const en15dias = new Date();
    en15dias.setDate(en15dias.getDate() + 15);
    const iso = en15dias.toISOString().slice(0, 10);
    expect(colorAlertaLote(iso)).toBe("amarillo");
  });

  it("lote que vence en más de 30 días → verde", () => {
    const en60dias = new Date();
    en60dias.setDate(en60dias.getDate() + 60);
    const iso = en60dias.toISOString().slice(0, 10);
    expect(colorAlertaLote(iso)).toBe("verde");
  });
});

// ── Tests: diasHastaVencimiento (DFD 3.3.2 Restar vs Fecha Actual) ────────────
describe("diasHastaVencimiento — Cálculo de días restantes (DFD 3.3.2)", () => {
  it("fecha pasada retorna número negativo", () => {
    expect(diasHastaVencimiento("2020-01-01")).toBeLessThan(0);
  });

  it("fecha futura retorna número positivo", () => {
    const en30 = new Date();
    en30.setDate(en30.getDate() + 30);
    expect(diasHastaVencimiento(en30.toISOString().slice(0, 10))).toBeGreaterThan(0);
  });

  it("el resultado es un entero", () => {
    const d = diasHastaVencimiento("2030-01-01");
    expect(Number.isInteger(d)).toBe(true);
  });
});

// ── Tests: escenario Merma (E-R: LOTE →Genera→ MERMA) ────────────────────────

interface Merma {
  id: number;
  cantidad: number;
  motivo: string;
  loteId: number;
}

function calcularMermaPorLote(mermas: Merma[], loteId: number): number {
  return mermas.filter(m => m.loteId === loteId).reduce((s, m) => s + m.cantidad, 0);
}

describe("calcularMerma — Cuantificación de pérdidas (DFD 3.3 + E-R MERMA)", () => {
  const mermasEjemplo: Merma[] = [
    { id: 1, cantidad: 5,  motivo: "Vencimiento", loteId: 10 },
    { id: 2, cantidad: 3,  motivo: "Daño físico",  loteId: 10 },
    { id: 3, cantidad: 12, motivo: "Vencimiento",  loteId: 11 },
    { id: 4, cantidad: 1,  motivo: "Robo",         loteId: 12 },
  ];

  it("suma correctamente las mermas de un lote específico", () => {
    expect(calcularMermaPorLote(mermasEjemplo, 10)).toBe(8);  // 5 + 3
    expect(calcularMermaPorLote(mermasEjemplo, 11)).toBe(12);
    expect(calcularMermaPorLote(mermasEjemplo, 12)).toBe(1);
  });

  it("retorna 0 si el lote no tiene mermas registradas", () => {
    expect(calcularMermaPorLote(mermasEjemplo, 999)).toBe(0);
  });

  it("lote con múltiples motivos acumula todas sus unidades", () => {
    const mermaLote10 = calcularMermaPorLote(mermasEjemplo, 10);
    expect(mermaLote10).toBeGreaterThan(0);
    expect(mermaLote10).toBe(5 + 3);
  });
});
