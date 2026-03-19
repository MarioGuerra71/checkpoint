import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
 
/**
 * POST /api/registro
 * Registra un nuevo usuario en la base de datos.
 * Espera: { nombre_usuario, email, password }
 * Validaciones: campos requeridos, formato email, password segura,
 *               nombre_usuario único, email único.
 */
export async function POST(req) {
  try {
    // ============= EXTRAER DATOS =============
 
    const { nombre_usuario, email, password } = await req.json();
 
    // ============= VALIDACIONES BÁSICAS =============
 
    if (!nombre_usuario?.trim() || !email?.trim() || !password?.trim()) {
      return NextResponse.json(
        { error: "Todos los campos son obligatorios" },
        { status: 400 }
      );
    }
 
    // Nombre de usuario: mínimo 3 caracteres, solo letras, números y guiones bajos
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nombre_usuario.trim())) {
      return NextResponse.json(
        { error: "El usuario debe tener entre 3 y 20 caracteres (letras, números o _)" },
        { status: 400 }
      );
    }
 
    // Formato de email válido
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json(
        { error: "El formato del email no es válido" },
        { status: 400 }
      );
    }
 
    // Contraseña: mínimo 8 caracteres, al menos una letra y un número
    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }
 
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return NextResponse.json(
        { error: "La contraseña debe contener al menos una letra y un número" },
        { status: 400 }
      );
    }
 
    // ============= COMPROBAR DUPLICADOS =============
 
    // Verificar que el nombre de usuario no esté en uso
    const [existeUsuario] = await db.query(
      "SELECT id_usuario FROM usuario WHERE nombre_usuario = ?",
      [nombre_usuario.trim()]
    );
 
    if (existeUsuario.length > 0) {
      return NextResponse.json(
        { error: "Ese nombre de usuario ya está en uso" },
        { status: 409 }
      );
    }
 
    // Verificar que el email no esté en uso
    const [existeEmail] = await db.query(
      "SELECT id_usuario FROM usuario WHERE email = ?",
      [email.trim().toLowerCase()]
    );
 
    if (existeEmail.length > 0) {
      return NextResponse.json(
        { error: "Ese email ya está registrado" },
        { status: 409 }
      );
    }
 
    // ============= CREAR USUARIO =============
 
    // Hashear la contraseña con bcrypt (10 rondas)
    const contrasena_hash = await bcrypt.hash(password, 10);
 
    // Insertar usuario en la BD
    const [result] = await db.query(
      `INSERT INTO usuario (nombre_usuario, email, contrasena_hash, fecha_registro)
       VALUES (?, ?, ?, NOW())`,
      [nombre_usuario.trim(), email.trim().toLowerCase(), contrasena_hash]
    );
 
    // Crear preferencias por defecto para el nuevo usuario
    await db.query(
      `INSERT INTO preferencias_usuario (id_usuario, tema) VALUES (?, 'oscuro')`,
      [result.insertId]
    );
 
    // ============= RESPUESTA EXITOSA =============
 
    return NextResponse.json(
      { success: true, message: "Cuenta creada correctamente" },
      { status: 201 }
    );
 
  } catch (error) {
    console.error("[API Registro Error]", error);
    return NextResponse.json(
      { error: "Error del servidor. Intenta de nuevo más tarde." },
      { status: 500 }
    );
  }
}