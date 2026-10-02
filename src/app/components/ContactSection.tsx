export function ContactSection() {
  const mapsUrl   = "https://maps.app.goo.gl/sD1p8J5QZaA3dtvs7";
  const waNumber  = "584141667535";
  const waDisplay = "+58 414-166-7535";

  return (
    <section id="contacto" className="py-20 px-6 md:px-16"
      style={{ background: "#0d0300" }}>

      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">

          {/* ── Columna izquierda — datos de contacto ── */}
          <div>
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-4"
              style={{ background: "rgba(224,123,0,0.15)", color: "#f5a623", letterSpacing: 1 }}
            >
              CONTACTO
            </span>
            <h2 style={{ color: "#ffffff", fontSize: 36, fontWeight: 800, lineHeight: 1.2 }}>
              Estamos aquí
              <br />
              para ti
            </h2>
            <p style={{ color: "#c26f30", fontSize: 15, marginTop: 12, lineHeight: 1.7 }}>
              Escríbenos por WhatsApp para preguntar por precios,
              disponibilidad y pedidos. ¡Respondemos rápido!
            </p>

            <div className="mt-8 flex flex-col gap-6">

              {/* WhatsApp */}
              <div className="flex gap-4 items-start">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(37,211,102,0.12)", border: "1.5px solid #25d366" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#25d366">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: "#25d366", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
                    WHATSAPP
                  </p>
                  <a
                    href={`https://wa.me/${waNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#f5e0c0", fontSize: 17, fontWeight: 700 }}
                    className="hover:underline"
                  >
                    {waDisplay}
                  </a>
                  <p style={{ color: "#6a3a10", fontSize: 12, marginTop: 2 }}>
                    Precios, disponibilidad y pedidos
                  </p>
                </div>
              </div>

              {/* Dirección */}
              <div className="flex gap-4 items-start">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(224,123,0,0.12)", border: "1.5px solid #e07b00" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#f5a623" strokeWidth="1.8">
                    <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: "#f5a623", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
                    DIRECCIÓN
                  </p>
                  <p style={{ color: "#f5e0c0", fontSize: 14, marginTop: 2, lineHeight: 1.6 }}>
                    Av. 13, Entre calles 67 y 67A
                    <br />
                    C. 67, Maracaibo 4001, Zulia
                  </p>
                </div>
              </div>

              {/* Horario */}
              <div className="flex gap-4 items-start">
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(204,34,0,0.12)", border: "1.5px solid #cc2200" }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                    stroke="#ff6b35" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div>
                  <p style={{ color: "#ff6b35", fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }}>
                    HORARIO DE ATENCIÓN
                  </p>
                  <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: "#e07b00", color: "#fff" }}
                      >
                        Lun – Sáb
                      </span>
                      <span style={{ color: "#f5e0c0", fontSize: 14 }}>8:00 am – 7:00 pm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-xs font-bold"
                        style={{ background: "#3a1200", color: "#8a5a30" }}
                      >
                        Domingo
                      </span>
                      <span style={{ color: "#6a3a10", fontSize: 14 }}>Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Botón grande WhatsApp */}
            <a
              href={`https://wa.me/${waNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 flex items-center justify-center gap-3 py-4 rounded-xl font-bold transition-all hover:opacity-85"
              style={{ background: "#25d366", color: "#fff", fontSize: 16 }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Escríbenos por WhatsApp
            </a>
          </div>

          {/* ── Columna derecha — Mapa ── */}
          <div className="flex flex-col gap-4">
            <div
              className="rounded-2xl overflow-hidden flex flex-col"
              style={{ border: "2px solid #5a1a00" }}
            >
              {/* Header */}
              <div
                className="px-5 py-3 flex items-center gap-3"
                style={{ background: "#1a0500" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#f5a623" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span style={{ color: "#f5a623", fontSize: 13, fontWeight: 700 }}>
                  UBICACIÓN — MARACAIBO, ZULIA
                </span>
              </div>

              {/* Mapa body */}
              <div
                className="relative flex flex-col items-center justify-center gap-5 py-12 px-6"
                style={{ background: "linear-gradient(135deg, #0d0300 0%, #1a0500 100%)", minHeight: 260 }}
              >
                <div className="relative">
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(224,123,0,0.12)", border: "2px solid #e07b00" }}
                  >
                    <svg width="44" height="44" viewBox="0 0 24 24" fill="none"
                      stroke="#f5a623" strokeWidth="1.5">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ background: "#e07b00" }}
                  />
                </div>

                <div className="text-center">
                  <p style={{ color: "#f5e0c0", fontSize: 16, fontWeight: 700 }}>Invergica</p>
                  <p style={{ color: "#8a5a30", fontSize: 13, marginTop: 4 }}>
                    Av. 13, entre calles 67 y 67A
                  </p>
                  <p style={{ color: "#6a3a10", fontSize: 12, marginTop: 2 }}>
                    Maracaibo 4001, Zulia
                  </p>
                </div>

                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-7 py-3 rounded-xl font-bold transition-all hover:opacity-85 w-full justify-center"
                  style={{ background: "#e07b00", color: "#fff", fontSize: 15 }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Ver en Google Maps
                </a>
                <p style={{ color: "#4a2010", fontSize: 11, textAlign: "center" }}>
                  Toca el botón para abrir la ubicación exacta
                </p>
              </div>
            </div>

            {/* Info rápida */}
            <div
              className="rounded-xl p-4 flex items-center gap-4"
              style={{ background: "#1a0500", border: "1px solid #3a1200" }}
            >
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: "rgba(255,107,53,0.12)", border: "1px solid #cc2200" }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#ff6b35" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v4l3 3" />
                </svg>
              </div>
              <div>
                <p style={{ color: "#f5a623", fontSize: 12, fontWeight: 700 }}>
                  Lun – Sáb · 8:00 am – 7:00 pm
                </p>
                <p style={{ color: "#6a3a10", fontSize: 12 }}>
                  Tu multitienda en Maracaibo
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
