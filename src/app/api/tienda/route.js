import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

/**
 * GET /api/tienda — Items disponibles en la tienda
 * POST /api/tienda — Comprar item con monedas
 */

export async function GET() {
  try {
    const [items] = await db.query(
      "SELECT * FROM avatar_item WHERE precio_monedas IS NOT NULL ORDER BY rareza DESC, precio_monedas ASC",
    );
    return NextResponse.json({ items });
  } catch (error) {
    console.error("[API Tienda GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { id_item } = await req.json();
    if (!id_item)
      return NextResponse.json({ error: "id_item requerido" }, { status: 400 });

    // Obtener precio del item
    const [[item]] = await db.query(
      "SELECT * FROM avatar_item WHERE id_item = ? AND precio_monedas IS NOT NULL",
      [id_item],
    );
    if (!item)
      return NextResponse.json(
        { error: "Item no disponible en tienda" },
        { status: 404 },
      );

    // Verificar que no lo tiene ya
    const [posee] = await db.query(
      "SELECT id_item FROM usuario_inventario WHERE id_usuario = ? AND id_item = ?",
      [id_usuario, id_item],
    );
    if (posee.length > 0) {
      return NextResponse.json(
        { error: "Ya tienes este item" },
        { status: 409 },
      );
    }

    // Verificar monedas suficientes
    const [[monedas]] = await db.query(
      "SELECT monedas FROM usuario_monedas WHERE id_usuario = ?",
      [id_usuario],
    );
    if (!monedas || monedas.monedas < item.precio_monedas) {
      return NextResponse.json(
        { error: "Monedas insuficientes" },
        { status: 400 },
      );
    }

    // Comprar
    await db.query(
      "UPDATE usuario_monedas SET monedas = monedas - ? WHERE id_usuario = ?",
      [item.precio_monedas, id_usuario],
    );
    await db.query(
      "INSERT INTO usuario_inventario (id_usuario, id_item) VALUES (?, ?)",
      [id_usuario, id_item],
    );

    const [[monedasActuales]] = await db.query(
      "SELECT monedas FROM usuario_monedas WHERE id_usuario = ?",
      [id_usuario],
    );

    return NextResponse.json({
      success: true,
      monedasRestantes: monedasActuales.monedas,
    });
  } catch (error) {
    console.error("[API Tienda POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
