import "@testing-library/jest-dom";

// pdfjs-dist usa DOMMatrix internamente (API Canvas) — jsdom no la incluye
// Se provee un stub mínimo para que el módulo se importe sin error
if (typeof globalThis.DOMMatrix === "undefined") {
  (globalThis as any).DOMMatrix = class {
    constructor() {}
    invertSelf() { return this; }
  };
}

// Simula localStorage en el entorno jsdom
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem:    (k: string)           => store[k] ?? null,
    setItem:    (k: string, v: string) => { store[k] = v; },
    removeItem: (k: string)           => { delete store[k]; },
    clear:      ()                    => { store = {}; },
    get length() { return Object.keys(store).length; },
    key: (i: number) => Object.keys(store)[i] ?? null,
  };
})();

Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Limpia localStorage antes de cada prueba
beforeEach(() => localStorage.clear());
