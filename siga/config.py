# ============================================================
# SIGA - Configuración central
# ============================================================
#
# Las credenciales (BD y administrador) NO van en el código.
# Se leen desde variables de entorno / archivo .env (ver siga/.env.example).
# Este archivo SÍ se versiona; el archivo .env NO (ver .gitignore).
# ============================================================

import os

# Carga opcional de un archivo .env (si python-dotenv está instalado).
# Si no está, se usan las variables de entorno del sistema igualmente.
try:
    from dotenv import load_dotenv
    load_dotenv()  # busca un .env en el directorio de trabajo / siga/
except ImportError:
    pass


def _env(nombre, por_defecto=None):
    """Lee una variable de entorno; usa un valor por defecto si no existe."""
    return os.getenv(nombre, por_defecto)


def _env_int(nombre, por_defecto):
    """Lee una variable de entorno numérica de forma segura."""
    valor = os.getenv(nombre)
    try:
        return int(valor) if valor not in (None, "") else por_defecto
    except (TypeError, ValueError):
        return por_defecto


# --- Base de datos (valores reales en siga/.env) ---
DB_CONFIG = {
    "host":            _env("DB_HOST", "localhost"),
    "port":            _env_int("DB_PORT", 3306),
    "user":            _env("DB_USER", "root"),
    "password":        _env("DB_PASSWORD", ""),
    "database":        _env("DB_NAME", "siga_db"),
    "charset":         "utf8mb4",
    "autocommit":      False,
    "connect_timeout": 5,
}

# --- Credenciales del administrador (Módulo A: Autenticación) ---
# Se definen en siga/.env como ADMIN_EMAIL y ADMIN_PASSWORD.
ADMIN_EMAIL    = _env("ADMIN_EMAIL", "")
ADMIN_PASSWORD = _env("ADMIN_PASSWORD", "")

# Aviso temprano si faltan credenciales de administrador (no detiene la app).
if not ADMIN_EMAIL or not ADMIN_PASSWORD:
    import warnings
    warnings.warn(
        "ADMIN_EMAIL / ADMIN_PASSWORD no estan definidos. "
        "Copia siga/.env.example a siga/.env y completa los valores.",
        RuntimeWarning,
    )

# --- Parámetros fiscales ---
IVA_RATE     = 0.16   # 16 %
IGTF_RATE    = 0.03   # 3 % (solo pagos en divisas)

# --- Semáforo de vencimiento de lotes (DFD 3.3.3) ---
LOTE_ROJO_DIAS     = 0    # vencido o vence hoy (≤ 0 días)
LOTE_AMARILLO_DIAS = 30   # próximo a vencer (1–30 días)

# --- Umbrales de stock (semáforo) ---
STOCK_SUFICIENTE = "suficiente"   # stock_actual >= stock_minimo
STOCK_BAJO       = "bajo"         # 0 < stock_actual < stock_minimo
STOCK_AGOTADO    = "agotado"      # stock_actual == 0

# --- Paleta de colores (tema oscuro financiero) ---
COLORS = {
    # Fondos
    "bg_root":       "#0d1117",
    "bg_frame":      "#161b22",
    "bg_card":       "#1c2128",
    "bg_widget":     "#21262d",
    "bg_entry":      "#0d1117",
    "bg_hover":      "#2d333b",

    # Acento principal
    "accent":        "#388bfd",
    "accent_hover":  "#58a6ff",
    "accent_dark":   "#1f6feb",

    # Texto
    "text_primary":  "#e6edf3",
    "text_secondary":"#8b949e",
    "text_muted":    "#6e7681",
    "text_on_accent":"#ffffff",

    # Bordes
    "border":        "#30363d",
    "border_focus":  "#388bfd",

    # Semáforo de stock
    "stock_suf_bg":  "#1a3a2a",
    "stock_suf_fg":  "#56d364",
    "stock_bajo_bg": "#3a2e00",
    "stock_bajo_fg": "#e3b341",
    "stock_ago_bg":  "#3a1a1a",
    "stock_ago_fg":  "#f85149",

    # Métricas / tarjetas
    "card_ventas":   "#1f3a5f",
    "card_igtf":     "#3a1f5f",
    "card_gastos":   "#3a2a1f",
    "card_margen":   "#1f3a2a",

    # Matplotlib
    "mpl_bg":        "#161b22",
    "mpl_axes_bg":   "#1c2128",
    "mpl_line":      "#388bfd",
    "mpl_line2":     "#56d364",
    "mpl_grid":      "#30363d",
    "mpl_text":      "#8b949e",
    "mpl_title":     "#e6edf3",
    "mpl_pie": [
        "#388bfd", "#56d364", "#e3b341",
        "#f85149", "#79c0ff", "#a5d6ff",
        "#d2a8ff", "#ffa657",
    ],
}

# --- Tipografía ---
FONT_FAMILY  = "Segoe UI"
FONT_SIZES   = {
    "xs":    10,
    "sm":    11,
    "md":    12,
    "lg":    14,
    "xl":    16,
    "xxl":   22,
    "hero":  32,
}

# --- Ventana principal ---
WINDOW_TITLE  = "SIGA — Sistema Integral de Gestión de Impuestos y Ganancias"
WINDOW_MIN_W  = 1280
WINDOW_MIN_H  = 780
WINDOW_SIZE   = "1400x860"
