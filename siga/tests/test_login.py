#!/usr/bin/env python3
"""
Pruebas unitarias — Módulo A: Autenticación (login.py)
Cubre: validar_email, verificar_credenciales,
       color_semaforo_lote, calcular_iva, calcular_igtf, calcular_deuda_fiscal
"""

import sys
import os
import unittest

# Agregar la carpeta siga/ al path y cargar mocks antes de cualquier import SIGA
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
import tests.mock_deps  # noqa: F401 — side effects only

from login import (
    validar_email,
    verificar_credenciales,
    color_semaforo_lote,
    calcular_iva,
    calcular_igtf,
    calcular_deuda_fiscal,
)
from config import ADMIN_EMAIL, ADMIN_PASSWORD, IVA_RATE, IGTF_RATE


# ── validar_email ────────────────────────────────────────────────────────────

class TestValidarEmail(unittest.TestCase):

    def test_email_valido_standard(self):
        self.assertTrue(validar_email("addr43342@gmail.com"))

    def test_email_valido_dominio_punto(self):
        self.assertTrue(validar_email("user@empresa.com.ve"))

    def test_email_sin_arroba(self):
        self.assertFalse(validar_email("usuariogmail.com"))

    def test_email_sin_dominio(self):
        self.assertFalse(validar_email("usuario@"))

    def test_email_vacio(self):
        self.assertFalse(validar_email(""))

    def test_email_solo_espacios(self):
        self.assertFalse(validar_email("   "))

    def test_email_con_espacios_iniciales_se_limpia(self):
        # strip() interno — espacio extra no debe invalidar
        self.assertTrue(validar_email("  addr43342@gmail.com  "))

    def test_email_xss_injection(self):
        self.assertFalse(validar_email("<script>alert(1)</script>"))

    def test_email_sql_injection(self):
        self.assertFalse(validar_email("' OR '1'='1"))

    def test_email_multiples_arrobas(self):
        self.assertFalse(validar_email("a@@b.com"))


# ── verificar_credenciales ───────────────────────────────────────────────────

class TestVerificarCredenciales(unittest.TestCase):

    def test_credenciales_correctas(self):
        self.assertTrue(verificar_credenciales(ADMIN_EMAIL, ADMIN_PASSWORD))

    def test_email_mayusculas_acepta(self):
        self.assertTrue(verificar_credenciales(ADMIN_EMAIL.upper(), ADMIN_PASSWORD))

    def test_password_incorrecta(self):
        self.assertFalse(verificar_credenciales(ADMIN_EMAIL, "wrongpass"))

    def test_email_incorrecto(self):
        self.assertFalse(verificar_credenciales("otro@correo.com", ADMIN_PASSWORD))

    def test_ambos_incorrectos(self):
        self.assertFalse(verificar_credenciales("x@x.com", "bad"))

    def test_password_case_sensitive(self):
        # la contraseña SÍ es sensible a mayúsculas
        self.assertFalse(verificar_credenciales(ADMIN_EMAIL, ADMIN_PASSWORD.lower()))

    def test_email_con_espacios_se_limpia(self):
        self.assertTrue(verificar_credenciales(f" {ADMIN_EMAIL} ", ADMIN_PASSWORD))

    def test_password_vacia(self):
        self.assertFalse(verificar_credenciales(ADMIN_EMAIL, ""))

    def test_sql_injection_no_autentica(self):
        self.assertFalse(verificar_credenciales("' OR '1'='1", "' OR '1'='1"))

    def test_xss_no_autentica(self):
        self.assertFalse(
            verificar_credenciales("<script>", "<img src=x onerror=alert(1)>")
        )


# ── color_semaforo_lote ──────────────────────────────────────────────────────

