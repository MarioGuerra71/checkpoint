import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/listas/juegos?listaId=X — Juegos de una lista
 * POST /api/listas/juegos — Añadir juego a lista
 * DELETE /api/listas/juegos?listaId=X&gameId=Y — Quitar juego de lista
 */

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

export async function GET(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const listaId = searchParams.get("listaId");

    if (!listaId)
      return NextResponse.json({ error: "listaId requerido" }, { status: 400 });

    // Verificar que la lista pertenece al usuario
    const [lista] = await db.query(
      "SELECT id_lista, nombre_lista FROM lista WHERE id_lista = ? AND id_usuario = ?",
      [listaId, id_usuario],
    );

    if (lista.length === 0) {
      return NextResponse.json(
        { error: "Lista no encontrada" },
        { status: 404 },
      );
    }

    const [juegos] = await db.query(
      "SELECT rawg_game_id FROM lista_videojuego WHERE id_lista = ?",
      [listaId],
    );

    return NextResponse.json({
      lista: lista[0],
      juegos: juegos.map((j) => j.rawg_game_id),
    });
  } catch (error) {
    console.error("[API Listas Juegos GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { id_lista, rawg_game_id } = await req.json();

    if (!id_lista || !rawg_game_id) {
      return NextResponse.json(
        { error: "id_lista y rawg_game_id requeridos" },
        { status: 400 },
      );
    }

    // Verificar que la lista pertenece al usuario
    const [lista] = await db.query(
      "SELECT id_lista FROM lista WHERE id_lista = ? AND id_usuario = ?",
      [id_lista, id_usuario],
    );

    if (lista.length === 0) {
      return NextResponse.json(
        { error: "Lista no encontrada" },
        { status: 404 },
      );
    }

    // Verificar que el juego no está ya en la lista
    const [existe] = await db.query(
      "SELECT id_lista FROM lista_videojuego WHERE id_lista = ? AND rawg_game_id = ?",
      [id_lista, rawg_game_id],
    );

    if (existe.length > 0) {
      return NextResponse.json(
        { error: "El juego ya está en esta lista" },
        { status: 409 },
      );
    }

    await db.query(
      "INSERT INTO lista_videojuego (id_lista, rawg_game_id) VALUES (?, ?)",
      [id_lista, rawg_game_id],
    );

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("[API Listas Juegos POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const listaId = searchParams.get("listaId");
    const gameId = searchParams.get("gameId");

    if (!listaId || !gameId) {
      return NextResponse.json(
        { error: "listaId y gameId requeridos" },
        { status: 400 },
      );
    }

    // Verificar que la lista pertenece al usuario
    const [lista] = await db.query(
      "SELECT id_lista FROM lista WHERE id_lista = ? AND id_usuario = ?",
      [listaId, id_usuario],
    );

    if (lista.length === 0) {
      return NextResponse.json(
        { error: "Lista no encontrada" },
        { status: 404 },
      );
    }

    await db.query(
      "DELETE FROM lista_videojuego WHERE id_lista = ? AND rawg_game_id = ?",
      [listaId, gameId],
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[API Listas Juegos DELETE]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
