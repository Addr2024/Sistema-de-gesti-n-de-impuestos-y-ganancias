interface ImageZoneProps {
  label: string;
  description: string;
  recommendedSize: string;
  src?: string;
  alt?: string;
  aspectRatio?: string;
  index?: number;
}

export function ImageZone({
  label,
  description,
  recommendedSize,
  src,
  alt,
  aspectRatio = "4/3",
  index,
}: ImageZoneProps) {
  return (
    <div className="relative rounded-xl overflow-hidden group"
      style={{ aspectRatio, border: "2px dashed #2d7a3a" }}>

      {src ? (
        <img src={src} alt={alt || label} className="w-full h-full object-cover" />
      ) : (
        /* Placeholder cuando no hay imagen */
        <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-4"
          style={{ background: "linear-gradient(135deg, #0f2d1a 0%, #1a4a2a 100%)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(201,168,76,0.15)", border: "2px dashed #c9a84c" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none"
              stroke="#c9a84c" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="m21 15-5-5L5 21" />
            </svg>
          </div>
          {index !== undefined && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-bold"
              style={{ background: "#c9a84c", color: "#0f2d1a" }}>
              #{index + 1}
            </span>
          )}
          <div className="text-center">
            <p style={{ color: "#c9a84c", fontSize: 13, fontWeight: 700 }}>{label}</p>
            <p style={{ color: "#86b08a", fontSize: 11, marginTop: 4 }}>{description}</p>
            <p style={{ color: "#4a7a50", fontSize: 10, marginTop: 6, fontFamily: "monospace" }}>
              📐 {recommendedSize}
            </p>
          </div>
        </div>
      )}

      {/* Badge explicativo siempre visible */}
      <div className="absolute bottom-2 left-2 right-2 rounded-md px-2 py-1.5 flex items-center gap-2"
        style={{ background: "rgba(15,45,26,0.92)", border: "1px dashed #2d7a3a" }}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="#c9a84c" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" />
        </svg>
        <span style={{ color: "#86b08a", fontSize: 10, fontWeight: 600 }}>{label}</span>
      </div>
    </div>
  );
}
