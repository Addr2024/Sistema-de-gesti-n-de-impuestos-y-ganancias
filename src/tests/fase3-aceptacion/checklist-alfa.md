# FASE 3 — PRUEBAS ALFA / BETA
## Checklist de Aceptación — Invergica Web
**Ejecutar con:** Usuario administrador supervisado por el desarrollador  
**Entorno:** Navegador Chrome/Firefox en el equipo del local

---

## MÓDULO 1: Autenticación (USUARIO — E-R)

### Prueba A01 — Login correcto
- [ ] Abrir la aplicación
- [ ] Ingresar correo y contraseña correctos del administrador
- [ ] Hacer clic en "Iniciar Sesión"
- **Esperado:** El sitio completo aparece, la URL no cambia
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba A02 — Login incorrecto
- [ ] Ingresar correo equivocado
- [ ] Hacer clic en "Iniciar Sesión"
- **Esperado:** Aparece mensaje rojo "Correo o contraseña incorrectos"
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba A03 — Persistencia de sesión
- [ ] Iniciar sesión
- [ ] Cerrar la pestaña del navegador
- [ ] Abrir de nuevo la misma URL
- **Esperado:** El sitio ya está abierto sin pedir login de nuevo
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba A04 — Cerrar sesión
- [ ] Con sesión activa, hacer clic en "Salir" en la barra superior
- **Esperado:** Regresa a la pantalla de login
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba A05 — Olvidé mi contraseña
- [ ] Hacer clic en "¿Olvidaste tu contraseña?"
- **Esperado:** Aparece modal con botón de WhatsApp
- [ ] Hacer clic en el botón de WhatsApp
- **Esperado:** Abre WhatsApp con el número del admin
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba A06 — No tengo cuenta
- [ ] Hacer clic en "¿No tienes una cuenta?"
- **Esperado:** Modal explica que es sistema privado
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

---

## MÓDULO 2: Reporte de Ventas del Día (CIERRE_CAJA — E-R)

### Prueba B01 — Arrastrar PDF de ventas
- [ ] Ir a la sección "Documentos"
- [ ] Arrastrar el PDF de Cierre de Caja del sistema A2 al recuadro naranja
- **Esperado:** Se muestra "Cargando..." y luego los datos del reporte
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba B02 — Semáforo de rendimiento
- [ ] Cargar un PDF de ventas con productos de varios márgenes
- **Esperado:** El semáforo circular muestra el color correcto (verde ≥60%, amarillo 30-59%, rojo <30%)
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba B03 — Gráfica de barras
- [ ] Con datos cargados, verificar la gráfica de barras
- **Esperado:** Muestra hasta 20 productos, barras con colores verde/amarillo/rojo
- [ ] Pasar el mouse sobre una barra
- **Esperado:** Tooltip muestra nombre, monto, cantidad y % utilidad
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba B04 — Guardado para impuestos
- [ ] Cargar un PDF de ventas
- **Esperado:** Aparece badge verde "Datos guardados para Pago de Impuestos del mes"
- [ ] Ir a la sección "Impuestos"
- **Esperado:** El día de hoy aparece en la tabla de días con su base imponible
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba B05 — PDF incorrecto
- [ ] Cargar un PDF que NO sea de ventas A2
- **Esperado:** Mensaje de error claro "No se encontraron productos"
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

---

## MÓDULO 3: Inventario de Productos (PRODUCTO + LOTE — E-R)

### Prueba C01 — Carga de inventario
- [ ] En la sección "Documentos", cargar el PDF de inventario A2
- **Esperado:** Aparecen los contadores de suficiente/bajo/agotado
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba C02 — Semáforo oculto antes de cargar
- [ ] Verificar el panel de inventario SIN haber cargado PDF
- **Esperado:** El semáforo aparece apagado (oscuro, sin colores)
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba C03 — Alertas urgentes
- [ ] Cargar inventario con productos agotados o bajos
- **Esperado:** Aparecen secciones "Agotados" y "Bajos" con los productos resaltados
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

---

