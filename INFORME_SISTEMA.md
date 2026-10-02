# INFORME DEL SISTEMA — INVERGICA WEB
## Carpetas, Archivos y Funciones por Interfaz

**Proyecto:** Invergica — Interfaz Web Administrativa  
**Tecnología:** React 18 + TypeScript + Tailwind CSS v4  
**Entorno:** Figma Make (Vite, sin backend, localStorage)  
**Fecha:** Julio 2026

---

## INTERFAZ DE ENTRADA (Login)

La interfaz de entrada controla el acceso total al sistema. Ninguna sección del sitio es visible sin autenticación.

### Archivos involucrados

| Archivo | Ruta | Rol |
|---|---|---|
| `LoginPage.tsx` | `src/app/components/LoginPage.tsx` | Componente principal del formulario de login |
| `App.tsx` | `src/app/App.tsx` | Controla el estado `isLoggedIn` y renderiza Login o App |
| `Logo.jpg` | `src/imports/Logo.jpg` | Imagen del logo mostrada en el card de login |

### Funciones y lógica

#### `LoginPage.tsx`

```
ADMIN_EMAIL    (constante)  — correo autorizado (editable por el dueño)
ADMIN_PASSWORD (constante)  — contraseña del administrador (editable)

handleSubmit(e)             — valida credenciales, guarda sesión en localStorage
                              clave: "invergica_auth" = "true"

ModalOverlay({children, onClose})
                            — modal reutilizable para "Olvidé contraseña" y "No tengo cuenta"
```

#### Estados React (`LoginPage`)

| Estado | Tipo | Descripción |
|---|---|---|
| `email` | `string` | Valor del campo correo |
| `password` | `string` | Valor del campo contraseña |
| `showPass` | `boolean` | Alterna visibilidad de contraseña |
| `error` | `string` | Mensaje de error de credenciales |
| `loading` | `boolean` | Spinner durante verificación |
| `modal` | `"forgot" \| "noCuenta" \| null` | Modal activo |
| `emailTouched` | `boolean` | Activa validación visual del email |

#### `App.tsx`

```
useState<boolean>(() => localStorage.getItem("invergica_auth") === "true")
                            — inicializa sesión desde localStorage (persiste recarga)

handleLogin()               — setIsLoggedIn(true)
handleLogout()              — limpia localStorage + setIsLoggedIn(false)
```

### Flujo de autenticación

```
Usuario abre la app
    ↓
App.tsx lee localStorage["invergica_auth"]
    ├── "true"  → renderiza interfaz de salida (sitio completo)
    └── null    → renderiza <LoginPage onLogin={handleLogin} />
                      ↓
                  usuario ingresa email + contraseña
                      ↓
                  handleSubmit() compara con ADMIN_EMAIL / ADMIN_PASSWORD
                      ├── OK  → localStorage["invergica_auth"] = "true" → onLogin()
                      └── KO  → muestra mensaje de error
```

---

## INTERFAZ DE SALIDA (Sitio Principal)

La interfaz de salida es el sitio completo que el administrador ve tras autenticarse. Contiene 6 secciones.

### Árbol de componentes

```
App.tsx (raíz)
├── Navbar.tsx              — barra de navegación fija con botón "Salir"
├── HeroSection.tsx         — hero con imagen de fachada
├── [banda de estadísticas] — inline en App.tsx (2 métricas)
├── GallerySection.tsx      — galería interior/exterior
├── DocumentsSection.tsx    — reportes internos A2
│   ├── VentasPanel.tsx     — lector PDF ventas + gráfica barras
│   │   └── FileDropZone.tsx
│   └── InventarioPanel.tsx — lector PDF inventario + semáforo
│       └── FileDropZone.tsx
├── ImpuestosSection.tsx    — módulo tributario IVA + IGTF
├── ContactSection.tsx      — WhatsApp + Google Maps
└── Footer.tsx
```

### Archivos por sección

#### `Navbar.tsx` — `src/app/components/Navbar.tsx`
| Elemento | Descripción |
|---|---|
| `Logo.jpg` | Logo en navbar (importado como módulo ES) |
| `onLogout?: () => void` | Prop recibida de App.tsx para cerrar sesión |
| Botón "Salir" | Llama `onLogout()`, aparece solo cuando la prop existe |

#### `HeroSection.tsx` — `src/app/components/HeroSection.tsx`
| Elemento | Descripción |
|---|---|
| `Abasto.jpg` | Imagen de fachada del local como fondo del hero |
| WhatsApp link | `https://wa.me/584141667535` |

#### `GallerySection.tsx` — `src/app/components/GallerySection.tsx`
| Elemento | Descripción |
|---|---|
| `Abasto.jpg` | Foto exterior |
| `Interior_del_Abasto.jpg` | Foto interior |
| Feature cards | Víveres, horario (Lun–Sáb 8am–7pm), ubicación |

#### `DocumentsSection.tsx` — `src/app/components/DocumentsSection.tsx`
Contenedor que renderiza `VentasPanel` + `InventarioPanel` en grid 2 columnas.

