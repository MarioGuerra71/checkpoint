import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/favoritos — Lista de favoritos del usuario
 * POST /api/favoritos — Añadir a favoritos
 * DELETE /api/favoritos?gameId=X — Quitar de favoritos
 */

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match        = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

export async function GET(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const [favoritos] = await db.query(
      "SELECT rawg_game_id FROM favorito WHERE id_usuario = ? ORDER BY rawg_game_id DESC",
      [id_usuario]
    );

    return NextResponse.json({ favoritos: favoritos.map(f => f.rawg_game_id) });

  } catch (error) {
    console.error("[API Favoritos GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { rawg_game_id } = await req.json();
    if (!rawg_game_id) return NextResponse.json({ error: "rawg_game_id requerido" }, { status: 400 });

    // Verificar que no existe ya
    const [existe] = await db.query(
      "SELECT id_usuario FROM favorito WHERE id_usuario = ? AND rawg_game_id = ?",
      [id_usuario, rawg_game_id]
    );

    if (existe.length > 0) {
      return NextResponse.json({ error: "Ya está en favoritos" }, { status: 409 });
    }

    await db.query(
      "INSERT INTO favorito (id_usuario, rawg_game_id) VALUES (?, ?)",
      [id_usuario, rawg_game_id]
    );

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("[API Favoritos POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const gameId = searchParams.get("gameId");
    if (!gameId) return NextResponse.json({ error: "gameId requerido" }, { status: 400 });

    await db.query(
      "DELETE FROM favorito WHERE id_usuario = ? AND rawg_game_id = ?",
      [id_usuario, gameId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API Favoritos DELETE]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}