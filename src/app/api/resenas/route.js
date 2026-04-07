import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/resenas?gameId=123
 * Devuelve todas las reseñas de un juego con datos del usuario
 *
 * POST /api/resenas
 * Crea una nueva reseña para el usuario autenticado
 */

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");

    if (!gameId) {
      return NextResponse.json({ error: "gameId requerido" }, { status: 400 });
    }

    const [resenas] = await db.query(
      `SELECT r.id_resena, r.puntuacion, r.comentario, r.fecha_resena,
              u.nombre_usuario, u.avatar
       FROM resena r
       JOIN usuario u ON r.id_usuario = u.id_usuario
       WHERE r.rawg_game_id = ?
       ORDER BY r.fecha_resena DESC`,
      [gameId]
    );

    return NextResponse.json({ resenas });

  } catch (error) {
    console.error("[API Reseñas GET Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    // ── Verificar autenticación ───────────────────────────
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { rawg_game_id, puntuacion, comentario } = await req.json();

    if (!rawg_game_id) {
      return NextResponse.json({ error: "rawg_game_id requerido" }, { status: 400 });
    }

    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      return NextResponse.json({ error: "Puntuación debe ser entre 1 y 5" }, { status: 400 });
    }

    // Verificar si ya existe reseña de este usuario para este juego
    const [existe] = await db.query(
      "SELECT id_resena FROM resena WHERE id_usuario = ? AND rawg_game_id = ?",
      [id_usuario, rawg_game_id]
    );

    if (existe.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes una reseña para este juego" },
        { status: 409 }
      );
    }

    await db.query(
      `INSERT INTO resena (rawg_game_id, id_usuario, puntuacion, comentario, fecha_resena)
       VALUES (?, ?, ?, ?, NOW())`,
      [rawg_game_id, id_usuario, puntuacion || null, comentario?.trim() || null]
    );

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("[API Reseñas POST Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}