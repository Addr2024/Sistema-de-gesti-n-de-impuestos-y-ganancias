import { useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, Legend,
} from "recharts";
import { FileDropZone } from "./FileDropZone";
import {
  leerVentasPdf, resumenVentas, colorMargen,
  type ProductoVendido, type SemaforoColor,
} from "../utils/pdfParser";
import { guardarVentasDia } from "../utils/taxStorage";

// ── Colores del semáforo ──────────────────────────────────────────────────────
const LUZ: Record<SemaforoColor, { bg: string; border: string; text: string; label: string }> = {
  verde:    { bg: "#0d2e14", border: "#22c55e", text: "#4ade80", label: "EXCELENTE" },
  amarillo: { bg: "#2e1f00", border: "#eab308", text: "#facc15", label: "REGULAR"   },
  rojo:     { bg: "#2e0a0a", border: "#ef4444", text: "#f87171", label: "BAJO"      },
};

const BAR_COLOR: Record<SemaforoColor, string> = {
  verde: "#22c55e", amarillo: "#eab308", rojo: "#ef4444",
};

// ── Tooltip personalizado de la gráfica ──────────────────────────────────────
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const c = LUZ[colorMargen(d.pct) as SemaforoColor];
  return (
    <div className="rounded-xl p-3" style={{
      background: "#1a0500", border: `1.5px solid ${c.border}`,
      maxWidth: 260, fontSize: 12,
    }}>
      <p style={{ color: c.text, fontWeight: 700, marginBottom: 4 }}>{d.fullName}</p>
      <p style={{ color: "#f5a623" }}>Monto: <strong>Bs. {d.monto.toFixed(2)}</strong></p>
      <p style={{ color: "#c26f30" }}>Cantidad: {Number(d.cantidad).toLocaleString("es-VE")}</p>
      <p style={{ color: "#c26f30" }}>Utilidad: Bs. {d.utilidad.toFixed(2)}</p>
      <span className="inline-block px-2 py-0.5 rounded text-xs font-bold mt-1"
        style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
        {c.label} — {d.pct.toFixed(1)}%
      </span>
    </div>
  );
}

