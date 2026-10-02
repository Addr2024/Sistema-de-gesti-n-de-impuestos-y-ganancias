# ============================================================
# SIGA - Capa de lógica de datos (Pandas)
# Toda la manipulación numérica y los cálculos fiscales
# viven aquí, completamente separados de la interfaz.
# ============================================================

from __future__ import annotations

from datetime import date, timedelta
from typing import Any

import pandas as pd

from config import IVA_RATE, IGTF_RATE, STOCK_SUFICIENTE, STOCK_BAJO, STOCK_AGOTADO
from database import db


# ─────────────────────────────────────────────────────────────
# Procesador del Carrito (Módulo Punto de Venta)
# ─────────────────────────────────────────────────────────────

class CartProcessor:
    """
    Mantiene el carrito de compras como un DataFrame de Pandas.
    Realiza todos los cálculos fiscales en tiempo real.
    """

    # Columnas del carrito
    COLUMNS = [
        "producto_id", "codigo", "descripcion", "cantidad",
        "precio_unit_bs", "aplica_iva",
        "subtotal_base",   # cantidad × precio sin impuestos
        "iva_bs",          # IVA de esta línea
        "subtotal_bs",     # subtotal_base + iva_bs
    ]

    def __init__(self) -> None:
        self._df: pd.DataFrame = pd.DataFrame(columns=self.COLUMNS)
        self._tasa_usd: float = db.get_current_rate() if db.is_connected else 1.0
        self._pago_usd: bool = False

    # ── propiedades ───────────────────────────────────────────

    @property
    def df(self) -> pd.DataFrame:
        return self._df.copy()

    @property
    def is_empty(self) -> bool:
        return self._df.empty

    @property
    def tasa_usd(self) -> float:
        return self._tasa_usd

    @tasa_usd.setter
    def tasa_usd(self, value: float) -> None:
        self._tasa_usd = max(value, 0.0001)

    @property
    def pago_usd(self) -> bool:
        return self._pago_usd

    @pago_usd.setter
    def pago_usd(self, value: bool) -> None:
        self._pago_usd = value

    # ── operaciones del carrito ──────────────────────────────

    def add_product(self, product: dict[str, Any], cantidad: int) -> str | None:
        """
        Agrega o acumula un producto.
        Retorna un mensaje de error o None si todo salió bien.
        """
        if cantidad <= 0:
            return "La cantidad debe ser mayor a cero."

        stock = int(product.get("stock_actual", 0))
        if stock == 0:
            return f"'{product['descripcion']}' está agotado."

        pid = int(product["id"])

        # Si ya existe en el carrito, actualizar cantidad
        mask = self._df["producto_id"] == pid
        if mask.any():
            nueva_cant = int(self._df.loc[mask, "cantidad"].iloc[0]) + cantidad
            if nueva_cant > stock:
                return f"Stock insuficiente. Disponible: {stock}."
            self._df.loc[mask, "cantidad"] = nueva_cant
        else:
            if cantidad > stock:
                return f"Stock insuficiente. Disponible: {stock}."
            nueva_fila = {
                "producto_id":    pid,
                "codigo":         product["codigo"],
                "descripcion":    product["descripcion"],
                "cantidad":       cantidad,
                "precio_unit_bs": float(product["precio_bs"]),
                "aplica_iva":     bool(product["aplica_iva"]),
                "subtotal_base":  0.0,
                "iva_bs":         0.0,
                "subtotal_bs":    0.0,
            }
            self._df = pd.concat(
                [self._df, pd.DataFrame([nueva_fila])],
                ignore_index=True,
            )

        self._recalculate()
        return None

    def remove_item(self, index: int) -> None:
        """Elimina la fila del carrito por posición."""
        self._df = self._df.drop(index=index).reset_index(drop=True)
        self._recalculate()

    def clear(self) -> None:
        """Vacía el carrito."""
        self._df = pd.DataFrame(columns=self.COLUMNS)

    # ── cálculos ─────────────────────────────────────────────

    def _recalculate(self) -> None:
        """Recalcula todos los totales de línea usando operaciones vectorizadas."""
        if self._df.empty:
            return

        self._df["subtotal_base"] = (
            self._df["cantidad"] * self._df["precio_unit_bs"]
        ).round(2)

        self._df["iva_bs"] = (
            self._df["subtotal_base"] * self._df["aplica_iva"].astype(int) * IVA_RATE
        ).round(2)

        self._df["subtotal_bs"] = (
            self._df["subtotal_base"] + self._df["iva_bs"]
        ).round(2)

    def get_totals(self) -> dict[str, float]:
        """
        Retorna el resumen fiscal completo listo para mostrarse en pantalla.
        """
        if self._df.empty:
            return {
                "subtotal_bs": 0.0, "iva_bs": 0.0, "igtf_bs": 0.0,
                "total_bs": 0.0,    "total_usd": 0.0,
            }

        subtotal_bs = float(self._df["subtotal_base"].sum())
        iva_bs      = float(self._df["iva_bs"].sum())
        base_total  = subtotal_bs + iva_bs
        igtf_bs     = round(base_total * IGTF_RATE, 2) if self._pago_usd else 0.0
        total_bs    = round(base_total + igtf_bs, 2)
        total_usd   = round(total_bs / self._tasa_usd, 4) if self._tasa_usd else 0.0

        return {
            "subtotal_bs": round(subtotal_bs, 2),
            "iva_bs":      round(iva_bs,      2),
            "igtf_bs":     igtf_bs,
            "total_bs":    total_bs,
            "total_usd":   total_usd,
        }

    def get_items_for_save(self) -> list[dict]:
        """Retorna la lista de ítems formateada para `database.save_sale()`."""
        return self._df[[
            "producto_id", "codigo", "descripcion",
            "cantidad", "precio_unit_bs", "aplica_iva",
            "iva_bs", "subtotal_bs",
        ]].to_dict("records")


