// ─────────────────────────────────────────────────────────────────────────────
// FASE 3 — ACEPTACIÓN AUTOMATIZADA (UI real con jsdom + Testing Library)
// Ejecuta los casos de checklist-alfa.md que no requieren un PDF (A01–A06, D01–D06, E01–E04).
// Las credenciales son ficticias y se inyectan por variables de entorno de prueba.
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor, cleanup, within } from "@testing-library/react";
import { guardarVentasDia } from "../../app/utils/taxStorage";

const EMAIL = "admin.prueba@example.com";
const CLAVE = "ClavePrueba#2026";

vi.stubEnv("VITE_ADMIN_EMAIL", EMAIL);
vi.stubEnv("VITE_ADMIN_PASSWORD", CLAVE);

const bs = (v: number) =>
  `Bs. ${v.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

async function cargarApp() {
  const mod = await import("../../app/App");
  return mod.default;
}

const campoEmail = () => document.querySelector('input[type="email"]') as HTMLInputElement;
const campoClave = () => document.querySelector('input[type="password"]') as HTMLInputElement;

function enviarLogin(email: string, clave: string) {
  fireEvent.change(campoEmail(), { target: { value: email } });
  fireEvent.change(campoClave(), { target: { value: clave } });
  fireEvent.click(screen.getAllByRole("button", { name: /iniciar sesión/i })[0]);
}

afterEach(() => cleanup());

// ── MÓDULO 1: Autenticación ─────────────────────────────────────────────────

describe("A01 — Login correcto", () => {
  it("muestra el sitio completo y guarda la sesión", async () => {
    const App = await cargarApp();
    render(<App />);
    enviarLogin(EMAIL, CLAVE);
    await waitFor(() => expect(screen.getByText("Pago de Impuestos")).toBeInTheDocument(), { timeout: 4000 });
    expect(localStorage.getItem("invergica_auth")).toBe("true");
  });
});

describe("A02 — Login incorrecto", () => {
  it("muestra el mensaje de error y no inicia sesión", async () => {
    const App = await cargarApp();
    render(<App />);
    enviarLogin("otro@correo.com", "mala");
    await waitFor(() => expect(screen.getByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument(), { timeout: 4000 });
    expect(localStorage.getItem("invergica_auth")).toBeNull();
  });
});

describe("A03 — Persistencia de sesión", () => {
  it("con sesión guardada abre el sitio sin pedir login", async () => {
    localStorage.setItem("invergica_auth", "true");
    const App = await cargarApp();
    render(<App />);
    expect(screen.getByText("Pago de Impuestos")).toBeInTheDocument();
    expect(campoEmail()).toBeNull();
  });
});

describe("A04 — Cerrar sesión", () => {
  it("el botón Salir regresa al login y borra la sesión", async () => {
    localStorage.setItem("invergica_auth", "true");
    const App = await cargarApp();
    render(<App />);
    fireEvent.click(screen.getByTitle("Cerrar sesión"));
    expect(campoEmail()).toBeInTheDocument();
    expect(localStorage.getItem("invergica_auth")).toBeNull();
  });
});

describe("A05 — Olvidé mi contraseña", () => {
  it("abre el modal con enlace de WhatsApp al número del administrador", async () => {
    const App = await cargarApp();
    render(<App />);
    fireEvent.click(screen.getByText(/¿Olvidaste tu contraseña\?/i));
    const enlaces = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]'));
    expect(enlaces.length).toBeGreaterThan(0);
    expect(enlaces.every(a => a.href.includes("584141667535"))).toBe(true);
  });
});

describe("A06 — No tengo cuenta", () => {
  it("el modal explica que el sistema es privado", async () => {
    const App = await cargarApp();
    render(<App />);
    fireEvent.click(screen.getByText(/¿No tienes una cuenta\?/i));
    expect(screen.getByText(/Sistema Privado/i)).toBeInTheDocument();
  });
});

describe("Configuración — el login usa VITE_ADMIN_EMAIL / VITE_ADMIN_PASSWORD", () => {
  it("sin variables definidas el acceso queda bloqueado", async () => {
    vi.stubEnv("VITE_ADMIN_EMAIL", "");
    vi.stubEnv("VITE_ADMIN_PASSWORD", "");
    vi.resetModules();
    const App = await cargarApp();
    render(<App />);
    enviarLogin("", "");
    enviarLogin(EMAIL, CLAVE);
    await waitFor(() => expect(screen.getByText(/Acceso no configurado/i)).toBeInTheDocument(), { timeout: 4000 });
    expect(localStorage.getItem("invergica_auth")).toBeNull();
    vi.stubEnv("VITE_ADMIN_EMAIL", EMAIL);
    vi.stubEnv("VITE_ADMIN_PASSWORD", CLAVE);
    vi.resetModules();
  });

  it("con otras credenciales en el entorno, solo esas son válidas", async () => {
    vi.stubEnv("VITE_ADMIN_EMAIL", "otro.admin@example.com");
    vi.stubEnv("VITE_ADMIN_PASSWORD", "OtraClave#1");
    vi.resetModules();
    const App = await cargarApp();
    render(<App />);
    enviarLogin(EMAIL, CLAVE);
    await waitFor(() => expect(screen.getByText(/Correo o contraseña incorrectos/i)).toBeInTheDocument(), { timeout: 4000 });
    vi.stubEnv("VITE_ADMIN_EMAIL", EMAIL);
    vi.stubEnv("VITE_ADMIN_PASSWORD", CLAVE);
    vi.resetModules();
  });
});

// ── MÓDULO 4: Pago de Impuestos (datos sembrados en localStorage) ───────────

function hoy(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function cargarImpuestos() {
  const mod = await import("../../app/components/ImpuestosSection");
  return mod.ImpuestosSection;
}

describe("D01/D02 — Tarjetas de impuestos y cálculo del IVA", () => {
  beforeEach(() => guardarVentasDia(hoy(), 1000, 600, 400, 10));

  it("muestra las 4 tarjetas y IVA = base × 0,16", async () => {
    const Impuestos = await cargarImpuestos();
    render(<Impuestos />);
    expect(await screen.findByText(/BASE IMPONIBLE/i)).toBeInTheDocument();
    expect(screen.getByText(/IVA DÉBITO FISCAL \(16%\)/i)).toBeInTheDocument();
    expect(screen.getByText(/IGTF \(3% Divisas\)/i)).toBeInTheDocument();
    expect(screen.getByText(/TOTAL A PAGAR SENIAT/i)).toBeInTheDocument();
    expect(screen.getAllByText(bs(160)).length).toBeGreaterThan(0);
  });
});

describe("D03 — Divisas para el IGTF", () => {
  beforeEach(() => guardarVentasDia(hoy(), 1000, 600, 400, 10));

  it("editar divisas = 200 recalcula el IGTF a 6,00", async () => {
    const Impuestos = await cargarImpuestos();
    render(<Impuestos />);
    fireEvent.click(await screen.findByTitle("Clic para editar divisas"));
    const campo = document.querySelector('input[type="number"]') as HTMLInputElement;
    expect(campo).toBeTruthy();
    fireEvent.change(campo, { target: { value: "200" } });
    fireEvent.keyDown(campo, { key: "Enter" });
    await waitFor(() => expect(screen.getAllByText(bs(6)).length).toBeGreaterThan(0));
  });
});

describe("D04 — Alerta de vencimiento (texto según días restantes)", () => {
  afterEach(() => vi.useRealTimers());

  const casos: Array<[string, string, RegExp]> = [
    ["lejano (>15 días)", "2026-10-02", /días para vencer/],
    ["intermedio (6–15 días)", "2026-11-05", /días para vencer/],
    ["cercano (1–5 días)", "2026-11-12", /días para vencer/],
    ["vence hoy", "2026-11-15", /Vence HOY/],
    ["vencido", "2026-11-20", /Vencido hace/],
  ];

  it.each(casos)("%s", async (_n, fechaSistema, esperado) => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date(`${fechaSistema}T12:00:00`));
    const [a, m] = fechaSistema.slice(0, 7).split("-").map(Number);
    const mesDatos = m === 1 ? `${a - 1}-12` : `${a}-${String(m - 1).padStart(2, "0")}`;
    guardarVentasDia(`${mesDatos}-10`, 500, 300, 200, 5);
    const Impuestos = await cargarImpuestos();
    render(<Impuestos />);
    fireEvent.change(document.querySelector("select") as HTMLSelectElement, { target: { value: mesDatos } });
    expect(await screen.findByText(esperado)).toBeInTheDocument();
  });
});

describe("D05/D06 — Cambio de mes y mes sin datos", () => {
  it("un mes sin PDFs muestra el banner y al elegir otro mes cambian los datos", async () => {
    guardarVentasDia("2026-01-10", 500, 300, 200, 5);
    const Impuestos = await cargarImpuestos();
    render(<Impuestos />);
    expect(await screen.findByText(/Sin datos para/i)).toBeInTheDocument();
    fireEvent.change(document.querySelector("select") as HTMLSelectElement, { target: { value: "2026-01" } });
    await waitFor(() => expect(screen.queryByText(/Sin datos para/i)).not.toBeInTheDocument());
    expect(screen.getAllByText(bs(80)).length).toBeGreaterThan(0);
  });
});

// ── MÓDULO 5: Navegación y enlaces ──────────────────────────────────────────

describe("E01 — Cada enlace del menú apunta a una sección existente", () => {
  it("Inicio, Galería, Documentos, Impuestos y Contacto tienen destino", async () => {
    localStorage.setItem("invergica_auth", "true");
    const App = await cargarApp();
    const { container } = render(<App />);
    const nav = container.querySelector("nav") as HTMLElement;
    const destinos = within(nav).getAllByRole("link")
      .map(a => a.getAttribute("href") ?? "")
      .filter(h => h.startsWith("#"))
      .map(h => h.slice(1));
    for (const id of ["inicio", "galeria", "documentos", "impuestos", "contacto"]) {
      expect(destinos).toContain(id);
      expect(document.getElementById(id)).not.toBeNull();
    }
  });
});

describe("E02 — Menú en móvil (hallazgo)", () => {
  it("los enlaces del menú se ocultan en pantallas pequeñas sin menú alternativo", async () => {
    localStorage.setItem("invergica_auth", "true");
    const App = await cargarApp();
    const { container } = render(<App />);
    const nav = container.querySelector("nav") as HTMLElement;
    const contenedor = within(nav).getByText("Galería").closest("div") as HTMLElement;
    expect(contenedor.className).toContain("hidden");
    expect(within(nav).queryByLabelText(/menú|menu/i)).toBeNull();
  });
});

describe("E03/E04 — WhatsApp y Google Maps", () => {
  it("todos los enlaces de WhatsApp usan +58 414-1667535 y existe enlace a Maps", async () => {
    localStorage.setItem("invergica_auth", "true");
    const App = await cargarApp();
    render(<App />);
    const wa = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="wa.me"]'));
    expect(wa.length).toBeGreaterThan(0);
    expect(wa.every(a => a.href.includes("584141667535"))).toBe(true);
    expect(document.querySelector('a[href*="maps"]')).not.toBeNull();
  });
});
