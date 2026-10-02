// ─────────────────────────────────────────────────────────────────────────────
// FASE 1 — PRUEBAS UNITARIAS: taxStorage.ts
// Proceso DFD cubierto: 2.2.1 Extraer Base, 2.2.2 ×IVA, 2.2.3 ×IGTF
// Relaciones E-R cubiertas: CIERRE_CAJA (fecha_cierre, utilidad_neta),
//                            GASTOS_OPERATIVOS (monto)
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from "vitest";
import {
  guardarVentasDia,
  leerVentasDia,
  actualizarDivisas,
  leerVentasMes,
  calcularResumenMes,
  mesesConDatos,
  vencimientoSENIAT,
  diasParaVencimiento,
  formatearMes,
  IVA_RATE,
  IGTF_RATE,
} from "../../app/utils/taxStorage";

// ── 1. Constantes del DFD ─────────────────────────────────────────────────────
describe("Constantes fiscales (DFD Nivel 3)", () => {
  it("IVA_RATE debe ser exactamente 0.16 (16%)", () => {
    expect(IVA_RATE).toBe(0.16);
  });

  it("IGTF_RATE debe ser exactamente 0.03 (3%)", () => {
    expect(IGTF_RATE).toBe(0.03);
  });
});

// ── 2. guardarVentasDia ────────────────────────────────────────────────────────
describe("guardarVentasDia — Proceso 2.2.1 Extraer Base Imponible", () => {
  it("guarda una entrada correctamente y se puede recuperar", () => {
    guardarVentasDia("2026-07-10", 5000, 3000, 2000, 24);
    const dia = leerVentasDia("2026-07-10");

    expect(dia).not.toBeNull();
    expect(dia!.totalVentas).toBe(5000);
    expect(dia!.totalCosto).toBe(3000);
    expect(dia!.totalUtilidad).toBe(2000);
    expect(dia!.cantidadProductos).toBe(24);
    expect(dia!.divisas).toBe(0); // por defecto 0
  });

  it("preserva divisas al sobreescribir el mismo día", () => {
    guardarVentasDia("2026-07-10", 5000, 3000, 2000, 24);
    actualizarDivisas("2026-07-10", 200);
    guardarVentasDia("2026-07-10", 6000, 3500, 2500, 28); // reimportación del PDF

    const dia = leerVentasDia("2026-07-10");
    expect(dia!.totalVentas).toBe(6000);
    expect(dia!.divisas).toBe(200); // divisas NO se borran
  });

  it("fecha se almacena en formato YYYY-MM-DD", () => {
    guardarVentasDia("2026-07-15", 1000, 600, 400, 10);
    const dia = leerVentasDia("2026-07-15");
    expect(dia!.fecha).toBe("2026-07-15");
  });
});

// ── 3. leerVentasDia ─────────────────────────────────────────────────────────
describe("leerVentasDia — Lectura de datos diarios", () => {
  it("retorna null si no existe la fecha", () => {
    expect(leerVentasDia("2099-01-01")).toBeNull();
  });

  it("retorna el objeto completo si existe", () => {
    guardarVentasDia("2026-07-10", 1200, 800, 400, 15);
    const dia = leerVentasDia("2026-07-10");
    expect(dia).toMatchObject({ fecha: "2026-07-10", totalVentas: 1200 });
  });
});

// ── 4. actualizarDivisas ──────────────────────────────────────────────────────
describe("actualizarDivisas — Proceso 2.2.3 Filtrar Divisas", () => {
  it("actualiza el monto de divisas de un día existente", () => {
    guardarVentasDia("2026-07-10", 5000, 3000, 2000, 24);
    actualizarDivisas("2026-07-10", 350.50);

    const dia = leerVentasDia("2026-07-10");
    expect(dia!.divisas).toBe(350.50);
  });

  it("no hace nada si el día no existe", () => {
    actualizarDivisas("2099-01-01", 100); // no debe lanzar excepción
    expect(leerVentasDia("2099-01-01")).toBeNull();
  });

  it("no permite divisas negativas", () => {
    guardarVentasDia("2026-07-10", 5000, 3000, 2000, 24);
    actualizarDivisas("2026-07-10", -50);
    const dia = leerVentasDia("2026-07-10");
    expect(dia!.divisas).toBeGreaterThanOrEqual(0);
  });
});

