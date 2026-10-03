"""
Inyecta stubs mínimos de todas las dependencias externas en sys.modules
antes de que cualquier módulo SIGA se importe.

Uso:
    import tests.mock_deps  # en la primera línea de cada test file
"""

import sys
import types
import os

# ── Credenciales de PRUEBA por entorno ───────────────────────────────────────
# config.py ahora lee las credenciales desde variables de entorno y aborta si
# faltan. Para que la suite completa (77 pruebas) se ejecute sin un .env real,
# fijamos aqui valores FICTICIOS de prueba (NUNCA las credenciales reales).
# Se usa setdefault para no pisar un entorno ya configurado por el equipo/CI.
os.environ.setdefault("ADMIN_EMAIL", "test.admin@invergica.local")
os.environ.setdefault("ADMIN_PASSWORD", "TestPass2026")
os.environ.setdefault("DB_HOST", "localhost")
os.environ.setdefault("DB_PORT", "3306")
os.environ.setdefault("DB_USER", "siga_test")
os.environ.setdefault("DB_PASSWORD", "test_db_pass")
os.environ.setdefault("DB_NAME", "siga_db")

# ── helpers ────────────────────────────────────────────────────────────────

def _stub(name: str, **attrs) -> types.ModuleType:
    """Crea un módulo stub con atributos arbitrarios."""
    m = types.ModuleType(name)
    for k, v in attrs.items():
        setattr(m, k, v)
    sys.modules.setdefault(name, m)
    return m


def _class_stub(name: str = "Stub"):
    """Genera una clase que acepta cualquier init/args silenciosamente."""
    return type(name, (), {
        "__init__": lambda self, *a, **kw: None,
        "__getattr__": lambda self, _: (lambda *a, **kw: None),
    })


# ── numpy ───────────────────────────────────────────────────────────────────

np_mod = _stub("numpy", nan=float("nan"), inf=float("inf"))
np_mod.select = lambda conditions, choices, default=0: default
np_mod.where  = lambda cond, x, y: x if cond else y
np_mod.array  = list
sys.modules.setdefault("numpy", np_mod)

# ── pandas ──────────────────────────────────────────────────────────────────

class _FakeDF:
    """DataFrame mínimo para que CartProcessor/DashboardProcessor no exploten."""
    def __init__(self, data=None, columns=None):
        self._rows = data or []
        self._cols = columns or []

    @property
    def empty(self): return len(self._rows) == 0

    def iterrows(self): return iter([])
    def __len__(self): return len(self._rows)
    def __getitem__(self, key): return []
    def __setitem__(self, key, val): pass

    def apply(self, fn, axis=None): return self

    @property
    def iloc(self): return self

    def tolist(self): return self._rows
    def sum(self): return 0
    def count(self): return 0

pd_mod = _stub("pandas")
pd_mod.DataFrame = _FakeDF
pd_mod.to_numeric = lambda s, errors="coerce": 0
pd_mod.np = np_mod
sys.modules.setdefault("pandas", pd_mod)
sys.modules.setdefault("pd", pd_mod)

# ── customtkinter ────────────────────────────────────────────────────────────

_CTkBase = _class_stub("CTkBase")
_CTkWidget = type("CTkWidget", (_CTkBase,), {
    "pack":       lambda self, *a, **kw: None,
    "grid":       lambda self, *a, **kw: None,
    "configure":  lambda self, **kw: None,
    "pack_propagate": lambda self, *a, **kw: None,
    "winfo_children": lambda self: [],
    "destroy":    lambda self: None,
    "grab_set":   lambda self: None,
    "grab_release": lambda self: None,
    "focus_set":  lambda self: None,
    "deiconify":  lambda self: None,
    "withdraw":   lambda self: None,
    "protocol":   lambda self, *a, **kw: None,
    "mainloop":   lambda self: None,
})

ctk_mod = _stub("customtkinter")
for _name in ("CTk","CTkToplevel","CTkFrame","CTkLabel","CTkButton",
              "CTkEntry","CTkCheckBox","CTkSwitch","CTkScrollbar",
              "CTkTabview","CTkScrollableFrame"):
    setattr(ctk_mod, _name, _CTkWidget)
ctk_mod.BooleanVar = _class_stub("BooleanVar")
ctk_mod.StringVar  = _class_stub("StringVar")
ctk_mod.set_appearance_mode    = lambda *a: None
ctk_mod.set_default_color_theme = lambda *a: None
sys.modules.setdefault("customtkinter", ctk_mod)

# ── tkinter ──────────────────────────────────────────────────────────────────

tk_mod = _stub("tkinter")
tk_mod.Frame        = _CTkWidget
tk_mod.BooleanVar   = _class_stub("BooleanVar")
tk_mod.StringVar    = _class_stub("StringVar")
tk_mod.messagebox   = _stub("tkinter.messagebox",
    showinfo=lambda *a, **kw: None,
    showerror=lambda *a, **kw: None,
    showwarning=lambda *a, **kw: None,
    askyesno=lambda *a, **kw: True,
)
tk_mod.ttk = _stub("tkinter.ttk",
    Treeview=_CTkWidget,
    Style=_class_stub("Style"),
    Scrollbar=_CTkWidget,
)
sys.modules.setdefault("tkinter", tk_mod)
sys.modules.setdefault("tkinter.messagebox", tk_mod.messagebox)
sys.modules.setdefault("tkinter.ttk", tk_mod.ttk)

# ── matplotlib ───────────────────────────────────────────────────────────────

_mpl      = _stub("matplotlib")
_mpl_plt  = _stub("matplotlib.pyplot",
    subplots=lambda *a, **kw: (_stub("fig"), _stub("ax")),
    close=lambda *a: None,
)
_mpl_fig  = _stub("matplotlib.figure", Figure=_class_stub("Figure"))
_mpl_back = _stub("matplotlib.backends.backend_tkagg",
    FigureCanvasTkAgg=_class_stub("FigureCanvasTkAgg"))
_mpl_tick = _stub("matplotlib.ticker",
    FuncFormatter=lambda fn: fn)
_mpl.use  = lambda *a: None
sys.modules.setdefault("matplotlib",                    _mpl)
sys.modules.setdefault("matplotlib.pyplot",             _mpl_plt)
sys.modules.setdefault("matplotlib.figure",             _mpl_fig)
sys.modules.setdefault("matplotlib.backends",           _stub("matplotlib.backends"))
sys.modules.setdefault("matplotlib.backends.backend_tkagg", _mpl_back)
sys.modules.setdefault("matplotlib.ticker",             _mpl_tick)

# ── mysql.connector ──────────────────────────────────────────────────────────

_mysql_err = type("Error", (Exception,), {})
_mysql_mod = _stub("mysql")
_mysql_conn = _stub("mysql.connector", Error=_mysql_err,
    connect=lambda **kw: None)
_mysql_mod.connector = _mysql_conn
sys.modules.setdefault("mysql",           _mysql_mod)
sys.modules.setdefault("mysql.connector", _mysql_conn)
