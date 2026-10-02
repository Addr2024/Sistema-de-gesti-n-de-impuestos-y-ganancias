import { ImageZone } from "./ImageZone";

const PRODUCTS = [
  { name: "Granos y Cereales",    desc: "Arroz, caraotas, lentejas, avena" },
  { name: "Lácteos y Derivados",  desc: "Leche, queso, mantequilla, yogur" },
  { name: "Aceites y Condimentos",desc: "Aceite, sal, azúcar, harina" },
  { name: "Higiene Personal",     desc: "Jabón, shampoo, papel higiénico" },
  { name: "Bebidas",              desc: "Jugos, refrescos, agua, café" },
  { name: "Limpieza del Hogar",   desc: "Detergente, cloro, desengrasante" },
];

export function ProductsSection() {
  return (
    <section id="productos" className="py-20 px-6 md:px-16"
      style={{ background: "#f8faf8" }}>

      {/* Encabezado */}
      <div className="text-center mb-14">
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "#e8f5ea", color: "#1a5e28", letterSpacing: 1 }}>
          NUESTROS PRODUCTOS
        </span>
        <h2 style={{ color: "#0f2d1a", fontSize: 36, fontWeight: 800 }}>
          Catálogo de Categorías
        </h2>
        <p style={{ color: "#5a7a5e", fontSize: 16, marginTop: 10, maxWidth: 520, margin: "10px auto 0" }}>
          Cada categoría tiene su espacio para imagen y descripción.
          Sustituye las zonas marcadas por fotos reales de tus productos.
        </p>
      </div>

      {/* Grid de categorías */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PRODUCTS.map((cat, i) => (
          <div key={cat.name} className="rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            style={{ background: "#ffffff", border: "1px solid #e0eee2" }}>

            {/* Zona de imagen del producto */}
            <ImageZone
              label={`Imagen — ${cat.name}`}
              description="Foto representativa de la categoría"
              recommendedSize="800×600 px · JPG/PNG/WEBP"
              index={i}
              aspectRatio="16/9"
            />

            {/* Info */}
            <div className="p-4">
              <h3 style={{ color: "#0f2d1a", fontSize: 15, fontWeight: 700 }}>
                {cat.name}
              </h3>
              <p style={{ color: "#6a9a6e", fontSize: 13, marginTop: 3 }}>
                {cat.desc}
              </p>
              <button className="mt-3 w-full py-2 rounded-lg text-sm font-semibold transition-all hover:opacity-80"
                style={{ background: "#e8f5ea", color: "#1a5e28" }}>
                Ver productos →
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
