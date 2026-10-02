Sistema de gestión de impuestos y ganancias.

# Invergica – SIGA + Sitio Web

Dos sistemas paralelos para el abasto **Invergica** (Maracaibo, Zulia):

- **SIGA**: aplicación de escritorio en Python para gestión de impuestos, ganancias, punto de venta, lotes y mermas.
- **Sitio web**: aplicación React/TypeScript con la presentación pública del negocio, login con sesión persistente, lectura de PDFs del sistema A2 y control fiscal.

## Problema o necesidad que aborda

- El abasto necesita controlar ventas, inventario, lotes, mermas e impuestos sin llevarlos a mano.
- Los reportes del sistema A2 se entregan en PDF y no se pueden analizar directamente.
- El negocio no tiene presencia web ni un canal de contacto claro.

## Objetivo

**General:** centralizar la gestión comercial y fiscal de Invergica y dar al negocio presencia digital.

**Específicos:**

- Registrar ventas, lotes y mermas en MySQL y calcular impuestos y ganancias (SIGA).
- Mostrar un dashboard gerencial con gráficos.
- Leer PDFs de ventas e inventario del sistema A2 mediante drag-and-drop.
- Evaluar el rendimiento del inventario con un semáforo.
- Acumular datos fiscales para el pago de impuestos.
- Publicar ubicación, horario y contacto por WhatsApp.

## Funcionalidades principales

**SIGA (escritorio)**

- Login de administrador
- Punto de venta (carrito de compras)
- Dashboard gerencial con Matplotlib
- Control de lotes y mermas
- Cálculo de impuestos y ganancias, con tasas históricas y cierres fiscales

**Sitio web**

- Login con sesión persistente (`LoginPage.tsx`)
- Hero, productos, galería, documentos, contacto y footer
- Carga de PDFs de A2 por drag-and-drop (`VentasPanel.tsx`, `InventarioPanel.tsx`, `pdfParser.ts`)
- Semáforo de rendimiento por inventario (`SemaforoRendimiento.tsx`)
- Pago de Impuestos (`ImpuestosSection.tsx`), con datos acumulados en `localStorage` mediante `taxStorage.ts`

## Estructura del proyecto: dónde está cada cosa

```
.
├── README.md
├── package.json                  # Dependencias y scripts de la web (build, test)
├── vite.config.ts                # Configuración de Vite
├── vitest.config.ts              # Configuración de pruebas web
├── postcss.config.mjs
│
├── src/                          # ── SITIO WEB (React + TypeScript) ──
│   ├── app/
│   │   ├── App.tsx               # Raíz: controla sesión (login) y secciones
│   │   ├── components/
│   │   │   ├── LoginPage.tsx           # Acceso y sesión persistente
│   │   │   ├── Navbar.tsx
│   │   │   ├── HeroSection.tsx
│   │   │   ├── ProductsSection.tsx
│   │   │   ├── GallerySection.tsx
│   │   │   ├── DocumentsSection.tsx
│   │   │   ├── ContactSection.tsx      # WhatsApp, dirección, horario
│   │   │   ├── Footer.tsx
│   │   │   ├── VentasPanel.tsx         # Lectura de PDF de ventas A2
│   │   │   ├── InventarioPanel.tsx     # Lectura de PDF de inventario A2
│   │   │   ├── SemaforoRendimiento.tsx # Semáforo por inventario
│   │   │   ├── ImpuestosSection.tsx    # Pago de impuestos
│   │   │   ├── FileDropZone.tsx / PdfZone.tsx / ImageZone.tsx  # Zonas de arrastre
│   │   │   ├── figma/ImageWithFallback.tsx
│   │   │   └── ui/                     # Componentes base (shadcn/Radix)
│   │   ├── utils/
│   │   │   ├── pdfParser.ts            # Parseo de PDFs del sistema A2
│   │   │   └── taxStorage.ts           # Persistencia fiscal en localStorage
│   │   └── data/
│   │       ├── ventas_muestra.ts       # Datos de ejemplo
│   │       └── inventario_muestra.ts
│   ├── imports/                  # Imágenes reales (Logo.jpg, Abasto.jpg,
│   │                             #   Interior_del_Abasto.jpg) y Prompt_Maestro.txt
│   ├── styles/                   # theme.css, fonts.css, tailwind.css, index.css
│   └── tests/                    # Pruebas Vitest (103) por fase
│       ├── setup.ts
│       ├── fase1-unitarias/      # autenticacion, pdfParser, taxStorage
│       ├── fase2-integracion/    # flujoFiscal, semaforoInventario
│       └── fase3-aceptacion/     # checklist-alfa.md
│
├── siga/                         # ── SISTEMA DE ESCRITORIO (Python) ──
│   ├── app.py                    # Ventana principal: POS y dashboard (punto de entrada)
│   ├── login.py                  # Ventana de login
│   ├── config.py                 # Constantes y credenciales de administrador
│   ├── database.py               # Conexión y consultas MySQL
│   ├── data_processor.py         # CartProcessor y DashboardProcessor (Pandas)
│   ├── schema.sql                # Creación de las tablas MySQL
│   ├── requirements.txt          # Dependencias Python
│   └── tests/                    # Pruebas unitarias (77)
│       ├── mock_deps.py
│       ├── test_config.py
│       ├── test_database.py
│       └── test_login.py
│
├── guidelines/Guidelines.md      # Lineamientos de diseño
├── PROMPTS_PRUEBAS/              # Prompts por fase de prueba (F1 a F4)
│
├── INFORME_SISTEMA.md            # Carpetas, archivos y funciones por interfaz (web)
├── INFORME_CAMBIOS_PYTHON.md     # Cambios realizados en SIGA
├── PLAN_PRUEBAS_INVERGICA.md     # Plan de pruebas
├── PROMPT_RESUMEN.txt            # Resumen del proyecto
└── ATTRIBUTIONS.md               # Créditos
```

