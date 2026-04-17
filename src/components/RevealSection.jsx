"use client";

import { useScrollReveal } from "@/lib/useScrollReveal";

export default function RevealSection({
  children,
  className = "",
  delay = 0,
  direction = "up", // "up" | "left" | "right" | "none"
}) {
  const { ref, visible } = useScrollReveal();

  const directions = {
    up: "translate-y-12 opacity-0",
    left: "-translate-x-12 opacity-0",
    right: "translate-x-12 opacity-0",
    none: "opacity-0",
  };

  const initial = directions[direction] || directions.up;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        visible ? "translate-y-0 translate-x-0 opacity-100" : initial
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