## MÓDULO 4: Pago de Impuestos (CIERRE_CAJA + GASTOS_OPERATIVOS — E-R)

### Prueba D01 — Visualización de impuestos del mes
- [ ] Cargar al menos un PDF de ventas del día
- [ ] Ir a la sección "Impuestos"
- **Esperado:** Se muestran las 4 tarjetas: Base Imponible, IVA, IGTF, Total SENIAT
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba D02 — Verificar cálculo IVA
- [ ] Ver el monto de "IVA Débito Fiscal (16%)"
- [ ] Calcularlo manualmente: Base Imponible × 0.16
- **Esperado:** El valor en pantalla coincide exactamente
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba D03 — Ingresar divisas para IGTF
- [ ] En la tabla de días, hacer clic en la celda "Divisas (Bs.)" de cualquier día
- **Esperado:** La celda se vuelve un campo de entrada editable
- [ ] Escribir un monto (ej: 200) y presionar Enter
- **Esperado:** La tabla actualiza, y el IGTF total se recalcula (200 × 0.03 = 6.00)
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba D04 — Alerta de vencimiento
- [ ] Verificar el badge de vencimiento en la sección Impuestos
- **Esperado:** Muestra los días restantes para la declaración (día 15 del mes siguiente)
- [ ] Verificar que el color cambia según cercanía:
  - Verde: > 15 días
  - Amarillo: 6–15 días
  - Naranja: 1–5 días
  - Rojo: vencido
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba D05 — Cambio de mes
- [ ] Usar el dropdown de mes para seleccionar un mes anterior
- **Esperado:** Los datos cambian correctamente al mes seleccionado
- [ ] Seleccionar mes actual
- **Esperado:** Vuelven los datos del mes en curso
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba D06 — Sin datos en el mes
- [ ] Seleccionar un mes sin PDFs cargados
- **Esperado:** Aparece el banner "Sin datos para [mes]" con instrucciones
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

---

## MÓDULO 5: Navegación y Usabilidad (Pruebas No Funcionales)

### Prueba E01 — Navegación por enlaces
- [ ] Hacer clic en cada enlace del menú: Inicio, Galería, Documentos, Impuestos, Contacto
- **Esperado:** La página hace scroll suave a cada sección
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba E02 — Responsive en móvil
- [ ] Abrir las herramientas de desarrollador (F12), activar modo dispositivo móvil (iPhone/Android)
- **Esperado:** El layout se adapta, el menú se compacta, los textos son legibles
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba E03 — WhatsApp
- [ ] Hacer clic en cualquier botón verde de WhatsApp
- **Esperado:** Abre chat de WhatsApp con el número +58 414-1667535
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba E04 — Google Maps
- [ ] Hacer clic en "Ver en Google Maps" en la sección Contacto
- **Esperado:** Abre Google Maps en la ubicación de Invergica
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

### Prueba E05 — Rendimiento de carga PDF
- [ ] Cargar un PDF de ventas de tamaño normal
- **Esperado:** El resultado aparece en menos de 10 segundos
- **Tiempo medido:** ______ segundos
- **Estado:** ☐ Pasa  ☐ Falla  ☐ Pendiente

---

## RESUMEN DE PRUEBAS ALFA

| Módulo | Total | Pasan | Fallan | Pendiente |
|---|---|---|---|---|
| Autenticación (A) | 6 | | | |
| Ventas (B) | 5 | | | |
| Inventario (C) | 3 | | | |
| Impuestos (D) | 6 | | | |
| Usabilidad (E) | 5 | | | |
| **TOTAL** | **25** | | | |

**Ejecutado por:** _______________________  
**Fecha:** _______________________  
**Versión de la app:** _______________________  
**Observaciones:** ___________________________________________

---

## CRITERIOS DE ACEPTACIÓN MÍNIMA
- ✅ 100% de pruebas A (autenticación) deben pasar
- ✅ 100% de pruebas B01-B04 deben pasar (flujo PDF ventas)
- ✅ 100% de pruebas D01-D03 deben pasar (cálculo impuestos)
- ⚠️ Fallos en E (usabilidad) se documentan pero no bloquean la entrega
