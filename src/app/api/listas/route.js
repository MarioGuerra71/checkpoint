import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/listas — Obtiene todas las listas del usuario
 * POST /api/listas — Crea una nueva lista
 * DELETE /api/listas?id=X — Elimina una lista
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

    const [listas] = await db.query(
      `SELECT l.id_lista, l.nombre_lista, l.fecha_creacion,
              COUNT(lv.rawg_game_id) as total_juegos
       FROM lista l
       LEFT JOIN lista_videojuego lv ON l.id_lista = lv.id_lista
       WHERE l.id_usuario = ?
       GROUP BY l.id_lista
       ORDER BY l.fecha_creacion DESC`,
      [id_usuario]
    );

    return NextResponse.json({ listas });

  } catch (error) {
    console.error("[API Listas GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { nombre_lista } = await req.json();

    if (!nombre_lista?.trim()) {
      return NextResponse.json({ error: "El nombre es obligatorio" }, { status: 400 });
    }

    if (nombre_lista.trim().length > 50) {
      return NextResponse.json({ error: "El nombre no puede superar 50 caracteres" }, { status: 400 });
    }

    const [result] = await db.query(
      `INSERT INTO lista (id_usuario, nombre_lista, fecha_creacion) VALUES (?, ?, NOW())`,
      [id_usuario, nombre_lista.trim()]
    );

    return NextResponse.json({ success: true, id_lista: result.insertId }, { status: 201 });

  } catch (error) {
    console.error("[API Listas POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id_lista = searchParams.get("id");

    if (!id_lista) return NextResponse.json({ error: "id requerido" }, { status: 400 });

    // Verificar que pertenece al usuario
    const [lista] = await db.query(
      "SELECT id_lista FROM lista WHERE id_lista = ? AND id_usuario = ?",
      [id_lista, id_usuario]
    );

    if (lista.length === 0) {
      return NextResponse.json({ error: "Lista no encontrada" }, { status: 404 });
    }

    // Eliminar juegos de la lista y luego la lista
    await db.query("DELETE FROM lista_videojuego WHERE id_lista = ?", [id_lista]);
    await db.query("DELETE FROM lista WHERE id_lista = ?", [id_lista]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API Listas DELETE]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}