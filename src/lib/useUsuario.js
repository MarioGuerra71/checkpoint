"use client";

import { useState, useEffect } from "react";

/**
 * Hook que carga los datos del usuario autenticado
 * desde /api/usuario y enriquece los juegos con info de RAWG
 */
export function useUsuario() {
  const [usuario, setUsuario]   = useState(null);
  const [stats, setStats]       = useState(null);
  const [masJugados, setMasJugados] = useState([]);
  const [sesiones, setSesiones] = useState([]);
  const [resenas, setResenas]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      try {
        // ── 1. Datos del usuario ──────────────────────────────
        const res  = await fetch("/api/usuario");
        if (!res.ok) throw new Error("No autenticado");
        const data = await res.json();
        if (cancelled) return;

        setUsuario(data.usuario);
        setStats(data.stats);
        setSesiones(data.sesionesRecientes);
        setResenas(data.resenasRecientes);

        // ── 2. Enriquecer juegos más jugados con RAWG ─────────
        const enriched = await Promise.all(
          data.masJugados.map(async (item) => {
            try {
              const r    = await fetch(`/api/rawg?id=${item.rawg_game_id}`);
              const game = await r.json();
              return {
                ...game,
                totalMinutos: parseInt(item.total_minutos),
                totalHoras:   Math.round(parseInt(item.total_minutos) / 60),
              };
            } catch {
              return { id: item.rawg_game_id, title: "Juego desconocido", cover: null, totalMinutos: parseInt(item.total_minutos) };
            }
          })
        );

        if (!cancelled) setMasJugados(enriched);

      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    cargar();
    return () => { cancelled = true; };
  }, []);

  return { usuario, stats, masJugados, sesiones, resenas, loading, error };
}