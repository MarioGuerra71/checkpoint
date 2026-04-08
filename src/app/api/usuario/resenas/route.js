import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/usuario/resenas?page=1
 * Devuelve todas las reseñas del usuario con paginación
 */
export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page   = parseInt(searchParams.get("page") || "1");
    const limit  = 8;
    const offset = (page - 1) * limit;

    const [resenas] = await db.query(
      `SELECT id_resena, rawg_game_id, puntuacion, comentario, fecha_resena
       FROM resena
       WHERE id_usuario = ?
       ORDER BY fecha_resena DESC
       LIMIT ? OFFSET ?`,
      [id_usuario, limit, offset]
    );

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM resena WHERE id_usuario = ?",
      [id_usuario]
    );

    return NextResponse.json({
      resenas,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });

  } catch (error) {
    console.error("[API Usuario Reseñas Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}