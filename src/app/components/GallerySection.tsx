import abastoImg   from "../../imports/Abasto.jpg";
import interiorImg from "../../imports/Interior_del_Abasto.jpg";

export function GallerySection() {
  return (
    <section id="galeria" className="py-20 px-6 md:px-16" style={{ background: "#fff8f0" }}>

      {/* Encabezado */}
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "#fff0e0", color: "#c25e00", letterSpacing: 1 }}>
          NUESTRO LOCAL
        </span>
        <h2 style={{ color: "#1a0500", fontSize: 36, fontWeight: 800 }}>Conoce Invergica</h2>
        <p style={{ color: "#7a4020", fontSize: 15, marginTop: 10, maxWidth: 480, margin: "10px auto 0" }}>
          Así luce nuestra tienda por dentro y por fuera. Ven a visitarnos.
        </p>
      </div>

      <div className="max-w-5xl mx-auto flex flex-col gap-5">

        {/* Exterior + Interior */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="relative rounded-2xl overflow-hidden group"
            style={{ height: 340, border: "2px solid #e07b00" }}>
            <img src={abastoImg} alt="Fachada exterior de Invergica"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(26,5,0,0.75) 0%, transparent 55%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-2"
                style={{ background: "#e07b00", color: "#fff" }}>FACHADA EXTERIOR</span>
              <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Nuestra tienda</p>
              <p style={{ color: "#f5c68a", fontSize: 13 }}>Maracaibo, Venezuela</p>
            </div>
          </div>

          <div className="relative rounded-2xl overflow-hidden group"
            style={{ height: 340, border: "2px solid #cc2200" }}>
            <img src={interiorImg} alt="Interior de Invergica"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(to top, rgba(26,5,0,0.75) 0%, transparent 55%)" }} />
            <div className="absolute bottom-0 left-0 right-0 p-5">
              <span className="inline-block px-2 py-0.5 rounded text-xs font-bold mb-2"
                style={{ background: "#cc2200", color: "#fff" }}>INTERIOR DEL ABASTO</span>
              <p style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>Variedad de productos</p>
              <p style={{ color: "#f5c68a", fontSize: 13 }}>Todo lo que necesitas en un solo lugar</p>
            </div>
          </div>
        </div>

        {/* Tarjetas de características — sin "Venta de Pollos", 3 tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          {[
            {
              icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
              label: "Víveres en General",
            },
            {
              icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
              label: "Lun – Sáb · 8:00 am – 7:00 pm",
            },
            {
              icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z",
              label: "Maracaibo, Venezuela",
            },
          ].map((item) => (
            <div key={item.label}
              className="rounded-xl p-5 flex flex-col items-center text-center gap-3"
              style={{ background: "#1a0500", border: "1px solid #5a1a00" }}>
              <div className="w-11 h-11 rounded-full flex items-center justify-center"
                style={{ background: "rgba(224,123,0,0.15)", border: "1.5px solid #e07b00" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="#f5a623" strokeWidth="1.8">
                  <path d={item.icon} />
                </svg>
              </div>
              <p style={{ color: "#f5c68a", fontSize: 13, fontWeight: 600 }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
