"use client";

import { useState } from "react";

export default function TextExpandible({ texto, maxLength = 80, className = "" }) {
  const [expandido, setExpandido] = useState(false);

  if (!texto) return null;

  if (texto.length <= maxLength) {
    return <span className={className}>{texto}</span>;
  }

  return (
    <span className={className}>
      {expandido ? texto : `${texto.slice(0, maxLength)}...`}
      <button
        onClick={(e) => { e.stopPropagation(); setExpandido(!expandido); }}
        className="ml-1 text-foreground/60 hover:text-foreground font-bold transition-colors cursor-pointer underline underline-offset-2 text-[10px]"
      >
        {expandido ? "Ver menos" : "Ver más"}
      </button>
    </span>
  );
}