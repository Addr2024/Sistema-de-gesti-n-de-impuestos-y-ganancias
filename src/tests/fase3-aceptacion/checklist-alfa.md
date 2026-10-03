# FASE 3 — PRUEBAS ALFA / BETA
## Checklist de Aceptación — Invergica Web
**Ejecutar con:** Usuario administrador supervisado por el desarrollador  
**Entorno:** Navegador Chrome/Firefox en el equipo del local

> **Nota sobre esta ejecución:** las pruebas marcadas **Pasa (código)** se
> verificaron por *inspección del código* y por las *pruebas unitarias* del
> proyecto (lógica de autenticación y cálculo fiscal). Las pruebas que requieren
> interacción real en el navegador o cargar PDFs reales de A2 quedan como
> **Pendiente** y deben ejecutarse manualmente por el equipo, anotando el
> resultado. Ningún caso se marca “Pasa” sin evidencia.
> Leyenda: ✅ Pasa · ❌ Falla · ⏳ Pendiente (ejecución manual).

---

## MÓDULO 1: Autenticación (USUARIO — E-R)

### Prueba A01 — Login correcto
- [x] Abrir la aplicación
- [x] Ingresar correo y contraseña correctos del administrador
- [x] Hacer clic en "Iniciar Sesión"
- **Esperado:** El sitio completo aparece, la URL no cambia
- **Estado:** ✅ **Pasa (código)**
- **Observación:** `LoginPage.tsx` compara email (insensible a mayúsculas) y
  contraseña (sensible) y llama `onLogin()`. Lógica cubierta por
  `test_login.py::verificar_credenciales`. Confirmar flujo visual en navegador.

### Prueba A02 — Login incorrecto
- [x] Ingresar correo equivocado
- [x] Hacer clic en "Iniciar Sesión"
- **Esperado:** Aparece mensaje rojo "Correo o contraseña incorrectos"
- **Estado:** ✅ **Pasa (código)**
- **Observación:** El bloque `else` fija el mensaje de error exacto. Verificado por
  inspección; pruebas unitarias cubren credenciales inválidas, SQL/XSS.

### Prueba A03 — Persistencia de sesión
- [ ] Iniciar sesión
- [ ] Cerrar la pestaña del navegador
- [ ] Abrir de nuevo la misma URL
- **Esperado:** El sitio ya está abierto sin pedir login de nuevo
- **Estado:** ⏳ **Pendiente**
- **Observación:** `LoginPage` guarda `localStorage["invergica_auth"]="true"`, pero
  la lectura al cargar vive en `App.tsx` (no incluido). Verificar manualmente.

### Prueba A04 — Cerrar sesión
- [ ] Con sesión activa, hacer clic en "Salir" en la barra superior
- **Esperado:** Regresa a la pantalla de login
- **Estado:** ⏳ **Pendiente**
- **Observación:** Depende de `App.tsx`/`Navbar.tsx` (no incluidos). Verificar
  manualmente que se limpie `invergica_auth`.

### Prueba A05 — Olvidé mi contraseña
- [x] Hacer clic en "¿Olvidaste tu contraseña?"
- **Esperado:** Aparece modal con botón de WhatsApp
- [x] Hacer clic en el botón de WhatsApp
- **Esperado:** Abre WhatsApp con el número del admin
- **Estado:** ✅ **Pasa (código)**
- **Observación:** Modal `forgot` con enlace `https://wa.me/584141667535` presente
  en `LoginPage.tsx`. Confirmar apertura real en dispositivo.

### Prueba A06 — No tengo cuenta
- [x] Hacer clic en "¿No tienes una cuenta?"
- **Esperado:** Modal explica que es sistema privado
- **Estado:** ✅ **Pasa (código)**
- **Observación:** Modal `noCuenta` presente con el texto de sistema privado y RIF.

---

## MÓDULO 2: Reporte de Ventas del Día (CIERRE_CAJA — E-R)

### Prueba B01 — Arrastrar PDF de ventas
- [ ] Ir a la sección "Documentos"
- [ ] Arrastrar el PDF de Cierre de Caja del sistema A2 al recuadro naranja
- **Esperado:** Se muestra "Cargando..." y luego los datos del reporte
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador + PDF real de A2 (`VentasPanel.tsx`,
  `pdfParser.ts`). Es el módulo que estabas ajustando; prueba con PDFs reales.

