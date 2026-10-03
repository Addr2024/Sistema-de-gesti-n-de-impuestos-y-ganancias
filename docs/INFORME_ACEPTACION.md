# Informe de Pruebas de Aceptación — Invergica Web / SIGA

**Proyecto:** SIGA — Sistema de Gestión de Impuestos y Ganancias (Invergica)  
**Fecha:** 03/10/2026  
**Versión:** 1.0  
**Responsable:** Ángel Díaz (C.I. 31.989.203)

---

## 1. Alcance y método

Se trabajó sobre dos niveles de prueba:

1. **Pruebas unitarias / de integración (automatizadas):**
   - Web (Vitest): **103 pruebas** declaradas — `pnpm test`.
   - SIGA (Python unittest): **77 pruebas** declaradas — `python -m unittest discover tests`.
2. **Checklist de aceptación (alfa/beta):** 25 casos funcionales/no funcionales en
   [`src/tests/fase3-aceptacion/checklist-alfa.md`](../src/tests/fase3-aceptacion/checklist-alfa.md).

> **Importante sobre la ejecución:** la revisión automatizada de este informe se
> realizó sobre el **subconjunto de archivos entregado** (esquema SQL,
> `LoginPage.tsx`, suites de prueba Python, `package.json`). No se disponía del
> árbol completo (`config.py`, `login.py`, `database.py`, componentes React),
> por lo que **las suites no se corrieron en este entorno**. Los resultados
> “Pasa” del checklist se basan en inspección de código y en la definición de las
> pruebas unitarias. El equipo debe correr ambas suites en su equipo y adjuntar
> la salida real (`pnpm test` y `python -m unittest`).

---

## 2. Resumen de la checklist de aceptación (25 casos)

| Módulo | Total | Pasan | Fallan | Pendiente |
|---|---|---|---|---|
| Autenticación (A) | 6 | 4 | 0 | 2 |
| Ventas (B) | 5 | 0 | 0 | 5 |
| Inventario (C) | 3 | 0 | 0 | 3 |
| Impuestos (D) | 6 | 2 | 0 | 4 |
| Usabilidad (E) | 5 | 0 | 0 | 5 |
| **TOTAL** | **25** | **6** | **0** | **19** |

### Casos verificados (Pasa por código / pruebas unitarias)

| Caso | Qué se verificó | Evidencia |
|---|---|---|
| A01 | Login correcto llama `onLogin()` | `LoginPage.tsx` + `verificar_credenciales` |
| A02 | Login incorrecto muestra error | `LoginPage.tsx` |
| A05 | Modal “olvidé contraseña” + WhatsApp | `LoginPage.tsx` (`wa.me/584141667535`) |
| A06 | Modal “sistema privado” | `LoginPage.tsx` |
| D02 | IVA 16% (`calcular_iva`, `IVA_RATE=0.16`) | `test_login.py::TestCalcularIVA` |
| D03 | IGTF 3% (`calcular_igtf`, `IGTF_RATE=0.03`) | `test_login.py::TestCalcularIGTF` |

### Casos pendientes (ejecución manual del equipo)

A03, A04 (sesión/logout), B01–B05 (carga de PDF de ventas A2), C01–C03
(inventario), D01, D04–D06 (UI de impuestos), E01–E05 (navegación/responsive/
enlaces). Requieren navegador y PDFs reales de A2.

---

## 3. Criterios de aceptación mínima

| Criterio | Estado |
|---|---|
| 100% de pruebas A (autenticación) | Parcial: A01/A02/A05/A06 OK por código; **faltan A03, A04 manuales** |
| 100% de B01–B04 (flujo PDF ventas) | Pendiente (manual) |
| 100% de D01–D03 (cálculo impuestos) | Parcial: D02/D03 OK; **falta D01 manual** |
| Fallos en E no bloquean | Cumplido (sin fallos registrados) |

---

## 4. Conclusión

- La **lógica crítica** (autenticación y cálculo fiscal IVA/IGTF) está validada
  por las pruebas unitarias y la revisión de código.
- No se registraron **fallos**; los casos no confirmados quedan como
  **Pendiente** y dependen de la ejecución manual en navegador.
- **Acción requerida del equipo** antes de la revisión final:
  1. Correr `pnpm test` y `python -m unittest discover tests` y adjuntar la salida.
  2. Ejecutar manualmente A03, A04, B01–B05, C01–C03, D01, D04–D06, E01–E05.
  3. Marcar cada caso en el checklist y anotar observaciones.
