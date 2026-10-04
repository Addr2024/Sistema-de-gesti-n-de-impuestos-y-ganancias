# Informe de Aceptación — Invergica v1.0

Fecha: 2026-10-04. Checklist: `src/tests/fase3-aceptacion/checklist-alfa.md`.

## Cómo se ejecutó
- `src/tests/fase3-aceptacion/aceptacion.ui.test.tsx`: UI real (jsdom + Testing Library) para login, impuestos y navegación.
- `src/tests/fase3-aceptacion/aceptacion.pdf.test.tsx`: flujo de PDF A2 con el parser real (`pdfjs-dist`) y los paneles reales, usando PDFs **sintéticos** en `src/tests/fixtures/`.
- Resultado global: web 127/127 pruebas, SIGA 77/77.

## Resultado: 21 pasan, 1 falla, 3 pendientes (de 25)
| Caso | Estado |
|---|---|
| A01–A06 | Pasa |
| B01, B04, B05 | Pasa (PDF sintético) |
| B02, B03, C02 | Pendiente: revisión visual en navegador |
| C01, C03 | Pasa (PDF sintético) |
| D01–D06 | Pasa |
| E01, E03, E04 | Pasa |
| E02 | Falla (no bloqueante): sin menú móvil |
| E05 | Pasa: 0,13 s con PDF sintético |

## Flujo PDF A2 (hallazgo principal)
Con PDFs sintéticos: se extraen 8 productos de ventas y 6 de inventario; base 22 250,00 → IVA 3 560,00; un PDF que no es A2 muestra «No se encontraron productos» y no guarda nada.

**Limitación:** los PDFs son generados por el equipo, no reportes reales de A2. Falta probar con un PDF real.

### Procedimiento manual con PDF real (pendiente del equipo)
1. Iniciar sesión y abrir «Documentos».
2. Arrastrar el PDF de Cierre de Caja de A2 → verificar productos, semáforo (B02) y gráfica (B03).
3. Verificar el badge «Datos guardados» y la sección «Impuestos» (B04, D01).
4. Arrastrar el PDF de inventario → contadores y alertas (C01, C03).
5. Repetir con un PDF cualquiera (B05) y cronometrar la carga (E05).

## Hallazgos
1. **Menú móvil ausente** (E02): `Navbar` usa `hidden md:flex` sin hamburguesa.
2. **Descripciones largas**: si A2 parte una descripción en dos líneas, el parser pierde la descripción (agrupa filas por Y con tolerancia 4).
3. **Descuentos ignorados**: la base imponible suma `montoBruto`; no resta descuentos.
4. **pdfjs-dist 6.x** exige JS moderno (`Promise.try`, `Uint8Array.toHex`, `Math.sumPrecise`); en pruebas se agregan polyfills en `setup.ts`. Navegadores antiguos podrían fallar.
5. **Worker desde CDN**: `pdfParser.ts` carga el worker por URL según `pdfjsLib.version`; sin internet, la lectura de PDF falla.
6. **Sin `index.html` ni script `dev`**: `pnpm build` falla fuera de Figma Make.
7. **`VITE_*` queda visible en el bundle**: el login web es una barrera de interfaz, no seguridad real.
