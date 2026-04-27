import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page    = parseInt(searchParams.get("page") || "1");
    const gameIds = searchParams.get("gameIds");
    const limit   = 8;
    const offset  = (page - 1) * limit;

    let whereClause = "WHERE r.id_usuario = ?";
    let queryParams = [id_usuario];

    if (gameIds) {
      const ids = gameIds.split(",").map(Number).filter(Boolean);
      if (ids.length > 0) {
        whereClause += ` AND r.rawg_game_id IN (${ids.map(() => "?").join(",")})`;
        queryParams  = [id_usuario, ...ids];
      }
    }

    const [resenas] = await db.query(
      `SELECT r.id_resena, r.rawg_game_id, r.puntuacion, r.comentario,
              r.plataforma, r.modo, r.fecha_resena,
              uc.nombre_usuario as companero_nombre
       FROM resena r
       LEFT JOIN usuario uc ON r.id_companero = uc.id_usuario
       ${whereClause}
       ORDER BY r.fecha_resena DESC
       LIMIT ? OFFSET ?`,
      [...queryParams, limit, offset]
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM resena r ${whereClause}`,
      queryParams
    );

    return NextResponse.json({
      resenas,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      page,
    });

  } catch (error) {
    console.error("[API Usuario Reseñas Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}