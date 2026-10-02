# PLAN DE PRUEBAS — INVERGICA WEB
## Metodología Incremental · 4 Fases de Validación
**Sistema:** SIG-A (Sistema Integrado de Gestión para Abasto)  
**Tecnología:** React 18 + TypeScript + Vitest 4.1 + Testing Library  
**Fecha del informe:** Agosto 2026  
**Resultado actual:** ✅ 103 / 103 pruebas pasando

---

## ESTADO DEL SISTEMA DE PRUEBAS

```
pnpm vitest run
```

| Archivo de prueba | Tests | Estado |
|---|---|---|
| `fase1-unitarias/autenticacion.unit.test.ts` | 20 | ✅ VERDE |
| `fase1-unitarias/taxStorage.unit.test.ts` | 35 | ✅ VERDE |
| `fase1-unitarias/pdfParser.unit.test.ts` | 28 | ✅ VERDE |
| `fase2-integracion/flujoFiscal.integration.test.ts` | 13 | ✅ VERDE |
| `fase2-integracion/semaforoInventario.integration.test.ts` | 17 | ✅ VERDE |
| **TOTAL** | **103** | **✅ 100%** |

---

## FASE 1: DESARROLLO Y PRUEBAS TEMPRANAS

### Objetivo
Validar la lógica interna de cada unidad de código de forma aislada antes de conectarla al resto del sistema.

### 1.1 Pruebas de Caja Blanca — Ejecutadas

#### `autenticacion.unit.test.ts` (20 tests)
Cubre la lógica de `LoginPage.tsx` + `App.tsx`:

| ID | Prueba | Resultado |
|---|---|---|
| U01 | validarEmail() acepta correos válidos | ✅ |
| U02 | validarEmail() rechaza sin @ | ✅ |
| U03 | validarEmail() rechaza sin dominio | ✅ |
| U04 | validarEmail() rechaza cadenas vacías | ✅ |
| U05 | validarEmail() rechaza correos con espacios | ✅ |
| U06 | intentarLogin() acepta credenciales correctas | ✅ |
| U07 | intentarLogin() es insensible a mayúsculas en el correo | ✅ |
| U08 | intentarLogin() es sensible a mayúsculas en contraseña | ✅ |
| U09 | intentarLogin() rechaza correo incorrecto | ✅ |
| U10 | intentarLogin() rechaza campos vacíos | ✅ |
| U11 | intentarLogin() aplica trim() al correo | ✅ |
| U12 | haySession() retorna false sin sesión | ✅ |
| U13 | guardarSesion() activa localStorage | ✅ |
| U14 | cerrarSesion() elimina localStorage | ✅ |
| U15 | sesión persiste entre recargas | ✅ |
| U16 | cerrarSesion() sin sesión no lanza error | ✅ |
| U17 | inyección SQL en correo rechazada | ✅ |
| U18 | inyección SQL en contraseña rechazada | ✅ |
| U19 | XSS en correo rechazado | ✅ |
| U20 | correo numérico rechazado | ✅ |

#### `taxStorage.unit.test.ts` (35 tests)
Cubre `taxStorage.ts` — Proceso DFD 2.2.1→2.2.3 y E-R CIERRE_CAJA:

| Grupo | Tests | Resultado |
|---|---|---|
| Constantes IVA_RATE / IGTF_RATE | 2 | ✅ |
| guardarVentasDia() — guardar, preservar divisas, formato fecha | 3 | ✅ |
| leerVentasDia() — null y objeto completo | 2 | ✅ |
| actualizarDivisas() — actualizar, no existente, negativos | 3 | ✅ |
| leerVentasMes() — filtrado, vacío, orden cronológico | 3 | ✅ |
| calcularResumenMes() — base, IVA, divisas, IGTF, total, utilidad, días, vacío | 8 | ✅ |
| mesesConDatos() — lista, sin duplicados | 2 | ✅ |
| vencimientoSENIAT() — 3 casos incluido cruce de año | 1 | ✅ |
| diasParaVencimiento() — tipo, negativo pasado | 2 | ✅ |
| formatearMes() — 3 meses en español | 1 | ✅ |

