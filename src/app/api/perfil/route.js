import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/perfil?username=xxx  → perfil público de otro usuario
 * GET /api/perfil               → perfil del usuario autenticado (igual que /api/usuario pero más completo)
 */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usernameParam = searchParams.get("username");

    // ── Determinar qué usuario mostrar ────────────────────────
    let id_usuario = null;
    let esPropio = false;

    if (usernameParam) {
      // Perfil público por username
      const [rows] = await db.query(
        "SELECT id_usuario FROM usuario WHERE nombre_usuario = ?",
        [usernameParam],
      );
      if (rows.length === 0) {
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 },
        );
      }
      id_usuario = rows[0].id_usuario;
    } else {
      // Perfil propio: leer cookie
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(/auth_token=([^;]+)/);
      id_usuario = match ? parseInt(match[1]) : null;
      esPropio = true;

      if (!id_usuario) {
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      }
    }

    // ── Datos básicos ─────────────────────────────────────────
    const [usuarios] = await db.query(
      `SELECT id_usuario, nombre_usuario, email, avatar, fecha_registro
       FROM usuario WHERE id_usuario = ?`,
      [id_usuario],
    );
    if (usuarios.length === 0) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );
    }
    const usuario = usuarios[0];

    // ── Preferencias (tema) ───────────────────────────────────
    const [prefs] = await db.query(
      "SELECT tema FROM preferencias_usuario WHERE id_usuario = ?",
      [id_usuario],
    );
    const tema = prefs[0]?.tema ?? "oscuro";

    // ── Stats ─────────────────────────────────────────────────
    const [[horasRow]] = await db.query(
      "SELECT COALESCE(SUM(duracion_minutos),0) AS total FROM sesion_juego WHERE id_usuario = ?",
      [id_usuario],
    );
    const [[resenasRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM resena WHERE id_usuario = ?",
      [id_usuario],
    );
    const [[favsRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM favorito WHERE id_usuario = ?",
      [id_usuario],
    );
    const [[listasRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM lista WHERE id_usuario = ?",
      [id_usuario],
    );
    const [[seguidoresRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM seguimiento WHERE id_seguido = ?",
      [id_usuario],
    );
    const [[siguiendoRow]] = await db.query(
      "SELECT COUNT(*) AS total FROM seguimiento WHERE id_seguidor = ?",
      [id_usuario],
    );

    // ── Juegos más jugados (top 6) ────────────────────────────
    const [masJugados] = await db.query(
      `SELECT rawg_game_id, SUM(duracion_minutos) AS total_minutos
       FROM sesion_juego WHERE id_usuario = ?
       GROUP BY rawg_game_id
       ORDER BY total_minutos DESC
       LIMIT 6`,
      [id_usuario],
    );

    // ── Reseñas recientes (últimas 8) ─────────────────────────
    const [resenas] = await db.query(
      `SELECT rawg_game_id, puntuacion, comentario, fecha_resena
       FROM resena WHERE id_usuario = ?
       ORDER BY fecha_resena DESC
       LIMIT 8`,
      [id_usuario],
    );

    // ── Sesiones recientes (últimas 8) ────────────────────────
    const [sesiones] = await db.query(
      `SELECT rawg_game_id, duracion_minutos, fecha_sesion, comentario
       FROM sesion_juego WHERE id_usuario = ?
       ORDER BY fecha_sesion DESC
       LIMIT 8`,
      [id_usuario],
    );

    // ── Listas del usuario ────────────────────────────────────
    const [listas] = await db.query(
      `SELECT l.id_lista, l.nombre_lista, l.fecha_creacion,
              COUNT(lv.rawg_game_id) AS total_juegos
       FROM lista l
       LEFT JOIN lista_videojuego lv ON lv.id_lista = l.id_lista
       WHERE l.id_usuario = ?
       GROUP BY l.id_lista
       ORDER BY l.fecha_creacion DESC
       LIMIT 6`,
      [id_usuario],
    );

    return NextResponse.json({
      usuario: {
        id: usuario.id_usuario,
        nombre: usuario.nombre_usuario,
        email: esPropio ? usuario.email : undefined,
        avatar: usuario.avatar,
        fechaRegistro: usuario.fecha_registro,
      },
      tema,
      esPropio,
      stats: {
        horasJugadas: Math.round(horasRow.total / 60),
        minutosTotal: horasRow.total,
        totalResenas: resenasRow.total,
        totalFavoritos: favsRow.total,
        totalListas: listasRow.total,
        seguidores: seguidoresRow.total,
        siguiendo: siguiendoRow.total,
      },
      masJugados,
      resenas,
      sesiones,
      listas,
    });
  } catch (err) {
    console.error("[API Perfil Error]", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

/**
 * PATCH /api/perfil
 * Actualiza tema del usuario autenticado
 * Body: { tema: "oscuro" | "claro" }
 */
export async function PATCH(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const body = await req.json();
    const { tema } = body;

    if (!["oscuro", "claro"].includes(tema)) {
      return NextResponse.json({ error: "Tema inválido" }, { status: 400 });
    }

    // Upsert: insert si no existe, update si ya existe
    await db.query(
      `INSERT INTO preferencias_usuario (id_usuario, tema)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE tema = VALUES(tema)`,
      [id_usuario, tema],
    );

    return NextResponse.json({ ok: true, tema });
  } catch (err) {
    console.error("[API Perfil PATCH Error]", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
