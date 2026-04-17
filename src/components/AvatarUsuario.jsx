import Image from "next/image";

const BORDE_RAREZA = {
  comun: "ring-2 ring-gray-400/50",
  raro: "ring-2 ring-blue-400/70",
  epico: "ring-2 ring-purple-400/80",
  legendario: "ring-2 ring-yellow-400 shadow-lg shadow-yellow-400/40",
};

export default function AvatarUsuario({ usuario, size = 36, className = "" }) {
  const bordeClase = usuario?.bordeRareza
    ? BORDE_RAREZA[usuario.bordeRareza]
    : "ring-2 ring-foreground/30";

  const sizeStyle = { width: size, height: size, minWidth: size };

  return (
    <div
      className={`relative rounded-full overflow-hidden bg-foreground/10 flex items-center justify-center font-black text-foreground uppercase ${bordeClase} ${className}`}
      style={sizeStyle}
    >
      {usuario?.avatarUrl ? (
        <Image
          src={usuario.avatarUrl}
          alt={usuario.nombre || "avatar"}
          fill
          sizes={`${size}px`}
          className="object-cover"
          onError={(e) => {
            e.target.style.display = "none";
          }}
        />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>
          {usuario?.nombre?.[0] || "U"}
        </span>
      )}
    </div>
  );
}
