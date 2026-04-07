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
      "SELECT id_usuario, nombre_usuario, email, avatar, fecha_registro FROM usuario WHERE id_usuario = ?",
      [id_usuario]
    );

    if (usuarios.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    const usuario = usuarios[0];

    // ── Estadísticas ──────────────────────────────────────────

    // Total horas jugadas
    const [horasResult] = await db.query(
      "SELECT COALESCE(SUM(duracion_minutos), 0) as total_minutos FROM sesion_juego WHERE id_usuario = ?",
      [id_usuario]
    );
    const totalMinutos = horasResult[0].total_minutos;
    const totalHoras   = Math.round(totalMinutos / 60);

    // Total reseñas
    const [resenasCount] = await db.query(
      "SELECT COUNT(*) as total FROM resena WHERE id_usuario = ?",
      [id_usuario]
    );

    // Total favoritos
    const [favoritosCount] = await db.query(
      "SELECT COUNT(*) as total FROM favorito WHERE id_usuario = ?",
      [id_usuario]
    );

    // Total listas
    const [listasCount] = await db.query(
      "SELECT COUNT(*) as total FROM lista WHERE id_usuario = ?",
      [id_usuario]
    );

    // ── Sesiones recientes (últimas 5) ────────────────────────
    const [sesiones] = await db.query(
      `SELECT rawg_game_id, duracion_minutos, fecha_sesion, comentario
       FROM sesion_juego
       WHERE id_usuario = ?
       ORDER BY fecha_sesion DESC
       LIMIT 5`,
      [id_usuario]
    );

    // ── Reseñas recientes (últimas 5) ─────────────────────────
    const [resenas] = await db.query(
      `SELECT rawg_game_id, puntuacion, comentario, fecha_resena
       FROM resena
       WHERE id_usuario = ?
       ORDER BY fecha_resena DESC
       LIMIT 5`,
      [id_usuario]
    );

    // ── Juegos más jugados (por horas) ────────────────────────
    const [masJugados] = await db.query(
      `SELECT rawg_game_id, SUM(duracion_minutos) as total_minutos
       FROM sesion_juego
       WHERE id_usuario = ?
       GROUP BY rawg_game_id
       ORDER BY total_minutos DESC
       LIMIT 6`,
      [id_usuario]
    );

    // ── IDs de favoritos ──────────────────────────────────────
    const [favoritos] = await db.query(
      "SELECT rawg_game_id FROM favorito WHERE id_usuario = ?",
      [id_usuario]
    );

    // ── Tema del usuario ──────────────────────────────────
    const [prefResult] = await db.query(
      "SELECT tema FROM preferencias_usuario WHERE id_usuario = ?",
      [id_usuario]
    );
    const tema = prefResult[0]?.tema || "oscuro";

    // ── Respuesta completa ────────────────────────────────────
    return NextResponse.json({
      usuario: {
        id:              usuario.id_usuario,
        nombre:          usuario.nombre_usuario,
        email:           usuario.email,
        avatar:          usuario.avatar,
        fechaRegistro:   usuario.fecha_registro,
      },
      stats: {
        horasJugadas:    totalHoras,
        totalResenas:    resenasCount[0].total,
        totalFavoritos:  favoritosCount[0].total,
        totalListas:     listasCount[0].total,
      },
      tema,
      sesionesRecientes: sesiones,
      resenasRecientes:  resenas,
      masJugados:        masJugados,
      favoritosIds:      favoritos.map(f => f.rawg_game_id),
    });

  } catch (error) {
    console.error("[API Usuario Error]", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}