> Los DFDs, Diagrama E-R, diccionarios y minutas están en: Sistema de gestión de impuestos y ganancias/src/imports

## Tecnologías utilizadas

| Sistema | Stack |
|---|---|
| SIGA | Python, CustomTkinter, Pandas, NumPy, Matplotlib, mysql-connector-python |
| Web | React 18, TypeScript, Vite 6, Tailwind CSS 4, Radix UI, Motion, Recharts, pdfjs-dist, Vitest |

## Base de datos

- Motor: **MySQL**, usado solo por SIGA. La web no usa servidor y guarda sus datos en `localStorage`.
- Script de creación: [`siga/schema.sql`](siga/schema.sql)
- Tablas:

| Tabla | Propósito |
|---|---|
| `productos` | Catálogo de productos |
| `tasas_historicas` | Historial de tasas de cambio/impuestos |
| `ventas` / `ventas_detalle` | Cabecera y líneas de cada venta |
| `gastos_operativos` | Gastos del negocio |
| `cierres_fiscales` | Cierres para cálculo de impuestos |
| `lotes` | Lotes de inventario |
| `mermas` | Pérdidas por lote |

- Diagrama E-R: `docs/diagrama-er.*` (pendiente de agregar).

## Instalación y ejecución

### SIGA (escritorio)

Requisitos: Python 3.10 o superior y un servidor MySQL en ejecución.

```bash
cd siga
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Crear las tablas
mysql -u <usuario> -p < schema.sql

# Ajustar credenciales en config.py (BD y ADMIN_PASSWORD)
python app.py
```

### Sitio web

Requisitos: Node.js 18 o superior y pnpm.

```bash
pnpm install
pnpm dev        # desarrollo (si no existe el script: pnpm exec vite)
pnpm build      # compilación de producción
```

## Pruebas

```bash
# Web: 103 pruebas (Vitest)
pnpm test            # una sola ejecución
pnpm test:watch      # modo observador

# SIGA: 77 pruebas unitarias
cd siga
python -m unittest discover tests     # o: pytest tests
```

El plan completo está en [`PLAN_PRUEBAS_INVERGICA.md`](PLAN_PRUEBAS_INVERGICA.md). La checklist de aceptación está en `src/tests/fase3-aceptacion/checklist-alfa.md`.

## Equipo

| Angel | Desarrollador|
|---|---|
| _[Angel]_ | _[Desarrollo / Análisis / Documentación]_ |

## Evidencias / capturas

Están en: Sistema de gestión de impuestos y ganancias/src/imports

```md
![Login](docs/img/login.png)
![Dashboard SIGA](docs/img/dashboard.png)
![Lectura de PDF A2](docs/img/pdf-a2.png)
![Semáforo de inventario](docs/img/semaforo.png)
```

## Estado del proyecto

En desarrollo.

- Hecho: login web y SIGA, punto de venta, dashboard, semáforo, sección de impuestos y suites de prueba (web 103, SIGA 77).
- En curso: ajuste del lector de PDFs de A2 (`src/app/utils/pdfParser.ts`).
- Pendiente: _[despliegue, DFDs y E-R en `docs/`, sincronización entre ambos sistemas]_.

## Contacto

- WhatsApp: +58 414-1667535
- Dirección: Av. 13, entre calles 67 y 67A, Maracaibo 4001, Zulia
- Horario: lunes a sábado, 8:00 am – 7:00 pm
