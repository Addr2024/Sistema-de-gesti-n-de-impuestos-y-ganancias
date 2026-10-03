# Diccionario de Datos — SIGA (`siga_db`)

> Generado a partir del esquema real implementado en [`siga/schema.sql`](../siga/schema.sql).
> Motor: **MySQL** (`CHARACTER SET utf8mb4`, `COLLATE utf8mb4_unicode_ci`).
> Convenciones: **PK** = clave primaria, **FK** = clave foránea, **UQ** = única.

---

## 1. `productos` — Catálogo de productos

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador del producto |
| `codigo` | VARCHAR(50) | No | UQ (idx_codigo) | — | Código único del producto (SKU) |
| `descripcion` | VARCHAR(255) | No | — | — | Nombre/descripción del producto |
| `precio_bs` | DECIMAL(18,2) | No | — | 0.00 | Precio de venta en bolívares |
| `aplica_iva` | TINYINT(1) | No | — | 1 | 1 = grava IVA, 0 = exento |
| `stock_actual` | INT | No | — | 0 | Existencia actual |
| `stock_minimo` | INT | No | — | 5 | Umbral de stock mínimo (alerta) |
| `categoria` | VARCHAR(100) | Sí | — | 'General' | Categoría comercial |
| `creado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Fecha de alta |
| `actualizado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP ON UPDATE | Fecha de última modificación |

---

## 2. `tasas_historicas` — Historial de tasas de cambio (BCV)

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador del registro |
| `fecha` | DATE | No | UQ (uq_fecha_fuente, idx_fecha) | — | Fecha de la tasa |
| `tasa_bcv` | DECIMAL(18,4) | No | — | — | Tasa Bs./USD |
| `fuente` | VARCHAR(50) | Sí | UQ (uq_fecha_fuente) | 'BCV' | Origen de la tasa |
| `creado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Fecha de registro |

> Restricción `UNIQUE (fecha, fuente)`: una sola tasa por fecha y fuente.

---

## 3. `ventas` — Cabecera de ventas (factura)

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador de la venta |
| `numero_factura` | VARCHAR(20) | No | UQ | — | Número de factura (ej. F-000001) |
| `fecha` | DATETIME | No | idx_fecha | CURRENT_TIMESTAMP | Fecha/hora de la venta |
| `subtotal_bs` | DECIMAL(18,2) | No | — | 0.00 | Base imponible en Bs. |
| `iva_bs` | DECIMAL(18,2) | No | — | 0.00 | IVA de la venta |
| `igtf_bs` | DECIMAL(18,2) | No | — | 0.00 | IGTF (si pagó en divisas) |
| `total_bs` | DECIMAL(18,2) | No | — | 0.00 | Total en Bs. |
| `total_usd` | DECIMAL(18,4) | No | — | 0.00 | Total equivalente en USD |
| `tasa_usd` | DECIMAL(18,4) | No | — | 1.00 | Tasa aplicada |
| `pago_usd` | TINYINT(1) | No | — | 0 | 1 = pago en divisas (genera IGTF) |
| `cierre_fiscal_id` | INT | Sí | FK lógica → `cierres_fiscales.id` | NULL | Cierre fiscal asociado |
| `creado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Fecha de registro |

---

## 4. `ventas_detalle` — Líneas de venta

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador de la línea |
| `venta_id` | INT | No | FK → `ventas.id` (ON DELETE CASCADE) | — | Venta a la que pertenece |
| `producto_id` | INT | No | FK → `productos.id` | — | Producto vendido |
| `codigo` | VARCHAR(50) | No | — | — | Código del producto (histórico) |
| `descripcion` | VARCHAR(255) | No | — | — | Descripción (histórica) |
| `cantidad` | INT | No | — | 1 | Unidades vendidas |
| `precio_unit_bs` | DECIMAL(18,2) | No | — | — | Precio unitario en Bs. |
| `aplica_iva` | TINYINT(1) | No | — | 1 | 1 = grava IVA |
| `iva_bs` | DECIMAL(18,2) | No | — | 0.00 | IVA de la línea |
| `subtotal_bs` | DECIMAL(18,2) | No | — | — | Subtotal de la línea |

