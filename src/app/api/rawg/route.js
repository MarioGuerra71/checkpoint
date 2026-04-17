import { NextResponse } from "next/server";

const RAWG_BASE = "https://api.rawg.io/api";
const API_KEY   = process.env.RAWG_API_KEY;

function buildParams(type) {
  const base = { key: API_KEY, page_size: 28 };

  const today   = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);
  const fmt = (d) => d.toISOString().split("T")[0];

  switch (type) {
    case "trending":
      return {
        ...base,
        page_size: 28,                              // ← sube a 28
        dates: (() => {
          const monthAgo = new Date();
          monthAgo.setDate(today.getDate() - 30);   // ← 30 días en vez de 7
          return `${fmt(monthAgo)},${fmt(today)}`;
        })(),
        ordering: "-added",
      };
      return { ...base, dates: `${fmt(weekAgo)},${fmt(today)}`, ordering: "-added" };
    case "nuevos":
      return { ...base, dates: (() => { const d = new Date(); d.setDate(today.getDate() - 60); return `${fmt(d)},${fmt(today)}`; })(), ordering: "-released" };
    case "mejorValorados":
      return { ...base, page_size: 28, ordering: "-metacritic", metacritic: "80,100" };
    default:
      return base;
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");
    const id   = searchParams.get("id");

    // ── Detalle de un juego por ID ────────────────────────────
    if (id) {
      const res = await fetch(
        `${RAWG_BASE}/games/${id}?key=${API_KEY}`,
        { next: { revalidate: 86400 } }
      );
      if (!res.ok) return NextResponse.json({ error: "Juego no encontrado" }, { status: res.status });
      const g = await res.json();
      return NextResponse.json({
        id:          g.id,
        title:       g.name,
        cover:       g.background_image || null,
        rating:      g.rating ? parseFloat(g.rating.toFixed(1)) : null,
        metacritic:  g.metacritic || null,
        released:    g.released || null,
        genre:       g.genres?.[0]?.name || "Desconocido",
        genres:      g.genres?.map((x) => x.name) || [],
        platforms:   g.platforms?.map((p) => p.platform.name) || [],
        description: g.description_raw || g.description || null,
        playtime:    g.playtime || null,
        website:     g.website || null,
        developers:  g.developers?.map((d) => d.name) || [],
        publishers:  g.publishers?.map((p) => p.name) || [],
      });
    }

    // ── Lista de juegos ───────────────────────────────────────
    const params      = buildParams(type || "trending");
    const queryString = new URLSearchParams(params).toString();
    const rawgRes     = await fetch(`${RAWG_BASE}/games?${queryString}`, { next: { revalidate: 600 } });

    if (!rawgRes.ok) {
      console.error("[RAWG API Error]", rawgRes.status);
      return NextResponse.json({ error: "Error al contactar con RAWG" }, { status: rawgRes.status });
    }

    const data  = await rawgRes.json();
    const games = (data.results || []).map((g) => ({
      id:          g.id,
      title:       g.name,
      cover:       g.background_image || null,
      rating:      g.rating ? parseFloat(g.rating.toFixed(1)) : null,
      metacritic:  g.metacritic || null,
      released:    g.released || null,
      genre:       g.genres?.[0]?.name || "Desconocido",
      genres:      g.genres?.map((x) => x.name) || [],
      platforms:   g.platforms?.map((p) => p.platform.name) || [],
    }));

    return NextResponse.json({ games });

  } catch (error) {
    console.error("[API RAWG Error]", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}