### Prueba B02 — Semáforo de rendimiento
- [ ] Cargar un PDF de ventas con productos de varios márgenes
- **Esperado:** El semáforo circular muestra el color correcto (verde ≥60%, amarillo 30-59%, rojo <30%)
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere datos cargados en el navegador.

### Prueba B03 — Gráfica de barras
- [ ] Con datos cargados, verificar la gráfica de barras
- **Esperado:** Muestra hasta 20 productos, barras con colores verde/amarillo/rojo
- [ ] Pasar el mouse sobre una barra
- **Esperado:** Tooltip muestra nombre, monto, cantidad y % utilidad
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador.

### Prueba B04 — Guardado para impuestos
- [ ] Cargar un PDF de ventas
- **Esperado:** Aparece badge verde "Datos guardados para Pago de Impuestos del mes"
- [ ] Ir a la sección "Impuestos"
- **Esperado:** El día de hoy aparece en la tabla de días con su base imponible
- **Estado:** ⏳ **Pendiente**
- **Observación:** Flujo UI + `taxStorage.ts` (no incluido). Verificar manualmente.

### Prueba B05 — PDF incorrecto
- [ ] Cargar un PDF que NO sea de ventas A2
- **Esperado:** Mensaje de error claro "No se encontraron productos"
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador.

---

## MÓDULO 3: Inventario de Productos (PRODUCTO + LOTE — E-R)

### Prueba C01 — Carga de inventario
- [ ] En la sección "Documentos", cargar el PDF de inventario A2
- **Esperado:** Aparecen los contadores de suficiente/bajo/agotado
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador + PDF de inventario A2 (`InventarioPanel.tsx`).

### Prueba C02 — Semáforo oculto antes de cargar
- [ ] Verificar el panel de inventario SIN haber cargado PDF
- **Esperado:** El semáforo aparece apagado (oscuro, sin colores)
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador.

### Prueba C03 — Alertas urgentes
- [ ] Cargar inventario con productos agotados o bajos
- **Esperado:** Aparecen secciones "Agotados" y "Bajos" con los productos resaltados
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador. La clasificación stock (suficiente/bajo/
  agotado) existe como constante en `config.py` (pruebas unitarias la validan).

---

## MÓDULO 4: Pago de Impuestos (CIERRE_CAJA + GASTOS_OPERATIVOS — E-R)

### Prueba D01 — Visualización de impuestos del mes
- [ ] Cargar al menos un PDF de ventas del día
- [ ] Ir a la sección "Impuestos"
- **Esperado:** Se muestran las 4 tarjetas: Base Imponible, IVA, IGTF, Total SENIAT
- **Estado:** ⏳ **Pendiente**
- **Observación:** UI (`ImpuestosSection.tsx`, no incluido). Verificar manualmente.

### Prueba D02 — Verificar cálculo IVA
- [x] Ver el monto de "IVA Débito Fiscal (16%)"
- [x] Calcularlo manualmente: Base Imponible × 0.16
- **Esperado:** El valor en pantalla coincide exactamente
- **Estado:** ✅ **Pasa (código)**
- **Observación:** `IVA_RATE = 0.16` y `calcular_iva(base) = round(base*0.16, 2)`
  verificados por `test_login.py::TestCalcularIVA` (ej. 1000 → 160.00).
  Confirmar que la vista web muestre el mismo valor.

### Prueba D03 — Ingresar divisas para IGTF
- [x] Verificar el cálculo IGTF (3%) sobre divisas
- [ ] En la tabla de días, hacer clic en la celda "Divisas (Bs.)" (edición en navegador)
- **Esperado (cálculo):** 200 × 0.03 = 6.00
- **Estado:** ✅ **Pasa (cálculo) / ⏳ edición UI pendiente**
- **Observación:** `IGTF_RATE = 0.03` y `calcular_igtf` verificados por
  `test_login.py::TestCalcularIGTF` (100 → 3.00). La edición en celda es UI;
  verificar manualmente que al escribir el monto se recalcule el IGTF total.

