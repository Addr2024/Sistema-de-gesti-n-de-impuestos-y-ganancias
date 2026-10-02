# INFORME DE CAMBIOS — SIGA Python (Adaptación Prompt_Maestro)

**Fecha:** 2026-09-01  
**Versión:** 1.1  
**Sistema:** SIGA — Sistema Integral de Gestión de Impuestos y Ganancias  
**Entorno:** Python 3.9.2 · CustomTkinter · Pandas · Matplotlib · MySQL  
**Resultado de pruebas:** ✅ 77/77 tests passed (0 fallos)

---

## 1. Resumen Ejecutivo

Se adaptó el Prompt_Maestro (diseño Figma — Módulos A–F) al sistema SIGA en Python,
usando exclusivamente las bibliotecas ya instaladas (CustomTkinter, Pandas, Matplotlib,
MySQL Connector). Se añadieron 5 archivos nuevos y se modificaron 3 existentes.

---

## 2. Archivos Modificados

### `siga/config.py`
**Cambios:** Añadidas 4 constantes nuevas en la sección de configuración:

```python
ADMIN_EMAIL    = "addr43342@gmail.com"   # Módulo A: credencial admin
ADMIN_PASSWORD = "Invergica2026"          # Módulo A: contraseña admin
IVA_RATE       = 0.16                    # Proceso 2.2.2 DFD — 16%
IGTF_RATE      = 0.03                    # Proceso 2.2.3 DFD — 3%
LOTE_ROJO_DIAS     = 0                   # DFD 3.3.3: vencido o vence hoy
LOTE_AMARILLO_DIAS = 30                  # DFD 3.3.3: próximo a vencer
```

---

### `siga/app.py`
**Cambios:** Integración del flujo de login antes de mostrar la interfaz principal.

| Antes | Después |
|-------|---------|
| `SIGAApp.__init__` construía la UI directamente | `SIGAApp.__init__` oculta la ventana (`withdraw()`), muestra `LoginWindow` |
| Sin autenticación | `_on_login_success()` conecta BD y construye UI, luego `deiconify()` |

**Nuevo import:**
```python
from login import LoginWindow
```

**Nuevo método `_on_login_success()`:**
```python
def _on_login_success(self) -> None:
    self._try_connect_db()
    self._build_ui()
    self.deiconify()
```

---

### `siga/schema.sql`
**Cambios:** Añadidas 2 tablas nuevas y datos de semilla.

#### Tabla `lotes` (Módulo C — E-R LOTE)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | Identificador |
| `codigo_lote` | VARCHAR(50) UNIQUE | Ej. `LOTE-101` |
| `producto_id` | INT FK → productos | Producto al que pertenece |
| `cantidad` | INT | Unidades en el lote |
| `fecha_vencimiento` | DATE | Fecha de vencimiento |
| `color_alerta` | ENUM('verde','amarillo','rojo') | Semáforo DFD 3.3.3 |

#### Tabla `mermas` (E-R LOTE → MERMA)
| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | INT PK | Identificador |
| `lote_id` | INT FK → lotes | Lote afectado |
| `cantidad` | INT | Unidades mermadas |
| `motivo` | ENUM | Vencimiento / Daño Físico / Robo / Otro |
| `observaciones` | VARCHAR(255) | Notas libres |
| `registrado_en` | TIMESTAMP | Fecha/hora de registro |

**Datos de semilla añadidos:** 5 lotes y 2 mermas de ejemplo.

---

### `siga/database.py`
**Cambios:** 7 métodos nuevos en `DatabaseManager`.

#### Módulo C — Lotes y Mermas
| Método | Descripción |
|--------|-------------|
| `get_lots_by_product(producto_id)` | Lista lotes de un producto con días restantes calculados |
| `get_lots_expiring_soon(dias=30)` | DFD 3.3: lotes que vencen en ≤ `dias` días (incluye vencidos) |
| `update_lot_color(lote_id, color)` | Actualiza el badge de semáforo (DFD 3.3.3) |
| `save_merma(lote_id, cantidad, motivo, obs)` | Registra merma y descuenta del lote en una transacción |
| `get_mermas_by_lot(lote_id)` | Historial de mermas de un lote |

