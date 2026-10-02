import { useState } from "react";
import { FileDropZone } from "./FileDropZone";
import {
  leerInventarioPdf, resumenInventario, estadoStock,
  type ProductoInventario,
} from "../utils/pdfParser";

type Estado = "suficiente" | "bajo" | "agotado";

const SEMAFORO: Record<Estado, { bg: string; border: string; text: string; etiqueta: string }> = {
  suficiente: { bg: "#0d2e14", border: "#22c55e", text: "#4ade80", etiqueta: "✅ OK"      },
  bajo:       { bg: "#2e1f00", border: "#eab308", text: "#facc15", etiqueta: "⚠️ BAJO"    },
  agotado:    { bg: "#2e0a0a", border: "#ef4444", text: "#f87171", etiqueta: "🚨 AGOTADO" },
};

function LuzSemaforo({ estado }: { estado: Estado }) {
  return (
    <div className="flex gap-2 items-center">
      {(["suficiente", "bajo", "agotado"] as Estado[]).map((e) => (
        <div key={e} className="w-5 h-5 rounded-full transition-all duration-300"
          style={{
            background: estado === e ? SEMAFORO[e].border : "#1a0a00",
            boxShadow:  estado === e ? `0 0 10px 3px ${SEMAFORO[e].border}88` : "none",
            border: `1.5px solid ${estado === e ? SEMAFORO[e].border : "#3a1200"}`,
          }}
        />
      ))}
    </div>
  );
}

