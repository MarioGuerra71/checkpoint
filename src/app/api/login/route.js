import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

/**
 * POST /api/login
 * Endpoint para autenticar un usuario
 * Espera: { usuario: string, password: string }
 * Retorna: Cookie segura si las credenciales son válidas
 */
export async function POST(req) {
  try {
    // ============= VALIDAR ENTRADA =============

    // Extrae usuario y contraseña del body de la petición
    const { usuario, password } = await req.json();

    // Verificar que ambos campos estén presentes
    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    // ============= BUSCAR USUARIO EN BD ============= 

    // Consultar la base de datos para encontrar el usuario
    const [rows] = await db.query(
      "SELECT id_usuario, nombre_usuario, contrasena_hash FROM usuario WHERE nombre_usuario = ?",
      [usuario]
    );
    // Si no existe el usuario
    if (rows.length === 0) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.contrasena_hash);
    // ============= VALIDAR CONTRASEÑA =============


    // Comparar la contraseña ingresada con la hasheada en la base de datos
    // bcrypt.compare() devuelve true si coinciden, false si no

    // Si la contraseña no coincide
    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Usuario o contraseña incorrectos" },
        { status: 401 }
      );
    }

    // ============= CREAR RESPUESTA EXITOSA CON COOKIE =============

    // Crear respuesta de éxito
    const response = NextResponse.json(
      {
        success: true,
        message: "Login exitoso",
      },
      { status: 200 }
    );

    // Establecer cookie segura en la respuesta
    // La cookie contiene el ID del usuario autenticado
    // httpOnly = no puede ser accedida desde JavaScript (protege contra XSS)
    // secure = solo se envía por HTTPS en producción
    // sameSite = protege contra CSRF
    // maxAge = tiempo de expiración en segundos (24 horas)
    response.cookies.set("auth_token", user.id_usuario.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return response;

  } catch (error) {
    // ============= MANEJO DE ERRORES =============

    console.error("[API Login Error]", error);

    // Responder con error genérico (no revelar detalles internos)
    return NextResponse.json(
      { error: "Error del servidor. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}
