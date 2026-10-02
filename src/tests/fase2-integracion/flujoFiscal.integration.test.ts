// ─────────────────────────────────────────────────────────────────────────────
// FASE 2 — PRUEBAS DE INTEGRACIÓN: Flujo completo Ventas → Impuestos
// Cubre la comunicación entre VentasPanel (guardar) → ImpuestosSection (leer)
// DFD Nivel 2: Proceso 1.1→1.2→2.2.1→2.2.2→2.2.3
// E-R: CIERRE_CAJA ←Detalla→ PRODUCTO ←Pertenece_A→ LOTE
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from "vitest";
import {
  guardarVentasDia,
  actualizarDivisas,
  calcularResumenMes,
  mesesConDatos,
  vencimientoSENIAT,
  diasParaVencimiento,
  IVA_RATE,
  IGTF_RATE,
} from "../../app/utils/taxStorage";

// ── Escenario: Semana de ventas completa en julio 2026 ────────────────────────

const semanaJulio = [
  { fecha: "2026-07-07", ventas: 12500, costo: 7500,  utilidad: 5000,  prods: 28 },
  { fecha: "2026-07-08", ventas: 9800,  costo: 5880,  utilidad: 3920,  prods: 22 },
  { fecha: "2026-07-09", ventas: 15200, costo: 9120,  utilidad: 6080,  prods: 35 },
  { fecha: "2026-07-10", ventas: 8400,  costo: 5040,  utilidad: 3360,  prods: 19 },
  { fecha: "2026-07-11", ventas: 11000, costo: 6600,  utilidad: 4400,  prods: 25 },
  { fecha: "2026-07-12", ventas: 13700, costo: 8220,  utilidad: 5480,  prods: 30 },
];

const divisasPorDia: Record<string, number> = {
  "2026-07-08": 250,
  "2026-07-10": 180,
  "2026-07-12": 420,
};

describe("Integración: Flujo completo Ventas → Impuestos (DFD 1.1→2.2.3)", () => {
  beforeEach(() => {
    semanaJulio.forEach(d => guardarVentasDia(d.fecha, d.ventas, d.costo, d.utilidad, d.prods));
    Object.entries(divisasPorDia).forEach(([fecha, monto]) => actualizarDivisas(fecha, monto));
  });

  it("los 6 días se almacenan correctamente", () => {
    const resumen = calcularResumenMes("2026-07");
    expect(resumen.diasConDatos).toBe(6);
  });

  it("la base imponible suma todos los días del mes", () => {
    const esperado = semanaJulio.reduce((s, d) => s + d.ventas, 0);
    const resumen  = calcularResumenMes("2026-07");
    expect(resumen.baseImponible).toBe(esperado);
  });

  it("el IVA se calcula sobre la base imponible total (Proceso 2.2.2)", () => {
    const base    = semanaJulio.reduce((s, d) => s + d.ventas, 0);
    const resumen = calcularResumenMes("2026-07");
    expect(resumen.ivaDeuda).toBeCloseTo(base * IVA_RATE, 2);
  });

  it("las divisas acumulan solo los días con pago en USD", () => {
    const totalDivisas = Object.values(divisasPorDia).reduce((s, v) => s + v, 0);
    const resumen      = calcularResumenMes("2026-07");
    expect(resumen.divisas).toBe(totalDivisas); // 250 + 180 + 420 = 850
  });

  it("el IGTF se calcula solo sobre divisas (Proceso 2.2.3)", () => {
    const totalDivisas = Object.values(divisasPorDia).reduce((s, v) => s + v, 0);
    const resumen      = calcularResumenMes("2026-07");
    expect(resumen.igtfDeuda).toBeCloseTo(totalDivisas * IGTF_RATE, 2);
  });

  it("el total de deuda fiscal es IVA + IGTF", () => {
    const resumen = calcularResumenMes("2026-07");
    expect(resumen.totalDeuda).toBeCloseTo(resumen.ivaDeuda + resumen.igtfDeuda, 2);
  });

  it("la utilidad neta se acumula correctamente", () => {
    const esperada = semanaJulio.reduce((s, d) => s + d.utilidad, 0);
    const resumen  = calcularResumenMes("2026-07");
    expect(resumen.utilidadNeta).toBe(esperada);
  });

  it("el mes aparece en la lista de meses con datos", () => {
    const meses = mesesConDatos();
    expect(meses).toContain("2026-07");
  });
});

describe("Integración: Actualización de divisas no rompe ventas existentes", () => {
  it("actualizar divisas de un día no modifica sus ventas", () => {
    guardarVentasDia("2026-07-15", 5000, 3000, 2000, 20);
    actualizarDivisas("2026-07-15", 300);
    actualizarDivisas("2026-07-15", 150); // segunda actualización

    const resumen = calcularResumenMes("2026-07");
    expect(resumen.baseImponible).toBe(5000);
    expect(resumen.divisas).toBe(150); // usa el último valor
  });
});

describe("Integración: Múltiples meses aislados", () => {
  it("julio y agosto tienen bases imponibles independientes", () => {
    guardarVentasDia("2026-07-20", 10000, 6000, 4000, 20);
    guardarVentasDia("2026-08-05", 15000, 9000, 6000, 25);

    const rJulio   = calcularResumenMes("2026-07");
    const rAgosto  = calcularResumenMes("2026-08");

    expect(rJulio.baseImponible).toBe(10000);
    expect(rAgosto.baseImponible).toBe(15000);
    expect(rJulio.ivaDeuda).not.toBe(rAgosto.ivaDeuda);
  });
});

describe("Integración: Vencimiento y alertas SENIAT", () => {
  it("vencimientoSENIAT es el día 15 del mes siguiente", () => {
    expect(vencimientoSENIAT("2026-07")).toBe("2026-08-15");
  });

  it("mes ya pasado tiene días negativos (vencido)", () => {
    expect(diasParaVencimiento("2020-03")).toBeLessThan(0);
  });

  it("el vencimiento es consistente con el resumen del mes", () => {
    guardarVentasDia("2026-07-10", 5000, 3000, 2000, 20);
    const r = calcularResumenMes("2026-07");
    expect(r.mes).toBe("2026-07");
    // Vencimiento del resumen coincide con la función
    expect(vencimientoSENIAT(r.mes)).toBe("2026-08-15");
  });
});

describe("Integración: Precisión financiera (sin errores de punto flotante)", () => {
  it("base imponible con decimales no genera error de flotante", () => {
    guardarVentasDia("2026-07-01", 1234.56, 789.01, 445.55, 10);
    guardarVentasDia("2026-07-02", 987.65,  543.21, 444.44, 8);

    const r = calcularResumenMes("2026-07");
    expect(r.baseImponible).toBeCloseTo(1234.56 + 987.65, 2);
    expect(r.ivaDeuda).toBeCloseTo((1234.56 + 987.65) * 0.16, 2);
  });

  it("IGTF con divisas decimales se redondea a 2 decimales", () => {
    guardarVentasDia("2026-07-01", 1000, 600, 400, 10);
    actualizarDivisas("2026-07-01", 333.33);

    const r = calcularResumenMes("2026-07");
    expect(r.igtfDeuda).toBeCloseTo(333.33 * 0.03, 2);
    // Verifica que no tenga más de 2 decimales significativos
    const decimales = String(r.igtfDeuda).split(".")[1]?.length ?? 0;
    expect(decimales).toBeLessThanOrEqual(2);
  });
});
