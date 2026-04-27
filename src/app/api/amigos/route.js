import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match        = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario   = match ? parseInt(match[1]) : null;

    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const [amigos] = await db.query(
      `SELECT u.id_usuario, u.nombre_usuario
       FROM seguimiento s
       JOIN usuario u ON s.id_seguido = u.id_usuario
       WHERE s.id_seguidor = ?
       ORDER BY u.nombre_usuario ASC`,
      [id_usuario]
    );

    return NextResponse.json({ amigos });

  } catch (error) {
    console.error("[API Amigos Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}