---

## 5. `gastos_operativos` — Gastos del negocio

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador del gasto |
| `fecha` | DATE | No | idx_fecha | — | Fecha del gasto |
| `categoria` | VARCHAR(100) | No | idx_categoria | — | Categoría (Nómina, Servicios…) |
| `descripcion` | VARCHAR(255) | No | — | — | Detalle del gasto |
| `monto_bs` | DECIMAL(18,2) | No | — | 0.00 | Monto en Bs. |
| `creado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Fecha de registro |

---

## 6. `cierres_fiscales` — Cierre diario (Reporte Z)

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador del cierre |
| `fecha_cierre` | DATE | No | UQ | — | Fecha del cierre (una por día) |
| `total_ventas_bs` | DECIMAL(18,2) | No | — | 0.00 | Total de ventas del día |
| `total_iva_bs` | DECIMAL(18,2) | No | — | 0.00 | IVA acumulado |
| `total_igtf_bs` | DECIMAL(18,2) | No | — | 0.00 | IGTF acumulado |
| `total_neto_bs` | DECIMAL(18,2) | No | — | 0.00 | Neto (sin impuestos) |
| `total_gastos_bs` | DECIMAL(18,2) | No | — | 0.00 | Gastos del día |
| `ganancia_neta_bs` | DECIMAL(18,2) | No | — | 0.00 | Ganancia neta |
| `cantidad_facturas` | INT | No | — | 0 | Número de facturas del día |
| `ejecutado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Momento del cierre |

---

## 7. `lotes` — Lotes de inventario

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador del lote |
| `codigo_lote` | VARCHAR(50) | No | UQ | — | Código del lote |
| `producto_id` | INT | No | FK → `productos.id` (idx_lote_producto) | — | Producto del lote |
| `cantidad` | INT | No | — | 0 | Unidades en el lote |
| `fecha_vencimiento` | DATE | No | idx_lote_vencimiento | — | Fecha de vencimiento |
| `color_alerta` | ENUM('verde','amarillo','rojo') | No | — | 'verde' | Semáforo de vencimiento |
| `creado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Fecha de registro |

---

## 8. `mermas` — Pérdidas por lote

| Columna | Tipo | Nulo | Clave | Valor por defecto | Descripción |
|---|---|---|---|---|---|
| `id` | INT AUTO_INCREMENT | No | PK | — | Identificador de la merma |
| `lote_id` | INT | No | FK → `lotes.id` (ON DELETE CASCADE, idx_merma_lote) | — | Lote afectado |
| `cantidad` | INT | No | — | 0 | Unidades perdidas |
| `motivo` | ENUM('Vencimiento','Daño Físico','Robo','Otro') | No | — | — | Causa de la merma |
| `observaciones` | VARCHAR(255) | Sí | — | '' | Comentario adicional |
| `registrado_en` | TIMESTAMP | Sí | — | CURRENT_TIMESTAMP | Fecha de registro |

---

## Relaciones (claves foráneas)

| Tabla hija | Columna | Tabla padre | Regla |
|---|---|---|---|
| `ventas_detalle` | `venta_id` | `ventas.id` | ON DELETE CASCADE |
| `ventas_detalle` | `producto_id` | `productos.id` | RESTRICT (por defecto) |
| `lotes` | `producto_id` | `productos.id` | RESTRICT (por defecto) |
| `mermas` | `lote_id` | `lotes.id` | ON DELETE CASCADE |
| `ventas` | `cierre_fiscal_id` | `cierres_fiscales.id` | Referencia lógica (columna nullable, sin `FOREIGN KEY` declarada en el esquema) |

> Nota: `ventas.cierre_fiscal_id` está pensada para enlazar cada venta con su
> cierre fiscal, pero en `schema.sql` no se declara como `FOREIGN KEY` formal.
> Si se desea integridad referencial estricta, añadir la restricción.
