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
      `SELECT r.rawg_game_id, r.puntuacion, r.comentario, r.plataforma, r.modo, r.fecha_resena,
          uc.nombre_usuario as companero_nombre
   FROM resena r
   LEFT JOIN usuario uc ON r.id_companero = uc.id_usuario
   WHERE r.id_usuario = ?
   ORDER BY r.fecha_resena DESC LIMIT 5`,
      [u.id_usuario],
    );
    const puntos = Math.floor(
      totalResenas * 10 + Math.floor(totalHoras / 60) * 2,
    );

    const niveles = [
      { nivel: 1, nombre: "Novato", icono: "🌱", min: 0 },
      { nivel: 2, nombre: "Jugador", icono: "🎮", min: 100 },
      { nivel: 3, nombre: "Aficionado", icono: "⚡", min: 300 },
      { nivel: 4, nombre: "Veterano", icono: "🔥", min: 600 },
      { nivel: 5, nombre: "Experto", icono: "💎", min: 1000 },
      { nivel: 6, nombre: "Maestro", icono: "👑", min: 2000 },
      { nivel: 7, nombre: "Leyenda", icono: "🌟", min: 4000 },
    ];
    const nivelActual =
      [...niveles].reverse().find((n) => puntos >= n.min) || niveles[0];
    const siguiente = niveles.find((n) => n.min > puntos);
    const nivel = {
      ...nivelActual,
      puntos,
      progreso: siguiente
        ? Math.round(
            ((puntos - nivelActual.min) / (siguiente.min - nivelActual.min)) *
              100,
          )
        : 100,
    };
    const [favoritos] = await db.query(
      "SELECT rawg_game_id FROM favorito WHERE id_usuario = ? LIMIT 20",
      [u.id_usuario],
    );

    const [sesiones] = await db.query(
      `SELECT s.rawg_game_id, s.duracion_minutos, s.fecha_sesion,
          s.comentario, s.plataforma, s.modo,
          uc.nombre_usuario as companero_nombre
   FROM sesion_juego s
   LEFT JOIN usuario uc ON s.id_companero = uc.id_usuario
   WHERE s.id_usuario = ?
   ORDER BY s.fecha_sesion DESC
   LIMIT 10`,
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
      sesiones,
      favoritosIds: favoritos.map(f => f.rawg_game_id),
      resenas,
      nivel,
    });
  } catch (error) {
    console.error("[API Usuario Público Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
