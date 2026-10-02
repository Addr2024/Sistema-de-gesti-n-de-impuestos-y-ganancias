#!/usr/bin/env python3
# ============================================================
# SIGA — Módulo A: Autenticación (Prompt_Maestro Módulo A)
# Ventana de login que bloquea la app hasta autenticarse.
# ============================================================

from __future__ import annotations

import re
import tkinter as tk
from tkinter import messagebox
from typing import Callable

import customtkinter as ctk

from config import ADMIN_EMAIL, ADMIN_PASSWORD, COLORS, FONT_FAMILY, FONT_SIZES

C = COLORS
F = FONT_FAMILY


# ─────────────────────────────────────────────────────────────
# Lógica de autenticación (funciones puras — testables sin GUI)
# ─────────────────────────────────────────────────────────────

EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def validar_email(email: str) -> bool:
    """Valida el formato del correo electrónico."""
    return bool(EMAIL_RE.match(email.strip()))


def verificar_credenciales(email: str, password: str) -> bool:
    """
    Verifica las credenciales contra el administrador configurado.
    Insensible a mayúsculas en el correo; sensible en la contraseña.
    """
    return (
        email.strip().lower() == ADMIN_EMAIL.lower()
        and password == ADMIN_PASSWORD
    )


def color_semaforo_lote(dias_restantes: int) -> str:
    """
    DFD 3.3.3 — Asignar Color de Alerta al lote.
    Retorna 'rojo', 'amarillo' o 'verde'.
    """
    from config import LOTE_ROJO_DIAS, LOTE_AMARILLO_DIAS
    if dias_restantes <= LOTE_ROJO_DIAS:
        return "rojo"
    if dias_restantes <= LOTE_AMARILLO_DIAS:
        return "amarillo"
    return "verde"


def calcular_iva(base_imponible: float) -> float:
    """Proceso 2.2.2 — Segregar IVA (base × 0.16)."""
    from config import IVA_RATE
    return round(base_imponible * IVA_RATE, 2)


def calcular_igtf(divisas: float) -> float:
    """Proceso 2.2.3 — Filtrar Divisas y aplicar IGTF (divisas × 0.03)."""
    from config import IGTF_RATE
    return round(divisas * IGTF_RATE, 2)


def calcular_deuda_fiscal(base_imponible: float, divisas: float) -> dict:
    """Consolidación Fiscal — retorna iva, igtf y total."""
    iva  = calcular_iva(base_imponible)
    igtf = calcular_igtf(divisas)
    return {
        "base_imponible": round(base_imponible, 2),
        "iva_deuda":      iva,
        "divisas":        round(divisas, 2),
        "igtf_deuda":     igtf,
        "total_deuda":    round(iva + igtf, 2),
    }


def dias_hasta_vencimiento(fecha_vencimiento: "datetime.date") -> int:
    """DFD 3.3.2 — Restar fecha de lote vs fecha actual."""
    from datetime import date
    delta = fecha_vencimiento - date.today()
    return delta.days


# ─────────────────────────────────────────────────────────────
# Ventana de Login (CTkToplevel — bloquea la app principal)
# ─────────────────────────────────────────────────────────────

