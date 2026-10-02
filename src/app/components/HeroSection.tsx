import abastoImg from "../../imports/Abasto.jpg";

export function HeroSection() {
  return (
    <section id="inicio" className="relative w-full" style={{ height: 600, marginTop: 64 }}>

      {/* Imagen exterior del abasto */}
      <div className="absolute inset-0">
        <img
          src={abastoImg}
          alt="Fachada de Invergica"
          className="w-full h-full object-cover object-center"
        />
        {/* Overlay naranja-rojo oscuro */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, rgba(26,5,0,0.90) 0%, rgba(80,20,0,0.70) 55%, rgba(26,5,0,0.50) 100%)",
          }}
        />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col justify-center h-full px-10 md:px-20 max-w-3xl">
        <div
          className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full w-fit"
          style={{ background: "rgba(224,123,0,0.18)", border: "1px solid #e07b00" }}
        >
          <span style={{ color: "#f5a623", fontSize: 12, fontWeight: 700, letterSpacing: 1 }}>
            ● ABASTO
          </span>
        </div>

        <h1
          style={{
            color: "#ffffff",
            fontSize: 50,
            fontWeight: 900,
            lineHeight: 1.08,
            marginBottom: 20,
          }}
        >
          Invergica
          <br />
          <span style={{ color: "#f5a623" }}>tu multitienda</span>
          <br />
          <span style={{ color: "#ff6b35" }}>favorita</span>
        </h1>

        <p style={{ color: "#f5c68a", fontSize: 16, lineHeight: 1.7, maxWidth: 460, marginBottom: 34 }}>
          Encuentra todo lo que necesitas para tu hogar.
          Escríbenos por WhatsApp y te atendemos de inmediato.
        </p>

        <div className="flex gap-4 flex-wrap">
          <a
            href="https://wa.me/584141667535"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-7 py-3 rounded-lg font-bold transition-all hover:opacity-85"
            style={{ background: "#e07b00", color: "#ffffff", fontSize: 15 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            Contáctanos
          </a>
          <a
            href="#galeria"
            className="px-7 py-3 rounded-lg font-semibold transition-all hover:bg-white/10"
            style={{ border: "2px solid #f5a623", color: "#f5a623", fontSize: 15 }}
          >
            Ver el Local
          </a>
        </div>
      </div>
    </section>
  );
}
