import { NextResponse } from "next/server";
import { db } from "@/lib/db";

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
      [gameId],
    );

    return NextResponse.json({ resenas });
  } catch (error) {
    console.error("[API Reseñas GET Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { rawg_game_id, puntuacion, comentario } = await req.json();

    if (!rawg_game_id) {
      return NextResponse.json(
        { error: "rawg_game_id requerido" },
        { status: 400 },
      );
    }

    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      return NextResponse.json(
        { error: "Puntuación debe ser entre 1 y 5" },
        { status: 400 },
      );
    }

    const [existe] = await db.query(
      "SELECT id_resena FROM resena WHERE id_usuario = ? AND rawg_game_id = ?",
      [id_usuario, rawg_game_id],
    );

    if (existe.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes una reseña para este juego" },
        { status: 409 },
      );
    }

    await db.query(
      `INSERT INTO resena (rawg_game_id, id_usuario, puntuacion, comentario, fecha_resena)
       VALUES (?, ?, ?, ?, NOW())`,
      [
        rawg_game_id,
        id_usuario,
        puntuacion || null,
        comentario?.trim() || null,
      ],
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[API Reseñas POST Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// ── EDITAR reseña ─────────────────────────────────────────────
export async function PUT(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id_resena, puntuacion, comentario } = await req.json();

    if (!id_resena) {
      return NextResponse.json(
        { error: "id_resena requerido" },
        { status: 400 },
      );
    }

    if (puntuacion && (puntuacion < 1 || puntuacion > 5)) {
      return NextResponse.json(
        { error: "Puntuación debe ser entre 1 y 5" },
        { status: 400 },
      );
    }

    // Verificar que la reseña pertenece al usuario
    const [resena] = await db.query(
      "SELECT id_resena FROM resena WHERE id_resena = ? AND id_usuario = ?",
      [id_resena, id_usuario],
    );

    if (resena.length === 0) {
      return NextResponse.json(
        { error: "Reseña no encontrada" },
        { status: 404 },
      );
    }

    await db.query(
      `UPDATE resena SET puntuacion = ?, comentario = ? WHERE id_resena = ?`,
      [puntuacion || null, comentario?.trim() || null, id_resena],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Reseñas PUT Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

// ── ELIMINAR reseña ───────────────────────────────────────────
export async function DELETE(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id_resena = searchParams.get("id");

    if (!id_resena) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    // Verificar que pertenece al usuario
    const [resena] = await db.query(
      "SELECT id_resena FROM resena WHERE id_resena = ? AND id_usuario = ?",
      [id_resena, id_usuario],
    );

    if (resena.length === 0) {
      return NextResponse.json(
        { error: "Reseña no encontrada" },
        { status: 404 },
      );
    }

    await db.query("DELETE FROM resena WHERE id_resena = ?", [id_resena]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Reseñas DELETE Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
