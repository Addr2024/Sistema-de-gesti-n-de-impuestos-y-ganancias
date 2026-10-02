import { useRef, useState } from "react";

interface FileDropZoneProps {
  onFile: (file: File) => void;
  loading?: boolean;
  fileName?: string;
  error?: string;
  accept?: string;
  accentColor?: string;
  label?: string;
}

export function FileDropZone({
  onFile,
  loading = false,
  fileName,
  error,
  accept = ".pdf",
  accentColor = "#e07b00",
  label = "Arrastra tu PDF aquí",
}: FileDropZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = (file: File | null | undefined) => {
    if (file) onFile(file);
  };

  return (
    <div
      onClick={() => !loading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        handle(e.dataTransfer.files[0]);
      }}
      className="relative rounded-xl flex flex-col items-center justify-center gap-3 cursor-pointer transition-all select-none"
      style={{
        padding: "28px 16px",
        border: `2px dashed ${error ? "#ef4444" : dragging ? accentColor : accentColor + "55"}`,
        background: dragging
          ? accentColor + "12"
          : error
          ? "#2e0a0a"
          : "#0d0300",
        minHeight: 120,
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handle(e.target.files?.[0])}
      />

      {/* Ícono de estado */}
      {loading ? (
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: accentColor, borderTopColor: "transparent" }} />
      ) : error ? (
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: "#2e0a0a", border: "1.5px solid #ef4444" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#f87171" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      ) : fileName ? (
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: accentColor + "20", border: `1.5px solid ${accentColor}` }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke={accentColor} strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      ) : (
        <div className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ background: accentColor + "15", border: `1.5px dashed ${accentColor}` }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke={accentColor} strokeWidth="1.8">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
      )}

      {/* Texto */}
      <div className="text-center">
        {loading ? (
          <p style={{ color: accentColor, fontSize: 13, fontWeight: 700 }}>
            Leyendo PDF…
          </p>
        ) : error ? (
          <>
            <p style={{ color: "#f87171", fontSize: 13, fontWeight: 700 }}>
              Error al leer el archivo
            </p>
            <p style={{ color: "#8a4040", fontSize: 11, marginTop: 2 }}>{error}</p>
            <p style={{ color: "#6a3030", fontSize: 11, marginTop: 4 }}>
              Haz clic para intentar con otro archivo
            </p>
          </>
        ) : fileName ? (
          <>
            <p style={{ color: accentColor, fontSize: 13, fontWeight: 700 }}>
              {fileName}
            </p>
            <p style={{ color: "#6a3a10", fontSize: 11, marginTop: 2 }}>
              ✓ Leído correctamente · Haz clic para cambiar
            </p>
          </>
        ) : (
          <>
            <p style={{ color: accentColor, fontSize: 13, fontWeight: 700 }}>
              {label}
            </p>
            <p style={{ color: "#6a3a10", fontSize: 11, marginTop: 2 }}>
              o haz clic para seleccionar — solo archivos PDF
            </p>
          </>
        )}
      </div>

      {/* Borde brillante cuando se arrastra */}
      {dragging && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{ boxShadow: `0 0 0 3px ${accentColor}44` }} />
      )}
    </div>
  );
}
