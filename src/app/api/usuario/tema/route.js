import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * POST /api/usuario/tema
 * Actualiza el tema del usuario (oscuro/claro) en la BD
 */
export async function POST(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { tema } = await req.json();

    if (!["oscuro", "claro"].includes(tema)) {
      return NextResponse.json({ error: "Tema no válido" }, { status: 400 });
    }

    await db.query(
      `INSERT INTO preferencias_usuario (id_usuario, tema)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE tema = ?`,
      [id_usuario, tema, tema]
    );

    return NextResponse.json({ success: true, tema });

  } catch (error) {
    console.error("[API Tema Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}