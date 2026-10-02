import logoImg from "../../imports/Logo.jpg";

export function Footer() {
  return (
    <footer style={{ background: "#060100", borderTop: "1px solid #3a1200" }}>
      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Logo y tagline */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img
                src={logoImg}
                alt="Logo Invergica"
                className="rounded-full object-cover"
                style={{ width: 52, height: 52, border: "2px solid #e07b00" }}
              />
              <div>
                <span style={{ color: "#f5a623", fontSize: 17, fontWeight: 900, letterSpacing: 2 }}>
                  INVERGICA
                </span>
                <p style={{ color: "#8a4a10", fontSize: 10, letterSpacing: 1 }}>
                  TU MULTITIENDA FAVORITA
                </p>
              </div>
            </div>
            <p style={{ color: "#5a2a10", fontSize: 13, lineHeight: 1.6 }}>
              Tu multitienda de confianza en Maracaibo.
              Atención directa al cliente.
            </p>
          </div>

          {/* Navegación */}
          <div>
            <p style={{ color: "#f5a623", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              NAVEGACIÓN
            </p>
            <div className="flex flex-col gap-2">
              {[
                { label: "Inicio",      href: "#inicio" },
                { label: "Galería",     href: "#galeria" },
                { label: "Documentos",  href: "#documentos" },
                { label: "Contacto",    href: "#contacto" },
              ].map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  style={{ color: "#5a2a10", fontSize: 13 }}
                  className="hover:text-orange-400 transition-colors"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </div>

          {/* Contacto rápido */}
          <div>
            <p style={{ color: "#f5a623", fontSize: 12, fontWeight: 700, letterSpacing: 1, marginBottom: 12 }}>
              CONTÁCTANOS
            </p>
            <a
              href="https://wa.me/584141667535"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 mb-3 hover:opacity-75 transition-opacity"
              style={{ color: "#25d366", fontSize: 14, fontWeight: 600 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              +58 414-166-7535
            </a>
            <p style={{ color: "#5a2a10", fontSize: 12 }}>
              Lun–Sáb: 8am – 7pm
              <br />
              Dom: Cerrado
            </p>
          </div>
        </div>

        {/* Línea base */}
        <div
          className="mt-8 pt-6 flex flex-col md:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid #2a0a00" }}
        >
          <p style={{ color: "#3a1200", fontSize: 12 }}>
            © 2025 Invergica · RIF J-413252619. Todos los derechos reservados.
          </p>
          <p style={{ color: "#3a1200", fontSize: 11 }}>
            Gestionado con SIGA · Sistema Integral de Gestión
          </p>
        </div>
      </div>
    </footer>
  );
}
