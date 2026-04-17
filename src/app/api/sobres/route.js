import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUsuario(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

// Probabilidades por rareza
const PROBABILIDADES = {
  comun: 0.6,
  raro: 0.25,
  epico: 0.12,
  legendario: 0.03,
};

// Monedas por duplicado según rareza
const MONEDAS_DUPLICADO = {
  comun: 10,
  raro: 25,
  epico: 75,
  legendario: 200,
};

function sortearRareza() {
  const rand = Math.random();
  if (rand < PROBABILIDADES.legendario) return "legendario";
  if (rand < PROBABILIDADES.legendario + PROBABILIDADES.epico) return "epico";
  if (
    rand <
    PROBABILIDADES.legendario + PROBABILIDADES.epico + PROBABILIDADES.raro
  )
    return "raro";
  return "comun";
}

/**
 * GET /api/sobres — Estado de sobres del usuario
 * POST /api/sobres — Abrir un sobre
 */

export async function GET(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const [[sobre]] = await db.query(
      "SELECT sobres_pendientes, ultimo_sobre FROM usuario_sobre WHERE id_usuario = ?",
      [id_usuario],
    );

    const [[monedas]] = await db.query(
      "SELECT monedas FROM usuario_monedas WHERE id_usuario = ?",
      [id_usuario],
    );

    // Calcular si puede reclamar sobre diario
    let puedeReclamar = false;
    let horasRestantes = 0;

    if (sobre) {
      if (!sobre.ultimo_sobre) {
        puedeReclamar = true;
      } else {
        const ahora = new Date();
        const ultimo = new Date(sobre.ultimo_sobre);
        const diffHoras = (ahora - ultimo) / (1000 * 60 * 60);
        puedeReclamar = diffHoras >= 24;
        horasRestantes = puedeReclamar ? 0 : Math.ceil(24 - diffHoras);
      }
    }

    return NextResponse.json({
      sobresPendientes: sobre?.sobres_pendientes || 0,
      monedas: monedas?.monedas || 0,
      puedeReclamar,
      horasRestantes,
    });
  } catch (error) {
    console.error("[API Sobres GET]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const id_usuario = getUsuario(req);
    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { tipo } = await req.json(); // "diario" | "pendiente"

    // Verificar estado del sobre
    const [[sobre]] = await db.query(
      "SELECT sobres_pendientes, ultimo_sobre FROM usuario_sobre WHERE id_usuario = ?",
      [id_usuario],
    );

    if (!sobre)
      return NextResponse.json({ error: "Error de usuario" }, { status: 400 });

    if (tipo === "diario") {
      if (sobre.ultimo_sobre) {
        const diffHoras =
          (new Date() - new Date(sobre.ultimo_sobre)) / (1000 * 60 * 60);
        if (diffHoras < 24) {
          return NextResponse.json(
            { error: `Próximo sobre en ${Math.ceil(24 - diffHoras)}h` },
            { status: 400 },
          );
        }
      }
    } else if (tipo === "pendiente") {
      if (sobre.sobres_pendientes <= 0) {
        return NextResponse.json(
          { error: "No tienes sobres pendientes" },
          { status: 400 },
        );
      }
    }

    // Obtener inventario actual del usuario
    const [inventario] = await db.query(
      "SELECT id_item FROM usuario_inventario WHERE id_usuario = ?",
      [id_usuario],
    );
    const idsEnInventario = new Set(inventario.map((i) => i.id_item));

    // Obtener todos los items del catálogo agrupados por rareza
    const [todosItems] = await db.query("SELECT * FROM avatar_item");
    const itemsPorRareza = {};
    todosItems.forEach((item) => {
      if (!itemsPorRareza[item.rareza]) itemsPorRareza[item.rareza] = [];
      itemsPorRareza[item.rareza].push(item);
    });

    // Sortear 3 items
    const resultados = [];
    let monedasGanadas = 0;

    for (let i = 0; i < 3; i++) {
      const rareza = sortearRareza();
      const opciones = itemsPorRareza[rareza] || itemsPorRareza["comun"];
      const item = opciones[Math.floor(Math.random() * opciones.length)];
      const duplicado = idsEnInventario.has(item.id_item);

      if (duplicado) {
        // Item duplicado → dar monedas
        const monedas = MONEDAS_DUPLICADO[rareza];
        monedasGanadas += monedas;
        resultados.push({
          ...item,
          duplicado: true,
          monedasRecibidas: monedas,
        });
      } else {
        // Item nuevo → añadir al inventario
        await db.query(
          "INSERT IGNORE INTO usuario_inventario (id_usuario, id_item) VALUES (?, ?)",
          [id_usuario, item.id_item],
        );
        idsEnInventario.add(item.id_item);
        resultados.push({ ...item, duplicado: false });
      }
    }

    // Dar monedas por duplicados
    if (monedasGanadas > 0) {
      await db.query(
        "UPDATE usuario_monedas SET monedas = monedas + ? WHERE id_usuario = ?",
        [monedasGanadas, id_usuario],
      );
    }

    // Actualizar registro de sobre
    if (tipo === "diario") {
      await db.query(
        "UPDATE usuario_sobre SET ultimo_sobre = NOW() WHERE id_usuario = ?",
        [id_usuario],
      );
    } else {
      await db.query(
        "UPDATE usuario_sobre SET sobres_pendientes = sobres_pendientes - 1 WHERE id_usuario = ?",
        [id_usuario],
      );
    }

    // Monedas totales actuales
    const [[monedasActuales]] = await db.query(
      "SELECT monedas FROM usuario_monedas WHERE id_usuario = ?",
      [id_usuario],
    );

    return NextResponse.json({
      success: true,
      items: resultados,
      monedasGanadas,
      monedaTotal: monedasActuales.monedas,
    });
  } catch (error) {
    console.error("[API Sobres POST]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
