#!/usr/bin/env python3
# ============================================================
# SIGA — Sistema Integral de Gestión de Impuestos y Ganancias
# Interfaz principal  ·  CustomTkinter + Matplotlib
# ============================================================

from __future__ import annotations

import logging
import tkinter as tk
import tkinter.ttk as ttk
from datetime import date
from tkinter import messagebox
from typing import Any

import customtkinter as ctk
import matplotlib
import matplotlib.pyplot as plt
import matplotlib.ticker as mticker
from matplotlib.backends.backend_tkagg import FigureCanvasTkAgg
from matplotlib.figure import Figure

from config import (
    COLORS, FONT_FAMILY, FONT_SIZES,
    STOCK_AGOTADO, STOCK_BAJO, STOCK_SUFICIENTE,
    WINDOW_MIN_H, WINDOW_MIN_W, WINDOW_SIZE, WINDOW_TITLE,
)
from data_processor import CartProcessor, DashboardProcessor
from database import db
from login import LoginWindow

matplotlib.use("TkAgg")
logging.basicConfig(level=logging.INFO, format="%(levelname)s: %(message)s")
logger = logging.getLogger(__name__)

# ─────────────────────────────────────────────────────────────
# Configuración global del tema CTk
# ─────────────────────────────────────────────────────────────

ctk.set_appearance_mode("dark")
ctk.set_default_color_theme("dark-blue")

C = COLORS   # alias corto
F = FONT_FAMILY


def font(size_key: str = "md", bold: bool = False, italic: bool = False) -> tuple:
    weight  = "bold"   if bold   else "normal"
    slant   = "italic" if italic else "roman"
    return (F, FONT_SIZES[size_key], weight, slant)


# ─────────────────────────────────────────────────────────────
# Helpers de UI reutilizables
# ─────────────────────────────────────────────────────────────

def make_label(
    parent,
    text: str,
    size: str = "md",
    bold: bool = False,
    color: str | None = None,
    **kwargs,
) -> ctk.CTkLabel:
    return ctk.CTkLabel(
        parent,
        text=text,
        font=font(size, bold),
        text_color=color or C["text_primary"],
        **kwargs,
    )


def make_button(
    parent,
    text: str,
    command,
    fg: str | None = None,
    hover: str | None = None,
    text_color: str = "#ffffff",
    size: str = "md",
    **kwargs,
) -> ctk.CTkButton:
    return ctk.CTkButton(
        parent,
        text=text,
        command=command,
        font=font(size, bold=True),
        fg_color=fg or C["accent"],
        hover_color=hover or C["accent_hover"],
        text_color=text_color,
        corner_radius=6,
        **kwargs,
    )


def separator(parent, orient: str = "horizontal", padx: int = 0) -> tk.Frame:
    w = tk.Frame(parent, bg=C["border"], height=1 if orient == "horizontal" else 0)
    w.pack(fill="x" if orient == "horizontal" else "y", padx=padx, pady=4)
    return w


# ─────────────────────────────────────────────────────────────
# Tarjeta de Métrica (Dashboard)
# ─────────────────────────────────────────────────────────────

class MetricCard(ctk.CTkFrame):
    def __init__(self, parent, title: str, bg_color: str, **kwargs):
        super().__init__(
            parent,
            fg_color=bg_color,
            corner_radius=10,
            border_width=1,
            border_color=C["border"],
            **kwargs,
        )
        self._lbl_title = make_label(self, title, size="sm", color=C["text_secondary"])
        self._lbl_title.pack(anchor="w", padx=14, pady=(12, 0))

        self._lbl_value = make_label(self, "—", size="xxl", bold=True, color=C["text_primary"])
        self._lbl_value.pack(anchor="w", padx=14, pady=(2, 0))

        self._lbl_sub = make_label(self, "", size="xs", color=C["text_muted"])
        self._lbl_sub.pack(anchor="w", padx=14, pady=(0, 12))

    def update(self, value: str, subtitle: str = "") -> None:
        self._lbl_value.configure(text=value)
        self._lbl_sub.configure(text=subtitle)


# ─────────────────────────────────────────────────────────────
# Pestaña 1 — Punto de Venta
# ─────────────────────────────────────────────────────────────