// ── Semáforo circular ─────────────────────────────────────────────────────────
function Semaforo({ color }: { color: SemaforoColor }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      {(["verde", "amarillo", "rojo"] as SemaforoColor[]).map((c) => (
        <div key={c} className="w-6 h-6 rounded-full transition-all duration-300"
          style={{
            background: color === c ? BAR_COLOR[c] : "#1a0a00",
            boxShadow: color === c ? `0 0 12px 3px ${BAR_COLOR[c]}88` : "none",
            border: `1.5px solid ${color === c ? BAR_COLOR[c] : "#3a1200"}`,
          }} />
      ))}
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────
export function VentasPanel() {
  const [datos,         setDatos]         = useState<ProductoVendido[] | null>(null);
  const [loading,       setLoading]       = useState(false);
  const [error,         setError]         = useState<string | undefined>();
  const [fileName,      setFileName]      = useState<string | undefined>();
  const [guardado,      setGuardado]      = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(undefined);
    setFileName(undefined);
    setDatos(null);
    setGuardado(false);
    try {
      const prods = await leerVentasPdf(file);
      if (prods.length === 0)
        throw new Error("No se encontraron productos. Verifica que el PDF sea el reporte correcto de A2.");

      setDatos(prods);
      setFileName(file.name);

      // Proceso 2.2.1 DFD: guardar Base Imponible en almacén fiscal
      const res   = resumenVentas(prods);
      const hoy   = new Date().toISOString().slice(0, 10);
      guardarVentasDia(hoy, res.totalVentas, res.totalCosto, res.totalUtilidad, res.cantidad);
      setGuardado(true);
    } catch (e: any) {
      setError(e.message ?? "Error desconocido al leer el PDF.");
    } finally {
      setLoading(false);
    }
  };

  const resumen = datos ? resumenVentas(datos) : null;
  const colorGeneral = resumen ? colorMargen(resumen.margenPromedio) : "rojo";
  const lGeneral = LUZ[colorGeneral];

  // Datos para la gráfica
  const chartData = datos
    ? [...datos]
        .sort((a, b) => b.montoBruto - a.montoBruto)
        .slice(0, 20)
        .map(p => ({
          name:     p.descripcion.length > 14 ? p.descripcion.slice(0, 14) + "…" : p.descripcion,
          fullName: p.descripcion,
          monto:    p.montoBruto,
          cantidad: p.cantidad,
          utilidad: p.utilidad,
          pct:      p.pctUtilidad,
        }))
    : [];

  return (
    <div className="flex flex-col gap-0 rounded-2xl overflow-hidden"
      style={{ background: "#0d0300", border: "2px solid #e07b00" }}>

      {/* ── Cabecera ── */}
      <div className="px-5 py-4 flex items-center gap-3"
        style={{ background: "#e07b00" }}>
        <div className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(255,255,255,0.2)" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#fff" strokeWidth="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14,2 14,8 20,8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
        </div>
        <div>
          <p style={{ color: "#fff", fontSize: 15, fontWeight: 800 }}>
            Reporte de Ventas del Día
          </p>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 11 }}>
            Sistema A2 — arrastra o haz clic para cargar
          </p>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4">

        {/* Instrucciones rápidas */}
        <div style={{ background: "#1a0500", borderRadius: 10, padding: "10px 14px" }}>
          <p style={{ color: "#f5a623", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
            ¿CÓMO USARLO?
          </p>
          <ol style={{ color: "#8a5a30", fontSize: 12, lineHeight: 1.8, paddingLeft: 14 }}>
            <li>Abre A2 → Ventas → «Productos Vendidos»</li>
            <li>Selecciona la fecha y haz clic en Imprimir → Guardar como PDF</li>
            <li>Arrastra ese PDF al recuadro de abajo</li>
          </ol>
        </div>

        {/* Zona de arrastrar */}
        <FileDropZone
          onFile={handleFile}
          loading={loading}
          fileName={fileName}
          error={error}
          accentColor="#e07b00"
          label="Arrastra el PDF de Ventas del Día aquí"
        />

        {/* Confirmación de guardado fiscal */}
        {guardado && (
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{ background: "rgba(34,197,94,0.08)", border: "1px solid #22c55e44" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#4ade80" strokeWidth="2.5">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <p style={{ color: "#4ade80", fontSize: 12 }}>
              Datos guardados para <strong>Pago de Impuestos</strong> del mes
            </p>
          </div>
        )}

        {/* ── Resultados — solo cuando hay datos ── */}
        {datos && resumen && (
          <>
            {/* Semáforo + métricas */}
            <div className="flex gap-4 mt-2">
              <div className="flex flex-col items-center justify-center gap-3 p-4 rounded-xl"
                style={{ background: lGeneral.bg, border: `2px solid ${lGeneral.border}`, minWidth: 100 }}>
                <Semaforo color={colorGeneral} />
                <div className="text-center">
                  <p style={{ color: lGeneral.text, fontSize: 20, fontWeight: 900 }}>
                    {resumen.margenPromedio}%
                  </p>
                  <p style={{ color: lGeneral.text, fontSize: 10, fontWeight: 700 }}>
                    MARGEN
                  </p>
                  <p style={{ color: lGeneral.text, fontSize: 10 }}>{lGeneral.label}</p>
                </div>
              </div>

              <div className="flex-1 grid grid-cols-2 gap-2">
                {[
                  { l: "Vendido",  v: `Bs. ${resumen.totalVentas.toFixed(2)}`,   c: "#f5a623" },
                  { l: "Utilidad", v: `Bs. ${resumen.totalUtilidad.toFixed(2)}`, c: "#4ade80" },
                  { l: "Costo",    v: `Bs. ${resumen.totalCosto.toFixed(2)}`,    c: "#ff6b35" },
                  { l: "Productos",v: String(resumen.cantidad),                   c: "#c26f30" },
                ].map(m => (
                  <div key={m.l} className="rounded-lg p-3"
                    style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
                    <p style={{ color: "#6a3a10", fontSize: 10 }}>{m.l}</p>
                    <p style={{ color: m.c, fontSize: 14, fontWeight: 800 }}>{m.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Gráfica de barras ── */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #3a1200" }}>
              <div className="px-4 py-2.5 flex items-center justify-between"
                style={{ background: "#1a0500" }}>
                <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 700 }}>
                  📊 Monto Vendido por Producto (Top 20)
                </p>
                <div className="flex gap-3">
                  {(["verde", "amarillo", "rojo"] as SemaforoColor[]).map(c => (
                    <span key={c} className="flex items-center gap-1 text-xs"
                      style={{ color: LUZ[c].text }}>
                      <span className="w-2.5 h-2.5 rounded-sm inline-block"
                        style={{ background: BAR_COLOR[c] }} />
                      {LUZ[c].label}
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ background: "#0d0300", padding: "12px 4px 4px" }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData} margin={{ top: 4, right: 12, left: 0, bottom: 90 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#2a0800" vertical={false} />
                    <XAxis
                      dataKey="name"
                      angle={-45}
                      textAnchor="end"
                      interval={0}
                      tick={{ fill: "#8a5a30", fontSize: 10 }}
                      tickLine={{ stroke: "#3a1200" }}
                      axisLine={{ stroke: "#3a1200" }}
                    />
                    <YAxis
                      tick={{ fill: "#8a5a30", fontSize: 10 }}
                      tickLine={{ stroke: "#3a1200" }}
                      axisLine={{ stroke: "#3a1200" }}
                      tickFormatter={(v) => `${v}`}
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(224,123,0,0.08)" }} />
                    <Bar dataKey="monto" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={BAR_COLOR[colorMargen(entry.pct)]}
                          fillOpacity={0.85}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* ── Tabla detalle ── */}
            <div className="rounded-xl overflow-hidden"
              style={{ border: "1px solid #3a1200" }}>
              <div className="px-4 py-2.5" style={{ background: "#1a0500" }}>
                <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 700 }}>
                  Detalle completo — {datos.length} productos
                </p>
              </div>
              <div className="overflow-x-auto" style={{ maxHeight: 320, overflowY: "auto" }}>
                <table className="w-full">
                  <thead style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr style={{ background: "#0d0300" }}>
                      {["Código", "Descripción", "Cant.", "Bs. Bruto", "% Utilidad"].map(h => (
                        <th key={h} className="py-2 px-3 text-left"
                          style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {datos.map((p) => {
                      const c = LUZ[colorMargen(p.pctUtilidad)];
                      return (
                        <tr key={p.codigo}
                          style={{ borderBottom: "1px solid #1a0800" }}>
                          <td className="py-1.5 px-3"
                            style={{ color: "#8a5a30", fontSize: 11 }}>{p.codigo}</td>
                          <td className="py-1.5 px-3"
                            style={{ color: "#f5e0c0", fontSize: 12 }}>{p.descripcion}</td>
                          <td className="py-1.5 px-3 text-center"
                            style={{ color: "#c26f30", fontSize: 12 }}>
                            {p.cantidad.toLocaleString("es-VE")}
                          </td>
                          <td className="py-1.5 px-3 text-right"
                            style={{ color: "#f5a623", fontSize: 12, fontWeight: 600 }}>
                            {p.montoBruto.toFixed(2)}
                          </td>
                          <td className="py-1.5 px-3 text-right">
                            <span className="px-2 py-0.5 rounded text-xs font-bold"
                              style={{ background: c.bg, color: c.text, border: `1px solid ${c.border}` }}>
                              {c.label} {p.pctUtilidad.toFixed(1)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top mejores / peores */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { titulo: "🟢 Mayor margen",     items: resumen.mejores, color: LUZ.verde },
                { titulo: "🔴 Menor margen",     items: resumen.peores,  color: LUZ.rojo  },
              ].map(({ titulo, items, color }) => (
                <div key={titulo} className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${color.border}44` }}>
                  <div className="px-4 py-2" style={{ background: color.bg }}>
                    <p style={{ color: color.text, fontSize: 12, fontWeight: 700 }}>{titulo}</p>
                  </div>
                  {items.map((p, i) => (
                    <div key={p.codigo}
                      className="px-3 py-2 flex justify-between items-center"
                      style={{ borderBottom: i < 2 ? `1px solid ${color.bg}` : "none", background: "#0d0300" }}>
                      <span style={{ color: "#c26f30", fontSize: 11 }}>
                        #{i + 1} {p.descripcion.slice(0, 22)}
                      </span>
                      <span className="text-xs font-bold px-1.5 py-0.5 rounded"
                        style={{ background: color.bg, color: color.text }}>
                        {p.pctUtilidad.toFixed(1)}%
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
