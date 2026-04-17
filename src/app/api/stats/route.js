import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * GET /api/stats
 * Estadísticas globales reales de la plataforma
 */
export async function GET() {
  try {
    const [[{ totalResenas }]] = await db.query(
      "SELECT COUNT(*) as totalResenas FROM resena"
    );
    const [[{ totalMinutos }]] = await db.query(
      "SELECT COALESCE(SUM(duracion_minutos), 0) as totalMinutos FROM sesion_juego"
    );
    const [[{ totalUsuarios }]] = await db.query(
      "SELECT COUNT(*) as totalUsuarios FROM usuario"
    );
    const [[{ totalSesiones }]] = await db.query(
      "SELECT COUNT(*) as totalSesiones FROM sesion_juego"
    );
    const [[{ totalListas }]] = await db.query(
      "SELECT COUNT(*) as totalListas FROM lista"
    );

    return NextResponse.json({
      resenas:   totalResenas,
      horas:     Math.round(totalMinutos / 60),
      usuarios:  totalUsuarios,
      sesiones:  totalSesiones,
      listas:    totalListas,
    });

  } catch (error) {
    console.error("[API Stats Error]", error);
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 });
  }
}