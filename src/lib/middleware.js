import { NextResponse } from "next/server";

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 *
 * Este middleware se ejecuta ANTES de que se procese cualquier petición.
 * Verifica que el usuario tenga una sesión válida (cookie auth_token).
 *
 * Flujo:
 * 1. Si el usuario intenta acceder a una ruta protegida (/home, etc):
 *    - Verificar que tenga cookie auth_token
 *    - Si NO tiene cookie → redirigir a /login
 *    - Si SÍ tiene cookie → permitir acceso
 *
 * 2. Si el usuario accede a /login:
 *    - Si TIENE cookie auth_token → redirigir a /home
 *    - Si NO tiene cookie → permitir ver el login
 */

// ============= RUTAS PROTEGIDAS =============

// Array con todas las rutas que requieren estar autenticado
// Si alguien intenta acceder sin cookie auth_token, será redirigido a /login
const protectedRoutes = [
  "/home",
  "/profile",
  "/settings",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // ============= VERIFICAR SI EXISTE LA COOKIE =============

  // Obtener la cookie auth_token de la petición
  // Esta cookie se establece en el servidor cuando el login es exitoso
  const authToken = request.cookies.get("auth_token")?.value;

  // ============= LÓGICA: RUTAS PROTEGIDAS =============

  // Verificar si la ruta actual está en la lista de protegidas
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Si es una ruta protegida Y el usuario NO tiene cookie
  if (isProtectedRoute && !authToken) {
    // Redirigir al usuario a la página de login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ============= LÓGICA: PÁGINA DE LOGIN =============

  // Si el usuario TIENE cookie y trata de acceder a /login
  if (pathname === "/login" && authToken) {
    // Redirigir directamente a /home (ya está autenticado)
    return NextResponse.redirect(new URL("/home", request.url));
  }

  // ============= PERMITIR ACCESO =============

  // Si ninguna condición anterior se cumplió, permitir el acceso normal
  return NextResponse.next();
}

// ============= CONFIGURACIÓN DEL MIDDLEWARE =============

// Especificar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    "/home/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
  ],
};
