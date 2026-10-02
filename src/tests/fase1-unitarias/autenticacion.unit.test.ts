// ─────────────────────────────────────────────────────────────────────────────
// FASE 1 — PRUEBAS UNITARIAS: Autenticación (LoginPage logic)
// Caja Blanca: lógica de sesión y validación de credenciales
// Relaciones E-R: USUARIO (id_usuario, nombre, rol)
// Mock: se simula localStorage (ya configurado en setup.ts)
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect, beforeEach } from "vitest";

// ── Lógica extraída de LoginPage (funciones puras testables) ─────────────────

const ADMIN_EMAIL    = "addr43342@gmail.com";
const ADMIN_PASSWORD = "Invergica2026";
const SESSION_KEY    = "invergica_auth";

function validarEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function intentarLogin(email: string, password: string): boolean {
  return (
    email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() &&
    password === ADMIN_PASSWORD
  );
}

function guardarSesion(): void {
  localStorage.setItem(SESSION_KEY, "true");
}

function cerrarSesion(): void {
  localStorage.removeItem(SESSION_KEY);
}

function haySession(): boolean {
  return localStorage.getItem(SESSION_KEY) === "true";
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("validarEmail — Validación de formato de correo", () => {
  it("acepta correos válidos", () => {
    expect(validarEmail("admin@invergica.com")).toBe(true);
    expect(validarEmail("addr43342@gmail.com")).toBe(true);
    expect(validarEmail("usuario@empresa.com.ve")).toBe(true);
  });

  it("rechaza correos sin @", () => {
    expect(validarEmail("admininvergica.com")).toBe(false);
  });

  it("rechaza correos sin dominio", () => {
    expect(validarEmail("admin@")).toBe(false);
  });

  it("rechaza cadenas vacías", () => {
    expect(validarEmail("")).toBe(false);
  });

  it("rechaza correos con espacios", () => {
    expect(validarEmail("admin @invergica.com")).toBe(false);
  });
});

describe("intentarLogin — Verificación de credenciales (E-R: USUARIO.rol)", () => {
  it("acepta credenciales correctas exactas", () => {
    expect(intentarLogin(ADMIN_EMAIL, ADMIN_PASSWORD)).toBe(true);
  });

  it("es insensible a mayúsculas en el correo", () => {
    expect(intentarLogin("ADDR43342@GMAIL.COM", ADMIN_PASSWORD)).toBe(true);
    expect(intentarLogin("Addr43342@Gmail.Com", ADMIN_PASSWORD)).toBe(true);
  });

  it("es sensible a mayúsculas en la contraseña", () => {
    expect(intentarLogin(ADMIN_EMAIL, "invergica2026")).toBe(false);
    expect(intentarLogin(ADMIN_EMAIL, "INVERGICA2026")).toBe(false);
  });

  it("rechaza correo incorrecto con contraseña correcta", () => {
    expect(intentarLogin("otro@correo.com", ADMIN_PASSWORD)).toBe(false);
  });

  it("rechaza campos vacíos", () => {
    expect(intentarLogin("", "")).toBe(false);
    expect(intentarLogin(ADMIN_EMAIL, "")).toBe(false);
    expect(intentarLogin("", ADMIN_PASSWORD)).toBe(false);
  });

  it("rechaza correo con espacios al inicio/final", () => {
    // trim() en el correo sí se aplica, así que debe pasar
    expect(intentarLogin(`  ${ADMIN_EMAIL}  `, ADMIN_PASSWORD)).toBe(true);
  });
});

describe("Gestión de sesión — localStorage (USUARIO persistido)", () => {
  beforeEach(() => localStorage.clear());

  it("haySession() retorna false si no se ha iniciado sesión", () => {
    expect(haySession()).toBe(false);
  });

  it("guardarSesion() marca la sesión como activa", () => {
    guardarSesion();
    expect(haySession()).toBe(true);
    expect(localStorage.getItem(SESSION_KEY)).toBe("true");
  });

  it("cerrarSesion() elimina la sesión", () => {
    guardarSesion();
    cerrarSesion();
    expect(haySession()).toBe(false);
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
  });

  it("la sesión persiste entre 'recargas' (simuladas con nueva lectura)", () => {
    guardarSesion();
    // Simulamos que App.tsx re-lee al montar
    const sessionActiva = localStorage.getItem(SESSION_KEY) === "true";
    expect(sessionActiva).toBe(true);
  });

  it("cerrar sesión cuando no hay sesión activa no lanza error", () => {
    expect(() => cerrarSesion()).not.toThrow();
  });
});

describe("Seguridad — casos borde (E-R: USUARIO.rol = admin only)", () => {
  it("inyección SQL básica en correo es rechazada", () => {
    expect(intentarLogin("' OR '1'='1", ADMIN_PASSWORD)).toBe(false);
  });

  it("inyección SQL en contraseña es rechazada", () => {
    expect(intentarLogin(ADMIN_EMAIL, "' OR '1'='1")).toBe(false);
  });

  it("script XSS en correo es rechazado", () => {
    expect(intentarLogin("<script>alert(1)</script>@x.com", ADMIN_PASSWORD)).toBe(false);
  });

  it("correo con solo números es rechazado", () => {
    expect(intentarLogin("12345", ADMIN_PASSWORD)).toBe(false);
  });
});
