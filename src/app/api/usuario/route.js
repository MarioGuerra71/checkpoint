import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/usuario
 * Devuelve los datos del usuario autenticado usando la cookie auth_token.
 * Incluye: datos básicos, estadísticas, sesiones recientes y reseñas.
 */
export async function GET(req) {
  try {
    // ── Leer id_usuario de la cookie ──────────────────────────
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // ── Datos básicos del usuario ─────────────────────────────
    const [usuarios] = await db.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.email, u.avatar, u.fecha_registro,
          ai_av.imagen_url as avatar_url, ai_av.rareza as avatar_rareza,
          ai_bo.imagen_url as borde_url, ai_bo.rareza as borde_rareza, ai_bo.color_hex as borde_color
   FROM usuario u
   LEFT JOIN avatar_item ai_av ON u.id_avatar = ai_av.id_item
   LEFT JOIN avatar_item ai_bo ON u.id_borde  = ai_bo.id_item
   WHERE u.id_usuario = ?`,
      [id_usuario],
    );

    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }

    const usuario = usuarios[0];

    // ── Estadísticas ──────────────────────────────────────────

    // Total horas jugadas
    const [horasResult] = await db.query(
      "SELECT COALESCE(SUM(duracion_minutos), 0) as total_minutos FROM sesion_juego WHERE id_usuario = ?",
      [id_usuario],
    );
    const totalMinutos = horasResult[0].total_minutos;
    const totalHoras = Math.round(totalMinutos / 60);

    // Total reseñas
    const [resenasCount] = await db.query(
      "SELECT COUNT(*) as total FROM resena WHERE id_usuario = ?",
      [id_usuario],
    );

    // Total favoritos
    const [favoritosCount] = await db.query(
      "SELECT COUNT(*) as total FROM favorito WHERE id_usuario = ?",
      [id_usuario],
    );

    // Total listas
    const [listasCount] = await db.query(
      "SELECT COUNT(*) as total FROM lista WHERE id_usuario = ?",
      [id_usuario],
    );

    // ── Sesiones recientes (últimas 5) ────────────────────────
    const [sesiones] = await db.query(
      `SELECT s.rawg_game_id, s.duracion_minutos, s.fecha_sesion,
          s.comentario, s.plataforma, s.modo,
          uc.nombre_usuario as companero_nombre
   FROM sesion_juego s
   LEFT JOIN usuario uc ON s.id_companero = uc.id_usuario
   WHERE s.id_usuario = ?
   ORDER BY s.fecha_sesion DESC
   LIMIT 5`,
      [id_usuario],
    );

    // ── Reseñas recientes (últimas 5) ─────────────────────────
    const [resenas] = await db.query(
      `SELECT r.rawg_game_id, r.puntuacion, r.comentario, r.plataforma,
          r.modo, r.fecha_resena,
          uc.nombre_usuario as companero_nombre
   FROM resena r
   LEFT JOIN usuario uc ON r.id_companero = uc.id_usuario
   WHERE r.id_usuario = ?
   ORDER BY r.fecha_resena DESC
   LIMIT 5`,
      [id_usuario],
    );

    // ── Juegos más jugados (por horas) ────────────────────────
    const [masJugados] = await db.query(
      `SELECT rawg_game_id, SUM(duracion_minutos) as total_minutos
       FROM sesion_juego
       WHERE id_usuario = ?
       GROUP BY rawg_game_id
       ORDER BY total_minutos DESC
       LIMIT 6`,
      [id_usuario],
    );

    // ── IDs de favoritos ──────────────────────────────────────
    const [favoritos] = await db.query(
      "SELECT rawg_game_id FROM favorito WHERE id_usuario = ?",
      [id_usuario],
    );

    // ── Tema del usuario ──────────────────────────────────
    const [prefResult] = await db.query(
      "SELECT tema FROM preferencias_usuario WHERE id_usuario = ?",
      [id_usuario],
    );
    const tema = prefResult[0]?.tema || "oscuro";

    // ── Respuesta completa ────────────────────────────────────
    return NextResponse.json({
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        email: usuario.email,
        avatar: usuario.avatar,
        fechaRegistro: usuario.fecha_registro,
        avatarUrl: usuario.avatar_url || null,
        avatarRareza: usuario.avatar_rareza || null,
        bordeUrl: usuario.borde_url || null,
        bordeRareza: usuario.borde_rareza || null,
        bordeColor: usuario.borde_color || null,
      },
      stats: {
        horasJugadas: totalHoras,
        totalResenas: resenasCount[0].total,
        totalFavoritos: favoritosCount[0].total,
        totalListas: listasCount[0].total,
      },
      tema,
      sesionesRecientes: sesiones,
      resenasRecientes: resenas,
      masJugados: masJugados,
      favoritosIds: favoritos.map((f) => f.rawg_game_id),
    });
  } catch (error) {
    console.error("[API Usuario Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