class POSTab(ctk.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color=C["bg_root"], **kwargs)
        self._cart = CartProcessor()
        self._build_ui()
        self._refresh_rate_label()

    # ── construcción del layout ──────────────────────────────

    def _build_ui(self) -> None:
        self.columnconfigure(0, weight=3)
        self.columnconfigure(1, weight=1)
        self.rowconfigure(0, weight=1)

        self._build_left_panel()
        self._build_right_panel()

    def _build_left_panel(self) -> None:
        left = ctk.CTkFrame(self, fg_color=C["bg_frame"], corner_radius=10)
        left.grid(row=0, column=0, sticky="nsew", padx=(12, 6), pady=12)
        left.columnconfigure(0, weight=1)
        left.rowconfigure(3, weight=1)

        # — Encabezado —
        hdr = ctk.CTkFrame(left, fg_color="transparent")
        hdr.grid(row=0, column=0, sticky="ew", padx=14, pady=(14, 4))
        make_label(hdr, "PUNTO DE VENTA", size="xl", bold=True,
                   color=C["accent"]).pack(side="left")
        self._lbl_rate = make_label(hdr, "", size="sm", color=C["text_muted"])
        self._lbl_rate.pack(side="right")

        separator(left, padx=14)

        # — Búsqueda de producto —
        search = ctk.CTkFrame(left, fg_color="transparent")
        search.grid(row=1, column=0, sticky="ew", padx=14, pady=6)
        search.columnconfigure(0, weight=3)
        search.columnconfigure(1, weight=1)
        search.columnconfigure(2, weight=0)

        make_label(search, "Código de Producto", size="sm",
                   color=C["text_secondary"]).grid(row=0, column=0, sticky="w", pady=(0, 3))
        make_label(search, "Cantidad", size="sm",
                   color=C["text_secondary"]).grid(row=0, column=1, sticky="w", padx=(8, 0), pady=(0, 3))

        self._entry_code = ctk.CTkEntry(
            search,
            font=font("lg"),
            fg_color=C["bg_entry"],
            border_color=C["border"],
            text_color=C["text_primary"],
            placeholder_text="Escanear o digitar código...",
            height=42,
        )
        self._entry_code.grid(row=1, column=0, sticky="ew")
        self._entry_code.bind("<Return>", self._on_code_enter)
        self._entry_code.focus_set()

        self._entry_qty = ctk.CTkEntry(
            search,
            font=font("lg"),
            fg_color=C["bg_entry"],
            border_color=C["border"],
            text_color=C["text_primary"],
            width=90,
            height=42,
        )
        self._entry_qty.insert(0, "1")
        self._entry_qty.grid(row=1, column=1, padx=(8, 0), sticky="ew")
        self._entry_qty.bind("<Return>", self._on_code_enter)

        btn_add = make_button(search, "+ Agregar", self._on_add_clicked, height=42)
        btn_add.grid(row=1, column=2, padx=(8, 0))

        # — IGTF toggle —
        toggle_frame = ctk.CTkFrame(left, fg_color="transparent")
        toggle_frame.grid(row=2, column=0, sticky="ew", padx=14, pady=(2, 6))
        self._igtf_var = ctk.BooleanVar(value=False)
        ctk.CTkSwitch(
            toggle_frame,
            text="Pago en Divisas (USD) — aplica IGTF 3 %",
            font=font("sm"),
            text_color=C["text_secondary"],
            variable=self._igtf_var,
            command=self._on_igtf_toggle,
            fg_color=C["accent_dark"],
            progress_color=C["accent"],
        ).pack(side="left")

        # — Tabla del carrito —
        cart_frame = ctk.CTkFrame(left, fg_color="transparent")
        cart_frame.grid(row=3, column=0, sticky="nsew", padx=14, pady=(0, 14))
        cart_frame.rowconfigure(0, weight=1)
        cart_frame.columnconfigure(0, weight=1)

        self._tree = self._build_cart_treeview(cart_frame)

    def _build_cart_treeview(self, parent) -> ttk.Treeview:
        style = ttk.Style()
        style.theme_use("clam")
        style.configure(
            "Cart.Treeview",
            background=C["bg_card"],
            foreground=C["text_primary"],
            fieldbackground=C["bg_card"],
            rowheight=28,
            font=(F, FONT_SIZES["sm"]),
            borderwidth=0,
        )
        style.configure(
            "Cart.Treeview.Heading",
            background=C["bg_widget"],
            foreground=C["text_secondary"],
            font=(F, FONT_SIZES["sm"], "bold"),
            borderwidth=0,
            relief="flat",
        )
        style.map("Cart.Treeview", background=[("selected", C["accent_dark"])])

        cols = ("codigo", "descripcion", "qty", "precio", "iva", "subtotal")
        tree = ttk.Treeview(parent, columns=cols, show="headings", style="Cart.Treeview")

        heads = {
            "codigo":      ("Código",       80,  "center"),
            "descripcion": ("Descripción",  240, "w"),
            "qty":         ("Cant.",         60, "center"),
            "precio":      ("Precio Unit.",  110, "e"),
            "iva":         ("IVA",           90,  "e"),
            "subtotal":    ("Subtotal",      110, "e"),
        }
        for col, (head, width, anchor) in heads.items():
            tree.heading(col, text=head)
            tree.column(col, width=width, anchor=anchor, stretch=(col == "descripcion"))

        vsb = ctk.CTkScrollbar(parent, command=tree.yview)
        vsb.grid(row=0, column=1, sticky="ns")
        tree.configure(yscrollcommand=vsb.set)
        tree.grid(row=0, column=0, sticky="nsew")

        tree.bind("<Delete>", self._on_delete_item)
        return tree

    def _build_right_panel(self) -> None:
        right = ctk.CTkFrame(self, fg_color=C["bg_frame"], corner_radius=10)
        right.grid(row=0, column=1, sticky="nsew", padx=(6, 12), pady=12)
        right.columnconfigure(0, weight=1)

        make_label(right, "RESUMEN FISCAL", size="lg", bold=True,
                   color=C["accent"]).pack(padx=14, pady=(16, 4), anchor="w")
        separator(right, padx=14)

        # — Filas de totales —
        totals_frame = ctk.CTkFrame(right, fg_color="transparent")
        totals_frame.pack(fill="x", padx=14, pady=8)
        totals_frame.columnconfigure(1, weight=1)

        self._total_labels: dict[str, ctk.CTkLabel] = {}
        rows_def = [
            ("subtotal", "Subtotal (Base):", C["text_secondary"]),
            ("iva",      "IVA  (16 %):",     C["text_secondary"]),
            ("igtf",     "IGTF (3 %):",      "#e3b341"),
        ]
        for r, (key, txt, color) in enumerate(rows_def):
            make_label(totals_frame, txt, size="sm", color=color).grid(
                row=r, column=0, sticky="w", pady=3)
            lbl = make_label(totals_frame, "Bs. 0,00", size="sm",
                             color=C["text_primary"])
            lbl.grid(row=r, column=1, sticky="e", pady=3)
            self._total_labels[key] = lbl

        separator(right, padx=0)

        # — Total grande —
        total_big = ctk.CTkFrame(right, fg_color=C["bg_card"], corner_radius=8)
        total_big.pack(fill="x", padx=14, pady=6)
        make_label(total_big, "TOTAL A PAGAR", size="sm",
                   color=C["text_secondary"]).pack(padx=12, pady=(10, 0), anchor="w")
        self._lbl_total_bs = make_label(total_big, "Bs. 0,00", size="hero",
                                        bold=True, color=C["accent"])
        self._lbl_total_bs.pack(padx=12, pady=(0, 4), anchor="w")
        self._lbl_total_usd = make_label(total_big, "$ 0.0000 USD", size="lg",
                                         color=C["text_muted"])
        self._lbl_total_usd.pack(padx=12, pady=(0, 10), anchor="w")

        # — Botones acción —
        separator(right, padx=14)

        self._btn_process = make_button(
            right, "✓  PROCESAR VENTA",
            self._on_process_sale,
            fg="#1a7a3a", hover="#25a853",
            size="lg", height=50,
        )
        self._btn_process.pack(fill="x", padx=14, pady=(8, 4))

        make_button(
            right, "✕  Cancelar Venta",
            self._on_cancel,
            fg="#5a1a1a", hover="#8b2e2e",
            size="md", height=38,
        ).pack(fill="x", padx=14, pady=(0, 14))

    # ── lógica de eventos ────────────────────────────────────

    def _refresh_rate_label(self) -> None:
        if db.is_connected:
            self._cart.tasa_usd = db.get_current_rate()
        self._lbl_rate.configure(
            text=f"Tasa BCV: {self._cart.tasa_usd:,.4f} Bs./USD"
        )

    def _on_code_enter(self, event=None) -> None:
        self._on_add_clicked()

    def _on_add_clicked(self) -> None:
        code = self._entry_code.get().strip()
        if not code:
            self._entry_code.focus_set()
            return

        try:
            qty = int(self._entry_qty.get())
        except ValueError:
            messagebox.showerror("Error", "La cantidad debe ser un número entero.")
            return

        if not db.is_connected:
            messagebox.showerror("Sin conexión",
                                 "No hay conexión con la base de datos.")
            return

        product = db.get_product_by_code(code)
        if not product:
            messagebox.showwarning("Producto no encontrado",
                                   f"No existe un producto con código: {code}")
            self._entry_code.delete(0, "end")
            self._entry_code.focus_set()
            return

        error = self._cart.add_product(product, qty)
        if error:
            messagebox.showwarning("Stock insuficiente", error)
        else:
            self._refresh_cart_table()
            self._refresh_totals()
            self._entry_code.delete(0, "end")
            self._entry_qty.delete(0, "end")
            self._entry_qty.insert(0, "1")
            self._entry_code.focus_set()

    def _on_delete_item(self, event=None) -> None:
        selected = self._tree.selection()
        if not selected:
            return
        idx = self._tree.index(selected[0])
        self._cart.remove_item(idx)
        self._refresh_cart_table()
        self._refresh_totals()

    def _on_igtf_toggle(self) -> None:
        self._cart.pago_usd = self._igtf_var.get()
        self._refresh_totals()

    def _on_process_sale(self) -> None:
        if self._cart.is_empty:
            messagebox.showinfo("Carrito vacío", "Agregue productos antes de procesar.")
            return
        if not db.is_connected:
            messagebox.showerror("Sin conexión", "No hay conexión con la base de datos.")
            return

        totals = self._cart.get_totals()
        confirm_msg = (
            f"¿Confirmar venta?\n\n"
            f"  Subtotal: Bs. {totals['subtotal_bs']:,.2f}\n"
            f"  IVA:      Bs. {totals['iva_bs']:,.2f}\n"
            f"  IGTF:     Bs. {totals['igtf_bs']:,.2f}\n"
            f"  ──────────────────────\n"
            f"  TOTAL:    Bs. {totals['total_bs']:,.2f}\n"
            f"            $  {totals['total_usd']:,.4f} USD"
        )
        if not messagebox.askyesno("Confirmar Venta", confirm_msg):
            return

        try:
            db.save_sale(
                items=self._cart.get_items_for_save(),
                subtotal_bs=totals["subtotal_bs"],
                iva_bs=totals["iva_bs"],
                igtf_bs=totals["igtf_bs"],
                total_bs=totals["total_bs"],
                tasa_usd=self._cart.tasa_usd,
                pago_usd=self._cart.pago_usd,
            )
            messagebox.showinfo("Venta Procesada", "La venta se registró exitosamente.")
            self._on_cancel()
        except Exception as exc:
            logger.error("Error al guardar venta: %s", exc)
            messagebox.showerror("Error al guardar", str(exc))

    def _on_cancel(self) -> None:
        self._cart.clear()
        self._igtf_var.set(False)
        self._cart.pago_usd = False
        self._refresh_cart_table()
        self._refresh_totals()
        self._entry_code.delete(0, "end")
        self._entry_qty.delete(0, "end")
        self._entry_qty.insert(0, "1")
        self._entry_code.focus_set()

    # ── refresco de la tabla y totales ───────────────────────

    def _refresh_cart_table(self) -> None:
        for item in self._tree.get_children():
            self._tree.delete(item)
        for _, row in self._cart.df.iterrows():
            self._tree.insert("", "end", values=(
                row["codigo"],
                row["descripcion"],
                int(row["cantidad"]),
                f"Bs. {float(row['precio_unit_bs']):,.2f}",
                f"Bs. {float(row['iva_bs']):,.2f}",
                f"Bs. {float(row['subtotal_bs']):,.2f}",
            ))

    def _refresh_totals(self) -> None:
        t = self._cart.get_totals()
        self._total_labels["subtotal"].configure(
            text=f"Bs. {t['subtotal_bs']:,.2f}")
        self._total_labels["iva"].configure(
            text=f"Bs. {t['iva_bs']:,.2f}")
        self._total_labels["igtf"].configure(
            text=f"Bs. {t['igtf_bs']:,.2f}",
            text_color="#e3b341" if t["igtf_bs"] > 0 else C["text_muted"],
        )
        self._lbl_total_bs.configure(text=f"Bs. {t['total_bs']:,.2f}")
        self._lbl_total_usd.configure(text=f"$ {t['total_usd']:,.4f} USD")