export function InventarioPanel() {
  const [datos,    setDatos]    = useState<ProductoInventario[] | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState<string | undefined>();
  const [fileName, setFileName] = useState<string | undefined>();

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(undefined);
    setFileName(undefined);
    setDatos(null);
    try {
      const prods = await leerInventarioPdf(file);
      if (prods.length === 0)
        throw new Error("No se encontraron productos. Verifica que el PDF sea el reporte de inventario de A2.");
      setDatos(prods);
      setFileName(file.name);
    } catch (e: any) {
      setError(e.message ?? "Error desconocido al leer el PDF.");
    } finally {
      setLoading(false);
    }
  };

  const resumen = datos ? resumenInventario(datos) : null;

  return (
    <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
      style={{ background: "#0d0300", border: "2px solid #cc2200" }}>

      {/* ── Cabecera ── */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ background: "#cc2200" }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.2)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2">
            <path d="M9 17H7A5 5 0 0 1 7 7h2" />
            <path d="M15 7h2a5 5 0 1 1 0 10h-2" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        </div>
        <div>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>
            Inventario de Productos
          </p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
            Sistema A2 — arrastra o haz clic para cargar
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* Instrucciones rápidas */}
        <div style={{ background: "#1a0500", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ color: "#ff6b35", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
            ¿CÓMO USARLO?
          </p>
          <ol style={{ color: "#8a5a30", fontSize: 12, lineHeight: 1.8, paddingLeft: 14 }}>
            <li>Abre A2 → Inventario → «Existencias» o «Kardex»</li>
            <li>Genera el reporte y guárdalo como PDF</li>
            <li>Arrastra ese PDF al recuadro de abajo</li>
          </ol>
        </div>

        {/* Zona de arrastrar */}
        <FileDropZone
          onFile={handleFile}
          loading={loading}
          fileName={fileName}
          error={error}
          accentColor="#cc2200"
          label="Arrastra el PDF de Inventario aquí"
        />

        {/* ── Semáforo — SOLO aparece cuando hay datos cargados ── */}
        {!datos && !loading && (
          <div className="rounded-xl p-4 text-center"
            style={{ background: "#1a0500", border: "1px dashed #3a1200" }}>
            <div className="flex justify-center gap-3 mb-3">
              {(["suficiente", "bajo", "agotado"] as Estado[]).map((e) => (
                <div key={e} className="w-7 h-7 rounded-full"
                  style={{ background: "#1a0a00", border: `1.5px solid #3a1200` }} />
              ))}
            </div>
            <p style={{ color: "#3a1200", fontSize: 12, fontWeight: 600 }}>
              El semáforo de stock aparecerá aquí
              <br />cuando cargues el PDF del inventario
            </p>
          </div>
        )}

        {datos && resumen && (
          <>
            {/* Contadores del semáforo */}
            <div className="grid grid-cols-3 gap-3">
              {([
                { est: "suficiente" as Estado, val: resumen.suficientes, label: "Bien surtidos"  },
                { est: "bajo"       as Estado, val: resumen.bajos,       label: "Reponer pronto" },
                { est: "agotado"    as Estado, val: resumen.agotados,    label: "Sin existencia" },
              ]).map(({ est, val, label }) => {
                const s = SEMAFORO[est];
                return (
                  <div key={est} className="rounded-xl p-4 text-center"
                    style={{ background: s.bg, border: `2px solid ${s.border}` }}>
                    <p style={{ color: s.text, fontSize: 28, fontWeight: 900 }}>{val}</p>
                    <LuzSemaforo estado={est} />
                    <p style={{ color: s.text, fontSize: 10, marginTop: 4, opacity: 0.8 }}>{label}</p>
                  </div>
                );
              })}
            </div>

            {/* Valor del inventario */}
            <div className="rounded-xl p-4 grid grid-cols-3 gap-4"
              style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
              {[
                { l: "Productos",        v: String(resumen.total),               c: "#f5e0c0" },
                { l: "Valor en Costo",   v: `Bs. ${resumen.valorCosto.toFixed(2)}`,  c: "#ff6b35" },
                { l: "Valor a Precio",   v: `Bs. ${resumen.valorVenta.toFixed(2)}`,  c: "#f5a623" },
              ].map(m => (
                <div key={m.l}>
                  <p style={{ color: "#6a3a10", fontSize: 10 }}>{m.l}</p>
                  <p style={{ color: m.c, fontSize: 14, fontWeight: 800 }}>{m.v}</p>
                </div>
              ))}
            </div>

            {/* Tabla de inventario con colores */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #3a1200" }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "#1a0500" }}>
                <p style={{ color: "#ff6b35", fontSize: 13, fontWeight: 700 }}>
                  Inventario Completo — {datos.length} productos
                </p>
                <div className="flex gap-3">
                  {(["suficiente", "bajo", "agotado"] as Estado[]).map(e => (
                    <span key={e} className="text-xs flex items-center gap-1"
                      style={{ color: SEMAFORO[e].text }}>
                      <span className="w-2 h-2 rounded-full inline-block"
                        style={{ background: SEMAFORO[e].border }} />
                      {SEMAFORO[e].etiqueta.split(" ")[1] ?? SEMAFORO[e].etiqueta}
                    </span>
                  ))}
                </div>
              </div>
              <div style={{ maxHeight: 360, overflowY: "auto" }}>
                <table className="w-full">
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: "#0d0300" }}>
                      {["Código", "Descripción", "Exist.", "Mín.", "Precio", "Estado"].map(h => (
                        <th key={h} className="py-2 px-3 text-left"
                          style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((p) => {
                      const est = estadoStock(p);
                      const s = SEMAFORO[est];
                      return (
                        <tr key={p.codigo}
                          style={{ borderBottom: "1px solid #1a0800", background: s.bg + "44" }}>
                          <td className="py-1.5 px-3"
                            style={{ color: "#8a5a30", fontSize: 11 }}>{p.codigo}</td>
                          <td className="py-1.5 px-3"
                            style={{ color: "#f5e0c0", fontSize: 12 }}>{p.descripcion}</td>
                          <td className="py-1.5 px-3 text-center font-bold"
                            style={{ color: s.text, fontSize: 13 }}>
                            {p.existencia.toLocaleString("es-VE")}
                          </td>
                          <td className="py-1.5 px-3 text-center"
                            style={{ color: "#6a3a10", fontSize: 12 }}>
                            {p.stockMinimo}
                          </td>
                          <td className="py-1.5 px-3 text-right"
                            style={{ color: "#f5a623", fontSize: 12 }}>
                            {p.precioVenta.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3">
                            <span className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ background: s.bg, color: s.text, border: `1px solid ${s.border}44` }}>
                              {s.etiqueta}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Alertas urgentes */}
            {resumen.agotados > 0 && (
              <div className="rounded-xl p-4"
                style={{ background: "#2e0a0a", border: "1px solid #ef4444" }}>
                <p style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  🚨 Productos AGOTADOS — Reponer de inmediato:
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumen.listaAgotados.map(p => (
                    <span key={p.codigo}
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#3a0a0a", color: "#f87171", border: "1px solid #ef4444" }}>
                      {p.descripcion}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {resumen.bajos > 0 && (
              <div className="rounded-xl p-4"
                style={{ background: "#2e1f00", border: "1px solid #eab308" }}>
                <p style={{ color: "#facc15", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  ⚠️ Stock BAJO — Reponer pronto:
                </p>
                <div className="flex flex-wrap gap-2">
                  {resumen.listaBajos.map(p => (
                    <span key={p.codigo}
                      className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#2e1f00", color: "#facc15", border: "1px solid #eab308" }}>
                      {p.descripcion} ({p.existencia} / mín. {p.stockMinimo})
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Nota sobre cómo interpreta los datos */}
            <div className="rounded-xl p-4 flex gap-3"
              style={{ background: "rgba(204,34,0,0.06)", border: "1px solid rgba(204,34,0,0.2)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="#ff6b35" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 16v-4M12 8h.01" />
              </svg>
              <p style={{ color: "#8a5a30", fontSize: 11, lineHeight: 1.7 }}>
                <strong style={{ color: "#ff6b35" }}>🟢 Verde</strong> = Stock suficiente (por encima del mínimo configurado en A2). &nbsp;
                <strong style={{ color: "#ff6b35" }}>🟡 Amarillo</strong> = Stock bajo (por debajo del mínimo). &nbsp;
                <strong style={{ color: "#ff6b35" }}>🔴 Rojo</strong> = Sin existencia — hay que surtir urgente.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