# ─────────────────────────────────────────────────────────────
# Procesador del Dashboard (Módulo Gerencial)
# ─────────────────────────────────────────────────────────────

class DashboardProcessor:
    """Consulta MySQL y procesa los datos con Pandas para el dashboard."""

    # ── métricas del día ─────────────────────────────────────

    def get_daily_metrics(self) -> dict[str, float | int]:
        """
        Retorna las 4 tarjetas de métricas:
        ventas totales, IGTF recaudado, gastos, margen neto.
        """
        rows = db.get_daily_sales()
        gastos = db.get_total_expenses_day()

        if not rows:
            return {
                "ventas_total_bs": 0.0,
                "igtf_total_bs":   0.0,
                "gastos_total_bs": round(gastos, 2),
                "margen_neta_bs":  round(-gastos, 2),
                "cantidad_ventas": 0,
            }

        df = pd.DataFrame(rows)
        df[["total_bs", "iva_bs", "igtf_bs"]] = df[["total_bs", "iva_bs", "igtf_bs"]].apply(
            pd.to_numeric, errors="coerce"
        ).fillna(0.0)

        ventas_total = float(df["total_bs"].sum())
        igtf_total   = float(df["igtf_bs"].sum())
        # Margen neto = ventas netas (sin impuestos) - gastos
        ventas_netas = ventas_total - float(df["iva_bs"].sum()) - igtf_total
        margen       = ventas_netas - gastos

        return {
            "ventas_total_bs": round(ventas_total, 2),
            "igtf_total_bs":   round(igtf_total,   2),
            "gastos_total_bs": round(gastos,        2),
            "margen_neta_bs":  round(margen,        2),
            "cantidad_ventas": len(df),
        }

    # ── gráfico 1: tendencia semanal ─────────────────────────

    def get_weekly_trend(self) -> pd.DataFrame:
        """
        Retorna un DataFrame con columnas [dia, total_bs, cantidad]
        rellenando con ceros los días sin ventas.
        """
        rows = db.get_weekly_sales_by_day()
        today = date.today()
        all_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

        if rows:
            df = pd.DataFrame(rows)
            df["dia"] = pd.to_datetime(df["dia"]).dt.date
            df["total_bs"] = pd.to_numeric(df["total_bs"], errors="coerce").fillna(0.0)
        else:
            df = pd.DataFrame(columns=["dia", "total_bs", "cantidad"])

        base = pd.DataFrame({"dia": all_days})
        merged = base.merge(df, on="dia", how="left").fillna(0)
        merged["total_bs"] = merged["total_bs"].astype(float)
        merged["cantidad"] = merged["cantidad"].astype(int)
        return merged

    # ── gráfico 2: gastos por categoría ─────────────────────

    def get_expenses_by_category(self) -> pd.DataFrame:
        """Retorna DataFrame [categoria, total_bs] para el pie chart."""
        rows = db.get_operational_expenses_by_category()
        if not rows:
            return pd.DataFrame(columns=["categoria", "total_bs"])
        df = pd.DataFrame(rows)
        df["total_bs"] = pd.to_numeric(df["total_bs"], errors="coerce").fillna(0.0)
        return df[df["total_bs"] > 0].reset_index(drop=True)

    # ── tabla de inventario con semáforo ─────────────────────

    def get_inventory_with_status(self) -> pd.DataFrame:
        """
        Retorna el inventario completo con una columna 'estado'
        según las reglas de negocio.
        """
        rows = db.get_all_products()
        if not rows:
            return pd.DataFrame()

        df = pd.DataFrame(rows)
        df["stock_actual"]  = pd.to_numeric(df["stock_actual"],  errors="coerce").fillna(0).astype(int)
        df["stock_minimo"]  = pd.to_numeric(df["stock_minimo"],  errors="coerce").fillna(0).astype(int)
        df["precio_bs"]     = pd.to_numeric(df["precio_bs"],     errors="coerce").fillna(0.0)

        # Semáforo vectorizado
        conditions = [
            df["stock_actual"] == 0,
            df["stock_actual"] < df["stock_minimo"],
        ]
        choices = [STOCK_AGOTADO, STOCK_BAJO]
        df["estado"] = pd.Series(
            pd.np.select(conditions, choices, default=STOCK_SUFICIENTE)
            if hasattr(pd.np, "select")
            else _np_select(conditions, choices, STOCK_SUFICIENTE),
            index=df.index,
        )
        return df[["codigo", "descripcion", "categoria",
                   "precio_bs", "stock_actual", "stock_minimo", "estado"]]

    # ── cierre fiscal ────────────────────────────────────────

    def compute_fiscal_closure(self) -> dict[str, Any] | None:
        """
        Agrupa las ventas del día en un DataFrame y calcula
        los totales para el Reporte Z.
        Retorna None si ya existe un cierre para hoy.
        """
        today = date.today()
        if db.fecha_tiene_cierre(today):
            return None

        rows = db.get_daily_sales(today)
        gastos = db.get_total_expenses_day(today)

        if not rows:
            df = pd.DataFrame(columns=["total_bs", "iva_bs", "igtf_bs"])
            total_v = iva = igtf = 0.0
            count = 0
        else:
            df = pd.DataFrame(rows)
            for col in ["total_bs", "iva_bs", "igtf_bs"]:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)
            total_v = float(df["total_bs"].sum())
            iva     = float(df["iva_bs"].sum())
            igtf    = float(df["igtf_bs"].sum())
            count   = len(df)

        neto   = total_v - iva - igtf
        margen = neto - gastos

        return {
            "fecha_cierre":       today,
            "total_ventas_bs":    round(total_v, 2),
            "total_iva_bs":       round(iva,     2),
            "total_igtf_bs":      round(igtf,    2),
            "total_neto_bs":      round(neto,    2),
            "total_gastos_bs":    round(gastos,  2),
            "ganancia_neta_bs":   round(margen,  2),
            "cantidad_facturas":  count,
        }


# ─────────────────────────────────────────────────────────────
# Helper: np.select compatible con versiones sin pd.np
# ─────────────────────────────────────────────────────────────

def _np_select(conditions, choices, default):
    import numpy as np
    return np.select(conditions, choices, default=default)