#### Módulo D — Fiscal
| Método | Descripción |
|--------|-------------|
| `get_monthly_fiscal_summary(mes)` | Agrega ventas de un mes (formato `'YYYY-MM'`) para el panel fiscal |
| `get_fiscal_history()` | Lista todos los cierres fiscales para el historial de declaraciones |

---

## 3. Archivos Nuevos

### `siga/login.py`
**Módulo A del Prompt_Maestro:** Ventana de autenticación.

#### Funciones puras (testables sin GUI):
| Función | Descripción |
|---------|-------------|
| `validar_email(email)` | Valida formato email con regex |
| `verificar_credenciales(email, password)` | Compara contra ADMIN_EMAIL/ADMIN_PASSWORD |
| `color_semaforo_lote(dias_restantes)` | DFD 3.3.3: retorna 'rojo'/'amarillo'/'verde' |
| `calcular_iva(base_imponible)` | Proceso 2.2.2: base × 0.16 |
| `calcular_igtf(divisas)` | Proceso 2.2.3: divisas × 0.03 |
| `calcular_deuda_fiscal(base, divisas)` | Consolidación: {iva_deuda, igtf_deuda, total_deuda} |
| `dias_hasta_vencimiento(fecha)` | DFD 3.3.2: fecha_lote − hoy en días |

#### Clase `LoginWindow(CTkToplevel)`:
- Formulario email + contraseña (sin placeholders)
- Toggle mostrar/ocultar contraseña
- Modal "¿Olvidaste tu contraseña?" → WhatsApp +58 414-166-7535
- Modal "¿No tienes cuenta?" → mensaje sistema privado
- Bloqueo de ventana padre con `grab_set()`
- Cierre controlado: pregunta antes de salir (`messagebox.askyesno`)
- Contador de intentos fallidos (mensaje extendido a partir del 3ro)

---

### `siga/tests/__init__.py`
Marca el directorio como paquete Python.

---

### `siga/tests/mock_deps.py`
Stubs mínimos para todas las dependencias externas (no disponibles en entorno de pruebas):

| Dependencia | Método de stub |
|-------------|----------------|
| `numpy` | Módulo sintético con `select`, `where`, `array` |
| `pandas` | `_FakeDF` con API compatible (iterrows, empty, etc.) |
| `customtkinter` | Clases stub que aceptan cualquier `__init__` |
| `tkinter` | Frame, BooleanVar, messagebox, ttk |
| `matplotlib` | pyplot, figure, backends, ticker |
| `mysql.connector` | connect stub + `Error` fake |

---