# ─────────────────────────────────────────────────────────────
# Pestaña 2 — Dashboard Gerencial
# ─────────────────────────────────────────────────────────────

class DashboardTab(ctk.CTkFrame):
    def __init__(self, parent, **kwargs):
        super().__init__(parent, fg_color=C["bg_root"], **kwargs)
        self._proc = DashboardProcessor()
        self._figures: list[Figure] = []
        self._build_ui()
        self.refresh()

    def _build_ui(self) -> None:
        self.columnconfigure(0, weight=1)
        self.rowconfigure(1, weight=1)
        self.rowconfigure(2, weight=2)

        self._build_header()
        self._build_metrics_row()
        self._build_charts_row()
        self._build_inventory_row()

    # ── encabezado ───────────────────────────────────────────

    def _build_header(self) -> None:
        hdr = ctk.CTkFrame(self, fg_color="transparent")
        hdr.grid(row=0, column=0, sticky="ew", padx=12, pady=(14, 0))
        make_label(hdr, "DASHBOARD GERENCIAL", size="xl", bold=True,
                   color=C["accent"]).pack(side="left")
        make_label(hdr, f"  ·  {date.today().strftime('%A %d de %B, %Y')}",
                   size="sm", color=C["text_muted"]).pack(side="left", pady=(4, 0))

        btn_frame = ctk.CTkFrame(hdr, fg_color="transparent")
        btn_frame.pack(side="right")
        make_button(
            btn_frame, "⟳  Actualizar",
            self.refresh, fg=C["bg_widget"], hover=C["bg_hover"],
            text_color=C["text_primary"], size="sm", height=32,
        ).pack(side="right", padx=(8, 0))
        make_button(
            btn_frame, "⊞  Cierre Fiscal (Reporte Z)",
            self._on_fiscal_closure,
            fg="#7a3500", hover="#a84b00",
            size="sm", height=32,
        ).pack(side="right")

    # ── tarjetas de métricas ─────────────────────────────────

    def _build_metrics_row(self) -> None:
        row = ctk.CTkFrame(self, fg_color="transparent")
        row.grid(row=1, column=0, sticky="nsew", padx=12, pady=10)
        for i in range(4):
            row.columnconfigure(i, weight=1, uniform="metric")

        cards_def = [
            ("ventas",  "Ventas Totales del Día",    C["card_ventas"]),
            ("igtf",    "IGTF Recaudado",             C["card_igtf"]),
            ("gastos",  "Gastos Operativos",           C["card_gastos"]),
            ("margen",  "Margen de Ganancia Neta",    C["card_margen"]),
        ]
        self._metric_cards: dict[str, MetricCard] = {}
        for col, (key, title, bg) in enumerate(cards_def):
            card = MetricCard(row, title, bg)
            card.grid(row=0, column=col, sticky="nsew",
                      padx=(0 if col == 0 else 6, 0))
            self._metric_cards[key] = card

    # ── gráficos Matplotlib ──────────────────────────────────

    def _build_charts_row(self) -> None:
        charts = ctk.CTkFrame(self, fg_color="transparent")
        charts.grid(row=2, column=0, sticky="nsew", padx=12, pady=(0, 6))
        charts.columnconfigure(0, weight=3)
        charts.columnconfigure(1, weight=2)
        charts.rowconfigure(0, weight=1)

        # — Contenedor gráfico líneas —
        self._frame_line = ctk.CTkFrame(
            charts, fg_color=C["bg_frame"], corner_radius=10,
            border_width=1, border_color=C["border"],
        )
        self._frame_line.grid(row=0, column=0, sticky="nsew", padx=(0, 6))

        # — Contenedor gráfico dona —
        self._frame_pie = ctk.CTkFrame(
            charts, fg_color=C["bg_frame"], corner_radius=10,
            border_width=1, border_color=C["border"],
        )
        self._frame_pie.grid(row=0, column=1, sticky="nsew")

    def _build_inventory_row(self) -> None:
        inv_wrapper = ctk.CTkFrame(
            self, fg_color=C["bg_frame"], corner_radius=10,
            border_width=1, border_color=C["border"],
        )
        inv_wrapper.grid(row=3, column=0, sticky="nsew", padx=12, pady=(0, 12))
        inv_wrapper.columnconfigure(0, weight=1)
        inv_wrapper.rowconfigure(1, weight=1)

        hdr2 = ctk.CTkFrame(inv_wrapper, fg_color="transparent")
        hdr2.grid(row=0, column=0, sticky="ew", padx=14, pady=(10, 0))
        make_label(hdr2, "CONTROL DE INVENTARIO",
                   size="md", bold=True, color=C["text_secondary"]).pack(side="left")
        make_label(hdr2, "  Verde = Suficiente  ·  Amarillo = Bajo  ·  Rojo = Agotado",
                   size="xs", color=C["text_muted"]).pack(side="left")

        self._inv_tree = self._build_inventory_treeview(inv_wrapper)

    def _build_inventory_treeview(self, parent) -> ttk.Treeview:
        style = ttk.Style()
        style.configure(
            "Inv.Treeview",
            background=C["bg_card"],
            foreground=C["text_primary"],
            fieldbackground=C["bg_card"],
            rowheight=24,
            font=(F, FONT_SIZES["sm"]),
            borderwidth=0,
        )
        style.configure(
            "Inv.Treeview.Heading",
            background=C["bg_widget"],
            foreground=C["text_secondary"],
            font=(F, FONT_SIZES["sm"], "bold"),
            borderwidth=0, relief="flat",
        )
        style.map("Inv.Treeview",
                  background=[("selected", C["accent_dark"])],
                  foreground=[("selected", "#ffffff")])

        # Tags de colores para el semáforo
        for tag, bg, fg in (
            (STOCK_SUFICIENTE, C["stock_suf_bg"], C["stock_suf_fg"]),
            (STOCK_BAJO,       C["stock_bajo_bg"], C["stock_bajo_fg"]),
            (STOCK_AGOTADO,    C["stock_ago_bg"],  C["stock_ago_fg"]),
        ):
            style.configure(f"Inv.{tag}.Treeview", background=bg, foreground=fg)

        cols = ("codigo", "descripcion", "categoria",
                "precio", "stock_actual", "stock_min", "estado")
        tree = ttk.Treeview(parent, columns=cols, show="headings", style="Inv.Treeview")

        heads = {
            "codigo":      ("Código",       90,  "center"),
            "descripcion": ("Descripción",  220, "w"),
            "categoria":   ("Categoría",    110, "w"),
            "precio":      ("Precio (Bs.)", 110, "e"),
            "stock_actual":("Stock Act.",    90, "center"),
            "stock_min":   ("Stock Mín.",    90, "center"),
            "estado":      ("Estado",        90, "center"),
        }
        for col, (head, width, anchor) in heads.items():
            tree.heading(col, text=head)
            tree.column(col, width=width, anchor=anchor,
                        stretch=(col == "descripcion"))

        vsb = ctk.CTkScrollbar(parent, command=tree.yview)
        vsb.grid(row=1, column=1, sticky="ns", pady=(4, 4))
        tree.configure(yscrollcommand=vsb.set)
        tree.grid(row=1, column=0, sticky="nsew", padx=(8, 0), pady=(4, 8))

        # Configurar tags de color directamente en el widget
        tree.tag_configure(STOCK_SUFICIENTE,
                           background=C["stock_suf_bg"], foreground=C["stock_suf_fg"])
        tree.tag_configure(STOCK_BAJO,
                           background=C["stock_bajo_bg"], foreground=C["stock_bajo_fg"])
        tree.tag_configure(STOCK_AGOTADO,
                           background=C["stock_ago_bg"], foreground=C["stock_ago_fg"])
        return tree

    # ── actualización de datos ───────────────────────────────

    def refresh(self) -> None:
        if not db.is_connected:
            return
        self._update_metrics()
        self._update_line_chart()
        self._update_pie_chart()
        self._update_inventory()

    def _update_metrics(self) -> None:
        m = self._proc.get_daily_metrics()
        tasa = db.get_current_rate()

        self._metric_cards["ventas"].update(
            f"Bs. {m['ventas_total_bs']:,.2f}",
            f"{m['cantidad_ventas']} facturas  ·  $ {m['ventas_total_bs']/tasa:,.2f} USD",
        )
        self._metric_cards["igtf"].update(
            f"Bs. {m['igtf_total_bs']:,.2f}",
            f"IGTF sobre divisas recaudado",
        )
        self._metric_cards["gastos"].update(
            f"Bs. {m['gastos_total_bs']:,.2f}",
            f"Gastos operativos del día",
        )
        margen = m["margen_neta_bs"]
        self._metric_cards["margen"].update(
            f"Bs. {margen:,.2f}",
            ("▲ Positivo" if margen >= 0 else "▼ Negativo"),
        )

    def _update_line_chart(self) -> None:
        df = self._proc.get_weekly_trend()
        for w in self._frame_line.winfo_children():
            w.destroy()

        fig, ax = plt.subplots(figsize=(5, 2.8))
        self._apply_mpl_theme(fig, ax)

        if not df.empty:
            labels = [str(d)[5:] for d in df["dia"]]   # MM-DD
            values = df["total_bs"].tolist()
            ax.plot(labels, values,
                    color=C["mpl_line"], linewidth=2.5,
                    marker="o", markersize=5,
                    markerfacecolor=C["mpl_line"], markeredgewidth=0)
            ax.fill_between(labels, values, alpha=0.12, color=C["mpl_line"])
            ax.yaxis.set_major_formatter(
                mticker.FuncFormatter(lambda x, _: f"Bs.\n{x:,.0f}"))
            ax.set_xticklabels(labels, rotation=30, ha="right")

        ax.set_title("Tendencia de Ventas — Últimos 7 días",
                     color=C["mpl_title"], fontsize=10, pad=8)
        fig.tight_layout(pad=1.2)
        self._embed_figure(fig, self._frame_line)

    def _update_pie_chart(self) -> None:
        df = self._proc.get_expenses_by_category()
        for w in self._frame_pie.winfo_children():
            w.destroy()

        fig, ax = plt.subplots(figsize=(3.4, 2.8))
        self._apply_mpl_theme(fig, ax)

        if not df.empty:
            wedge_props = {"width": 0.55, "edgecolor": C["bg_frame"], "linewidth": 2}
            ax.pie(
                df["total_bs"],
                labels=df["categoria"],
                colors=C["mpl_pie"][:len(df)],
                autopct="%1.1f%%",
                pctdistance=0.75,
                wedgeprops=wedge_props,
                textprops={"color": C["mpl_text"], "fontsize": 8},
                startangle=90,
            )
        ax.set_title("Gastos Operativos por Categoría",
                     color=C["mpl_title"], fontsize=10, pad=8)
        fig.tight_layout(pad=1.2)
        self._embed_figure(fig, self._frame_pie)

    def _update_inventory(self) -> None:
        for item in self._inv_tree.get_children():
            self._inv_tree.delete(item)

        df = self._proc.get_inventory_with_status()
        if df.empty:
            return

        for _, row in df.iterrows():
            estado = row["estado"]
            self._inv_tree.insert("", "end", tags=(estado,), values=(
                row["codigo"],
                row["descripcion"],
                row["categoria"],
                f"{float(row['precio_bs']):,.2f}",
                int(row["stock_actual"]),
                int(row["stock_minimo"]),
                estado.upper(),
            ))

    # ── cierre fiscal ────────────────────────────────────────

    def _on_fiscal_closure(self) -> None:
        if not db.is_connected:
            messagebox.showerror("Sin conexión", "No hay conexión con la base de datos.")
            return

        if db.fecha_tiene_cierre(date.today()):
            messagebox.showinfo(
                "Cierre ya ejecutado",
                f"Ya existe un Reporte Z para el {date.today().strftime('%d/%m/%Y')}.",
            )
            return

        data = self._proc.compute_fiscal_closure()
        if data is None:
            messagebox.showinfo("Sin ventas", "No hay ventas para procesar hoy.")
            return

        summary = (
            f"REPORTE Z — {data['fecha_cierre'].strftime('%d/%m/%Y')}\n"
            f"{'─'*38}\n"
            f"  Facturas emitidas:  {data['cantidad_facturas']}\n"
            f"  Ventas brutas:   Bs. {data['total_ventas_bs']:>12,.2f}\n"
            f"  IVA recaudado:   Bs. {data['total_iva_bs']:>12,.2f}\n"
            f"  IGTF recaudado:  Bs. {data['total_igtf_bs']:>12,.2f}\n"
            f"  Ventas netas:    Bs. {data['total_neto_bs']:>12,.2f}\n"
            f"  Gastos operativos: Bs. {data['total_gastos_bs']:>10,.2f}\n"
            f"{'─'*38}\n"
            f"  GANANCIA NETA:   Bs. {data['ganancia_neta_bs']:>12,.2f}\n\n"
            f"¿Desea ejecutar y guardar el cierre fiscal?"
        )
        if not messagebox.askyesno("Ejecutar Reporte Z", summary):
            return

        try:
            cid = db.save_fiscal_closure(**{k: v for k, v in data.items()})
            db.mark_sales_closed(data["fecha_cierre"], cid)
            messagebox.showinfo(
                "Cierre Ejecutado",
                "El Reporte Z fue guardado exitosamente en cierres_fiscales.",
            )
            self.refresh()
        except Exception as exc:
            logger.error("Error en cierre fiscal: %s", exc)
            messagebox.showerror("Error", str(exc))

    # ── helpers Matplotlib ───────────────────────────────────

    @staticmethod
    def _apply_mpl_theme(fig: Figure, ax) -> None:
        fig.patch.set_facecolor(C["mpl_bg"])
        ax.set_facecolor(C["mpl_axes_bg"])
        ax.tick_params(colors=C["mpl_text"], labelsize=7)
        ax.spines[:].set_color(C["mpl_grid"])
        ax.yaxis.set_tick_params(labelcolor=C["mpl_text"])
        ax.xaxis.set_tick_params(labelcolor=C["mpl_text"])
        ax.grid(axis="y", color=C["mpl_grid"], linestyle="--", linewidth=0.5, alpha=0.6)

    @staticmethod
    def _embed_figure(fig: Figure, parent) -> None:
        canvas = FigureCanvasTkAgg(fig, master=parent)
        canvas.draw()
        canvas.get_tk_widget().pack(fill="both", expand=True, padx=6, pady=6)
        plt.close(fig)


