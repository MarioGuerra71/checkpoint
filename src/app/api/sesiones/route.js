import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/sesiones
 * Registra una nueva sesión de juego para el usuario autenticado
 */
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