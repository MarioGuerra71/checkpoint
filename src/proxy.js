import { NextResponse } from "next/server";

const protectedRoutes = [
  "/homeRegistrado",
  "/perfil",
  "/profile",
  "/settings",
];

const authOnlyRoutes = [
  "/login",
  "/registro",
  "/home",
];

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  // Rutas protegidas — sin cookie redirige a login
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rutas solo para no autenticados — con cookie redirige a homeRegistrado
  const isAuthOnlyRoute = authOnlyRoutes.some((route) =>
    route === "/home" ? pathname === "/home" : pathname.startsWith(route)
  );
  if (isAuthOnlyRoute && authToken) {
    return NextResponse.redirect(new URL("/homeRegistrado", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/homeRegistrado/:path*",
    "/perfil/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/registro",
    "/home",
  ],
};