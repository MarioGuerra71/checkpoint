import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const mes = searchParams.get("mes") || "";
    const limit = 10;
    const offset = (page - 1) * limit;

    let whereExtra = "";
    let extraParams = [];

    if (mes) {
      whereExtra = " AND DATE_FORMAT(s.fecha_sesion, '%Y-%m') = ?";
      extraParams = [mes];
    }

    const [sesiones] = await db.query(
      `SELECT s.id_sesion, s.rawg_game_id, s.duracion_minutos, s.fecha_sesion,
              s.comentario, s.plataforma, s.modo,
              uc.nombre_usuario as companero_nombre
       FROM sesion_juego s
       LEFT JOIN usuario uc ON s.id_companero = uc.id_usuario
       WHERE s.id_usuario = ?
       ${whereExtra}
       ORDER BY s.fecha_sesion DESC
       LIMIT ? OFFSET ?`,
      [id_usuario, ...extraParams, limit, offset],
    );

    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM sesion_juego
       WHERE id_usuario = ?
       ${mes ? " AND DATE_FORMAT(fecha_sesion, '%Y-%m') = ?" : ""}`,
      mes ? [id_usuario, mes] : [id_usuario],
    );

    let mesesDisponibles = [];
    try {
      const [meses] = await db.query(
        `SELECT DISTINCT DATE_FORMAT(fecha_sesion, '%Y-%m') as mes,
                DATE_FORMAT(fecha_sesion, '%M %Y') as label
         FROM sesion_juego
         WHERE id_usuario = ?
         ORDER BY mes DESC`,
        [id_usuario],
      );
      mesesDisponibles = meses || [];
    } catch (e) {
      console.error("[Meses disponibles error]", e);
    }

    return NextResponse.json({
      sesiones,
      total,
      totalPages: Math.ceil(total / limit) || 1,
      page,
      mesesDisponibles,
    });
  } catch (error) {
    console.error("[API Sesiones GET Error]", error);
    return NextResponse.json(
      {
        error: "Error del servidor",
        sesiones: [],
        total: 0,
        totalPages: 1,
        page: 1,
        mesesDisponibles: [],
      },
      { status: 500 },
    );
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
    const {
      rawg_game_id,
      duracion_minutos,
      fecha_sesion,
      comentario,
      plataforma,
      modo,
      id_companero,
    } = await req.json();

    if (!rawg_game_id || !duracion_minutos || !fecha_sesion) {
      return NextResponse.json(
        {
          error: "rawg_game_id, duracion_minutos y fecha_sesion son requeridos",
        },
        { status: 400 },
      );
    }

    if (duracion_minutos < 1 || duracion_minutos > 1440) {
      return NextResponse.json(
        { error: "La duración debe estar entre 1 y 1440 minutos" },
        { status: 400 },
      );
    }

    await db.query(
      `INSERT INTO sesion_juego (rawg_game_id, id_usuario, duracion_minutos, fecha_sesion, comentario, plataforma, modo, id_companero)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        rawg_game_id,
        id_usuario,
        duracion_minutos,
        fecha_sesion,
        comentario?.trim() || null,
        plataforma || null,
        modo || "solitario",
        id_companero || null,
      ],
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
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

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
      [id_sesion, id_usuario],
    );

    if (sesion.length === 0) {
      return NextResponse.json(
        { error: "Sesión no encontrada" },
        { status: 404 },
      );
    }

    await db.query("DELETE FROM sesion_juego WHERE id_sesion = ?", [id_sesion]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Sesiones DELETE Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