class TestColorSemaforoLote(unittest.TestCase):

    def test_verde_mas_de_30_dias(self):
        self.assertEqual(color_semaforo_lote(31), "verde")

    def test_verde_exactamente_31_dias(self):
        self.assertEqual(color_semaforo_lote(31), "verde")

    def test_amarillo_30_dias(self):
        self.assertEqual(color_semaforo_lote(30), "amarillo")

    def test_amarillo_15_dias(self):
        self.assertEqual(color_semaforo_lote(15), "amarillo")

    def test_amarillo_1_dia(self):
        self.assertEqual(color_semaforo_lote(1), "amarillo")

    def test_rojo_0_dias(self):
        self.assertEqual(color_semaforo_lote(0), "rojo")

    def test_rojo_negativo(self):
        self.assertEqual(color_semaforo_lote(-5), "rojo")

    def test_verde_100_dias(self):
        self.assertEqual(color_semaforo_lote(100), "verde")


# ── calcular_iva ─────────────────────────────────────────────────────────────

class TestCalcularIVA(unittest.TestCase):

    def test_iva_rate_es_correcto(self):
        self.assertAlmostEqual(IVA_RATE, 0.16)

    def test_base_100(self):
        self.assertAlmostEqual(calcular_iva(100.0), 16.0)

    def test_base_0(self):
        self.assertAlmostEqual(calcular_iva(0.0), 0.0)

    def test_redondeo_2_decimales(self):
        resultado = calcular_iva(123.456)
        self.assertEqual(resultado, round(123.456 * 0.16, 2))

    def test_base_1000(self):
        self.assertAlmostEqual(calcular_iva(1000.0), 160.0)

    def test_base_negativa(self):
        # Comportamiento definido: retorna negativo (se usa solo con valores positivos)
        self.assertAlmostEqual(calcular_iva(-100.0), -16.0)


# ── calcular_igtf ────────────────────────────────────────────────────────────

class TestCalcularIGTF(unittest.TestCase):

    def test_igtf_rate_es_correcto(self):
        self.assertAlmostEqual(IGTF_RATE, 0.03)

    def test_divisas_100(self):
        self.assertAlmostEqual(calcular_igtf(100.0), 3.0)

    def test_divisas_0(self):
        self.assertAlmostEqual(calcular_igtf(0.0), 0.0)

    def test_redondeo_2_decimales(self):
        resultado = calcular_igtf(33.333)
        self.assertEqual(resultado, round(33.333 * 0.03, 2))

    def test_divisas_grandes(self):
        self.assertAlmostEqual(calcular_igtf(10000.0), 300.0)


# ── calcular_deuda_fiscal ────────────────────────────────────────────────────

class TestCalcularDeudaFiscal(unittest.TestCase):

    def test_estructura_retorno(self):
        r = calcular_deuda_fiscal(1000.0, 500.0)
        for key in ("base_imponible", "iva_deuda", "divisas", "igtf_deuda", "total_deuda"):
            self.assertIn(key, r)

    def test_calculo_iva_correcto(self):
        r = calcular_deuda_fiscal(1000.0, 0.0)
        self.assertAlmostEqual(r["iva_deuda"], 160.0)

    def test_calculo_igtf_correcto(self):
        r = calcular_deuda_fiscal(0.0, 500.0)
        self.assertAlmostEqual(r["igtf_deuda"], 15.0)

    def test_total_es_suma(self):
        r = calcular_deuda_fiscal(1000.0, 500.0)
        esperado = round(r["iva_deuda"] + r["igtf_deuda"], 2)
        self.assertAlmostEqual(r["total_deuda"], esperado)

    def test_sin_divisas_igtf_cero(self):
        r = calcular_deuda_fiscal(1000.0, 0.0)
        self.assertAlmostEqual(r["igtf_deuda"], 0.0)

    def test_base_cero_iva_cero(self):
        r = calcular_deuda_fiscal(0.0, 0.0)
        self.assertAlmostEqual(r["iva_deuda"], 0.0)
        self.assertAlmostEqual(r["total_deuda"], 0.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