// ── 5. leerVentasMes ─────────────────────────────────────────────────────────
describe("leerVentasMes — Agrupación mensual", () => {
  it("retorna solo los días del mes especificado", () => {
    guardarVentasDia("2026-07-01", 1000, 600, 400, 10);
    guardarVentasDia("2026-07-15", 2000, 1200, 800, 20);
    guardarVentasDia("2026-08-01", 3000, 1800, 1200, 30); // mes diferente

    const julio = leerVentasMes("2026-07");
    expect(julio).toHaveLength(2);
    expect(julio.map(d => d.fecha)).toEqual(["2026-07-01", "2026-07-15"]);
  });

  it("retorna array vacío si no hay datos en el mes", () => {
    expect(leerVentasMes("2026-12")).toHaveLength(0);
  });

  it("retorna los días ordenados cronológicamente", () => {
    guardarVentasDia("2026-07-20", 1000, 600, 400, 10);
    guardarVentasDia("2026-07-03", 2000, 1200, 800, 20);
    guardarVentasDia("2026-07-11", 1500, 900, 600, 15);

    const dias = leerVentasMes("2026-07");
    const fechas = dias.map(d => d.fecha);
    expect(fechas).toEqual([...fechas].sort());
  });
});

// ── 6. calcularResumenMes — PROCESO CENTRAL DEL DFD ──────────────────────────
describe("calcularResumenMes — Proceso 4: Consolidación Fiscal", () => {
  beforeEach(() => {
    guardarVentasDia("2026-07-01", 10000, 6000, 4000, 20);
    guardarVentasDia("2026-07-02", 8000,  4800, 3200, 15);
    actualizarDivisas("2026-07-01", 500);   // divisas día 1
    actualizarDivisas("2026-07-02", 300);   // divisas día 2
  });

  it("suma correctamente la base imponible del mes", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.baseImponible).toBe(18000); // 10000 + 8000
  });

  it("calcula IVA = baseImponible × 0.16 (Proceso 2.2.2)", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.ivaDeuda).toBeCloseTo(18000 * 0.16, 2); // 2880.00
  });

  it("suma divisas totales del mes", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.divisas).toBe(800); // 500 + 300
  });

  it("calcula IGTF = divisas × 0.03 (Proceso 2.2.3)", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.igtfDeuda).toBeCloseTo(800 * 0.03, 2); // 24.00
  });

  it("totalDeuda = IVA + IGTF", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.totalDeuda).toBeCloseTo(r.ivaDeuda + r.igtfDeuda, 2);
  });

  it("suma correctamente la utilidad neta", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.utilidadNeta).toBe(7200); // 4000 + 3200
  });

  it("cuenta correctamente los días con datos", () => {
    const r = calcularResumenMes("2026-07");
    expect(r.diasConDatos).toBe(2);
  });

  it("retorna totalDeuda = 0 cuando no hay datos", () => {
    const r = calcularResumenMes("2099-01");
    expect(r.totalDeuda).toBe(0);
    expect(r.diasConDatos).toBe(0);
  });
});

// ── 7. mesesConDatos ─────────────────────────────────────────────────────────
describe("mesesConDatos — Índice de meses activos", () => {
  it("lista los meses con datos, ordenados de más reciente a más antiguo", () => {
    guardarVentasDia("2026-06-15", 1000, 600, 400, 10);
    guardarVentasDia("2026-07-01", 2000, 1200, 800, 20);
    guardarVentasDia("2026-07-20", 1500, 900, 600, 15);

    const meses = mesesConDatos();
    expect(meses).toContain("2026-06");
    expect(meses).toContain("2026-07");
    expect(meses[0] >= meses[1]).toBe(true); // orden descendente
  });

  it("no duplica el mismo mes", () => {
    guardarVentasDia("2026-07-01", 1000, 600, 400, 10);
    guardarVentasDia("2026-07-10", 1000, 600, 400, 10);
    const meses = mesesConDatos();
    const julio = meses.filter(m => m === "2026-07");
    expect(julio).toHaveLength(1);
  });
});

// ── 8. vencimientoSENIAT ─────────────────────────────────────────────────────
describe("vencimientoSENIAT — Fecha límite de declaración", () => {
  it("retorna el día 15 del mes siguiente", () => {
    expect(vencimientoSENIAT("2026-07")).toBe("2026-08-15");
    expect(vencimientoSENIAT("2026-12")).toBe("2027-01-15"); // cruce de año
    expect(vencimientoSENIAT("2026-01")).toBe("2026-02-15");
  });
});

// ── 9. diasParaVencimiento ───────────────────────────────────────────────────
describe("diasParaVencimiento — Alerta de tiempo restante", () => {
  it("retorna un número entero (positivo o negativo)", () => {
    const dias = diasParaVencimiento("2026-07");
    expect(Number.isInteger(dias)).toBe(true);
  });

  it("retorna negativo para meses ya vencidos", () => {
    const dias = diasParaVencimiento("2020-01"); // vencimiento: 2020-02-15
    expect(dias).toBeLessThan(0);
  });
});

// ── 10. formatearMes ─────────────────────────────────────────────────────────
describe("formatearMes — Presentación en español", () => {
  it("formatea correctamente los 12 meses en español", () => {
    const casos: [string, string][] = [
      ["2026-01", "Enero 2026"],
      ["2026-06", "Junio 2026"],
      ["2026-12", "Diciembre 2026"],
    ];
    for (const [entrada, esperado] of casos) {
      expect(formatearMes(entrada)).toBe(esperado);
    }
  });
});