### `siga/tests/test_config.py` — 13 tests
Verifica constantes críticas del sistema:
- Tasas IVA (0.16) e IGTF (0.03)
- Umbrales de lote (0 días rojo, 30 días amarillo)
- Presencia y formato de colores (#hex)
- Formato de WINDOW_SIZE ("WxH")
- Claves requeridas en DB_CONFIG

### `siga/tests/test_login.py` — 44 tests
Cubre toda la lógica de `login.py`:
- `TestValidarEmail`: 10 casos (válidos, sin arroba, XSS, SQL injection)
- `TestVerificarCredenciales`: 10 casos (correcto, mayúsculas, case-sensitive, inyecciones)
- `TestColorSemaforoLote`: 8 casos (bordes: 0, 1, 30, 31 días)
- `TestCalcularIVA`: 6 casos (base 0, 100, 1000, negativos, redondeo)
- `TestCalcularIGTF`: 5 casos (0, 100, grandes, redondeo)
- `TestCalcularDeudaFiscal`: 6 casos (estructura, cálculos, borde cero)

### `siga/tests/test_database.py` — 20 tests
Usa `unittest.mock.MagicMock` para simular MySQL:
- `TestDatabaseConnection`: is_connected, disconnect, connect falla
- `TestProductos`: get_product_by_code (encontrado/no encontrado), get_all_products
- `TestTasas`: get_current_rate (con dato / fallback 1.0)
- `TestFacturas`: get_next_invoice_number (formato y primera)
- `TestCierreFiscal`: fecha_tiene_cierre, save_fiscal_closure
- `TestLotes`: get_lots_by_product, get_lots_expiring_soon, save_merma, get_mermas_by_lot
- `TestResumenFiscalMensual`: get_monthly_fiscal_summary (estructura y valores)

---

## 4. Cómo Ejecutar el Sistema

### Requisitos previos
```bash
pip install customtkinter mysql-connector-python pandas matplotlib numpy
```

### Base de datos
```bash
mysql -u root -p < siga/schema.sql
# Editar siga/config.py: DB_CONFIG['user'] y DB_CONFIG['password']
```

### Lanzar la aplicación
```bash
cd siga
python3 app.py
```
Al iniciar aparece la pantalla de login. Las credenciales son las configuradas
en `config.py` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`).

### Ejecutar las pruebas
```bash
cd siga
python3 -m unittest discover -s tests -p "test_*.py" -v
```
**Resultado esperado:** `Ran 77 tests in Xs — OK`

---

## 5. Estructura de Carpetas Final

```
siga/
├── config.py          ← Constantes globales (credenciales, tasas, colores)
├── database.py        ← Acceso MySQL (+ nuevos métodos LOTE/MERMA/fiscal)
├── data_processor.py  ← CartProcessor + DashboardProcessor (Pandas/Matplotlib)
├── app.py             ← UI principal CTk (ahora invoca LoginWindow al inicio)
├── login.py           ← [NUEVO] Módulo A: autenticación + funciones fiscales puras
├── schema.sql         ← DDL de base de datos (+ tablas lotes y mermas)
├── requirements.txt   ← Dependencias pip
└── tests/
    ├── __init__.py
    ├── mock_deps.py   ← [NUEVO] Stubs de dependencias externas para pruebas
    ├── test_config.py ← [NUEVO] 13 tests de configuración
    ├── test_login.py  ← [NUEVO] 44 tests de autenticación y lógica fiscal
    └── test_database.py ← [NUEVO] 20 tests de acceso a datos con mock MySQL
```

---

## 6. Correspondencia con Módulos del Prompt_Maestro

| Módulo Prompt_Maestro | Implementación Python | Archivos |
|----------------------|----------------------|----------|
| A — Autenticación | `LoginWindow` (CTkToplevel) | `login.py`, `config.py` |
| B — Ventas / PDF | `POSTab` + `CartProcessor` | `app.py`, `data_processor.py` |
| C — Inventario / Lotes / Mermas | `DashboardTab` + nuevas tablas DB | `database.py`, `schema.sql` |
| D — Fiscal SENIAT | `get_monthly_fiscal_summary()` + funciones en `login.py` | `database.py`, `login.py` |
| E — Configuración | `config.py` (editable directamente) | `config.py` |
| F — Usabilidad | Integrado en `LoginWindow` (WhatsApp modal, logout) | `login.py`, `app.py` |

---

## 7. Resultado de las Pruebas

```
Ran 77 tests in 0.067s
OK

test_config.TestConfigConstantes        — 13/13 ✅
test_database.TestCierreFiscal          —  3/ 3 ✅
test_database.TestDatabaseConnection    —  4/ 4 ✅
test_database.TestFacturas              —  2/ 2 ✅
test_database.TestLotes                 —  4/ 4 ✅
test_database.TestProductos             —  3/ 3 ✅
test_database.TestResumenFiscalMensual  —  1/ 1 ✅
test_database.TestTasas                 —  2/ 2 ✅
test_login.TestCalcularDeudaFiscal      —  6/ 6 ✅
test_login.TestCalcularIGTF             —  5/ 5 ✅
test_login.TestCalcularIVA              —  6/ 6 ✅
test_login.TestColorSemaforoLote        —  8/ 8 ✅
test_login.TestValidarEmail             — 10/10 ✅
test_login.TestVerificarCredenciales    — 10/10 ✅
```
