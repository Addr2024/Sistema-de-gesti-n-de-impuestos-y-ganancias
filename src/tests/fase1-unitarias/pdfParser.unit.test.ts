// ─────────────────────────────────────────────────────────────────────────────
// FASE 1 — PRUEBAS UNITARIAS: pdfParser.ts
// Caja Blanca: se testean funciones puras de cálculo y clasificación
// Mock: pdfjs-dist se omite (sus funciones async se prueban en Fase 2)
// Relaciones E-R: PRODUCTO (stock_minimo), LOTE (color_alerta), MERMA (motivo)
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import {
  colorMargen,
  estadoStock,
  resumenVentas,
  resumenInventario,
  type ProductoVendido,
  type ProductoInventario,
} from "../../app/utils/pdfParser";

// ── Datos de prueba ──────────────────────────────────────────────────────────

const productosVendidos: ProductoVendido[] = [
  { codigo: "100001", descripcion: "Arroz 1kg",     cantidad: 50, montoBruto: 2250, descuentos: 0, iva: 360, costo: 1500, utilidad: 750,  pctUtilidad: 33.3 },
  { codigo: "100002", descripcion: "Aceite 1L",     cantidad: 30, montoBruto: 2550, descuentos: 0, iva: 408, costo: 1200, utilidad: 1350, pctUtilidad: 52.9 },
  { codigo: "100003", descripcion: "Leche 400g",    cantidad: 20, montoBruto: 1900, descuentos: 0, iva: 304, costo:  600, utilidad: 1300, pctUtilidad: 68.4 },
  { codigo: "100004", descripcion: "Harina 1kg",    cantidad: 10, montoBruto:  380, descuentos: 0, iva:  60, costo:  320, utilidad:   60, pctUtilidad: 15.8 },
  { codigo: "100005", descripcion: "Azúcar 1kg",    cantidad: 15, montoBruto:  450, descuentos: 0, iva:  72, costo:  400, utilidad:   50, pctUtilidad: 11.1 },
];

const productosInventario: ProductoInventario[] = [
  { codigo: "100001", descripcion: "Arroz 1kg",  categoria: "Alimentos", existencia: 120, stockMinimo: 20, precioVenta: 45, costo: 30 },
  { codigo: "100002", descripcion: "Aceite 1L",  categoria: "Alimentos", existencia:   3, stockMinimo:  5, precioVenta: 85, costo: 55 },
  { codigo: "100003", descripcion: "Harina 1kg", categoria: "Alimentos", existencia:   0, stockMinimo: 10, precioVenta: 38, costo: 25 },
  { codigo: "100004", descripcion: "Leche 400g", categoria: "Lácteos",   existencia:  55, stockMinimo: 15, precioVenta: 95, costo: 60 },
];

// ── colorMargen — Semáforo de rendimiento de ventas ──────────────────────────
describe("colorMargen — Semáforo de margen (DFD 3.2 Evaluar Alertas)", () => {
  it("≥ 60% → verde", () => {
    expect(colorMargen(60)).toBe("verde");
    expect(colorMargen(75)).toBe("verde");
    expect(colorMargen(100)).toBe("verde");
  });

  it("≥ 30% y < 60% → amarillo", () => {
    expect(colorMargen(30)).toBe("amarillo");
    expect(colorMargen(45)).toBe("amarillo");
    expect(colorMargen(59.9)).toBe("amarillo");
  });

  it("< 30% → rojo", () => {
    expect(colorMargen(0)).toBe("rojo");
    expect(colorMargen(10)).toBe("rojo");
    expect(colorMargen(29.9)).toBe("rojo");
  });

  it("exactamente 60 es verde (borde)", () => {
    expect(colorMargen(60)).toBe("verde");
  });

  it("exactamente 30 es amarillo (borde)", () => {
    expect(colorMargen(30)).toBe("amarillo");
  });
});

// ── estadoStock — Semáforo de inventario (DFD 3.3.3 Asignar Color) ───────────
describe("estadoStock — Semáforo de existencias (LOTE.color_alerta)", () => {
  it("existencia = 0 → agotado", () => {
    const p: ProductoInventario = {
      codigo: "100003", descripcion: "Harina", categoria: "Alimentos",
      existencia: 0, stockMinimo: 10, precioVenta: 38, costo: 25,
    };
    expect(estadoStock(p)).toBe("agotado");
  });

  it("existencia > 0 y < stockMinimo → bajo", () => {
    const p: ProductoInventario = {
      codigo: "100002", descripcion: "Aceite", categoria: "Alimentos",
      existencia: 3, stockMinimo: 5, precioVenta: 85, costo: 55,
    };
    expect(estadoStock(p)).toBe("bajo");
  });

  it("existencia >= stockMinimo → suficiente", () => {
    const p: ProductoInventario = {
      codigo: "100001", descripcion: "Arroz", categoria: "Alimentos",
      existencia: 120, stockMinimo: 20, precioVenta: 45, costo: 30,
    };
    expect(estadoStock(p)).toBe("suficiente");
  });

  it("existencia exactamente igual a stockMinimo → suficiente", () => {
    const p: ProductoInventario = {
      codigo: "100004", descripcion: "Leche", categoria: "Lácteos",
      existencia: 15, stockMinimo: 15, precioVenta: 95, costo: 60,
    };
    expect(estadoStock(p)).toBe("suficiente");
  });
});

