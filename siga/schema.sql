-- ============================================================
-- SIGA - Sistema Integral de Gestión de Impuestos y Ganancias
-- Schema de base de datos: siga_db
-- ============================================================

CREATE DATABASE IF NOT EXISTS siga_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE siga_db;

-- ----------------------------------------------------------
-- Tabla: productos
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    codigo        VARCHAR(50)    NOT NULL UNIQUE,
    descripcion   VARCHAR(255)   NOT NULL,
    precio_bs     DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    aplica_iva    TINYINT(1)     NOT NULL DEFAULT 1,
    stock_actual  INT            NOT NULL DEFAULT 0,
    stock_minimo  INT            NOT NULL DEFAULT 5,
    categoria     VARCHAR(100)   DEFAULT 'General',
    creado_en     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    actualizado_en TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_codigo (codigo)
);

-- ----------------------------------------------------------
-- Tabla: tasas_historicas
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasas_historicas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    fecha         DATE           NOT NULL,
    tasa_bcv      DECIMAL(18, 4) NOT NULL,
    fuente        VARCHAR(50)    DEFAULT 'BCV',
    creado_en     TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_fecha_fuente (fecha, fuente),
    INDEX idx_fecha (fecha)
);

-- ----------------------------------------------------------
-- Tabla: ventas (cabecera)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    numero_factura  VARCHAR(20)    NOT NULL UNIQUE,
    fecha           DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal_bs     DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    iva_bs          DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    igtf_bs         DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_bs        DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_usd       DECIMAL(18, 4) NOT NULL DEFAULT 0.00,
    tasa_usd        DECIMAL(18, 4) NOT NULL DEFAULT 1.00,
    pago_usd        TINYINT(1)     NOT NULL DEFAULT 0,
    cierre_fiscal_id INT           DEFAULT NULL,
    creado_en       TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha)
);

-- ----------------------------------------------------------
-- Tabla: ventas_detalle (líneas de venta)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS ventas_detalle (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    venta_id        INT            NOT NULL,
    producto_id     INT            NOT NULL,
    codigo          VARCHAR(50)    NOT NULL,
    descripcion     VARCHAR(255)   NOT NULL,
    cantidad        INT            NOT NULL DEFAULT 1,
    precio_unit_bs  DECIMAL(18, 2) NOT NULL,
    aplica_iva      TINYINT(1)     NOT NULL DEFAULT 1,
    iva_bs          DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    subtotal_bs     DECIMAL(18, 2) NOT NULL,
    FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    INDEX idx_venta (venta_id)
);

-- ----------------------------------------------------------
-- Tabla: gastos_operativos
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS gastos_operativos (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    fecha       DATE           NOT NULL,
    categoria   VARCHAR(100)   NOT NULL,
    descripcion VARCHAR(255)   NOT NULL,
    monto_bs    DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    creado_en   TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_fecha (fecha),
    INDEX idx_categoria (categoria)
);

