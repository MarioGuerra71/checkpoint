import Image from "next/image";

const BORDE_FALLBACK = {
  comun:      "#9ca3af",
  raro:       "#60a5fa",
  epico:      "#c084fc",
  legendario: "#fbbf24",
};

export default function AvatarSimple({ usuario, size = 36, className = "" }) {
  const bordeColor = usuario?.borde_color
    || (usuario?.borde_rareza ? BORDE_FALLBACK[usuario.borde_rareza] : null);

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-foreground/10 flex items-center justify-center font-black text-foreground uppercase shrink-0 ${className}`}
      style={{
        width:         size,
        height:        size,
        minWidth:      size,
        outline:       bordeColor ? `2px solid ${bordeColor}` : "2px solid rgba(0,227,246,0.3)",
        outlineOffset: "2px",
        boxShadow:     bordeColor ? `0 0 6px ${bordeColor}50` : "none",
      }}
    >
      {usuario?.avatar_url ? (
        <Image
          src={usuario.avatar_url}
          alt={usuario.nombre_usuario || "avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>
          {usuario?.nombre_usuario?.[0] || "U"}
        </span>
      )}
    </div>
  );
}