import { NextResponse } from "next/server";
import { db } from "@/lib/db";

function getUsuarioDesdeCokie(req) {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(/auth_token=([^;]+)/);
  return match ? parseInt(match[1]) : null;
}

function calcularNivel(puntos) {
  const niveles = [
    { nivel: 1, nombre: "Novato", icono: "🌱", min: 0, max: 99 },
    { nivel: 2, nombre: "Jugador", icono: "🎮", min: 100, max: 299 },
    { nivel: 3, nombre: "Aficionado", icono: "⚡", min: 300, max: 599 },
    { nivel: 4, nombre: "Veterano", icono: "🔥", min: 600, max: 999 },
    { nivel: 5, nombre: "Experto", icono: "💎", min: 1000, max: 1999 },
    { nivel: 6, nombre: "Maestro", icono: "👑", min: 2000, max: 3999 },
    { nivel: 7, nombre: "Leyenda", icono: "🌟", min: 4000, max: Infinity },
  ];
  const actual = niveles.findLast((n) => puntos >= n.min) || niveles[0];
  const siguiente = niveles.find((n) => n.min > puntos);
  return {
    ...actual,
    puntos,
    puntosProximo: siguiente?.min || actual.min,
    progreso: siguiente
      ? Math.round(((puntos - actual.min) / (siguiente.min - actual.min)) * 100)
      : 100,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const usernameParam = searchParams.get("username");
    const id_propio = getUsuarioDesdeCokie(req);

    let id_usuario = null;
    let esPropio = false;

    if (usernameParam) {
      const [rows] = await db.query(
        "SELECT id_usuario FROM usuario WHERE nombre_usuario = ?",
        [usernameParam],
      );
      if (rows.length === 0)
        return NextResponse.json(
          { error: "Usuario no encontrado" },
          { status: 404 },
        );
      id_usuario = rows[0].id_usuario;
    } else {
      if (!id_propio)
        return NextResponse.json({ error: "No autenticado" }, { status: 401 });
      id_usuario = id_propio;
      esPropio = true;
    }

    // ── Datos básicos ─────────────────────────────────────────
    const [[usuario]] = await db.query(
      "SELECT id_usuario, nombre_usuario, email, avatar, fecha_registro FROM usuario WHERE id_usuario = ?",
      [id_usuario],
    );
    if (!usuario)
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 },
      );

    const [prefs] = await db.query(
      "SELECT tema FROM preferencias_usuario WHERE id_usuario = ?",
      [id_usuario],
    );
    const tema = prefs[0]?.tema ?? "oscuro";

    // ── Stats ─────────────────────────────────────────────────
    const [[statsRow]] = await db.query(
      `SELECT
        (SELECT COUNT(*) FROM resena WHERE id_usuario = ?) as resenas,
        (SELECT COUNT(*) FROM sesion_juego WHERE id_usuario = ?) as sesiones,
        (SELECT COALESCE(SUM(duracion_minutos),0) FROM sesion_juego WHERE id_usuario = ?) as minutos,
        (SELECT COUNT(*) FROM seguimiento WHERE id_seguidor = ?) as amigos,
        (SELECT COUNT(*) FROM favorito WHERE id_usuario = ?) as favoritos,
        (SELECT COUNT(*) FROM lista WHERE id_usuario = ?) as listas,
        (SELECT COUNT(*) FROM seguimiento WHERE id_seguido = ?) as seguidores`,
      [
        id_usuario,
        id_usuario,
        id_usuario,
        id_usuario,
        id_usuario,
        id_usuario,
        id_usuario,
      ],
    );

    const horas = Math.round(statsRow.minutos / 60);
    const puntos = Math.floor(
      statsRow.resenas * 10 +
        statsRow.sesiones * 5 +
        horas * 2 +
        statsRow.amigos * 15 +
        statsRow.favoritos * 3,
    );

    const nivel = calcularNivel(puntos);

    // ── Juegos más jugados ────────────────────────────────────
    const [masJugados] = await db.query(
      `SELECT rawg_game_id, SUM(duracion_minutos) AS total_minutos
       FROM sesion_juego WHERE id_usuario = ?
       GROUP BY rawg_game_id ORDER BY total_minutos DESC LIMIT 6`,
      [id_usuario],
    );

    // ── Reseñas recientes ─────────────────────────────────────
    const [resenas] = await db.query(
      `SELECT r.rawg_game_id, r.puntuacion, r.comentario, r.plataforma, r.modo, r.fecha_resena,
          uc.nombre_usuario as companero_nombre
   FROM resena r
   LEFT JOIN usuario uc ON r.id_companero = uc.id_usuario
   WHERE r.id_usuario = ?
   ORDER BY r.fecha_resena DESC LIMIT 8`,
      [id_usuario],
    );

    // ── Sesiones recientes ────────────────────────────────────
    const [sesiones] = await db.query(
      `SELECT s.rawg_game_id, s.duracion_minutos, s.fecha_sesion, s.comentario,
          s.plataforma, s.modo,
          uc.nombre_usuario as companero_nombre
   FROM sesion_juego s
   LEFT JOIN usuario uc ON s.id_companero = uc.id_usuario
   WHERE s.id_usuario = ?
   ORDER BY s.fecha_sesion DESC LIMIT 8`,
      [id_usuario],
    );

    // ── Listas ────────────────────────────────────────────────
    const [listas] = await db.query(
      `SELECT l.id_lista, l.nombre_lista, l.fecha_creacion,
              COUNT(lv.rawg_game_id) AS total_juegos
       FROM lista l
       LEFT JOIN lista_videojuego lv ON lv.id_lista = l.id_lista
       WHERE l.id_usuario = ?
       GROUP BY l.id_lista ORDER BY l.fecha_creacion DESC LIMIT 6`,
      [id_usuario],
    );

    // ── Logros (solo para perfil propio) ─────────────────────
    let nivel_data = nivel;
    let logros = [];
    let logrosNuevos = [];

    if (esPropio) {
      const [todosLogros] = await db.query(
        "SELECT * FROM logro ORDER BY tipo, objetivo",
      );
      const [logrosObtenidos] = await db.query(
        "SELECT id_logro, fecha FROM usuario_logro WHERE id_usuario = ?",
        [id_usuario],
      );
      const idsObtenidos = new Map(
        logrosObtenidos.map((l) => [l.id_logro, l.fecha]),
      );

      const [[sobresRow]] = await db.query(
        `SELECT COALESCE(
    (SELECT COUNT(*) FROM usuario_sobre WHERE id_usuario = ? AND ultimo_sobre IS NOT NULL),
    0
  ) + COALESCE(
    (SELECT 5 - sobres_pendientes FROM usuario_sobre WHERE id_usuario = ?),
    0
  ) as sobres_abiertos`,
        [id_usuario, id_usuario],
      );

      const statMap = {
        resenas: statsRow.resenas,
        sesiones: statsRow.sesiones,
        horas: horas,
        amigos: statsRow.amigos,
        favoritos: statsRow.favoritos,
        sobres: sobresRow?.sobres_abiertos || 0,
      };

      for (const logro of todosLogros) {
        if (
          !idsObtenidos.has(logro.id_logro) &&
          statMap[logro.tipo] >= logro.objetivo
        ) {
          await db.query(
            "INSERT IGNORE INTO usuario_logro (id_usuario, id_logro) VALUES (?, ?)",
            [id_usuario, logro.id_logro],
          );
          if (logro.recompensa_monedas > 0) {
            await db.query(
              "UPDATE usuario_monedas SET monedas = monedas + ? WHERE id_usuario = ?",
              [logro.recompensa_monedas, id_usuario],
            );
          }
          logrosNuevos.push(logro);
          idsObtenidos.set(logro.id_logro, new Date());
        }
      }

      logros = todosLogros.map((logro) => ({
        ...logro,
        obtenido: idsObtenidos.has(logro.id_logro),
        fecha: idsObtenidos.get(logro.id_logro) || null,
        progreso: Math.min(
          Math.round((statMap[logro.tipo] / logro.objetivo) * 100),
          100,
        ),
        actual: statMap[logro.tipo],
      }));
    }

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
        horasJugadas: horas,
        totalResenas: statsRow.resenas,
        totalFavoritos: statsRow.favoritos,
        totalListas: statsRow.listas,
        seguidores: statsRow.seguidores,
        siguiendo: statsRow.amigos,
      },
      nivel: nivel_data,
      logros,
      logrosNuevos,
      masJugados,
      resenas,
      sesiones,
      listas,
    });
  } catch (error) {
    console.error("[API Perfil GET Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const cookieHeader = req.headers.get("cookie") || "";
    const match = cookieHeader.match(/auth_token=([^;]+)/);
    const id_usuario = match ? parseInt(match[1]) : null;

    if (!id_usuario)
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });

    const { tema } = await req.json();
    if (!["oscuro", "claro"].includes(tema))
      return NextResponse.json({ error: "Tema inválido" }, { status: 400 });

    await db.query(
      `INSERT INTO preferencias_usuario (id_usuario, tema) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE tema = VALUES(tema)`,
      [id_usuario, tema],
    );

    return NextResponse.json({ ok: true, tema });
  } catch (err) {
    console.error("[API Perfil PATCH Error]", err);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}