-- ----------------------------------------------------------
-- Tabla: cierres_fiscales (Reporte Z)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS cierres_fiscales (
    id                  INT AUTO_INCREMENT PRIMARY KEY,
    fecha_cierre        DATE           NOT NULL UNIQUE,
    total_ventas_bs     DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_iva_bs        DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_igtf_bs       DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_neto_bs       DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    total_gastos_bs     DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    ganancia_neta_bs    DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    cantidad_facturas   INT            NOT NULL DEFAULT 0,
    ejecutado_en        TIMESTAMP      DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------
-- Tabla: lotes  (Módulo C — Prompt_Maestro / E-R LOTE)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS lotes (
    id                INT AUTO_INCREMENT PRIMARY KEY,
    codigo_lote       VARCHAR(50)    NOT NULL UNIQUE,
    producto_id       INT            NOT NULL,
    cantidad          INT            NOT NULL DEFAULT 0,
    fecha_vencimiento DATE           NOT NULL,
    color_alerta      ENUM('verde','amarillo','rojo') NOT NULL DEFAULT 'verde',
    creado_en         TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (producto_id) REFERENCES productos(id),
    INDEX idx_lote_producto (producto_id),
    INDEX idx_lote_vencimiento (fecha_vencimiento)
);

-- ----------------------------------------------------------
-- Tabla: mermas  (E-R LOTE → MERMA)
-- ----------------------------------------------------------
CREATE TABLE IF NOT EXISTS mermas (
    id            INT AUTO_INCREMENT PRIMARY KEY,
    lote_id       INT            NOT NULL,
    cantidad      INT            NOT NULL DEFAULT 0,
    motivo        ENUM('Vencimiento','Daño Físico','Robo','Otro') NOT NULL,
    observaciones VARCHAR(255)   DEFAULT '',
    registrado_en TIMESTAMP      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (lote_id) REFERENCES lotes(id) ON DELETE CASCADE,
    INDEX idx_merma_lote (lote_id)
);

-- ============================================================
-- Datos de ejemplo / semilla
-- ============================================================

INSERT IGNORE INTO tasas_historicas (fecha, tasa_bcv)
VALUES
    (CURDATE() - INTERVAL 6 DAY, 36.50),
    (CURDATE() - INTERVAL 5 DAY, 36.75),
    (CURDATE() - INTERVAL 4 DAY, 37.00),
    (CURDATE() - INTERVAL 3 DAY, 37.20),
    (CURDATE() - INTERVAL 2 DAY, 37.45),
    (CURDATE() - INTERVAL 1 DAY, 37.60),
    (CURDATE(),                  37.80);

INSERT IGNORE INTO productos (codigo, descripcion, precio_bs, aplica_iva, stock_actual, stock_minimo, categoria)
VALUES
    ('PROD-001', 'Arroz Premium 1Kg',        45.00,  1, 120, 20, 'Alimentos'),
    ('PROD-002', 'Aceite Vegetal 1L',         85.00,  1,   8,  5, 'Alimentos'),
    ('PROD-003', 'Harina de Trigo 1Kg',       38.00,  1,   3, 10, 'Alimentos'),
    ('PROD-004', 'Leche en Polvo 400g',       95.00,  1,  55, 15, 'Lácteos'),
    ('PROD-005', 'Azúcar Blanca 1Kg',         30.00,  1,   0,  5, 'Alimentos'),
    ('PROD-006', 'Café Molido 250g',          70.00,  1,  40, 10, 'Bebidas'),
    ('PROD-007', 'Jabón de Baño x3',          25.00,  1,  90, 20, 'Higiene'),
    ('PROD-008', 'Papel Higiénico x4',        40.00,  1,   2, 10, 'Higiene'),
    ('PROD-009', 'Detergente 1Kg',            55.00,  1,  35,  8, 'Limpieza'),
    ('PROD-010', 'Pasta Dental 100ml',        22.00,  1,  60, 12, 'Higiene');

INSERT IGNORE INTO gastos_operativos (fecha, categoria, descripcion, monto_bs)
VALUES
    (CURDATE(), 'Nómina',       'Pago semanal empleados',       4500.00),
    (CURDATE(), 'Servicios',    'Electricidad y agua',           850.00),
    (CURDATE(), 'Alquiler',     'Alquiler local comercial',     3200.00),
    (CURDATE(), 'Transporte',   'Flete de mercancía',            620.00),
    (CURDATE(), 'Mantenimiento','Reparación equipos',            380.00),
    (CURDATE() - INTERVAL 1 DAY, 'Nómina', 'Horas extras',      600.00),
    (CURDATE() - INTERVAL 1 DAY, 'Servicios', 'Internet',        150.00),
    (CURDATE() - INTERVAL 2 DAY, 'Transporte', 'Combustible',    200.00);

-- Lotes de ejemplo
INSERT IGNORE INTO lotes (codigo_lote, producto_id, cantidad, fecha_vencimiento, color_alerta)
VALUES
    ('LOTE-101', 1, 100, CURDATE() + INTERVAL 90 DAY,  'verde'),
    ('LOTE-102', 3,  20, CURDATE() + INTERVAL 15 DAY,  'amarillo'),
    ('LOTE-103', 5,   5, CURDATE() - INTERVAL 2 DAY,   'rojo'),
    ('LOTE-104', 4,  45, CURDATE() + INTERVAL 60 DAY,  'verde'),
    ('LOTE-105', 2,  10, CURDATE() + INTERVAL 7 DAY,   'amarillo');

-- Mermas de ejemplo
INSERT IGNORE INTO mermas (lote_id, cantidad, motivo, observaciones)
VALUES
    (3, 3, 'Vencimiento', 'Producto vencido antes de venderse'),
    (2, 2, 'Daño Físico',  'Cajas rotas en transporte');

-- Ventas simuladas de la semana
INSERT IGNORE INTO ventas (numero_factura, fecha, subtotal_bs, iva_bs, igtf_bs, total_bs, total_usd, tasa_usd, pago_usd)
VALUES
    ('F-0001', CURDATE() - INTERVAL 6 DAY, 800.00,  128.00, 0.00,  928.00, 25.36, 36.60, 0),
    ('F-0002', CURDATE() - INTERVAL 6 DAY, 450.00,   72.00, 15.66, 537.66, 14.22, 36.60, 1),
    ('F-0003', CURDATE() - INTERVAL 5 DAY, 1200.00, 192.00, 0.00, 1392.00, 37.88, 36.75, 0),
    ('F-0004', CURDATE() - INTERVAL 4 DAY, 320.00,   51.20, 0.00,  371.20, 10.03, 37.00, 0),
    ('F-0005', CURDATE() - INTERVAL 4 DAY, 980.00,  156.80, 34.14,1170.94, 31.65, 37.00, 1),
    ('F-0006', CURDATE() - INTERVAL 3 DAY, 650.00,  104.00, 0.00,  754.00, 20.27, 37.20, 0),
    ('F-0007', CURDATE() - INTERVAL 2 DAY, 1500.00, 240.00, 0.00, 1740.00, 46.45, 37.45, 0),
    ('F-0008', CURDATE() - INTERVAL 2 DAY, 220.00,   35.20, 7.66,  262.86,  7.02, 37.45, 1),
    ('F-0009', CURDATE() - INTERVAL 1 DAY, 870.00,  139.20, 0.00, 1009.20, 26.84, 37.60, 0),
    ('F-0010', CURDATE(),                  540.00,   86.40, 0.00,  626.40, 16.57, 37.80, 0),
    ('F-0011', CURDATE(),                  1100.00, 176.00, 38.22,1314.22, 34.77, 37.80, 1);