### Prueba D04 — Alerta de vencimiento
- [ ] Verificar el badge de vencimiento (día 15 del mes siguiente) y su color
- **Estado:** ⏳ **Pendiente**
- **Observación:** Lógica de UI no incluida. Verificar manualmente.

### Prueba D05 — Cambio de mes
- [ ] Usar el dropdown de mes para seleccionar un mes anterior y volver al actual
- **Estado:** ⏳ **Pendiente**
- **Observación:** El resumen mensual existe en backend
  (`test_database.py::get_monthly_fiscal_summary`), pero el dropdown web no se
  incluyó. Verificar manualmente.

### Prueba D06 — Sin datos en el mes
- [ ] Seleccionar un mes sin PDFs cargados
- **Esperado:** Aparece el banner "Sin datos para [mes]"
- **Estado:** ⏳ **Pendiente**
- **Observación:** Requiere navegador.

---

## MÓDULO 5: Navegación y Usabilidad (Pruebas No Funcionales)

### Prueba E01 — Navegación por enlaces
- [ ] Hacer clic en cada enlace del menú: Inicio, Galería, Documentos, Impuestos, Contacto
- **Esperado:** La página hace scroll suave a cada sección
- **Estado:** ⏳ **Pendiente**

### Prueba E02 — Responsive en móvil
- [ ] F12 → modo dispositivo móvil (iPhone/Android)
- **Esperado:** El layout se adapta, el menú se compacta, los textos son legibles
- **Estado:** ⏳ **Pendiente**

### Prueba E03 — WhatsApp
- [ ] Hacer clic en cualquier botón verde de WhatsApp
- **Esperado:** Abre chat de WhatsApp con el número +58 414-1667535
- **Estado:** ⏳ **Pendiente**
- **Observación:** El enlace `wa.me/584141667535` está confirmado en el modal de
  login; falta confirmar los demás botones (ContactSection no incluido).

### Prueba E04 — Google Maps
- [ ] Hacer clic en "Ver en Google Maps" en la sección Contacto
- **Esperado:** Abre Google Maps en la ubicación de Invergica
- **Estado:** ⏳ **Pendiente**

### Prueba E05 — Rendimiento de carga PDF
- [ ] Cargar un PDF de ventas de tamaño normal
- **Esperado:** El resultado aparece en menos de 10 segundos
- **Tiempo medido:** ______ segundos
- **Estado:** ⏳ **Pendiente**

---

## RESUMEN DE PRUEBAS ALFA

| Módulo | Total | Pasan | Fallan | Pendiente |
|---|---|---|---|---|
| Autenticación (A) | 6 | 4 | 0 | 2 |
| Ventas (B) | 5 | 0 | 0 | 5 |
| Inventario (C) | 3 | 0 | 0 | 3 |
| Impuestos (D) | 6 | 2 | 0 | 4 |
| Usabilidad (E) | 5 | 0 | 0 | 5 |
| **TOTAL** | **25** | **6** | **0** | **19** |

**Ejecutado por:** _______________________ (parte automática: revisión de código + pruebas unitarias)  
**Fecha:** 03/10/2026  
**Versión de la app:** 1.0  
**Observaciones:** Los 6 casos “Pasa (código)” se verificaron por inspección del
código y por las pruebas unitarias (autenticación y cálculo fiscal). Los 19
casos “Pendiente” requieren ejecución manual en el navegador y/o PDFs reales de A2.

---

## CRITERIOS DE ACEPTACIÓN MÍNIMA
- ✅/⏳ 100% de pruebas A (autenticación): A01, A02, A05, A06 verificadas por
  código; **faltan A03 y A04 (manuales)**.
- ⏳ 100% de pruebas B01-B04 (flujo PDF ventas): **pendientes de ejecución manual**.
- ✅/⏳ 100% de pruebas D01-D03 (cálculo impuestos): D02 y D03 (cálculo)
  verificados por pruebas unitarias; **falta D01 (manual)**.
- ⚠️ Fallos en E (usabilidad) se documentan pero no bloquean la entrega.

> **Conclusión:** el cálculo fiscal y la lógica de autenticación están validados.
> Para cumplir el criterio mínimo completo falta ejecutar manualmente A03, A04,
> B01-B04 y D01 (navegador + PDFs reales de A2) y registrar su resultado.
