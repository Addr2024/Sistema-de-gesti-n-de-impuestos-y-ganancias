# Diccionario de Datos (SIGA, MySQL `siga_db`)

Fuente: `siga/schema.sql`. Motor MySQL, `utf8mb4_unicode_ci`. Montos en Bs. con `DECIMAL(18,2)`.

## productos
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador |
| codigo | VARCHAR(50) | NOT NULL, UNIQUE, índice | Código del producto |
| descripcion | VARCHAR(255) | NOT NULL | Nombre/descripción |
| precio_bs | DECIMAL(18,2) | NOT NULL, def. 0.00 | Precio unitario en Bs. |
| aplica_iva | TINYINT(1) | NOT NULL, def. 1 | 1 si grava IVA |
| stock_actual | INT | NOT NULL, def. 0 | Existencia |
| stock_minimo | INT | NOT NULL, def. 5 | Umbral de alerta |
| categoria | VARCHAR(100) | def. 'General' | Categoría |
| creado_en / actualizado_en | TIMESTAMP | automáticos | Auditoría |

## tasas_historicas
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador |
| fecha | DATE | NOT NULL, UNIQUE con fuente | Día de la tasa |
| tasa_bcv | DECIMAL(18,4) | NOT NULL | Bs. por USD |
| fuente | VARCHAR(50) | def. 'BCV' | Origen |
| creado_en | TIMESTAMP | automático | Auditoría |

## ventas
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador |
| numero_factura | VARCHAR(20) | NOT NULL, UNIQUE | Nº de factura |
| fecha | DATETIME | NOT NULL, def. ahora | Fecha y hora |
| subtotal_bs | DECIMAL(18,2) | NOT NULL | Base sin impuestos |
| iva_bs | DECIMAL(18,2) | NOT NULL | IVA 16 % |
| igtf_bs | DECIMAL(18,2) | NOT NULL | IGTF 3 % (pagos en divisas) |
| total_bs | DECIMAL(18,2) | NOT NULL | Total en Bs. |
| total_usd | DECIMAL(18,4) | NOT NULL | Total en USD |
| tasa_usd | DECIMAL(18,4) | NOT NULL, def. 1.00 | Tasa aplicada |
| pago_usd | TINYINT(1) | NOT NULL, def. 0 | 1 si se pagó en divisas |
| cierre_fiscal_id | INT | NULL, sin FK | Cierre al que pertenece |
| creado_en | TIMESTAMP | automático | Auditoría |

## ventas_detalle
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK, AUTO_INCREMENT | Identificador |
| venta_id | INT | NOT NULL, FK → ventas.id (CASCADE) | Cabecera |
| producto_id | INT | NOT NULL, FK → productos.id | Producto |
| codigo / descripcion | VARCHAR | NOT NULL | Copia al momento de la venta |
| cantidad | INT | NOT NULL, def. 1 | Unidades |
| precio_unit_bs | DECIMAL(18,2) | NOT NULL | Precio unitario |
| aplica_iva | TINYINT(1) | NOT NULL, def. 1 | Grava IVA |
| iva_bs | DECIMAL(18,2) | NOT NULL | IVA de la línea |
| subtotal_bs | DECIMAL(18,2) | NOT NULL | Subtotal de la línea |

## gastos_operativos
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK | Identificador |
| fecha | DATE | NOT NULL, índice | Día del gasto |
| categoria | VARCHAR(100) | NOT NULL, índice | Nómina, Servicios, Alquiler… |
| descripcion | VARCHAR(255) | NOT NULL | Detalle |
| monto_bs | DECIMAL(18,2) | NOT NULL | Monto |

## cierres_fiscales
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK | Identificador |
| fecha_cierre | DATE | NOT NULL, UNIQUE | Día del cierre (Reporte Z) |
| total_ventas_bs, total_iva_bs, total_igtf_bs, total_neto_bs, total_gastos_bs, ganancia_neta_bs | DECIMAL(18,2) | NOT NULL, def. 0 | Totales del día |
| cantidad_facturas | INT | NOT NULL | Facturas emitidas |
| ejecutado_en | TIMESTAMP | automático | Momento del cierre |

## lotes
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK | Identificador |
| codigo_lote | VARCHAR(50) | NOT NULL, UNIQUE | Código del lote |
| producto_id | INT | NOT NULL, FK → productos.id | Producto |
| cantidad | INT | NOT NULL | Unidades del lote |
| fecha_vencimiento | DATE | NOT NULL, índice | Vencimiento |
| color_alerta | ENUM('verde','amarillo','rojo') | NOT NULL, def. 'verde' | Semáforo de vencimiento |

## mermas
| Campo | Tipo | Restricciones | Descripción |
|---|---|---|---|
| id | INT | PK | Identificador |
| lote_id | INT | NOT NULL, FK → lotes.id (CASCADE) | Lote afectado |
| cantidad | INT | NOT NULL | Unidades perdidas |
| motivo | ENUM('Vencimiento','Daño Físico','Robo','Otro') | NOT NULL | Causa |
| observaciones | VARCHAR(255) | def. '' | Nota |
| registrado_en | TIMESTAMP | automático | Fecha de registro |

## Datos de la web (localStorage, no MySQL)
| Clave | Contenido |
|---|---|
| `invergica_auth` | `"true"` si hay sesión |
| claves de `taxStorage.ts` | Por día: ventas brutas, base, IVA, divisas, cantidad de productos |
