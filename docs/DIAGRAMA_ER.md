# Diagrama Entidad-Relación (SIGA, MySQL `siga_db`)

Refleja exactamente `siga/schema.sql` (8 tablas). No existe tabla de usuarios: el administrador se define por variables de entorno (`siga/.env`).

```mermaid
erDiagram
    PRODUCTOS ||--o{ VENTAS_DETALLE : "se vende en"
    VENTAS ||--|{ VENTAS_DETALLE : "contiene"
    PRODUCTOS ||--o{ LOTES : "se recibe en"
    LOTES ||--o{ MERMAS : "registra pérdidas"
    CIERRES_FISCALES ||..o{ VENTAS : "agrupa (cierre_fiscal_id, sin FK)"

    PRODUCTOS {
        int id PK
        varchar codigo UK
        varchar descripcion
        decimal precio_bs
        tinyint aplica_iva
        int stock_actual
        int stock_minimo
        varchar categoria
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
        int cierre_fiscal_id
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
    LOTES {
        int id PK
        varchar codigo_lote UK
        int producto_id FK
        int cantidad
        date fecha_vencimiento
        enum color_alerta
    }
    MERMAS {
        int id PK
        int lote_id FK
        int cantidad
        enum motivo
        varchar observaciones
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
    }
    GASTOS_OPERATIVOS {
        int id PK
        date fecha
        varchar categoria
        varchar descripcion
        decimal monto_bs
    }
    TASAS_HISTORICAS {
        int id PK
        date fecha
        decimal tasa_bcv
        varchar fuente
    }
```

Notas:
- `gastos_operativos` y `tasas_historicas` no tienen llaves foráneas; se consultan por fecha.
- `ventas.cierre_fiscal_id` es una referencia lógica sin `FOREIGN KEY` en el esquema.
- La web no usa MySQL: guarda los datos fiscales en `localStorage` (`taxStorage.ts`).
