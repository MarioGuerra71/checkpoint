import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/comentarios?resenaId=X — Comentarios de una reseña
 * POST /api/comentarios — Crear comentario
 * DELETE /api/comentarios?id=X — Eliminar comentario propio
 */

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match        = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const resenaId = searchParams.get("resenaId");

    if (!resenaId) {
      return NextResponse.json({ error: "resenaId requerido" }, { status: 400 });
    }

    const [comentarios] = await db.query(
      `SELECT c.id_comentario, c.contenido, c.fecha_comentario,
              u.id_usuario, u.nombre_usuario, u.avatar
       FROM comentario_resena c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_resena = ?
       ORDER BY c.fecha_comentario ASC`,
      [resenaId]
    );

    return NextResponse.json({ comentarios });

  } catch (error) {
    console.error("[API Comentarios GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { id_resena, contenido } = await req.json();

    if (!id_resena) {
      return NextResponse.json({ error: "id_resena requerido" }, { status: 400 });
    }

    if (!contenido?.trim()) {
      return NextResponse.json({ error: "El comentario no puede estar vacío" }, { status: 400 });
    }

    if (contenido.trim().length > 500) {
      return NextResponse.json({ error: "El comentario no puede superar 500 caracteres" }, { status: 400 });
    }

    // Verificar que la reseña existe
    const [resena] = await db.query(
      "SELECT id_resena FROM resena WHERE id_resena = ?",
      [id_resena]
    );

    if (resena.length === 0) {
      return NextResponse.json({ error: "Reseña no encontrada" }, { status: 404 });
    }

    const [result] = await db.query(
      `INSERT INTO comentario_resena (id_resena, id_usuario, contenido, fecha_comentario)
       VALUES (?, ?, ?, NOW())`,
      [id_resena, id_usuario, contenido.trim()]
    );

    // Devolver el comentario recién creado con datos del usuario
    const [[nuevoComentario]] = await db.query(
      `SELECT c.id_comentario, c.contenido, c.fecha_comentario,
              u.id_usuario, u.nombre_usuario, u.avatar
       FROM comentario_resena c
       JOIN usuario u ON c.id_usuario = u.id_usuario
       WHERE c.id_comentario = ?`,
      [result.insertId]
    );

    return NextResponse.json({ success: true, comentario: nuevoComentario }, { status: 201 });

  } catch (error) {
    console.error("[API Comentarios POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id requerido" }, { status: 400 });
    }

    // Verificar que el comentario pertenece al usuario
    const [comentario] = await db.query(
      "SELECT id_comentario FROM comentario_resena WHERE id_comentario = ? AND id_usuario = ?",
      [id, id_usuario]
    );

    if (comentario.length === 0) {
      return NextResponse.json({ error: "Comentario no encontrado" }, { status: 404 });
    }

    await db.query("DELETE FROM comentario_resena WHERE id_comentario = ?", [id]);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API Comentarios DELETE]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}