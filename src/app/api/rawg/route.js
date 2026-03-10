import { NextResponse } from "next/server";

// ============================================================
// GET /api/rawg?type=trending|nuevos|mejorValorados
//
// Proxy interno hacia la API de RAWG.
// La API key NUNCA sale al navegador — solo vive en el servidor.
// ============================================================

const RAWG_BASE = "https://api.rawg.io/api";
const API_KEY   = process.env.RAWG_API_KEY;

// Devuelve los parámetros de query según el tipo solicitado
function buildParams(type) {
  const base = {
    key: API_KEY,
    page_size: 6,
    // Solo juegos con portada disponible
  };

  // Fechas para filtrar por "esta semana" en trending
  const today     = new Date();
  const weekAgo   = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (type) {
    case "trending":
      return {
        ...base,
        // Juegos con más añadidos por usuarios en los últimos 7 días
        dates:   `${fmt(weekAgo)},${fmt(today)}`,
        ordering: "-added",
      };

    case "nuevos":
      return {
        ...base,
        // Lanzados en los últimos 60 días, ordenados por fecha
        dates: (() => {
          const twoMonthsAgo = new Date();
          twoMonthsAgo.setDate(today.getDate() - 60);
          return `${fmt(twoMonthsAgo)},${fmt(today)}`;
        })(),
        ordering: "-released",
      };

    case "mejorValorados":
      return {
        ...base,
        // Todos los tiempos, ordenados por rating de Metacritic
        ordering:        "-metacritic",
        metacritic:      "80,100",
      };

    default:
      return base;
  }
}

export async function GET(req) {
  try {
    // ── Leer parámetro ?type=... ──────────────────────────────
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "trending";

    // ── Construir URL hacia RAWG ──────────────────────────────
    const params     = buildParams(type);
    const queryString = new URLSearchParams(params).toString();
    const rawgUrl    = `${RAWG_BASE}/games?${queryString}`;

    // ── Petición a RAWG ───────────────────────────────────────
    const rawgRes = await fetch(rawgUrl, {
      // Next.js cachea automáticamente; revalidamos cada 10 minutos
      next: { revalidate: 600 },
    });

    if (!rawgRes.ok) {
      console.error("[RAWG API Error]", rawgRes.status, await rawgRes.text());
      return NextResponse.json(
        { error: "Error al contactar con RAWG" },
        { status: rawgRes.status }
      );
    }

    const data = await rawgRes.json();

    // ── Normalizar la respuesta ───────────────────────────────
    // Solo enviamos al cliente los campos que necesitamos
    const games = (data.results || []).map((g) => ({
      id:          g.id,
      title:       g.name,
      cover:       g.background_image || null,
      rating:      g.rating            ? parseFloat(g.rating.toFixed(1))  : null,
      metacritic:  g.metacritic        || null,
      released:    g.released          || null,
      genre:       g.genres?.[0]?.name || "Desconocido",
      genres:      g.genres?.map((x) => x.name) || [],
      platforms:   g.platforms?.map((p) => p.platform.name) || [],
    }));

    return NextResponse.json({ games });

  } catch (error) {
    console.error("[API RAWG Error]", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
