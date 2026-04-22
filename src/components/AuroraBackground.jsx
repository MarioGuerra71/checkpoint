"use client";

import Aurora from "@/components/Aurora";

export default function AuroraBackground() {
  return (
    <div
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ width: "100vw", height: "100vh" }}
    >
      <Aurora
        colorStops={["#00E3F6", "#22434C", "#00b8c9"]}
        amplitude={0.8}
        blend={0.4}
      />
      <div className="absolute inset-0 bg-background/80" />
    </div>
  );
}