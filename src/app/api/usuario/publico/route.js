import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/usuario/publico?nombre=X
 * Devuelve el perfil público de un usuario por su nombre
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const nombre = searchParams.get("nombre");

    if (!nombre) {
      return NextResponse.json({ error: "nombre requerido" }, { status: 400 });
    }

    const [usuarios] = await db.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.avatar, u.fecha_registro,
              ai_av.imagen_url  as avatar_url,  ai_av.rareza    as avatar_rareza,
              ai_bo.rareza      as borde_rareza, ai_bo.color_hex as borde_color
       FROM usuario u
       LEFT JOIN avatar_item ai_av ON u.id_avatar = ai_av.id_item
       LEFT JOIN avatar_item ai_bo ON u.id_borde  = ai_bo.id_item
       WHERE u.nombre_usuario = ?`,
      [nombre],
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const u = usuarios[0];

    const [[{ totalResenas }]] = await db.query(
      "SELECT COUNT(*) as totalResenas FROM resena WHERE id_usuario = ?",
      [u.id_usuario],
    );
    const [[{ totalHoras }]] = await db.query(
      "SELECT COALESCE(SUM(duracion_minutos), 0) as totalHoras FROM sesion_juego WHERE id_usuario = ?",
      [u.id_usuario],
    );
    const [[{ totalListas }]] = await db.query(
      "SELECT COUNT(*) as totalListas FROM lista WHERE id_usuario = ?",
      [u.id_usuario],
    );

    const [resenas] = await db.query(
      `SELECT rawg_game_id, puntuacion, comentario, plataforma, fecha_resena
       FROM resena WHERE id_usuario = ?
       ORDER BY fecha_resena DESC LIMIT 5`,
      [u.id_usuario],
    );

    return NextResponse.json({
      usuario: {
        id: u.id_usuario,
        nombre: u.nombre_usuario,
        avatar: u.avatar,
        fechaRegistro: u.fecha_registro,
        avatarUrl: u.avatar_url || null,
        avatarRareza: u.avatar_rareza || null,
        bordeRareza: u.borde_rareza || null,
        bordeColor: u.borde_color || null,
      },
      stats: {
        totalResenas,
        horasJugadas: Math.round(totalHoras / 60),
        totalListas,
      },
      resenas,
    });
  } catch (error) {
    console.error("[API Usuario Público Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
