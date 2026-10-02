#!/usr/bin/env python3
"""
Pruebas unitarias — config.py
Verifica que todas las constantes críticas del sistema tengan los valores correctos.
"""

import sys
import os
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import tests.mock_deps  # noqa: F401

import config


class TestConfigConstantes(unittest.TestCase):

    def test_iva_rate(self):
        self.assertAlmostEqual(config.IVA_RATE, 0.16)

    def test_igtf_rate(self):
        self.assertAlmostEqual(config.IGTF_RATE, 0.03)

    def test_lote_rojo_dias(self):
        self.assertEqual(config.LOTE_ROJO_DIAS, 0)

    def test_lote_amarillo_dias(self):
        self.assertEqual(config.LOTE_AMARILLO_DIAS, 30)

    def test_admin_email_no_vacio(self):
        self.assertTrue(len(config.ADMIN_EMAIL) > 0)

    def test_admin_password_no_vacio(self):
        self.assertTrue(len(config.ADMIN_PASSWORD) > 0)

    def test_admin_email_tiene_arroba(self):
        self.assertIn("@", config.ADMIN_EMAIL)

    def test_stock_constantes_existen(self):
        self.assertEqual(config.STOCK_SUFICIENTE, "suficiente")
        self.assertEqual(config.STOCK_BAJO, "bajo")
        self.assertEqual(config.STOCK_AGOTADO, "agotado")

    def test_colores_presentes(self):
        required_keys = [
            "bg_root", "bg_frame", "accent", "text_primary",
            "text_secondary", "text_muted", "border",
            "stock_suf_fg", "stock_bajo_fg", "stock_ago_fg",
        ]
        for key in required_keys:
            self.assertIn(key, config.COLORS, f"Falta COLORS['{key}']")

    def test_colores_son_strings_hex(self):
        for key, val in config.COLORS.items():
            if isinstance(val, str):
                self.assertTrue(
                    val.startswith("#"),
                    f"COLORS['{key}'] = '{val}' no empieza con '#'",
                )

    def test_font_sizes_presentes(self):
        for size in ("xs", "sm", "md", "lg", "xl", "xxl", "hero"):
            self.assertIn(size, config.FONT_SIZES)

    def test_window_size_formato(self):
        # Debe tener formato "WxH"
        self.assertIn("x", config.WINDOW_SIZE)
        partes = config.WINDOW_SIZE.split("x")
        self.assertEqual(len(partes), 2)
        self.assertTrue(partes[0].isdigit())
        self.assertTrue(partes[1].isdigit())

    def test_db_config_keys(self):
        for key in ("host", "port", "user", "password", "database"):
            self.assertIn(key, config.DB_CONFIG)


if __name__ == "__main__":
    unittest.main(verbosity=2)