#### `pdfParser.unit.test.ts` (28 tests)
Cubre `pdfParser.ts` — funciones puras de clasificación y cálculo:

| Función | Tests | Resultado |
|---|---|---|
| colorMargen() — valores borde y medios | 5 | ✅ |
| estadoStock() — agotado / bajo / suficiente / borde igual | 4 | ✅ |
| resumenVentas() — sumas, margen, conteo, mejores/peores, vacío | 8 | ✅ |
| resumenInventario() — conteos, listas, valorCosto, valorVenta, vacío | 7 | ✅ |

### 1.2 Mantenimiento Preventivo incluido (10% de recursos)
- `taxStorage.ts`: validaciones en `actualizarDivisas` (divisas ≥ 0)
- `guardarVentasDia`: preserva divisas existentes al reimportar
- `calcularResumenMes`: redondeo a 2 decimales en todos los valores
- `pdfParser.ts`: guards `if (nums.length < 6) continue` en parseVentasRows

---

## FASE 2: INTEGRACIÓN Y SISTEMA

### Objetivo
Verificar que los módulos se comunican correctamente entre sí.

### 2.1 Pruebas de Integración — Ejecutadas

#### `flujoFiscal.integration.test.ts` (13 tests)
**Interfaz probada:** VentasPanel → taxStorage → ImpuestosSection

| ID | Prueba | Resultado |
|---|---|---|
| I01 | 6 días de ventas se almacenan y cuentan | ✅ |
| I02 | base imponible suma todos los días | ✅ |
| I03 | IVA = base × 0.16 sobre total mensual | ✅ |
| I04 | divisas acumulan solo días con pago USD | ✅ |
| I05 | IGTF = divisas × 0.03 sobre total mensual | ✅ |
| I06 | totalDeuda = IVA + IGTF | ✅ |
| I07 | utilidad neta se acumula correctamente | ✅ |
| I08 | mes aparece en lista de meses activos | ✅ |
| I09 | actualizar divisas no modifica ventas existentes | ✅ |
| I10 | julio y agosto son independientes (sin contaminación) | ✅ |
| I11 | vencimiento es el día 15 del mes siguiente | ✅ |
| I12 | mes pasado tiene días negativos (vencido) | ✅ |
| I13 | precisión decimal sin errores de flotante | ✅ |

#### `semaforoInventario.integration.test.ts` (17 tests)
**Interfaz probada:** pdfParser → resumenInventario → semáforo visual

| Grupo | Tests | Resultado |
|---|---|---|
| Clasificación individual (suficiente/bajo/agotado) | 3 | ✅ |
| Resumen consolidado — conteos y listas | 4 | ✅ |
| colorAlertaLote DFD 3.3.3 | 3 | ✅ |
| diasHastaVencimiento DFD 3.3.2 | 3 | ✅ |
| calcularMerma E-R LOTE→MERMA | 3 | ✅ |
| Casos borde de inventario | 1 | ✅ |

### 2.2 Pruebas No Funcionales — Estado

| Tipo | Herramienta | Estado |
|---|---|---|
| Rendimiento PDF parse | Medición manual (<10s) | Manual |
| Seguridad: inyección SQL | Tests U17-U18 | ✅ Automatizado |
| Seguridad: XSS | Test U19 | ✅ Automatizado |
| Usabilidad móvil | Chrome DevTools responsive | Manual (Checklist E02) |

---

## FASE 3: VALIDACIÓN Y ENTREGA (ACEPTACIÓN)

### Pruebas Alfa
**Archivo:** `src/tests/fase3-aceptacion/checklist-alfa.md`
**Total de pruebas manuales:** 25 casos  
**Ejecutar con:** El administrador del abasto supervisado

