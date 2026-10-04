// ─────────────────────────────────────────────────────────────────────────────
// FASE 3 — ACEPTACIÓN: flujo de carga y procesamiento de PDFs (B01, B04, B05, C01, C03, D01, E05)
// Usa la UI real (VentasPanel / InventarioPanel / ImpuestosSection) y el parser real
// con PDFs SINTÉTICOS (src/tests/fixtures/), generados con las columnas que espera pdfParser.ts.
// Limitación: no son reportes reales de A2; la prueba con un PDF real sigue siendo necesaria.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as pdfjsLib from "pdfjs-dist";
import { VentasPanel } from "../../app/components/VentasPanel";
import { InventarioPanel } from "../../app/components/InventarioPanel";
import { ImpuestosSection } from "../../app/components/ImpuestosSection";
import { leerVentasPdf, leerInventarioPdf } from "../../app/utils/pdfParser";

const aqui = dirname(fileURLToPath(import.meta.url));
const fixture = (n: string) => readFileSync(resolve(aqui, "../fixtures", n));

function pdfFile(nombre: string): File {
  const buf = fixture(nombre);
  const f = new File([buf], nombre, { type: "application/pdf" });
  // Uint8Array (no ArrayBuffer): evita el chequeo instanceof entre realms de jsdom
  (f as any).arrayBuffer = async () => new Uint8Array(buf);
  return f;
}

beforeAll(() => {
  // El worker de producción se descarga de un CDN; en pruebas se usa el local.
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(
    resolve(aqui, "../../../node_modules/pdfjs-dist/build/pdf.worker.mjs"),
  ).href;
});

afterEach(() => cleanup());

const bs = (v: number) =>
  `Bs. ${v.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

function subir(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  Object.defineProperty(input, "files", { value: [file], configurable: true });
  fireEvent.change(input);
}

describe("Parser real sobre PDFs sintéticos", () => {
  it("leerVentasPdf extrae los 8 productos con sus montos", async () => {
    const prods = await leerVentasPdf(pdfFile("ventas_a2_sintetico.pdf"));
    expect(prods).toHaveLength(8);
    expect(prods[0]).toMatchObject({ codigo: "10001", cantidad: 120, montoBruto: 5400, costo: 3000 });
  });

  it("leerInventarioPdf extrae los 6 productos", async () => {
    const prods = await leerInventarioPdf(pdfFile("inventario_a2_sintetico.pdf"));
    expect(prods).toHaveLength(6);
    expect(prods.find(p => p.codigo === "20005")).toMatchObject({ existencia: 0, stockMinimo: 5 });
  });
});

describe("B01/B04 — Cargar PDF de ventas y guardar para impuestos", () => {
  it("procesa el PDF, muestra los datos y los deja disponibles en Impuestos", async () => {
    render(<VentasPanel />);
    const t0 = performance.now();
    subir(pdfFile("ventas_a2_sintetico.pdf"));
    await waitFor(() => expect(screen.getByText(/Datos guardados para/i)).toBeInTheDocument(), { timeout: 15000 });
    const segundos = (performance.now() - t0) / 1000;
    expect(segundos).toBeLessThan(10); // E05
    console.info(`E05 tiempo de procesamiento PDF ventas: ${segundos.toFixed(2)} s`);

    cleanup();
    render(<ImpuestosSection />);
    // Base = suma de montos brutos del PDF (22.250,00); IVA = base × 0,16 = 3.560,00 (D01/D02 con datos del PDF)
    const base = 5400 + 3400 + 2850 + 2850 + 2700 + 1750 + 1500 + 1800;
    expect(await screen.findByText(/BASE IMPONIBLE/i)).toBeInTheDocument();
    expect(screen.getAllByText(bs(+(base * 0.16).toFixed(2))).length).toBeGreaterThan(0);
  });
});

describe("B05 — PDF que no es de A2", () => {
  it("muestra un mensaje de error claro y no guarda datos", async () => {
    render(<VentasPanel />);
    subir(pdfFile("no_a2.pdf"));
    await waitFor(() => expect(screen.getByText(/No se encontraron productos/i)).toBeInTheDocument(), { timeout: 15000 });
    expect(localStorage.length).toBe(0);
  });
});

describe("C01/C03 — Cargar PDF de inventario", () => {
  it("muestra agotados y bajos resaltados", async () => {
    render(<InventarioPanel />);
    subir(pdfFile("inventario_a2_sintetico.pdf"));
    await waitFor(() => expect(screen.getAllByText(/Agotado/i).length).toBeGreaterThan(0), { timeout: 15000 });
    expect(screen.getAllByText(/Bajo/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/AZUCAR BLANCA 1KG/i).length).toBeGreaterThan(0);
  });
});
