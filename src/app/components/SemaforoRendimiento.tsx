import { useState } from "react";
import {
  ventasMuestra,
  calcularResumen,
  semaforoMargen,
  type SemaforoColor,
  type ProductoVendido,
} from "../data/ventas_muestra";
import {
  inventarioMuestra,
  calcularResumenInventario,
  estadoStock,
} from "../data/inventario_muestra";

// ─── colores del semáforo ─────────────────────────────────────────────────────
const LUZ: Record<SemaforoColor, { bg: string; border: string; text: string; label: string }> = {
  verde:   { bg: "#0d2e14", border: "#22c55e", text: "#4ade80", label: "EXCELENTE"  },
  amarillo:{ bg: "#2e1f00", border: "#eab308", text: "#facc15", label: "REGULAR"    },
  rojo:    { bg: "#2e0a0a", border: "#ef4444", text: "#f87171", label: "BAJO"       },
};

function Semaforo({ color }: { color: SemaforoColor }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {(["verde", "amarillo", "rojo"] as SemaforoColor[]).map((c) => (
        <div key={c}
          className="w-7 h-7 rounded-full transition-all duration-300"
          style={{
            background: color === c
              ? (c === "verde" ? "#22c55e" : c === "amarillo" ? "#eab308" : "#ef4444")
              : "#1a0a00",
            boxShadow: color === c
              ? `0 0 14px 4px ${c === "verde" ? "#22c55e88" : c === "amarillo" ? "#eab30888" : "#ef444488"}`
              : "none",
            border: `1.5px solid ${color === c
              ? (c === "verde" ? "#22c55e" : c === "amarillo" ? "#eab308" : "#ef4444")
              : "#3a1200"}`,
          }}
        />
      ))}
    </div>
  );
}

function TagSemaforo({ pct }: { pct: number }) {
  const color = semaforoMargen(pct);
  const l = LUZ[color];
  return (
    <span className="px-2 py-0.5 rounded text-xs font-bold"
      style={{ background: l.bg, color: l.text, border: `1px solid ${l.border}` }}>
      {l.label} {pct.toFixed(1)}%
    </span>
  );
}

// ─── filas de la tabla ────────────────────────────────────────────────────────
function FilaProducto({ p, rank }: { p: ProductoVendido; rank?: number }) {
  const color = semaforoMargen(p.pctUtilidad);
  const l = LUZ[color];
  return (
    <tr style={{ borderBottom: "1px solid #2a0a00" }}>
      <td className="py-2 px-3">
        {rank !== undefined && (
          <span className="px-1.5 py-0.5 rounded text-xs font-bold mr-2"
            style={{ background: "#e07b0022", color: "#f5a623", border: "1px solid #e07b00" }}>
            #{rank + 1}
          </span>
        )}
        <span style={{ color: "#8a5a30", fontSize: 11 }}>{p.codigo}</span>
      </td>
      <td className="py-2 px-3" style={{ color: "#f5e0c0", fontSize: 12 }}>
        {p.descripcion}
      </td>
      <td className="py-2 px-3 text-center" style={{ color: "#c26f30", fontSize: 12 }}>
        {p.cantidad.toLocaleString("es-VE")}
      </td>
      <td className="py-2 px-3 text-right" style={{ color: "#f5a623", fontSize: 12, fontWeight: 600 }}>
        {p.montoBruto.toFixed(2)}
      </td>
      <td className="py-2 px-3 text-right">
        <TagSemaforo pct={p.pctUtilidad} />
      </td>
      <td className="py-2 px-3 text-right">
        <div className="flex items-center justify-end gap-2">
          <div className="w-1.5 h-1.5 rounded-full"
            style={{ background: l.border, boxShadow: `0 0 6px ${l.border}` }} />
        </div>
      </td>
    </tr>
  );
}