| Módulo | Pruebas |
|---|---|
| A — Autenticación | 6 pruebas (A01–A06) |
| B — Ventas PDF | 5 pruebas (B01–B05) |
| C — Inventario PDF | 3 pruebas (C01–C03) |
| D — Pago de Impuestos | 6 pruebas (D01–D06) |
| E — Usabilidad/No Funcional | 5 pruebas (E01–E05) |

### Criterios de aceptación mínima
- ✅ 100% de pruebas de autenticación (A01–A06)
- ✅ Flujo B01→B04 completo (cargar PDF y ver datos)
- ✅ Cálculos D01–D03 correctos (IVA + IGTF verificados manualmente)
- ⚠️ Fallos en E (usabilidad) se documentan pero no bloquean entrega

### Mantenimiento Correctivo (40% de recursos en fase 3)
Si se detecta un fallo durante alfa/beta:
1. Documentar en la columna "Observaciones" del checklist
2. Abrir issue con: pasos para reproducir + resultado actual + resultado esperado
3. Aplicar corrección en el archivo afectado
4. Re-ejecutar `pnpm vitest run` para verificar que no rompe otras pruebas
5. Marcar como corregido en el checklist

---

## FASE 4: MANTENIMIENTO EVOLUTIVO

### 4.1 Mantenimiento Perfectivo (20%)
Mejoras ya identificadas para el próximo incremento:
- [ ] Exportar reporte fiscal a PDF desde el navegador (html2pdf.js)
- [ ] Historial de declaraciones anteriores persistido
- [ ] Semáforo de vencimiento de lotes (DFD 3.1 Monitorear Vencimientos)

### 4.2 Mantenimiento Adaptativo (30%)
Cambios de entorno que requieren ajuste:
- Si SENIAT modifica la tasa de IVA (actualmente 16%): cambiar `IVA_RATE` en `taxStorage.ts`
- Si SENIAT modifica la tasa de IGTF (actualmente 3%): cambiar `IGTF_RATE` en `taxStorage.ts`
- Si el sistema A2 cambia el formato del PDF: revisar `parseVentasRows` en `pdfParser.ts`

### 4.3 Estrategia CI/CD recomendada
Agregar al `package.json`:
```json
"scripts": {
  "test":    "vitest run",
  "test:ui": "vitest --ui",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage"
}
```
Pipeline sugerido (GitHub Actions / Vercel):
```
push → pnpm install → pnpm test → pnpm build
```

---

## COBERTURA POR MÓDULO E-R

| Entidad E-R | Funciones probadas | Cobertura |
|---|---|---|
| USUARIO (rol, sesión) | validarEmail, intentarLogin, guardarSesion, cerrarSesion | ✅ Alta |
| CIERRE_CAJA (ventas, utilidad) | guardarVentasDia, calcularResumenMes, resumenVentas | ✅ Alta |
| PRODUCTO (stock_minimo) | estadoStock, resumenInventario | ✅ Alta |
| LOTE (vencimiento, color_alerta) | colorAlertaLote, diasHastaVencimiento, estadoStock | ✅ Alta |
| MERMA (cantidad, motivo) | calcularMermaPorLote | ✅ Media |
| FACTURA_COMPRA (monto_total) | Via resumenVentas (montoBruto) | ✅ Media |
| GASTOS_OPERATIVOS (monto) | Pendiente (Módulo 4.0 DFD) | ⚠️ Pendiente |
| PROVEEDOR (rif, razon_social) | Pendiente (Módulo 2.1 DFD) | ⚠️ Pendiente |

---

## PARA EJECUTAR LAS PRUEBAS

```bash
# Ejecutar todas las pruebas
pnpm vitest run

# Modo watch (re-ejecuta al guardar)
pnpm vitest

# Con interfaz visual en el navegador
pnpm vitest --ui

# Una fase específica
pnpm vitest run src/tests/fase1-unitarias/
pnpm vitest run src/tests/fase2-integracion/
```

*Para convertir a PDF: abrir en VS Code Preview o cualquier visor Markdown → Imprimir → Guardar como PDF.*
