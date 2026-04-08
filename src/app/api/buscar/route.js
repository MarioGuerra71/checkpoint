import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/buscar?q=texto
 * Busca juegos en RAWG y usuarios en la BD simultáneamente
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();

    if (!q || q.length < 2) {
      return NextResponse.json({ error: "Mínimo 2 caracteres" }, { status: 400 });
    }

    // ── Buscar juegos en RAWG y usuarios en BD en paralelo ──
    const [rawgRes, [usuarios]] = await Promise.all([
      fetch(
        `https://api.rawg.io/api/games?key=${process.env.RAWG_API_KEY}&search=${encodeURIComponent(q)}&page_size=8&search_precise=true`,
        { next: { revalidate: 300 } }
      ),
      db.query(
        `SELECT id_usuario, nombre_usuario, avatar
         FROM usuario
         WHERE nombre_usuario LIKE ?
         LIMIT 5`,
        [`%${q}%`]
      ),
    ]);

    if (!rawgRes.ok) throw new Error("Error al contactar con RAWG");
    const rawgData = await rawgRes.json();

    const juegos = (rawgData.results || []).map((g) => ({
      id:         g.id,
      title:      g.name,
      cover:      g.background_image || null,
      rating:     g.rating ? parseFloat(g.rating.toFixed(1)) : null,
      metacritic: g.metacritic || null,
      released:   g.released || null,
      genre:      g.genres?.[0]?.name || "Desconocido",
    }));

    return NextResponse.json({ juegos, usuarios });

  } catch (error) {
    console.error("[API Buscar Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}