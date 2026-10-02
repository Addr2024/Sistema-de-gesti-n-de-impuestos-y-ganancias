// ─────────────────────────────────────────────────────────────────────────────
// ImpuestosSection.tsx — Módulo 2.0: Gestión Tributaria y Retenciones
// Implementa DFD Nivel 3: Base Imponible → IVA×0.16 / Divisas×0.03 (IGTF)
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";
import {
  calcularResumenMes, mesesConDatos, formatearMes, vencimientoSENIAT,
  diasParaVencimiento, actualizarDivisas, leerVentasDia,
  IVA_RATE, IGTF_RATE,
  type VentasDia, type ResumenMes,
} from "../utils/taxStorage";

// ── Helpers de formato ────────────────────────────────────────────────────────

function bs(v: number) {
  return `Bs. ${v.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function mesActual(): string {
  return new Date().toISOString().slice(0, 7);
}

// ── Tarjeta de métrica ────────────────────────────────────────────────────────

function MetricCard({
  label, value, sub, color, icon,
}: {
  label: string; value: string; sub?: string; color: string; icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl p-4 flex flex-col gap-2"
      style={{ background: "#1a0500", border: `1.5px solid ${color}33` }}>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: `${color}18` }}>
          {icon}
        </div>
        <p style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>
          {label}
        </p>
      </div>
      <p style={{ color, fontSize: 20, fontWeight: 900, lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ color: "#6a3a10", fontSize: 11 }}>{sub}</p>}
    </div>
  );
}

// ── Badge de vencimiento ──────────────────────────────────────────────────────

function VencimientoBadge({ mes }: { mes: string }) {
  const dias = diasParaVencimiento(mes);
  const fecha = vencimientoSENIAT(mes);
  const [d, fmtFecha] = [dias, new Date(fecha + "T12:00:00").toLocaleDateString("es-VE", {
    day: "2-digit", month: "long", year: "numeric",
  })];

  const color  = d < 0 ? "#ef4444" : d <= 5 ? "#f97316" : d <= 15 ? "#eab308" : "#22c55e";
  const texto  = d < 0 ? `Vencido hace ${Math.abs(d)} días`
               : d === 0 ? "¡Vence HOY!"
               : `${d} días para vencer`;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{ background: `${color}10`, border: `1.5px solid ${color}44` }}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
        stroke={color} strokeWidth="2">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <div>
        <p style={{ color, fontSize: 13, fontWeight: 700 }}>{texto}</p>
        <p style={{ color: "#8a5a30", fontSize: 11 }}>
          Declaración SENIAT: {fmtFecha}
        </p>
      </div>
    </div>
  );
}

// ── Tabla de días del mes ─────────────────────────────────────────────────────

function TablaDias({
  dias, onEditarDivisas,
}: {
  dias: VentasDia[];
  onEditarDivisas: (fecha: string, valor: number) => void;
}) {
  const [editando, setEditando] = useState<string | null>(null);
  const [tempVal,  setTempVal]  = useState("");

  const guardar = (fecha: string) => {
    const val = parseFloat(tempVal.replace(",", ".")) || 0;
    onEditarDivisas(fecha, val);
    setEditando(null);
  };

  if (!dias.length) return (
    <div className="text-center py-8" style={{ color: "#3a1200" }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="1.5" className="mx-auto mb-2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <p style={{ fontSize: 13 }}>Sin datos importados este mes</p>
      <p style={{ fontSize: 11, marginTop: 4 }}>Carga PDFs desde el Reporte de Ventas del Día</p>
    </div>
  );

  return (
    <div className="overflow-x-auto rounded-xl" style={{ border: "1px solid #3a1200" }}>
      <table className="w-full">
        <thead>
          <tr style={{ background: "#1a0500" }}>
            {["Fecha", "Ventas (Base)", "Utilidad", "Divisas (Bs.)", "IVA Día", "IGTF Día"].map(h => (
              <th key={h} className="py-2 px-3 text-left"
                style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700 }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dias.map((d) => {
            const ivaD  = +(d.totalVentas * IVA_RATE).toFixed(2);
            const igtfD = +(d.divisas     * IGTF_RATE).toFixed(2);
            return (
              <tr key={d.fecha} style={{ borderBottom: "1px solid #1a0800" }}>
                <td className="py-2 px-3" style={{ color: "#f5a623", fontSize: 12, fontWeight: 600 }}>
                  {new Date(d.fecha + "T12:00:00").toLocaleDateString("es-VE", {
                    weekday: "short", day: "2-digit", month: "short",
                  })}
                </td>
                <td className="py-2 px-3" style={{ color: "#f5e0c0", fontSize: 12 }}>
                  {bs(d.totalVentas)}
                </td>
                <td className="py-2 px-3" style={{ color: "#4ade80", fontSize: 12 }}>
                  {bs(d.totalUtilidad)}
                </td>
                {/* Divisas — editable */}
                <td className="py-2 px-3">
                  {editando === d.fecha ? (
                    <div className="flex items-center gap-1">
                      <input
                        autoFocus
                        type="number"
                        value={tempVal}
                        onChange={e => setTempVal(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") guardar(d.fecha); if (e.key === "Escape") setEditando(null); }}
                        className="rounded px-2 py-1 w-24 outline-none"
                        style={{ background: "#0d0300", border: "1px solid #e07b00", color: "#f5a623", fontSize: 12 }}
                      />
                      <button onClick={() => guardar(d.fecha)}
                        style={{ color: "#4ade80", fontSize: 18 }} title="Guardar">✓</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditando(d.fecha); setTempVal(String(d.divisas)); }}
                      className="flex items-center gap-1 hover:opacity-70 transition-opacity"
                      title="Clic para editar divisas">
                      <span style={{ color: d.divisas > 0 ? "#f5a623" : "#3a1200", fontSize: 12 }}>
                        {bs(d.divisas)}
                      </span>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="#6a3a10" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                  )}
                </td>
                <td className="py-2 px-3" style={{ color: "#ff6b35", fontSize: 12 }}>
                  {bs(ivaD)}
                </td>
                <td className="py-2 px-3" style={{ color: "#c084fc", fontSize: 12 }}>
                  {bs(igtfD)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Flujo fiscal visual (DFD simplificado) ────────────────────────────────────

function FlujoDFD({ resumen }: { resumen: ResumenMes }) {
  return (
    <div className="rounded-xl p-4" style={{ background: "#0d0300", border: "1px solid #2a0800" }}>
      <p style={{ color: "#6a3a10", fontSize: 11, fontWeight: 700, marginBottom: 12 }}>
        FLUJO FISCAL — DFD MÓDULO 2.0
      </p>
      <div className="flex flex-col gap-0">
        {/* Nodo: Base Imponible */}
        <FlujoNodo
          label="2.2.1 Extraer Base Imponible"
          valor={bs(resumen.baseImponible)}
          color="#e07b00"
          desc="Ventas brutas del mes (Reporte A2)"
        />
        <FlujoBifurcacion />
        <div className="grid grid-cols-2 gap-3">
          {/* Rama IVA */}
          <div>
            <FlujoNodo
              label="2.2.2 Segregar IVA"
              valor={bs(resumen.ivaDeuda)}
              color="#ff6b35"
              desc={`Base × ${(IVA_RATE * 100).toFixed(0)}% = ${bs(resumen.ivaDeuda)}`}
            />
            <FlujoFlecha />
            <FlujoDestino label="SENIAT — Débito Fiscal IVA" color="#ef4444" />
          </div>
          {/* Rama IGTF */}
          <div>
            <FlujoNodo
              label="2.2.3 Filtrar Divisas"
              valor={bs(resumen.igtfDeuda)}
              color="#c084fc"
              desc={`Divisas × ${(IGTF_RATE * 100).toFixed(0)}% = ${bs(resumen.igtfDeuda)}`}
            />
            <FlujoFlecha />
            <FlujoDestino label="SENIAT — IGTF" color="#a855f7" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FlujoNodo({ label, valor, color, desc }: { label: string; valor: string; color: string; desc: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: `${color}10`, border: `1px solid ${color}33` }}>
      <p style={{ color, fontSize: 11, fontWeight: 700 }}>{label}</p>
      <p style={{ color, fontSize: 16, fontWeight: 900 }}>{valor}</p>
      <p style={{ color: "#6a3a10", fontSize: 10 }}>{desc}</p>
    </div>
  );
}

function FlujoBifurcacion() {
  return (
    <div className="flex justify-center my-1">
      <div className="w-px h-4" style={{ background: "#3a1200" }} />
    </div>
  );
}

function FlujoFlecha() {
  return (
    <div className="flex justify-center my-1">
      <svg width="12" height="16" viewBox="0 0 12 20" fill="#3a1200">
        <path d="M6 0v14M1 9l5 7 5-7" stroke="#3a1200" strokeWidth="2" fill="none" />
      </svg>
    </div>
  );
}

function FlujoDestino({ label, color }: { label: string; color: string }) {
  return (
    <div className="rounded-lg p-2 text-center"
      style={{ background: `${color}12`, border: `1px solid ${color}40` }}>
      <p style={{ color, fontSize: 11, fontWeight: 700 }}>{label}</p>
    </div>
  );
}

// ── Componente principal ──────────────────────────────────────────────────────

export function ImpuestosSection() {
  const [mesSeleccionado, setMesSeleccionado] = useState(mesActual());
  const [resumen,         setResumen]         = useState<ResumenMes | null>(null);
  const [meses,           setMeses]           = useState<string[]>([]);
  const [mostrarFlujo,    setMostrarFlujo]    = useState(false);

  const cargar = useCallback(() => {
    const lista = mesesConDatos();
    const actual = mesActual();
    if (!lista.includes(actual)) lista.unshift(actual);
    setMeses(lista);
    setResumen(calcularResumenMes(mesSeleccionado));
  }, [mesSeleccionado]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEditarDivisas = (fecha: string, valor: number) => {
    actualizarDivisas(fecha, valor);
    cargar();
  };

  const venc     = resumen ? diasParaVencimiento(resumen.mes) : 0;
  const sinDatos = !resumen || resumen.diasConDatos === 0;

  return (
    <section id="impuestos" className="py-16 px-4"
      style={{ background: "#0d0300" }}>
      <div className="max-w-5xl mx-auto">

        {/* ── Cabecera de sección ── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <p style={{ color: "#e07b00", fontSize: 11, fontWeight: 700, letterSpacing: 3, marginBottom: 4 }}>
              MÓDULO 2.0 — GESTIÓN TRIBUTARIA
            </p>
            <h2 style={{ color: "#f5e0c0", fontSize: 30, fontWeight: 900, lineHeight: 1.2 }}>
              Pago de Impuestos
            </h2>
            <p style={{ color: "#6a3a10", fontSize: 13, marginTop: 6 }}>
              IVA (16%) e IGTF (3%) calculados desde los reportes A2 · Declaración al SENIAT
            </p>
          </div>

          {/* Selector de mes */}
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#e07b00" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <select
              value={mesSeleccionado}
              onChange={e => setMesSeleccionado(e.target.value)}
              className="rounded-lg px-3 py-2 outline-none"
              style={{ background: "#1a0500", border: "1.5px solid #e07b00", color: "#f5a623", fontSize: 13 }}
            >
              {meses.map(m => (
                <option key={m} value={m}>{formatearMes(m)}</option>
              ))}
            </select>
          </div>
        </div>

        {/* ── Banner sin datos ── */}
        {sinDatos && (
          <div className="rounded-2xl p-8 text-center mb-8"
            style={{ background: "#1a0500", border: "1.5px dashed #3a1200" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"
              stroke="#3a1200" strokeWidth="1.5" className="mx-auto mb-3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p style={{ color: "#6a3a10", fontSize: 14, fontWeight: 700 }}>
              Sin datos para {formatearMes(mesSeleccionado)}
            </p>
            <p style={{ color: "#3a1200", fontSize: 12, marginTop: 6 }}>
              Carga el PDF de ventas del día en la sección de Reportes Internos
              <br />para que los impuestos se calculen automáticamente
            </p>
          </div>
        )}

        {resumen && (
          <>
            {/* ── Alerta de vencimiento ── */}
            <div className="mb-6">
              <VencimientoBadge mes={resumen.mes} />
            </div>

            {/* ── Tarjetas principales ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <MetricCard
                label="BASE IMPONIBLE"
                value={bs(resumen.baseImponible)}
                sub={`${resumen.diasConDatos} días con datos`}
                color="#f5a623"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#f5a623" strokeWidth="2">
                    <line x1="12" y1="1" x2="12" y2="23" />
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                }
              />
              <MetricCard
                label={`IVA DÉBITO FISCAL (${(IVA_RATE * 100).toFixed(0)}%)`}
                value={bs(resumen.ivaDeuda)}
                sub={`Base × ${(IVA_RATE * 100).toFixed(0)}%`}
                color="#ff6b35"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#ff6b35" strokeWidth="2">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </svg>
                }
              />
              <MetricCard
                label={`IGTF (${(IGTF_RATE * 100).toFixed(0)}% Divisas)`}
                value={bs(resumen.igtfDeuda)}
                sub={`Divisas ${bs(resumen.divisas)}`}
                color="#c084fc"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke="#c084fc" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                  </svg>
                }
              />
              <MetricCard
                label="TOTAL A PAGAR SENIAT"
                value={bs(resumen.totalDeuda)}
                sub="IVA + IGTF"
                color={venc < 0 ? "#ef4444" : venc <= 5 ? "#f97316" : "#4ade80"}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                    stroke={venc < 0 ? "#ef4444" : venc <= 5 ? "#f97316" : "#4ade80"} strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                }
              />
            </div>

            {/* ── Flujo DFD y utilidad ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              {/* Flujo fiscal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p style={{ color: "#8a5a30", fontSize: 12, fontWeight: 700 }}>FLUJO TRIBUTARIO</p>
                  <button
                    onClick={() => setMostrarFlujo(v => !v)}
                    style={{ color: "#f5a623", fontSize: 11, fontWeight: 600 }}
                    className="hover:opacity-70 transition-opacity">
                    {mostrarFlujo ? "Ocultar" : "Ver DFD"}
                  </button>
                </div>
                {mostrarFlujo ? (
                  <FlujoDFD resumen={resumen} />
                ) : (
                  <div className="rounded-xl p-4" style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
                    <div className="flex flex-col gap-2">
                      {[
                        { l: "Ventas brutas",  v: bs(resumen.baseImponible), c: "#f5a623" },
                        { l: "(-) Costos",     v: bs(resumen.costosTotal),   c: "#ff6b35" },
                        { l: "Utilidad neta",  v: bs(resumen.utilidadNeta),  c: "#4ade80" },
                        { l: "IVA por pagar",  v: bs(resumen.ivaDeuda),      c: "#ff6b35" },
                        { l: "IGTF por pagar", v: bs(resumen.igtfDeuda),     c: "#c084fc" },
                      ].map(r => (
                        <div key={r.l} className="flex justify-between items-center py-1.5"
                          style={{ borderBottom: "1px solid #2a0800" }}>
                          <span style={{ color: "#8a5a30", fontSize: 12 }}>{r.l}</span>
                          <span style={{ color: r.c, fontSize: 13, fontWeight: 700 }}>{r.v}</span>
                        </div>
                      ))}
                      <div className="flex justify-between items-center pt-1">
                        <span style={{ color: "#f5e0c0", fontSize: 13, fontWeight: 700 }}>TOTAL SENIAT</span>
                        <span style={{ color: "#ef4444", fontSize: 15, fontWeight: 900 }}>{bs(resumen.totalDeuda)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Info IGTF */}
              <div className="rounded-xl p-4" style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
                <p style={{ color: "#c084fc", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                  ¿CÓMO REGISTRAR EL IGTF?
                </p>
                <p style={{ color: "#8a5a30", fontSize: 12, lineHeight: 1.8 }}>
                  El IGTF se aplica a pagos en <strong style={{ color: "#f5a623" }}>divisas (USD, EUR)</strong>.
                  <br />
                  En la tabla de días, haz <strong style={{ color: "#f5a623" }}>clic en el valor de Divisas</strong>
                  <br />
                  para editar el monto recibido ese día en moneda extranjera.
                  <br /><br />
                  El sistema calcula <strong style={{ color: "#c084fc" }}>IGTF = Divisas × 3%</strong> automáticamente.
                </p>
                <div className="mt-4 rounded-lg px-3 py-2"
                  style={{ background: "#0d0300", border: "1px solid #2a0800" }}>
                  <p style={{ color: "#6a3a10", fontSize: 11 }}>
                    Tasa actual IGTF: <strong style={{ color: "#c084fc" }}>3%</strong> ·
                    Tasa IVA: <strong style={{ color: "#ff6b35" }}>16%</strong> · Fuente: SENIAT Venezuela
                  </p>
                </div>
              </div>
            </div>

            {/* ── Tabla de días ── */}
            <div>
              <p style={{ color: "#8a5a30", fontSize: 12, fontWeight: 700, marginBottom: 8 }}>
                DETALLE DIARIO — {formatearMes(resumen.mes).toUpperCase()}
              </p>
              <TablaDias dias={resumen.dias} onEditarDivisas={handleEditarDivisas} />
            </div>

            {/* ── Pie: instrucciones declaración ── */}
            <div className="mt-6 rounded-2xl p-6"
              style={{ background: "#1a0500", border: "1px solid #3a1200" }}>
              <p style={{ color: "#f5a623", fontSize: 13, fontWeight: 800, marginBottom: 10 }}>
                PASOS PARA DECLARAR ANTE EL SENIAT
              </p>
              <ol style={{ color: "#8a5a30", fontSize: 12, lineHeight: 2.2, paddingLeft: 20 }}>
                <li>Ingresa a <strong style={{ color: "#f5a623" }}>declaraciones.seniat.gob.ve</strong></li>
                <li>Selecciona el período: <strong style={{ color: "#f5a623" }}>{formatearMes(resumen.mes)}</strong></li>
                <li>En Débito Fiscal IVA coloca: <strong style={{ color: "#ff6b35" }}>{bs(resumen.ivaDeuda)}</strong></li>
                <li>En IGTF coloca: <strong style={{ color: "#c084fc" }}>{bs(resumen.igtfDeuda)}</strong></li>
                <li>Total a depositar: <strong style={{ color: "#ef4444" }}>{bs(resumen.totalDeuda)}</strong></li>
                <li>Fecha límite: <strong style={{ color: "#f5a623" }}>
                  {new Date(vencimientoSENIAT(resumen.mes) + "T12:00:00").toLocaleDateString("es-VE", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </strong></li>
              </ol>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
