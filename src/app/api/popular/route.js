import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/popular
 * Devuelve los juegos con más actividad (reseñas + sesiones)
 * en los últimos 7 días, enriquecidos con datos de RAWG.
 */
export async function GET() {
  try {
    // Reseñas de los últimos 7 días
    const [reseñasRecientes] = await db.query(
      `SELECT rawg_game_id, COUNT(*) as total_resenas
       FROM resena
       WHERE fecha_resena >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY rawg_game_id`,
    );

    // Sesiones de los últimos 7 días
    const [sesionesRecientes] = await db.query(
      `SELECT rawg_game_id, COUNT(*) as total_sesiones
       FROM sesion_juego
       WHERE fecha_sesion >= DATE_SUB(NOW(), INTERVAL 7 DAY)
       GROUP BY rawg_game_id`,
    );

    // Combinar y sumar actividad por juego
    const actividadMap = {};

    reseñasRecientes.forEach(({ rawg_game_id, total_resenas }) => {
      if (!actividadMap[rawg_game_id])
        actividadMap[rawg_game_id] = {
          rawg_game_id,
          actividad: 0,
          resenas: 0,
          sesiones: 0,
        };
      actividadMap[rawg_game_id].actividad += parseInt(total_resenas);
      actividadMap[rawg_game_id].resenas = parseInt(total_resenas);
    });

    sesionesRecientes.forEach(({ rawg_game_id, total_sesiones }) => {
      if (!actividadMap[rawg_game_id])
        actividadMap[rawg_game_id] = {
          rawg_game_id,
          actividad: 0,
          resenas: 0,
          sesiones: 0,
        };
      actividadMap[rawg_game_id].actividad += parseInt(total_sesiones);
      actividadMap[rawg_game_id].sesiones = parseInt(total_sesiones);
    });

    // Ordenar por actividad total y coger top 6
    const topJuegos = Object.values(actividadMap)
      .sort((a, b) => b.actividad - a.actividad)
      .slice(0, 6);

    if (topJuegos.length === 0) {
      return NextResponse.json({ juegos: [] });
    }

    // Enriquecer con RAWG
    const juegos = await Promise.all(
      topJuegos.map(async (item) => {
        try {
          const res = await fetch(
            `https://api.rawg.io/api/games/${item.rawg_game_id}?key=${process.env.RAWG_API_KEY}`,
            { next: { revalidate: 3600 } },
          );
          const game = await res.json();
          return {
            id: game.id,
            title: game.name,
            cover: game.background_image || null,
            rating: game.rating ? parseFloat(game.rating.toFixed(1)) : null,
            metacritic: game.metacritic || null,
            genre: game.genres?.[0]?.name || "Desconocido",
            actividad: item.actividad,
            resenas: item.resenas,
            sesiones: item.sesiones,
          };
        } catch {
          return null;
        }
      }),
    );

    return NextResponse.json({
      juegos: juegos.filter(Boolean),
    });
  } catch (error) {
    console.error("[API Popular Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
