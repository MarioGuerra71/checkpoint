import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const protectedRoutes = [
  "/homeRegistrado",
  "/perfil",
  "/buscar",
  "/mis-listas",
  "/mis-favoritos",
  "/mis-amigos",
  "/sobres",
  "/usuario",
  "/profile",
  "/settings",
];

const authOnlyRoutes = ["/login", "/registro", "/home"];

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const authToken = request.cookies.get("auth_token")?.value;

  const isProtectedRoute = protectedRoutes.some((r) => pathname.startsWith(r));
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const isAuthOnlyRoute = authOnlyRoutes.some((r) =>
    r === "/home" ? pathname === "/home" : pathname.startsWith(r),
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
    "/buscar/:path*",
    "/mis-favoritos/:path*",
    "/mis-listas/:path*",
    "/mis-amigos/:path*",
    "/sobres/:path*",
    "/usuario/:path*",
    "/settings/:path*",
    "/login",
    "/registro",
    "/home",
  ],
};