// ── resumenVentas — Agrupación de ventas del día ─────────────────────────────
describe("resumenVentas — Totales del día (CIERRE_CAJA)", () => {
  it("suma totalVentas correctamente", () => {
    const r = resumenVentas(productosVendidos);
    const esperado = productosVendidos.reduce((s, p) => s + p.montoBruto, 0);
    expect(r.totalVentas).toBeCloseTo(esperado, 2);
  });

  it("suma totalCosto correctamente", () => {
    const r = resumenVentas(productosVendidos);
    const esperado = productosVendidos.reduce((s, p) => s + p.costo, 0);
    expect(r.totalCosto).toBeCloseTo(esperado, 2);
  });

  it("suma totalUtilidad correctamente", () => {
    const r = resumenVentas(productosVendidos);
    const esperado = productosVendidos.reduce((s, p) => s + p.utilidad, 0);
    expect(r.totalUtilidad).toBeCloseTo(esperado, 2);
  });

  it("margenPromedio = (utilidad / ventas) × 100", () => {
    const r = resumenVentas(productosVendidos);
    const ventas   = productosVendidos.reduce((s, p) => s + p.montoBruto, 0);
    const utilidad = productosVendidos.reduce((s, p) => s + p.utilidad,   0);
    expect(r.margenPromedio).toBeCloseTo((utilidad / ventas) * 100, 1);
  });

  it("cuenta correctamente el número de productos", () => {
    const r = resumenVentas(productosVendidos);
    expect(r.cantidad).toBe(productosVendidos.length);
  });

  it("mejores son los 3 de mayor pctUtilidad", () => {
    const r = resumenVentas(productosVendidos);
    expect(r.mejores).toHaveLength(3);
    expect(r.mejores[0].pctUtilidad >= r.mejores[1].pctUtilidad).toBe(true);
  });

  it("peores son los 3 de menor pctUtilidad", () => {
    const r = resumenVentas(productosVendidos);
    expect(r.peores).toHaveLength(3);
    expect(r.peores[0].pctUtilidad <= r.peores[1].pctUtilidad).toBe(true);
  });

  it("lista vacía retorna todo en 0", () => {
    const r = resumenVentas([]);
    expect(r.totalVentas).toBe(0);
    expect(r.margenPromedio).toBe(0);
  });
});

// ── resumenInventario — Estado del inventario (PRODUCTO + LOTE) ───────────────
describe("resumenInventario — Control de existencias (E-R: PRODUCTO ←→ LOTE)", () => {
  it("cuenta correctamente el total de productos", () => {
    const r = resumenInventario(productosInventario);
    expect(r.total).toBe(4);
  });

  it("clasifica correctamente agotados (existencia = 0)", () => {
    const r = resumenInventario(productosInventario);
    expect(r.agotados).toBe(1); // solo Harina
    expect(r.listaAgotados[0].descripcion).toContain("Harina");
  });

  it("clasifica correctamente bajos (0 < existencia < stockMinimo)", () => {
    const r = resumenInventario(productosInventario);
    expect(r.bajos).toBe(1); // solo Aceite (existencia 3 < min 5)
    expect(r.listaBajos[0].descripcion).toContain("Aceite");
  });

  it("clasifica correctamente suficientes", () => {
    const r = resumenInventario(productosInventario);
    expect(r.suficientes).toBe(2); // Arroz y Leche
  });

  it("agotados + bajos + suficientes = total", () => {
    const r = resumenInventario(productosInventario);
    expect(r.agotados + r.bajos + r.suficientes).toBe(r.total);
  });

  it("calcula valorCosto = sum(existencia × costo)", () => {
    const r = resumenInventario(productosInventario);
    const esperado = productosInventario.reduce((s, p) => s + p.existencia * p.costo, 0);
    expect(r.valorCosto).toBeCloseTo(esperado, 2);
  });

  it("calcula valorVenta = sum(existencia × precioVenta)", () => {
    const r = resumenInventario(productosInventario);
    const esperado = productosInventario.reduce((s, p) => s + p.existencia * p.precioVenta, 0);
    expect(r.valorVenta).toBeCloseTo(esperado, 2);
  });

  it("inventario vacío retorna zeros", () => {
    const r = resumenInventario([]);
    expect(r.total).toBe(0);
    expect(r.valorCosto).toBe(0);
  });
});
