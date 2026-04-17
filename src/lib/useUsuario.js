"use client";

import { useState, useEffect } from "react";

export function useUsuario() {
  const [usuario, setUsuario] = useState(null);
  const [stats, setStats] = useState(null);
  const [masJugados, setMasJugados] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [resenas, setResenas] = useState([]);
  const [tema, setTemaState] = useState("oscuro");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      try {
        const res = await fetch("/api/usuario");
        if (!res.ok) throw new Error("No autenticado");
        const data = await res.json();
        if (cancelled) return;

        setUsuario(data.usuario);
        setStats(data.stats);
        setSesiones(data.sesionesRecientes);
        setResenas(data.resenasRecientes);
        setTemaState(data.tema || "oscuro");

        const enriched = await Promise.all(
          data.masJugados.map(async (item) => {
            try {
              const r = await fetch(`/api/rawg?id=${item.rawg_game_id}`);
              const game = await r.json();
              return {
                ...game,
                totalMinutos: parseInt(item.total_minutos),
                totalHoras: Math.round(parseInt(item.total_minutos) / 60),
              };
            } catch {
              return {
                id: item.rawg_game_id,
                title: "Juego desconocido",
                cover: null,
                totalMinutos: parseInt(item.total_minutos),
              };
            }
          }),
        );

        if (!cancelled) setMasJugados(enriched);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelled = true;
    };
  }, []);

  const cambiarTema = async (nuevoTema) => {
    setTemaState(nuevoTema);
    // Aplica al DOM inmediatamente
    document.documentElement.style.setProperty(
      "--background",
      nuevoTema === "claro" ? "#f0f8fa" : "#22434C",
    );
    document.documentElement.style.setProperty(
      "--foreground",
      nuevoTema === "claro" ? "#0e2a31" : "#00E3F6",
    );
    // Guarda en BD
    await fetch("/api/usuario/tema", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tema: nuevoTema }),
    });
  };

  return {
    usuario,
    stats,
    masJugados,
    sesiones,
    resenas,
    tema,
    cambiarTema,
    loading,
    error,
  };
}
