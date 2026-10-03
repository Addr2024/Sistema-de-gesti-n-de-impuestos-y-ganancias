# Diagrama Entidad–Relación — SIGA (`siga_db`)

> Generado a partir del esquema real implementado en [`siga/schema.sql`](../siga/schema.sql),
> por lo que **corresponde a la versión implementada**. Si el diagrama original
> del equipo difiere, la fuente válida es `schema.sql`.
>
> El diagrama está en sintaxis **Mermaid**; GitHub lo renderiza automáticamente.

```mermaid
erDiagram
    PRODUCTOS ||--o{ VENTAS_DETALLE : "aparece_en"
    PRODUCTOS ||--o{ LOTES : "se_divide_en"
    VENTAS ||--o{ VENTAS_DETALLE : "contiene"
    LOTES ||--o{ MERMAS : "genera"
    CIERRES_FISCALES ||--o{ VENTAS : "agrupa"

    PRODUCTOS {
        int id PK
        varchar codigo UK
        varchar descripcion
        decimal precio_bs
        tinyint aplica_iva
        int stock_actual
        int stock_minimo
        varchar categoria
        timestamp creado_en
        timestamp actualizado_en
    }

    TASAS_HISTORICAS {
        int id PK
        date fecha UK
        decimal tasa_bcv
        varchar fuente UK
        timestamp creado_en
    }

    VENTAS {
        int id PK
        varchar numero_factura UK
        datetime fecha
        decimal subtotal_bs
        decimal iva_bs
        decimal igtf_bs
        decimal total_bs
        decimal total_usd
        decimal tasa_usd
        tinyint pago_usd
        int cierre_fiscal_id FK
        timestamp creado_en
    }

    VENTAS_DETALLE {
        int id PK
        int venta_id FK
        int producto_id FK
        varchar codigo
        varchar descripcion
        int cantidad
        decimal precio_unit_bs
        tinyint aplica_iva
        decimal iva_bs
        decimal subtotal_bs
    }

    GASTOS_OPERATIVOS {
        int id PK
        date fecha
        varchar categoria
        varchar descripcion
        decimal monto_bs
        timestamp creado_en
    }

    CIERRES_FISCALES {
        int id PK
        date fecha_cierre UK
        decimal total_ventas_bs
        decimal total_iva_bs
        decimal total_igtf_bs
        decimal total_neto_bs
        decimal total_gastos_bs
        decimal ganancia_neta_bs
        int cantidad_facturas
        timestamp ejecutado_en
    }

    LOTES {
        int id PK
        varchar codigo_lote UK
        int producto_id FK
        int cantidad
        date fecha_vencimiento
        enum color_alerta
        timestamp creado_en
    }

    MERMAS {
        int id PK
        int lote_id FK
        int cantidad
        enum motivo
        varchar observaciones
        timestamp registrado_en
    }
```

## Notas del modelo

- `TASAS_HISTORICAS` y `GASTOS_OPERATIVOS` no tienen clave foránea; son tablas
  independientes de apoyo (tasa de cambio diaria y gastos del negocio).
- La relación `CIERRES_FISCALES → VENTAS` se modela mediante la columna
  `ventas.cierre_fiscal_id` (nullable). En `schema.sql` es una referencia
  lógica, no una `FOREIGN KEY` declarada.
- Cardinalidades: `||--o{` = "uno a muchos" (un producto tiene muchas líneas de
  venta y muchos lotes; una venta tiene muchas líneas; un lote tiene muchas
  mermas; un cierre agrupa muchas ventas).