# ─────────────────────────────────────────────────────────────
# Ventana principal
# ─────────────────────────────────────────────────────────────

class SIGAApp(ctk.CTk):
    def __init__(self) -> None:
        super().__init__()
        self._configure_window()
        # Ocultar ventana principal hasta que el login sea exitoso
        self.withdraw()
        # Mostrar login; _on_login_success se llama si las credenciales son correctas
        LoginWindow(self, on_success=self._on_login_success)

    def _on_login_success(self) -> None:
        """Callback invocado por LoginWindow tras autenticación exitosa."""
        self._try_connect_db()
        self._build_ui()
        self.deiconify()   # mostrar la ventana principal

    def _configure_window(self) -> None:
        self.title(WINDOW_TITLE)
        self.geometry(WINDOW_SIZE)
        self.minsize(WINDOW_MIN_W, WINDOW_MIN_H)
        self.configure(fg_color=C["bg_root"])

        # Icono (opcional — coloca siga_icon.ico en la misma carpeta)
        try:
            self.iconbitmap("siga_icon.ico")
        except Exception:
            pass

    def _try_connect_db(self) -> None:
        ok = db.connect()
        if not ok:
            messagebox.showwarning(
                "Sin conexión a MySQL",
                "No se pudo conectar a la base de datos.\n"
                "El sistema iniciará en modo demostración (sin datos reales).\n\n"
                "Verifique las credenciales en config.py.",
            )

    def _build_ui(self) -> None:
        # — Barra de título personalizada —
        titlebar = ctk.CTkFrame(self, fg_color=C["bg_frame"],
                                height=46, corner_radius=0)
        titlebar.pack(fill="x", side="top")
        titlebar.pack_propagate(False)

        make_label(
            titlebar, "  ⬡ SIGA", size="lg", bold=True, color=C["accent"]
        ).pack(side="left", padx=8)
        make_label(
            titlebar,
            "Sistema Integral de Gestión de Impuestos y Ganancias",
            size="sm", color=C["text_muted"],
        ).pack(side="left")
        make_label(
            titlebar,
            f"  v1.0  ·  {date.today().strftime('%d/%m/%Y')}",
            size="xs", color=C["text_muted"],
        ).pack(side="right", padx=12)

        conn_text = "● Conectado" if db.is_connected else "● Sin conexión"
        conn_color = C["stock_suf_fg"] if db.is_connected else C["stock_ago_fg"]
        make_label(titlebar, conn_text, size="sm",
                   color=conn_color).pack(side="right", padx=(0, 4))

        # — Tab view —
        tabs = ctk.CTkTabview(
            self,
            fg_color=C["bg_root"],
            segmented_button_fg_color=C["bg_frame"],
            segmented_button_selected_color=C["accent"],
            segmented_button_selected_hover_color=C["accent_hover"],
            segmented_button_unselected_color=C["bg_frame"],
            segmented_button_unselected_hover_color=C["bg_hover"],
            text_color=C["text_primary"],
            text_color_disabled=C["text_muted"],
            border_width=0,
        )
        tabs.pack(fill="both", expand=True, padx=0, pady=0)

        tabs.add("  Punto de Venta  ")
        tabs.add("  Dashboard Gerencial  ")

        POSTab(tabs.tab("  Punto de Venta  ")).pack(fill="both", expand=True)
        DashboardTab(tabs.tab("  Dashboard Gerencial  ")).pack(fill="both", expand=True)

    def on_close(self) -> None:
        db.disconnect()
        plt.close("all")
        self.destroy()


# ─────────────────────────────────────────────────────────────
# Punto de entrada
# ─────────────────────────────────────────────────────────────

if __name__ == "__main__":
    app = SIGAApp()
    app.protocol("WM_DELETE_WINDOW", app.on_close)
    app.mainloop()
