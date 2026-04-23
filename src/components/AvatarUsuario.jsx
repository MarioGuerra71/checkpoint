import Image from "next/image";

// Fallback por rareza si no hay color específico
const BORDE_RAREZA_FALLBACK = {
  comun:      "#9ca3af",
  raro:       "#60a5fa",
  epico:      "#c084fc",
  legendario: "#fbbf24",
};

export default function AvatarUsuario({ usuario, size = 36, className = "" }) {
  // Usar color específico del borde o fallback por rareza
  const bordeColor = usuario?.bordeColor
    || (usuario?.bordeRareza ? BORDE_RAREZA_FALLBACK[usuario.bordeRareza] : null);

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-foreground/10 flex items-center justify-center font-black text-foreground uppercase ${className}`}
      style={{
        width:    size,
        height:   size,
        minWidth: size,
        // Ring dinámico con el color del borde
        outline:        bordeColor ? `3px solid ${bordeColor}` : "2px solid rgba(0,227,246,0.3)",
        outlineOffset:  "2px",
        boxShadow:      bordeColor ? `0 0 8px ${bordeColor}60` : "none",
      }}
    >
      {usuario?.avatarUrl ? (
        <Image
          src={usuario.avatarUrl}
          alt={usuario.nombre || "avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>
          {usuario?.nombre?.[0] || "U"}
        </span>
      )}
    </div>
  );
}