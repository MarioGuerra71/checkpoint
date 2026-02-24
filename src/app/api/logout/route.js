import { NextResponse } from "next/server";

/**
 * POST /api/logout
 * Endpoint para cerrar sesión del usuario
 * Elimina la cookie auth_token de la respuesta
 */
export async function POST(req) {
  try {
    // ============= CREAR RESPUESTA =============

    // Crear respuesta de cierre de sesión exitoso
    const response = NextResponse.json(
      {
        success: true,
        message: "Sesión cerrada correctamente",
      },
      { status: 200 }
    );

    // ============= LIMPIAR COOKIE =============

    // Eliminar la cookie auth_token del navegador
    // Esto invalida la sesión del usuario
    // maxAge: 0 = la cookie expira inmediatamente
    response.cookies.set("auth_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0, // Expirar la cookie inmediatamente
      path: "/",
    });

    return response;

  } catch (error) {
    // ============= MANEJO DE ERRORES =============

    console.error("[API Logout Error]", error);

    // Responder con error genérico
    return NextResponse.json(
      { error: "Error al cerrar sesión" },
      { status: 500 }
    );
  }
}
