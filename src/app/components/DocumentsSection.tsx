import { VentasPanel }    from "./VentasPanel";
import { InventarioPanel } from "./InventarioPanel";

export function DocumentsSection() {
  return (
    <section id="documentos" className="py-20 px-6 md:px-16"
      style={{ background: "#1a0500" }}>

      {/* Encabezado */}
      <div className="text-center mb-12">
        <span
          className="inline-block px-3 py-1 rounded-full text-xs font-bold mb-3"
          style={{ background: "rgba(224,123,0,0.15)", color: "#f5a623", letterSpacing: 1 }}
        >
          REPORTES DEL SISTEMA A2
        </span>
        <h2 style={{ color: "#ffffff", fontSize: 36, fontWeight: 800 }}>
          Mis Reportes del Negocio
        </h2>
        <p style={{ color: "#c26f30", fontSize: 15, marginTop: 10, maxWidth: 560, margin: "10px auto 0" }}>
          Arrastra el PDF que exporta tu sistema A2 en cada tarjeta.
          Los resultados aparecen automáticamente.
        </p>
      </div>

      {/* ── Paneles lado a lado ── */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas del Día — con gráfica de barras */}
        <VentasPanel />

        {/* Inventario — con semáforo de stock */}
        <InventarioPanel />
      </div>

      {/* ── Nota general ── */}
      <div
        className="max-w-5xl mx-auto mt-8 rounded-2xl p-5 flex gap-4"
        style={{ background: "rgba(224,123,0,0.06)", border: "1px solid rgba(224,123,0,0.2)" }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#f5a623" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 800, marginBottom: 4 }}>
            📌 Nota para el dueño
          </p>
          <p style={{ color: "#8a5a30", fontSize: 12, lineHeight: 1.7 }}>
            Los archivos <strong style={{ color: "#c26f30" }}>PDF que genera tu sistema A2</strong> se leen
            directamente aquí sin necesidad de técnicos. Simplemente arrástralos encima de la tarjeta
            correspondiente. Si el PDF no se lee correctamente, verifica que sea el reporte
            exportado desde A2 y no una imagen o captura de pantalla.
            <br /><br />
            Los datos que muestran son solo de ese PDF — no se guardan en internet ni se comparten con nadie.
          </p>
        </div>
      </div>
    </section>
  );
}
