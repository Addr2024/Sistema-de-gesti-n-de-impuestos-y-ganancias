interface PdfZoneProps {
  title: string;
  description: string;
  docType: string;
  badge?: string;
  accentColor?: string;
}

export function PdfZone({
  title,
  description,
  docType,
  badge,
  accentColor = "#f5a623",
}: PdfZoneProps) {
  return (
    <div
      className="relative rounded-xl p-5 flex flex-col gap-3 transition-all hover:scale-[1.01]"
      style={{
        background: "linear-gradient(135deg, #0d0300 0%, #1a0500 100%)",
        border: `2px dashed ${accentColor}`,
      }}
    >
      {badge && (
        <span
          className="absolute top-3 right-3 px-2 py-0.5 rounded text-xs font-bold"
          style={{ background: accentColor, color: "#1a0500" }}
        >
          {badge}
        </span>
      )}

      <div
        className="w-12 h-12 rounded-lg flex items-center justify-center"
        style={{ background: `${accentColor}18`, border: `1.5px solid ${accentColor}` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke={accentColor} strokeWidth="1.8">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
      </div>

      <div>
        <h4 style={{ color: "#f5e0c0", fontSize: 14, fontWeight: 700, marginBottom: 4 }}>
          {title}
        </h4>
        <p style={{ color: "#8a5a30", fontSize: 12, lineHeight: 1.5 }}>
          {description}
        </p>
      </div>

      <div className="flex items-center gap-2 pt-1 border-t" style={{ borderColor: "#3a1200" }}>
        <span style={{ color: "#5a3010", fontSize: 10, fontFamily: "monospace" }}>
          📄 FORMATO: {docType}
        </span>
      </div>

      <div className="rounded-lg px-3 py-2" style={{ background: "rgba(224,123,0,0.08)" }}>
        <p style={{ color: accentColor, fontSize: 11, fontWeight: 600 }}>
          ↑ Aquí va el enlace o archivo PDF
        </p>
        <p style={{ color: "#6a3a10", fontSize: 10, marginTop: 2 }}>
          Reemplaza con un {"<a>"} o visor {"<embed>"} del PDF
        </p>
      </div>
    </div>
  );
}
