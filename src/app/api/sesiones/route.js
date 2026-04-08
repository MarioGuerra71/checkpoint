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
    const page  = parseInt(searchParams.get("page") || "1");
    const limit = 10;
    const offset = (page - 1) * limit;

    const [sesiones] = await db.query(
      `SELECT id_sesion, rawg_game_id, duracion_minutos, fecha_sesion, comentario
       FROM sesion_juego
       WHERE id_usuario = ?
       ORDER BY fecha_sesion DESC
       LIMIT ? OFFSET ?`,
      [id_usuario, limit, offset]
    );

    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) as total FROM sesion_juego WHERE id_usuario = ?",
      [id_usuario]
    );

    return NextResponse.json({
      sesiones,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    });

  } catch (error) {
    console.error("[API Sesiones GET Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { rawg_game_id, duracion_minutos, fecha_sesion, comentario } = await req.json();

    if (!rawg_game_id || !duracion_minutos || !fecha_sesion) {
      return NextResponse.json(
        { error: "rawg_game_id, duracion_minutos y fecha_sesion son requeridos" },
        { status: 400 }
      );
    }

    if (duracion_minutos < 1 || duracion_minutos > 1440) {
      return NextResponse.json(
        { error: "La duración debe estar entre 1 y 1440 minutos" },
        { status: 400 }
      );
    }

    await db.query(
      `INSERT INTO sesion_juego (rawg_game_id, id_usuario, duracion_minutos, fecha_sesion, comentario)
       VALUES (?, ?, ?, ?, ?)`,
      [rawg_game_id, id_usuario, duracion_minutos, fecha_sesion, comentario?.trim() || null]
    );

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("[API Sesiones POST Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id_sesion = searchParams.get("id");

    if (!id_sesion) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    const [sesion] = await db.query(
      "SELECT id_sesion FROM sesion_juego WHERE id_sesion = ? AND id_usuario = ?",
      [id_sesion, id_usuario]
    );

    if (sesion.length === 0) {
      return NextResponse.json({ error: "Sesión no encontrada" }, { status: 404 });
    }

    await db.query("DELETE FROM sesion_juego WHERE id_sesion = ?", [id_sesion]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API Sesiones DELETE Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}