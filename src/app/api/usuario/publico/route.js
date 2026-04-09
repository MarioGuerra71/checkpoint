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
      `SELECT id_usuario, nombre_usuario, avatar, fecha_registro FROM usuario
       WHERE nombre_usuario = ?`,
      [nombre]
    );

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const u = usuarios[0];

    // Stats públicas
    const [[{ totalResenas }]] = await db.query(
      "SELECT COUNT(*) as totalResenas FROM resena WHERE id_usuario = ?",
      [u.id_usuario]
    );
    const [[{ totalHoras }]] = await db.query(
      "SELECT COALESCE(SUM(duracion_minutos), 0) as totalHoras FROM sesion_juego WHERE id_usuario = ?",
      [u.id_usuario]
    );
    const [[{ totalListas }]] = await db.query(
      "SELECT COUNT(*) as totalListas FROM lista WHERE id_usuario = ?",
      [u.id_usuario]
    );

    // Reseñas recientes
    const [resenas] = await db.query(
      `SELECT rawg_game_id, puntuacion, comentario, fecha_resena
       FROM resena WHERE id_usuario = ?
       ORDER BY fecha_resena DESC LIMIT 5`,
      [u.id_usuario]
    );

    return NextResponse.json({
      usuario: {
        id:            u.id_usuario,
        nombre:        u.nombre_usuario,
        avatar:        u.avatar,
        fechaRegistro: u.fecha_registro,
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