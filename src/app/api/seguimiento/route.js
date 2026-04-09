import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/seguimiento?usuarioId=X — Info de seguimiento de un usuario
 * POST /api/seguimiento — Seguir a un usuario
 * DELETE /api/seguimiento?usuarioId=X — Dejar de seguir
 */

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match        = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

export async function GET(req) {
  try {
    const id_usuario = getUsuario(req);
    const { searchParams } = new URL(req.url);
    const usuarioId = parseInt(searchParams.get("usuarioId"));

    if (!usuarioId) {
      return NextResponse.json({ error: "usuarioId requerido" }, { status: 400 });
    }

    // Seguidores del usuario (quién le sigue)
    const [seguidores] = await db.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.avatar
       FROM seguimiento s
       JOIN usuario u ON s.id_seguidor = u.id_usuario
       WHERE s.id_seguido = ?`,
      [usuarioId]
    );

    // Seguidos por el usuario (a quién sigue)
    const [seguidos] = await db.query(
      `SELECT u.id_usuario, u.nombre_usuario, u.avatar
       FROM seguimiento s
       JOIN usuario u ON s.id_seguido = u.id_usuario
       WHERE s.id_seguidor = ?`,
      [usuarioId]
    );

    // Si hay sesión, comprobar si el usuario logueado ya sigue a este
    let yoLeSigo = false;
    if (id_usuario && id_usuario !== usuarioId) {
      const [rel] = await db.query(
        "SELECT id_seguidor FROM seguimiento WHERE id_seguidor = ? AND id_seguido = ?",
        [id_usuario, usuarioId]
      );
      yoLeSigo = rel.length > 0;
    }

    return NextResponse.json({ seguidores, seguidos, yoLeSigo });

  } catch (error) {
    console.error("[API Seguimiento GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_seguidor = getUsuario(req);
    if (!id_seguidor) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { id_seguido } = await req.json();
    if (!id_seguido) return NextResponse.json({ error: "id_seguido requerido" }, { status: 400 });

    if (id_seguidor === id_seguido) {
      return NextResponse.json({ error: "No puedes seguirte a ti mismo" }, { status: 400 });
    }

    // Verificar que el usuario a seguir existe
    const [usuario] = await db.query(
      "SELECT id_usuario FROM usuario WHERE id_usuario = ?",
      [id_seguido]
    );
    if (usuario.length === 0) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Verificar que no le sigue ya
    const [existe] = await db.query(
      "SELECT id_seguidor FROM seguimiento WHERE id_seguidor = ? AND id_seguido = ?",
      [id_seguidor, id_seguido]
    );
    if (existe.length > 0) {
      return NextResponse.json({ error: "Ya sigues a este usuario" }, { status: 409 });
    }

    await db.query(
      "INSERT INTO seguimiento (id_seguidor, id_seguido) VALUES (?, ?)",
      [id_seguidor, id_seguido]
    );

    return NextResponse.json({ success: true }, { status: 201 });

  } catch (error) {
    console.error("[API Seguimiento POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const id_seguidor = getUsuario(req);
    if (!id_seguidor) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const usuarioId = searchParams.get("usuarioId");
    if (!usuarioId) return NextResponse.json({ error: "usuarioId requerido" }, { status: 400 });

    await db.query(
      "DELETE FROM seguimiento WHERE id_seguidor = ? AND id_seguido = ?",
      [id_seguidor, usuarioId]
    );

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API Seguimiento DELETE]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}