// ─── componente principal ─────────────────────────────────────────────────────
export function SemaforoRendimiento() {
  const [vista, setVista] = useState<"ventas" | "inventario">("ventas");
  const resumen   = calcularResumen(ventasMuestra);
  const invResumen = calcularResumenInventario(inventarioMuestra);
  const colorGeneral = semaforoMargen(resumen.margenPromedio);
  const lGeneral = LUZ[colorGeneral];

  return (
    <div className="max-w-5xl mx-auto mt-10">

      {/* ── Cabecera del semáforo ── */}
      <div className="rounded-2xl overflow-hidden mb-6"
        style={{ background: "#0d0300", border: "2px solid #e07b00" }}>

        {/* Título */}
        <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ background: "#1a0500", borderBottom: "1px solid #3a1200" }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(224,123,0,0.15)", border: "1.5px solid #e07b00" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="#f5a623" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 8v4l3 3" />
              </svg>
            </div>
            <div>
              <p style={{ color: "#f5a623", fontSize: 15, fontWeight: 800 }}>
                Semáforo de Rendimiento
              </p>
              <p style={{ color: "#6a3a10", fontSize: 11 }}>
                Período: {ventasMuestra.periodo.desde} — {ventasMuestra.periodo.hasta}
                {" · "}Datos de muestra del sistema A2
              </p>
            </div>
          </div>

          {/* Tabs ventas / inventario */}
          <div className="flex rounded-lg overflow-hidden" style={{ border: "1px solid #3a1200" }}>
            {(["ventas", "inventario"] as const).map((t) => (
              <button key={t} onClick={() => setVista(t)}
                className="px-4 py-1.5 text-sm font-bold transition-all"
                style={{
                  background: vista === t ? "#e07b00" : "#1a0500",
                  color: vista === t ? "#fff" : "#6a3a10",
                }}>
                {t === "ventas" ? "📄 Ventas" : "📦 Inventario"}
              </button>
            ))}
          </div>
        </div>

        {/* ════ VISTA VENTAS ════ */}
        {vista === "ventas" && (
          <div className="p-6">

            {/* Indicador global */}
            <div className="flex flex-col md:flex-row gap-6 mb-8">

              {/* Semáforo grande */}
              <div className="flex flex-col items-center justify-center gap-4 p-6 rounded-xl"
                style={{ background: lGeneral.bg, border: `2px solid ${lGeneral.border}`, minWidth: 160 }}>
                <Semaforo color={colorGeneral} />
                <div className="text-center">
                  <p style={{ color: lGeneral.text, fontSize: 22, fontWeight: 900 }}>
                    {resumen.margenPromedio}%
                  </p>
                  <p style={{ color: lGeneral.text, fontSize: 12, fontWeight: 700 }}>
                    MARGEN GENERAL
                  </p>
                  <p className="mt-1 px-2 py-0.5 rounded text-xs font-bold"
                    style={{ background: lGeneral.border + "22", color: lGeneral.text }}>
                    {lGeneral.label}
                  </p>
                </div>
              </div>

              {/* Métricas en grid */}
              <div className="flex-1 grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: "Total Vendido",   value: `Bs. ${resumen.totalVentas.toFixed(2)}`,   color: "#f5a623" },
                  { label: "Costo Total",     value: `Bs. ${resumen.totalCosto.toFixed(2)}`,    color: "#ff6b35" },
                  { label: "Utilidad Neta",   value: `Bs. ${resumen.totalUtilidad.toFixed(2)}`, color: "#4ade80" },
                  { label: "N° Productos",    value: resumen.cantidadProductos,                  color: "#c26f30" },
                  { label: "Mejor Margen",    value: `${resumen.mejores[0]?.pctUtilidad.toFixed(1)}%`, color: "#4ade80" },
                  { label: "Menor Margen",    value: `${resumen.peores[0]?.pctUtilidad.toFixed(1)}%`,  color: "#f87171" },
                ].map((m) => (
                  <div key={m.label} className="rounded-xl p-4"
                    style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
                    <p style={{ color: "#6a3a10", fontSize: 11, marginBottom: 4 }}>{m.label}</p>
                    <p style={{ color: m.color, fontSize: 18, fontWeight: 800 }}>{m.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leyenda del semáforo */}
            <div className="flex gap-3 flex-wrap mb-6">
              {(Object.entries(LUZ) as [SemaforoColor, typeof LUZ["verde"]][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                  style={{ background: v.bg, border: `1px solid ${v.border}` }}>
                  <div className="w-3 h-3 rounded-full" style={{ background: v.border }} />
                  <span style={{ color: v.text, fontSize: 11, fontWeight: 700 }}>
                    {v.label}: {k === "verde" ? "≥ 60%" : k === "amarillo" ? "30–59%" : "< 30%"}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabla de todos los productos */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a1200" }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "#1a0500" }}>
                <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 700 }}>
                  Detalle por Producto — {ventasMuestra.periodo.desde}
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#0d0300" }}>
                      {["Código", "Descripción", "Cantidad", "Monto Bs.", "% Utilidad", ""].map(h => (
                        <th key={h} className="py-2 px-3 text-left"
                          style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700, letterSpacing: 0.5 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ventasMuestra.productos.map((p) => (
                      <FilaProducto key={p.codigo} p={p} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top 3 mejores y peores */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-5">
              {/* Mejores */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #22c55e44" }}>
                <div className="px-4 py-2.5" style={{ background: "#0d2e14" }}>
                  <p style={{ color: "#4ade80", fontSize: 13, fontWeight: 700 }}>
                    🟢 Top 3 — Mayor Margen
                  </p>
                </div>
                <div style={{ background: "#080f0a" }}>
                  {resumen.mejores.map((p, i) => (
                    <div key={p.codigo}
                      className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom: i < 2 ? "1px solid #0d2e14" : "none" }}>
                      <div>
                        <span className="text-xs mr-2 font-bold" style={{ color: "#4ade80" }}>#{i + 1}</span>
                        <span style={{ color: "#a0d8a8", fontSize: 12 }}>{p.descripcion}</span>
                      </div>
                      <TagSemaforo pct={p.pctUtilidad} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Peores */}
              <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #ef444444" }}>
                <div className="px-4 py-2.5" style={{ background: "#2e0a0a" }}>
                  <p style={{ color: "#f87171", fontSize: 13, fontWeight: 700 }}>
                    🔴 Top 3 — Menor Margen (revisar precio)
                  </p>
                </div>
                <div style={{ background: "#0f0505" }}>
                  {resumen.peores.map((p, i) => (
                    <div key={p.codigo}
                      className="px-4 py-3 flex items-center justify-between"
                      style={{ borderBottom: i < 2 ? "1px solid #2e0a0a" : "none" }}>
                      <div>
                        <span className="text-xs mr-2 font-bold" style={{ color: "#f87171" }}>#{i + 1}</span>
                        <span style={{ color: "#d08080", fontSize: 12 }}>{p.descripcion}</span>
                      </div>
                      <TagSemaforo pct={p.pctUtilidad} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ════ VISTA INVENTARIO ════ */}
        {vista === "inventario" && (
          <div className="p-6">

            {/* Resumen de stock */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { label: "✅ Productos con buen stock",  value: invResumen.suficientes, color: "#4ade80", bg: "#0d2e14", border: "#22c55e" },
                { label: "⚠️ Stock bajo — reponer pronto",value: invResumen.bajos,       color: "#facc15", bg: "#2e1f00", border: "#eab308" },
                { label: "🚨 Agotados — sin existencia",  value: invResumen.agotados,    color: "#f87171", bg: "#2e0a0a", border: "#ef4444" },
              ].map((m) => (
                <div key={m.label} className="rounded-xl p-5 text-center"
                  style={{ background: m.bg, border: `2px solid ${m.border}` }}>
                  <p style={{ color: m.color, fontSize: 36, fontWeight: 900 }}>{m.value}</p>
                  <p style={{ color: m.color, fontSize: 12, marginTop: 4, opacity: 0.8 }}>{m.label}</p>
                </div>
              ))}
            </div>

            {/* Valor del inventario */}
            <div className="rounded-xl p-4 mb-6 flex flex-wrap gap-6"
              style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
              <div>
                <p style={{ color: "#6a3a10", fontSize: 11 }}>Valor en Costo</p>
                <p style={{ color: "#ff6b35", fontSize: 20, fontWeight: 800 }}>
                  Bs. {invResumen.valorInventario.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ color: "#6a3a10", fontSize: 11 }}>Valor a Precio de Venta</p>
                <p style={{ color: "#f5a623", fontSize: 20, fontWeight: 800 }}>
                  Bs. {invResumen.valorVenta.toFixed(2)}
                </p>
              </div>
              <div>
                <p style={{ color: "#6a3a10", fontSize: 11 }}>Total Productos</p>
                <p style={{ color: "#f5e0c0", fontSize: 20, fontWeight: 800 }}>
                  {invResumen.total}
                </p>
              </div>
            </div>

            {/* Tabla de inventario con semáforo */}
            <div className="rounded-xl overflow-hidden" style={{ border: "1px solid #3a1200" }}>
              <div className="px-4 py-2.5" style={{ background: "#1a0500" }}>
                <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 700 }}>
                  Inventario Completo
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr style={{ background: "#0d0300" }}>
                      {["Código", "Descripción", "Categoría", "Existencia", "Mín.", "P. Venta", "Estado"].map(h => (
                        <th key={h} className="py-2 px-3 text-left"
                          style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {inventarioMuestra.map((p) => {
                      const estado = estadoStock(p);
                      const colores = {
                        suficiente: { bg: "#0d2e1488", text: "#4ade80" },
                        bajo:       { bg: "#2e1f0088", text: "#facc15" },
                        agotado:    { bg: "#2e0a0a88", text: "#f87171" },
                      };
                      const c = colores[estado];
                      return (
                        <tr key={p.codigo}
                          style={{ borderBottom: "1px solid #1a0800", background: c.bg }}>
                          <td className="py-2 px-3" style={{ color: "#8a5a30", fontSize: 11 }}>
                            {p.codigo}
                          </td>
                          <td className="py-2 px-3" style={{ color: "#f5e0c0", fontSize: 12 }}>
                            {p.descripcion}
                          </td>
                          <td className="py-2 px-3" style={{ color: "#c26f30", fontSize: 11 }}>
                            {p.categoria}
                          </td>
                          <td className="py-2 px-3 text-center font-bold"
                            style={{ color: c.text, fontSize: 13 }}>
                            {p.existencia.toLocaleString("es-VE")}
                          </td>
                          <td className="py-2 px-3 text-center"
                            style={{ color: "#6a3a10", fontSize: 12 }}>
                            {p.stockMinimo}
                          </td>
                          <td className="py-2 px-3 text-right"
                            style={{ color: "#f5a623", fontSize: 12 }}>
                            {p.precioVenta.toFixed(2)}
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ background: c.bg, color: c.text, border: `1px solid ${c.text}44` }}>
                              {estado === "suficiente" ? "✅ OK"
                                : estado === "bajo" ? "⚠️ BAJO"
                                : "🚨 AGOTADO"}
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
            {invResumen.agotados > 0 && (
              <div className="mt-5 rounded-xl p-4"
                style={{ background: "#2e0a0a", border: "1px solid #ef4444" }}>
                <p style={{ color: "#f87171", fontSize: 13, fontWeight: 700, marginBottom: 8 }}>
                  🚨 Productos AGOTADOS — Reponer inmediatamente:
                </p>
                <div className="flex flex-wrap gap-2">
                  {invResumen.productosAgotados.map(p => (
                    <span key={p.codigo} className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ background: "#3a0a0a", color: "#f87171", border: "1px solid #ef4444" }}>
                      {p.descripcion}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nota explicativa para el dueño */}
      <div className="rounded-xl p-5 flex gap-4"
        style={{ background: "rgba(224,123,0,0.06)", border: "1px solid rgba(224,123,0,0.2)" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
          stroke="#f5a623" strokeWidth="2" className="flex-shrink-0 mt-0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <div>
          <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 800, marginBottom: 5 }}>
            📌 Nota para el dueño — ¿Cómo funciona este semáforo?
          </p>
          <p style={{ color: "#8a5a30", fontSize: 12, lineHeight: 1.7 }}>
            <strong style={{ color: "#c26f30" }}>🟢 Verde</strong> = El producto tiene buena ganancia (más del 60% sobre el costo). Puedes seguir vendiéndolo tranquilamente.<br />
            <strong style={{ color: "#c26f30" }}>🟡 Amarillo</strong> = La ganancia es regular (entre 30% y 59%). Considera subir el precio un poco.<br />
            <strong style={{ color: "#c26f30" }}>🔴 Rojo</strong> = La ganancia es baja (menos del 30%). Revisa el precio de venta o el costo de compra.
            <br /><br />
            Cuando el técnico web conecte el PDF real del sistema A2, estos datos se actualizarán automáticamente.
          </p>
        </div>
      </div>
    </div>
  );
}
