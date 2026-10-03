Sistema de gestión de impuestos y ganancias.

# Invergica – SIGA + Sitio Web

Sistema de gestión de impuestos y ganancias para el abasto **Invergica**
(Maracaibo, Zulia). El proyecto se compone de dos sistemas paralelos:

- **SIGA**: aplicación de escritorio en Python para gestión de impuestos,
  ganancias, punto de venta, lotes y mermas (base de datos MySQL).
- **Sitio web**: aplicación React/TypeScript con la presentación pública del
  negocio, login con sesión persistente, lectura de PDFs del sistema A2 y
  control fiscal.

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

## Tecnologías utilizadas

| Sistema | Stack |
|---|---|
| SIGA | Python, CustomTkinter, Pandas, NumPy, Matplotlib, mysql-connector-python |
| Web | React 18, TypeScript, Vite 6, Tailwind CSS 4, Radix UI, Motion, Recharts, pdfjs-dist, Vitest |

## Base de datos

- Motor: **MySQL**, usado por SIGA. La web no usa servidor y guarda sus datos en `localStorage`.
- Script de creación: [`siga/schema.sql`](siga/schema.sql)
- **Diccionario de datos:** [`docs/DICCIONARIO_DATOS.md`](docs/DICCIONARIO_DATOS.md)
- **Diagrama E-R:** [`docs/DIAGRAMA_ER.md`](docs/DIAGRAMA_ER.md) (Mermaid, generado desde `schema.sql`)

| Tabla | Propósito |
|---|---|
| `productos` | Catálogo de productos |
| `tasas_historicas` | Historial de tasas de cambio |
| `ventas` / `ventas_detalle` | Cabecera y líneas de cada venta |
| `gastos_operativos` | Gastos del negocio |
| `cierres_fiscales` | Cierres diarios para cálculo de impuestos |
| `lotes` | Lotes de inventario |
| `mermas` | Pérdidas por lote |

## Configuración de credenciales (importante)

Las credenciales **no están en el código**. Se leen desde variables de entorno:

- Web: `.env` en la raíz (`VITE_ADMIN_EMAIL`, `VITE_ADMIN_PASSWORD`). Ver [`.env.example`](.env.example).
- SIGA: `siga/.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`, `DB_*`). Ver [`siga/.env.example`](siga/.env.example).

Los archivos `.env` **no se versionan** (ver [`.gitignore`](.gitignore)).

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

# Configurar credenciales (NO se suben al repositorio)
cp .env.example .env            # luego editar siga/.env con los valores reales
python app.py
```

### Sitio web

Requisitos: Node.js 18 o superior y pnpm.

```bash
cp .env.example .env            # definir VITE_ADMIN_EMAIL y VITE_ADMIN_PASSWORD
pnpm install
pnpm dev        # desarrollo
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

- Plan de pruebas: [`PLAN_PRUEBAS_INVERGICA.md`](PLAN_PRUEBAS_INVERGICA.md).
- Checklist de aceptación: [`src/tests/fase3-aceptacion/checklist-alfa.md`](src/tests/fase3-aceptacion/checklist-alfa.md).
- Informe de aceptación: [`docs/INFORME_ACEPTACION.md`](docs/INFORME_ACEPTACION.md).

> Las pruebas unitarias cargan credenciales ficticias de prueba desde
> `siga/tests/mock_deps.py`, por lo que la suite se ejecuta sin un `.env` real.

## Equipo

| Integrante | C.I. | Rol |
|---|---|---|
| Ángel Díaz | 31.989.203 | Desarrollo / Análisis / Documentación |

> Cliente / dueño del negocio: Luis Alberto (Invergica).

## Evidencias / capturas

Diagramas (DFD, E-R), diccionarios y minutas del proyecto en `src/imports/` y en
`docs/`. Capturas sugeridas:

```md
![Login](docs/img/login.png)
![Dashboard SIGA](docs/img/dashboard.png)
![Lectura de PDF A2](docs/img/pdf-a2.png)
![Semáforo de inventario](docs/img/semaforo.png)
```

## Estado del proyecto

**Versión final 1.0 — entrega académica (03/10/2026).**

- **Hecho:** login web y SIGA (credenciales por variables de entorno), punto de
  venta, dashboard, semáforo, sección de impuestos, esquema MySQL, diccionario
  de datos y diagrama E-R, y suites de prueba (web 103, SIGA 77).
- **Validado:** lógica de autenticación y cálculo fiscal (IVA 16% / IGTF 3%) por
  pruebas unitarias; ver `docs/INFORME_ACEPTACION.md`.
- **Pendiente de verificación manual:** casos de aceptación que requieren
  navegador y PDFs reales de A2 (ver checklist).
- **Mejoras futuras:** autenticación con backend (seguridad real del login web),
  despliegue, sincronización entre SIGA y la web.

## Contacto

- WhatsApp: +58 414-1667535
- Dirección: Av. 13, entre calles 67 y 67A, Maracaibo 4001, Zulia
- Horario: lunes a sábado, 8:00 am – 7:00 pm
