import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match        = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * GET /api/inventario — Items del usuario
 * POST /api/inventario/equipar — Equipar avatar o borde
 */

export async function GET(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const [items] = await db.query(
      `SELECT ai.id_item, ai.nombre, ai.tipo, ai.rareza, ai.imagen_url, ai.descripcion,
              ui.fecha_obtencion
       FROM usuario_inventario ui
       JOIN avatar_item ai ON ui.id_item = ai.id_item
       WHERE ui.id_usuario = ?
       ORDER BY ai.rareza DESC, ui.fecha_obtencion DESC`,
      [id_usuario]
    );

    // Avatar y borde activos
    const [[usuarioActivo]] = await db.query(
      "SELECT id_avatar, id_borde FROM usuario WHERE id_usuario = ?",
      [id_usuario]
    );

    return NextResponse.json({
      items,
      avatarActivo: usuarioActivo?.id_avatar || null,
      bordeActivo:  usuarioActivo?.id_borde  || null,
    });

  } catch (error) {
    console.error("[API Inventario GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario) return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { id_item } = await req.json();
    if (!id_item) return NextResponse.json({ error: "id_item requerido" }, { status: 400 });

    // Verificar que el item pertenece al usuario
    const [posee] = await db.query(
      "SELECT id_item FROM usuario_inventario WHERE id_usuario = ? AND id_item = ?",
      [id_usuario, id_item]
    );
    if (posee.length === 0) {
      return NextResponse.json({ error: "No tienes este item" }, { status: 403 });
    }

    // Obtener tipo del item
    const [[item]] = await db.query(
      "SELECT tipo FROM avatar_item WHERE id_item = ?",
      [id_item]
    );

    if (item.tipo === "avatar") {
      await db.query("UPDATE usuario SET id_avatar = ? WHERE id_usuario = ?", [id_item, id_usuario]);
    } else {
      await db.query("UPDATE usuario SET id_borde = ? WHERE id_usuario = ?", [id_item, id_usuario]);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("[API Inventario POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}