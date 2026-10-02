# ============================================================
# SIGA - Capa de acceso a datos (MySQL)
# Separa toda la lógica SQL del resto de la aplicación.
# ============================================================

from __future__ import annotations

import logging
from contextlib import contextmanager
from datetime import date, datetime
from typing import Any, Generator

import mysql.connector
from mysql.connector import Error as MySQLError

from config import DB_CONFIG

logger = logging.getLogger(__name__)


# ─────────────────────────────────────────────────────────────
# Conexión
# ─────────────────────────────────────────────────────────────

class DatabaseManager:
    """Gestiona la conexión MySQL con reconexión automática."""

    def __init__(self) -> None:
        self._connection: mysql.connector.MySQLConnection | None = None

    # -- conexión pública --------------------------------------------------

    def connect(self) -> bool:
        """Establece la conexión. Retorna True si tuvo éxito."""
        try:
            self._connection = mysql.connector.connect(**DB_CONFIG)
            logger.info("Conexión a MySQL establecida.")
            return True
        except MySQLError as exc:
            logger.error("No se pudo conectar a MySQL: %s", exc)
            self._connection = None
            return False

    def disconnect(self) -> None:
        if self._connection and self._connection.is_connected():
            self._connection.close()
            logger.info("Conexión a MySQL cerrada.")

    @property
    def is_connected(self) -> bool:
        return bool(self._connection and self._connection.is_connected())

    def _ensure_connection(self) -> None:
        if not self.is_connected:
            self.connect()

    # -- context manager para cursores ------------------------------------

    @contextmanager
    def cursor(self, dictionary: bool = True) -> Generator:
        """Context manager que provee un cursor y maneja commit/rollback."""
        self._ensure_connection()
        cur = self._connection.cursor(dictionary=dictionary)
        try:
            yield cur
            self._connection.commit()
        except MySQLError:
            self._connection.rollback()
            raise
        finally:
            cur.close()

    # ─────────────────────────────────────────────────────────
    # Módulo Productos
    # ─────────────────────────────────────────────────────────

    def get_product_by_code(self, codigo: str) -> dict[str, Any] | None:
        """Busca un producto por su código. Retorna dict o None."""
        sql = """
            SELECT id, codigo, descripcion, precio_bs, aplica_iva,
                   stock_actual, stock_minimo, categoria
            FROM productos
            WHERE codigo = %s
            LIMIT 1
        """
        with self.cursor() as cur:
            cur.execute(sql, (codigo.strip(),))
            return cur.fetchone()

    def get_all_products(self) -> list[dict]:
        """Retorna todos los productos (para el semáforo de inventario)."""
        sql = """
            SELECT id, codigo, descripcion, precio_bs, aplica_iva,
                   stock_actual, stock_minimo, categoria
            FROM productos
            ORDER BY descripcion
        """
        with self.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()

    def update_stock(self, producto_id: int, cantidad: int) -> None:
        """Descuenta `cantidad` unidades del stock."""
        sql = """
            UPDATE productos
            SET stock_actual = GREATEST(stock_actual - %s, 0)
            WHERE id = %s
        """
        with self.cursor() as cur:
            cur.execute(sql, (cantidad, producto_id))

    # ─────────────────────────────────────────────────────────
    # Módulo Tasas
    # ─────────────────────────────────────────────────────────

    def get_current_rate(self) -> float:
        """Obtiene la tasa BCV más reciente."""
        sql = """
            SELECT tasa_bcv
            FROM tasas_historicas
            ORDER BY fecha DESC
            LIMIT 1
        """
        with self.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()
            return float(row["tasa_bcv"]) if row else 1.0

    # ─────────────────────────────────────────────────────────
    # Módulo Ventas
    # ─────────────────────────────────────────────────────────

    def get_next_invoice_number(self) -> str:
        """Genera el siguiente número de factura correlativo."""
        sql = "SELECT COUNT(*) AS total FROM ventas"
        with self.cursor() as cur:
            cur.execute(sql)
            row = cur.fetchone()
            seq = (row["total"] or 0) + 1
        return f"F-{seq:06d}"

    def save_sale(
        self,
        items: list[dict],
        subtotal_bs: float,
        iva_bs: float,
        igtf_bs: float,
        total_bs: float,
        tasa_usd: float,
        pago_usd: bool,
    ) -> int:
        """
        Inserta la cabecera + detalle de venta y descuenta stock.
        Retorna el id de la venta creada.
        """
        total_usd = total_bs / tasa_usd if tasa_usd else 0.0
        numero = self.get_next_invoice_number()

        sql_venta = """
            INSERT INTO ventas
                (numero_factura, subtotal_bs, iva_bs, igtf_bs,
                 total_bs, total_usd, tasa_usd, pago_usd)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        sql_detalle = """
            INSERT INTO ventas_detalle
                (venta_id, producto_id, codigo, descripcion,
                 cantidad, precio_unit_bs, aplica_iva, iva_bs, subtotal_bs)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        """

        with self.cursor() as cur:
            cur.execute(
                sql_venta,
                (numero, subtotal_bs, iva_bs, igtf_bs,
                 total_bs, total_usd, tasa_usd, int(pago_usd)),
            )
            venta_id = cur.lastrowid

            for item in items:
                cur.execute(
                    sql_detalle,
                    (
                        venta_id,
                        item["producto_id"],
                        item["codigo"],
                        item["descripcion"],
                        item["cantidad"],
                        item["precio_unit_bs"],
                        int(item["aplica_iva"]),
                        item["iva_bs"],
                        item["subtotal_bs"],
                    ),
                )
                # Descuento de stock (dentro del mismo cursor/transacción)
                cur.execute(
                    "UPDATE productos "
                    "SET stock_actual = GREATEST(stock_actual - %s, 0) "
                    "WHERE id = %s",
                    (item["cantidad"], item["producto_id"]),
                )

        return venta_id

    # ─────────────────────────────────────────────────────────
    # Módulo Dashboard
    # ─────────────────────────────────────────────────────────

    def get_daily_sales(self, fecha: date | None = None) -> list[dict]:
        """Ventas del día indicado (default: hoy)."""
        target = fecha or date.today()
        sql = """
            SELECT id, numero_factura, fecha,
                   subtotal_bs, iva_bs, igtf_bs, total_bs,
                   total_usd, tasa_usd, pago_usd
            FROM ventas
            WHERE DATE(fecha) = %s
            ORDER BY fecha
        """
        with self.cursor() as cur:
            cur.execute(sql, (target,))
            return cur.fetchall()

    def get_weekly_sales_by_day(self) -> list[dict]:
        """Suma de ventas agrupadas por día, últimos 7 días."""
        sql = """
            SELECT
                DATE(fecha)          AS dia,
                SUM(total_bs)        AS total_bs,
                COUNT(*)             AS cantidad
            FROM ventas
            WHERE fecha >= CURDATE() - INTERVAL 6 DAY
            GROUP BY DATE(fecha)
            ORDER BY dia
        """
        with self.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()

    def get_operational_expenses_by_category(
        self, fecha: date | None = None
    ) -> list[dict]:
        """Gastos operativos del día agrupados por categoría."""
        target = fecha or date.today()
        sql = """
            SELECT categoria, SUM(monto_bs) AS total_bs
            FROM gastos_operativos
            WHERE fecha = %s
            GROUP BY categoria
            ORDER BY total_bs DESC
        """
        with self.cursor() as cur:
            cur.execute(sql, (target,))
            return cur.fetchall()

    def get_total_expenses_day(self, fecha: date | None = None) -> float:
        """Total de gastos del día."""
        target = fecha or date.today()
        sql = "SELECT COALESCE(SUM(monto_bs), 0) AS total FROM gastos_operativos WHERE fecha = %s"
        with self.cursor() as cur:
            cur.execute(sql, (target,))
            row = cur.fetchone()
            return float(row["total"])

    # ─────────────────────────────────────────────────────────
    # Módulo Cierre Fiscal (Reporte Z)
    # ─────────────────────────────────────────────────────────

    def fecha_tiene_cierre(self, fecha: date) -> bool:
        sql = "SELECT id FROM cierres_fiscales WHERE fecha_cierre = %s LIMIT 1"
        with self.cursor() as cur:
            cur.execute(sql, (fecha,))
            return cur.fetchone() is not None

    def save_fiscal_closure(
        self,
        fecha_cierre: date,
        total_ventas_bs: float,
        total_iva_bs: float,
        total_igtf_bs: float,
        total_neto_bs: float,
        total_gastos_bs: float,
        ganancia_neta_bs: float,
        cantidad_facturas: int,
    ) -> int:
        sql = """
            INSERT INTO cierres_fiscales
                (fecha_cierre, total_ventas_bs, total_iva_bs, total_igtf_bs,
                 total_neto_bs, total_gastos_bs, ganancia_neta_bs, cantidad_facturas)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        with self.cursor() as cur:
            cur.execute(
                sql,
                (
                    fecha_cierre,
                    total_ventas_bs,
                    total_iva_bs,
                    total_igtf_bs,
                    total_neto_bs,
                    total_gastos_bs,
                    ganancia_neta_bs,
                    cantidad_facturas,
                ),
            )
            return cur.lastrowid

    def mark_sales_closed(self, fecha: date, cierre_id: int) -> None:
        """Vincula las ventas del día al cierre fiscal."""
        sql = """
            UPDATE ventas
            SET cierre_fiscal_id = %s
            WHERE DATE(fecha) = %s AND cierre_fiscal_id IS NULL
        """
        with self.cursor() as cur:
            cur.execute(sql, (cierre_id, fecha))

    # ─────────────────────────────────────────────────────────
    # Módulo C — Lotes y Mermas (Prompt_Maestro Módulo C)
    # ─────────────────────────────────────────────────────────

    def get_lots_by_product(self, producto_id: int) -> list[dict]:
        """Retorna todos los lotes de un producto con días restantes calculados."""
        sql = """
            SELECT id, codigo_lote, producto_id, cantidad,
                   fecha_vencimiento, color_alerta,
                   DATEDIFF(fecha_vencimiento, CURDATE()) AS dias_restantes
            FROM lotes
            WHERE producto_id = %s
            ORDER BY fecha_vencimiento
        """
        with self.cursor() as cur:
            cur.execute(sql, (producto_id,))
            return cur.fetchall()

    def get_lots_expiring_soon(self, dias: int = 30) -> list[dict]:
        """
        DFD 3.3 — Lotes que vencen en los próximos `dias` días
        (incluye vencidos: dias_restantes <= 0).
        """
        sql = """
            SELECT l.id, l.codigo_lote, l.cantidad, l.fecha_vencimiento,
                   l.color_alerta,
                   DATEDIFF(l.fecha_vencimiento, CURDATE()) AS dias_restantes,
                   p.descripcion AS producto
            FROM lotes l
            JOIN productos p ON p.id = l.producto_id
            WHERE DATEDIFF(l.fecha_vencimiento, CURDATE()) <= %s
            ORDER BY dias_restantes
        """
        with self.cursor() as cur:
            cur.execute(sql, (dias,))
            return cur.fetchall()

    def update_lot_color(self, lote_id: int, color_alerta: str) -> None:
        """Actualiza el badge de semáforo de un lote (DFD 3.3.3)."""
        sql = "UPDATE lotes SET color_alerta = %s WHERE id = %s"
        with self.cursor() as cur:
            cur.execute(sql, (color_alerta, lote_id))

    def save_merma(
        self,
        lote_id: int,
        cantidad: int,
        motivo: str,
        observaciones: str = "",
    ) -> int:
        """
        Registra una merma y descuenta la cantidad del lote.
        Retorna el id de la merma creada.
        """
        sql_merma = """
            INSERT INTO mermas (lote_id, cantidad, motivo, observaciones)
            VALUES (%s, %s, %s, %s)
        """
        sql_stock = """
            UPDATE lotes
            SET cantidad = GREATEST(cantidad - %s, 0)
            WHERE id = %s
        """
        with self.cursor() as cur:
            cur.execute(sql_merma, (lote_id, cantidad, motivo, observaciones))
            merma_id = cur.lastrowid
            cur.execute(sql_stock, (cantidad, lote_id))
        return merma_id

    def get_mermas_by_lot(self, lote_id: int) -> list[dict]:
        """Retorna el historial de mermas de un lote."""
        sql = """
            SELECT id, cantidad, motivo, observaciones, registrado_en
            FROM mermas
            WHERE lote_id = %s
            ORDER BY registrado_en DESC
        """
        with self.cursor() as cur:
            cur.execute(sql, (lote_id,))
            return cur.fetchall()

    # ─────────────────────────────────────────────────────────
    # Módulo D — Resumen Fiscal Mensual (Prompt_Maestro Módulo D)
    # ─────────────────────────────────────────────────────────

    def get_monthly_fiscal_summary(self, mes: str) -> dict:
        """
        Suma de ventas del mes indicado (formato 'YYYY-MM').
        Retorna base_imponible, iva_total, igtf_total, total_ventas, cantidad_facturas.
        """
        sql = """
            SELECT
                COALESCE(SUM(subtotal_bs), 0)  AS base_imponible,
                COALESCE(SUM(iva_bs), 0)        AS iva_total,
                COALESCE(SUM(igtf_bs), 0)       AS igtf_total,
                COALESCE(SUM(total_bs), 0)      AS total_ventas,
                COUNT(*)                         AS cantidad_facturas
            FROM ventas
            WHERE DATE_FORMAT(fecha, '%%Y-%%m') = %s
        """
        with self.cursor() as cur:
            cur.execute(sql, (mes,))
            row = cur.fetchone()
            return {
                "mes":                mes,
                "base_imponible":     float(row["base_imponible"]),
                "iva_total":          float(row["iva_total"]),
                "igtf_total":         float(row["igtf_total"]),
                "total_ventas":       float(row["total_ventas"]),
                "cantidad_facturas":  int(row["cantidad_facturas"]),
            }

    def get_fiscal_history(self) -> list[dict]:
        """Retorna todos los cierres fiscales para el historial de declaraciones."""
        sql = """
            SELECT fecha_cierre, total_ventas_bs, total_iva_bs, total_igtf_bs,
                   ganancia_neta_bs, cantidad_facturas, ejecutado_en
            FROM cierres_fiscales
            ORDER BY fecha_cierre DESC
        """
        with self.cursor() as cur:
            cur.execute(sql)
            return cur.fetchall()


# Instancia singleton
db = DatabaseManager()
