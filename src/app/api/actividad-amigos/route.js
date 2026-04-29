import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * GET /api/actividad-amigos
 * Devuelve las últimas reseñas y sesiones de los usuarios que sigues
 */
export async function GET(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    // Obtener IDs de usuarios que sigo
    const [seguidos] = await db.query(
      "SELECT id_seguido FROM seguimiento WHERE id_seguidor = ?",
      [id_usuario],
    );

    if (seguidos.length === 0) {
      return NextResponse.json({ actividad: [] });
    }

    const ids = seguidos.map((s) => s.id_seguido);

    // Últimas reseñas de amigos
    const [resenas] = await db.query(
      `SELECT r.id_resena, r.rawg_game_id, r.puntuacion, r.comentario, r.fecha_resena,
          u.id_usuario, u.nombre_usuario,
          ai_av.imagen_url as avatar_url,
          ai_bo.color_hex  as borde_color, ai_bo.rareza as borde_rareza,
          'resena' as tipo
   FROM resena r
   JOIN usuario u ON r.id_usuario = u.id_usuario
   LEFT JOIN avatar_item ai_av ON u.id_avatar = ai_av.id_item
   LEFT JOIN avatar_item ai_bo ON u.id_borde  = ai_bo.id_item
   WHERE r.id_usuario IN (?)
   ORDER BY r.fecha_resena DESC
   LIMIT 10`,
      [ids],
    );

    // Últimas sesiones de amigos
    const [sesiones] = await db.query(
      `SELECT s.id_sesion, s.rawg_game_id, s.duracion_minutos, s.fecha_sesion, s.comentario,
          u.id_usuario, u.nombre_usuario,
          ai_av.imagen_url as avatar_url,
          ai_bo.color_hex  as borde_color, ai_bo.rareza as borde_rareza,
          'sesion' as tipo
   FROM sesion_juego s
   JOIN usuario u ON s.id_usuario = u.id_usuario
   LEFT JOIN avatar_item ai_av ON u.id_avatar = ai_av.id_item
   LEFT JOIN avatar_item ai_bo ON u.id_borde  = ai_bo.id_item
   WHERE s.id_usuario IN (?)
   ORDER BY s.fecha_sesion DESC
   LIMIT 10`,
      [ids],
    );

    // Combinar, ordenar por fecha y coger los 8 más recientes
    const todo = [
      ...resenas.map((r) => ({ ...r, fecha: r.fecha_resena })),
      ...sesiones.map((s) => ({ ...s, fecha: s.fecha_sesion })),
    ]
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
      .slice(0, 8);

    return NextResponse.json({ actividad: todo });
  } catch (error) {
    console.error("[API Actividad Amigos]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