#### `VentasPanel.tsx` — `src/app/components/VentasPanel.tsx`
| Función | Descripción |
|---|---|
| `handleFile(file)` | Llama `leerVentasPdf()`, actualiza estado, guarda en taxStorage |
| `guardarVentasDia()` | Importada de `taxStorage.ts`, persiste datos para impuestos |
| `CustomTooltip` | Tooltip personalizado para la gráfica recharts |
| `Semaforo({color})` | Indicador de semáforo circular (verde/amarillo/rojo) |
| gráfica recharts | `BarChart` + `Cell` para colores por margen |

#### `InventarioPanel.tsx` — `src/app/components/InventarioPanel.tsx`
| Función | Descripción |
|---|---|
| `handleFile(file)` | Llama `leerInventarioPdf()`, actualiza estado |
| Semáforo condicional | Oculto hasta cargar PDF; muestra 3 contadores y tabla |
| Alertas urgentes | Productos agotados y bajos destacados |

#### `FileDropZone.tsx` — `src/app/components/FileDropZone.tsx`
Componente reutilizable de drag & drop para PDFs.  
Estados: `idle / dragging / loading / success / error`

#### `ImpuestosSection.tsx` — `src/app/components/ImpuestosSection.tsx`
| Función | Descripción |
|---|---|
| `cargar()` | Lee `taxStorage`, recalcula resumen del mes seleccionado |
| `handleEditarDivisas(fecha, valor)` | Actualiza divisas de un día (para cálculo IGTF) |
| `MetricCard` | Tarjeta de métrica reutilizable |
| `VencimientoBadge` | Muestra días restantes para vencimiento SENIAT |
| `TablaDias` | Tabla editable de días con datos fiscales |
| `FlujoDFD` | Visualización del flujo DFD Módulo 2.0 |

#### `ContactSection.tsx` — `src/app/components/ContactSection.tsx`
| Elemento | Descripción |
|---|---|
| WhatsApp | `+58 414-166-7535` → `https://wa.me/584141667535` |
| Dirección | Av. 13, Entre calles 67 y 67A, Maracaibo 4001, Zulia |
| Google Maps | `https://maps.app.goo.gl/sD1p8J5QZaA3dtvs7` |
| Horario | Lun–Sáb: 8am–7pm / Dom: Cerrado |

---

## UTILIDADES

### `src/app/utils/pdfParser.ts`
| Función | Descripción |
|---|---|
| `extractItems(file)` | Extrae texto con coordenadas x,y usando pdfjs-dist |
| `groupByRows(items, tol)` | Agrupa ítems por fila (tolerancia Y ±4px) |
| `leerVentasPdf(file)` | Pipeline completo → `ProductoVendido[]` |
| `leerInventarioPdf(file)` | Pipeline completo → `ProductoInventario[]` |
| `colorMargen(pct)` | Semáforo: ≥60 verde / ≥30 amarillo / rojo |
| `estadoStock(p)` | Semáforo: suficiente / bajo / agotado |
| `resumenVentas(prods)` | Totales, margen, mejores/peores |
| `resumenInventario(prods)` | Conteos, valor, listas de alertas |

**Worker PDF:** `https://unpkg.com/pdfjs-dist@6.1.200/build/pdf.worker.min.mjs` (CDN)

### `src/app/utils/taxStorage.ts`
Implementa el almacén D1 del DFD para la capa web (localStorage).

| Función | Descripción |
|---|---|
| `guardarVentasDia(fecha, ...)` | Guarda resumen diario (llamado al importar PDF) |
| `actualizarDivisas(fecha, val)` | Edita el monto de divisas de un día |
| `leerVentasDia(fecha)` | Lee un día específico |
| `leerVentasMes(mes)` | Lee todos los días de un mes "YYYY-MM" |
| `calcularResumenMes(mes)` | Proceso 4 DFD: Base + IVA×0.16 + Divisas×0.03 |
| `mesesConDatos()` | Lista meses que tienen datos en localStorage |
| `vencimientoSENIAT(mes)` | Devuelve "YYYY-MM-15" del mes siguiente |
| `diasParaVencimiento(mes)` | Días hasta el vencimiento (negativo = vencido) |

**Constantes DFD:**  
`IVA_RATE = 0.16` (Proceso 2.2.2)  
`IGTF_RATE = 0.03` (Proceso 2.2.3)

---

## DATOS DE REFERENCIA

| Ítem | Valor |
|---|---|
| WhatsApp | +58 414-1667535 |
| Dirección | Av. 13, Entre calles 67 y 67A, C.67, Maracaibo 4001, Zulia |
| Google Maps | https://maps.app.goo.gl/sD1p8J5QZaA3dtvs7 |
| Horario | Lun–Sáb 8am–7pm / Dom: Cerrado |
| IVA Venezuela | 16% (SENIAT) |
| IGTF Venezuela | 3% sobre divisas |
| Vencimiento declaración | Día 15 del mes siguiente |

---

*Para convertir este informe a PDF: abre en cualquier editor Markdown y usa "Imprimir → Guardar como PDF".*
