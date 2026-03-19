import { NextResponse } from "next/server";

/**
 * MIDDLEWARE DE AUTENTICACIÓN
 *
 * Flujo de acceso:
 * - / → redirige siempre a /home (pública)
 * - /home → pública, cualquiera puede verla
 * - /registro → pública, pero si ya estás logueado te manda a /homeRegistrado
 * - /login → pública, pero si ya estás logueado te manda a /homeRegistrado
 * - /homeRegistrado → PROTEGIDA, sin cookie → redirige a /login
 * - /profile, /settings → PROTEGIDAS, sin cookie → redirige a /login
 */

// ============= RUTAS PROTEGIDAS =============
// Solo accesibles con cookie auth_token válida
const protectedRoutes = [
  "/homeRegistrado",
  "/profile",
  "/settings",
];

// ============= RUTAS SOLO PARA NO AUTENTICADOS =============
// Si ya tienes sesión y las visitas, te manda a /homeRegistrado
const authOnlyRoutes = [
  "/login",
  "/registro",
  "/home",
];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  // ============= RUTAS PROTEGIDAS =============
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ============= RUTAS SOLO PARA NO AUTENTICADOS =============
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    route === "/home" ? pathname === "/home" : pathname.startsWith(route)
  );

  if (isAuthOnlyRoute && authToken) {
    return NextResponse.redirect(new URL("/homeRegistrado", request.url));
  }

  return NextResponse.next();
}

// ============= CONFIGURACIÓN DEL MIDDLEWARE =============
export const config = {
  matcher: [
    "/homeRegistrado/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/registro",
    "/home",
  ],
};