class LoginWindow(ctk.CTkToplevel):
    """
    Módulo A del Prompt_Maestro:
    - Formulario email + contraseña
    - Modal "¿Olvidaste tu contraseña?" con WhatsApp
    - Mensaje "Solo administrador autorizado"
    - Bloquea la ventana padre hasta autenticación
    """

    def __init__(self, parent: ctk.CTk, on_success: Callable[[], None]) -> None:
        super().__init__(parent)
        self._parent     = parent
        self._on_success = on_success
        self._intentos   = 0

        self.title("SIGA — Iniciar Sesión")
        self.geometry("440x540")
        self.resizable(False, False)
        self.configure(fg_color=C["bg_root"])

        # Bloquear ventana padre hasta que esta se cierre/autentique
        self.grab_set()
        self.protocol("WM_DELETE_WINDOW", self._on_close_attempt)
        self.focus_set()

        self._build_ui()

    # ── construcción ────────────────────────────────────────

    def _build_ui(self) -> None:
        # — Barra superior naranja (estilo Invergica) —
        barra = tk.Frame(self, bg="#e07b00", height=4)
        barra.pack(fill="x", side="top")

        content = ctk.CTkFrame(self, fg_color="transparent")
        content.pack(fill="both", expand=True, padx=40, pady=30)

        # — Encabezado —
        ctk.CTkLabel(
            content, text="⬡  SIG-A",
            font=(F, 28, "bold"),
            text_color="#e07b00",
        ).pack(pady=(0, 4))

        ctk.CTkLabel(
            content, text="Sistema de Gestión Invergica",
            font=(F, 11),
            text_color=C["text_muted"],
        ).pack()

        ctk.CTkLabel(
            content, text="ACCESO ADMINISTRATIVO",
            font=(F, 10, "bold"),
            text_color="#6a3a10",
        ).pack(pady=(4, 20))

        # — Campo Correo —
        ctk.CTkLabel(
            content, text="CORREO ELECTRÓNICO",
            font=(F, 10, "bold"),
            text_color=C["text_secondary"],
            anchor="w",
        ).pack(fill="x")

        self._entry_email = ctk.CTkEntry(
            content,
            font=(F, 13),
            fg_color=C["bg_entry"],
            border_color=C["border"],
            text_color=C["text_primary"],
            height=44,
        )
        self._entry_email.pack(fill="x", pady=(4, 16))
        self._entry_email.bind("<Return>", lambda _: self._entry_pass.focus_set())

        # — Campo Contraseña —
        ctk.CTkLabel(
            content, text="CONTRASEÑA",
            font=(F, 10, "bold"),
            text_color=C["text_secondary"],
            anchor="w",
        ).pack(fill="x")

        pass_frame = ctk.CTkFrame(content, fg_color="transparent")
        pass_frame.pack(fill="x", pady=(4, 6))
        pass_frame.columnconfigure(0, weight=1)

        self._entry_pass = ctk.CTkEntry(
            pass_frame,
            font=(F, 13),
            fg_color=C["bg_entry"],
            border_color=C["border"],
            text_color=C["text_primary"],
            show="•",
            height=44,
        )
        self._entry_pass.grid(row=0, column=0, sticky="ew")
        self._entry_pass.bind("<Return>", lambda _: self._on_login())

        self._show_pass = tk.BooleanVar(value=False)
        ctk.CTkCheckBox(
            content,
            text="Mostrar contraseña",
            font=(F, 10),
            text_color=C["text_muted"],
            variable=self._show_pass,
            command=self._toggle_pass,
            fg_color=C["accent"],
            hover_color=C["accent_hover"],
            checkmark_color="#ffffff",
        ).pack(anchor="e", pady=(0, 4))

        # — "Olvidé mi contraseña" —
        ctk.CTkButton(
            content,
            text="¿Olvidaste tu contraseña?",
            font=(F, 11),
            fg_color="transparent",
            hover_color=C["bg_hover"],
            text_color="#e07b00",
            anchor="e",
            command=self._mostrar_olvide,
        ).pack(fill="x", pady=(0, 12))

        # — Mensaje de error —
        self._lbl_error = ctk.CTkLabel(
            content, text="",
            font=(F, 11),
            text_color=C["stock_ago_fg"],
            wraplength=340,
        )
        self._lbl_error.pack()

        # — Botón iniciar sesión —
        ctk.CTkButton(
            content,
            text="→  INICIAR SESIÓN",
            font=(F, 14, "bold"),
            height=48,
            fg_color="#cc2200",
            hover_color="#e07b00",
            text_color="#ffffff",
            corner_radius=8,
            command=self._on_login,
        ).pack(fill="x", pady=(8, 16))

        # — "No tienes cuenta" —
        ctk.CTkButton(
            content,
            text="¿No tienes una cuenta?",
            font=(F, 11),
            fg_color="transparent",
            hover_color=C["bg_hover"],
            text_color=C["text_muted"],
            command=self._mostrar_no_cuenta,
        ).pack()

    # ── eventos ──────────────────────────────────────────────

    def _toggle_pass(self) -> None:
        char = "" if self._show_pass.get() else "•"
        self._entry_pass.configure(show=char)

    def _on_login(self) -> None:
        email    = self._entry_email.get()
        password = self._entry_pass.get()

        if not validar_email(email):
            self._set_error("Ingresa un correo electrónico válido.")
            return

        if not password:
            self._set_error("La contraseña no puede estar vacía.")
            return

        if verificar_credenciales(email, password):
            self._lbl_error.configure(text="")
            self.grab_release()
            self.destroy()
            self._on_success()
        else:
            self._intentos += 1
            if self._intentos >= 3:
                self._set_error(
                    "Credenciales incorrectas. Sistema de uso exclusivo del\n"
                    "administrador de Invergica. Contacta por WhatsApp."
                )
            else:
                self._set_error("Correo o contraseña incorrectos.")

    def _set_error(self, msg: str) -> None:
        self._lbl_error.configure(text=msg)
        self._entry_pass.delete(0, "end")
        self._entry_pass.focus_set()

    def _mostrar_olvide(self) -> None:
        messagebox.showinfo(
            "Recuperar Contraseña",
            "Para recuperar tu contraseña, contacta\n"
            "al administrador por WhatsApp:\n\n"
            "+58 414-166-7535\n\n"
            "(También puedes escribir a través de la web\n"
            "de Invergica en la sección Contacto.)",
            parent=self,
        )

    def _mostrar_no_cuenta(self) -> None:
        messagebox.showinfo(
            "Sistema Privado",
            "SIG-A es un sistema de uso privado y exclusivo\n"
            "de Invergica.\n\n"
            "Solo el administrador autorizado puede\n"
            "iniciar sesión.",
            parent=self,
        )

    def _on_close_attempt(self) -> None:
        if messagebox.askyesno(
            "Salir",
            "¿Deseas cerrar el sistema?",
            parent=self,
        ):
            self._parent.destroy()
