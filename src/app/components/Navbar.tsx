import logoImg from "../../imports/Logo.jpg";

interface NavbarProps {
  onLogout?: () => void;
}

export function Navbar({ onLogout }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 h-16"
      style={{ background: "#1a0500", borderBottom: "2px solid #e07b00" }}
    >
      {/* Logo real + nombre */}
      <a href="#inicio" className="flex items-center gap-3">
        <img
          src={logoImg}
          alt="Logo Invergica"
          className="rounded-full object-cover"
          style={{ width: 46, height: 46, border: "2px solid #e07b00" }}
        />
        <div>
          <span style={{ color: "#f5a623", fontSize: 19, fontWeight: 900, letterSpacing: 2 }}>
            INVERGICA
          </span>
          <p style={{ color: "#c26f30", fontSize: 10, letterSpacing: 1, marginTop: -2 }}>
            TU MULTITIENDA FAVORITA
          </p>
        </div>
      </a>

      {/* Links de navegación */}
      <div className="hidden md:flex items-center gap-7">
        {["Inicio", "Galería", "Documentos", "Impuestos", "Contacto"].map((item) => (
          <a
            key={item}
            href={`#${item.toLowerCase().replace("í", "i").replace("é", "e")}`}
            className="transition-opacity hover:opacity-70"
            style={{ color: "#f5c68a", fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}
          >
            {item}
          </a>
        ))}
      </div>

      {/* Derecha: WhatsApp + Cerrar sesión */}
      <div className="flex items-center gap-3">
        <a
          href="https://wa.me/584141667535"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all hover:opacity-85"
          style={{ background: "#25d366", color: "#ffffff", fontSize: 13 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          WhatsApp
        </a>

        {onLogout && (
          <button
            onClick={onLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ background: "#2a0a00", color: "#8a5a30", border: "1px solid #3a1200", fontSize: 12 }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Salir
          </button>
        )}
      </div>
    </nav>
  );
}
