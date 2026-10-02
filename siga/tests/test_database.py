#!/usr/bin/env python3
"""
Pruebas unitarias — database.py
Usa unittest.mock para simular mysql.connector y verificar la lógica
de DatabaseManager sin necesitar una base de datos real.
"""

import sys
import os
import unittest
from unittest.mock import MagicMock, patch, PropertyMock

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import tests.mock_deps  # noqa: F401

from database import DatabaseManager


def _make_db_with_mock_conn():
    """Crea un DatabaseManager con una conexión MySQL simulada."""
    db = DatabaseManager()
    mock_conn = MagicMock()
    mock_conn.is_connected.return_value = True
    db._connection = mock_conn
    return db, mock_conn


def _mock_cursor(mock_conn, rows=None, lastrowid=1):
    """Configura el context manager cursor() para retornar rows dados."""
    mock_cur = MagicMock()
    mock_cur.fetchone.return_value = rows[0] if rows else None
    mock_cur.fetchall.return_value = rows or []
    mock_cur.lastrowid = lastrowid
    mock_cur.__enter__ = lambda self: mock_cur
    mock_cur.__exit__ = MagicMock(return_value=False)
    mock_conn.cursor.return_value = mock_cur
    return mock_cur


# ── conexión ─────────────────────────────────────────────────────────────────

class TestDatabaseConnection(unittest.TestCase):

    def test_is_connected_false_sin_conexion(self):
        db = DatabaseManager()
        self.assertFalse(db.is_connected)

    def test_is_connected_true_con_mock(self):
        db, _ = _make_db_with_mock_conn()
        self.assertTrue(db.is_connected)

    def test_disconnect_llama_close(self):
        db, mock_conn = _make_db_with_mock_conn()
        db.disconnect()
        mock_conn.close.assert_called_once()

    def test_connect_falla_retorna_false(self):
        import mysql.connector as mc
        mc.connect = MagicMock(side_effect=mc.Error("no connection"))
        db = DatabaseManager()
        result = db.connect()
        self.assertFalse(result)
        self.assertIsNone(db._connection)


# ── productos ────────────────────────────────────────────────────────────────

class TestProductos(unittest.TestCase):

    def test_get_product_by_code_retorna_dict(self):
        db, mock_conn = _make_db_with_mock_conn()
        expected = {"id": 1, "codigo": "PROD-001", "descripcion": "Arroz"}
        _mock_cursor(mock_conn, rows=[expected])
        result = db.get_product_by_code("PROD-001")
        self.assertEqual(result, expected)

    def test_get_product_by_code_no_encontrado(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[])
        result = db.get_product_by_code("NO-EXISTE")
        self.assertIsNone(result)

    def test_get_all_products_lista(self):
        db, mock_conn = _make_db_with_mock_conn()
        productos = [
            {"id": 1, "codigo": "P-001"},
            {"id": 2, "codigo": "P-002"},
        ]
        mock_cur = _mock_cursor(mock_conn)
        mock_cur.fetchall.return_value = productos
        result = db.get_all_products()
        self.assertEqual(len(result), 2)


# ── tasas ────────────────────────────────────────────────────────────────────

class TestTasas(unittest.TestCase):

    def test_get_current_rate_retorna_float(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[{"tasa_bcv": 37.80}])
        result = db.get_current_rate()
        self.assertIsInstance(result, float)
        self.assertAlmostEqual(result, 37.80)

    def test_get_current_rate_fallback_1(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[])
        result = db.get_current_rate()
        self.assertAlmostEqual(result, 1.0)


# ── facturas ─────────────────────────────────────────────────────────────────

class TestFacturas(unittest.TestCase):

    def test_get_next_invoice_number_formato(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[{"total": 10}])
        num = db.get_next_invoice_number()
        self.assertTrue(num.startswith("F-"))
        self.assertEqual(len(num), 8)  # "F-000011"

    def test_get_next_invoice_number_primera(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[{"total": 0}])
        num = db.get_next_invoice_number()
        self.assertEqual(num, "F-000001")


# ── cierre fiscal ─────────────────────────────────────────────────────────────

class TestCierreFiscal(unittest.TestCase):

    def test_fecha_tiene_cierre_true(self):
        from datetime import date
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[{"id": 1}])
        self.assertTrue(db.fecha_tiene_cierre(date.today()))

    def test_fecha_tiene_cierre_false(self):
        from datetime import date
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[])
        self.assertFalse(db.fecha_tiene_cierre(date.today()))

    def test_save_fiscal_closure_retorna_id(self):
        from datetime import date
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, lastrowid=42)
        cid = db.save_fiscal_closure(
            fecha_cierre=date.today(),
            total_ventas_bs=1000.0,
            total_iva_bs=160.0,
            total_igtf_bs=30.0,
            total_neto_bs=840.0,
            total_gastos_bs=200.0,
            ganancia_neta_bs=640.0,
            cantidad_facturas=5,
        )
        self.assertEqual(cid, 42)


# ── lotes ─────────────────────────────────────────────────────────────────────

class TestLotes(unittest.TestCase):

    def test_get_lots_by_product(self):
        db, mock_conn = _make_db_with_mock_conn()
        lotes = [
            {"id": 1, "codigo_lote": "LOTE-101", "dias_restantes": 90},
            {"id": 2, "codigo_lote": "LOTE-102", "dias_restantes": 15},
        ]
        mock_cur = _mock_cursor(mock_conn)
        mock_cur.fetchall.return_value = lotes
        result = db.get_lots_by_product(1)
        self.assertEqual(len(result), 2)

    def test_get_lots_expiring_soon(self):
        db, mock_conn = _make_db_with_mock_conn()
        mock_cur = _mock_cursor(mock_conn)
        mock_cur.fetchall.return_value = [
            {"id": 3, "codigo_lote": "LOTE-103", "dias_restantes": -2},
        ]
        result = db.get_lots_expiring_soon(30)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["dias_restantes"], -2)

    def test_save_merma_retorna_id(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, lastrowid=7)
        mid = db.save_merma(3, 2, "Vencimiento", "producto vencido")
        self.assertEqual(mid, 7)

    def test_get_mermas_by_lot(self):
        db, mock_conn = _make_db_with_mock_conn()
        mermas = [
            {"id": 1, "cantidad": 3, "motivo": "Vencimiento"},
        ]
        mock_cur = _mock_cursor(mock_conn)
        mock_cur.fetchall.return_value = mermas
        result = db.get_mermas_by_lot(3)
        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["motivo"], "Vencimiento")


# ── resumen fiscal mensual ────────────────────────────────────────────────────

class TestResumenFiscalMensual(unittest.TestCase):

    def test_get_monthly_fiscal_summary_estructura(self):
        db, mock_conn = _make_db_with_mock_conn()
        _mock_cursor(mock_conn, rows=[{
            "base_imponible":   10000.0,
            "iva_total":         1600.0,
            "igtf_total":          300.0,
            "total_ventas":     11900.0,
            "cantidad_facturas":     25,
        }])
        result = db.get_monthly_fiscal_summary("2026-08")
        self.assertEqual(result["mes"], "2026-08")
        self.assertAlmostEqual(result["base_imponible"], 10000.0)
        self.assertAlmostEqual(result["iva_total"], 1600.0)
        self.assertAlmostEqual(result["igtf_total"], 300.0)
        self.assertEqual(result["cantidad_facturas"], 25)


if __name__ == "__main__":
    unittest.main(verbosity=2)
