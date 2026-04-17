"use client";

import { useEffect, useRef, useState } from "react";

export default function StatCounter({ value, suffix = "", duration = 1500 }) {
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || started || !value) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, started]);

  useEffect(() => {
    if (!started || !value) return;
    const start = performance.now();
    const numValue = parseInt(String(value).replace(/\D/g, "")) || 0;

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * numValue));
      if (progress < 1) requestAnimationFrame(tick);
      else setDisplay(numValue);
    };

    requestAnimationFrame(tick);
  }, [started, value, duration]);

  return (
    <span ref={ref}>
      {display.toLocaleString("es-ES")}
      {suffix}
    </span>
  );
}
