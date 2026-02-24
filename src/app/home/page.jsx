"use client";

import { useRouter } from "next/navigation";

/**
 * Página /home
 * Página protegida que solo ven los usuarios autenticados
 * El middleware verifica automáticamente que tengan cookie auth_token
 */
export default function HomePage() {
  // ============= INICIALIZACIONES =============

  // useRouter nos permite redirigir al usuario
  const router = useRouter();

  // ============= FUNCIONES =============

  /**
   * handleLogout
   * Se ejecuta cuando el usuario hace clic en "Cerrar sesión"
   * Llama al endpoint /api/logout que elimina la cookie
   */
  const handleLogout = async () => {
    try {
      // Enviar petición POST al servidor para limpiar la cookie
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include", // Incluir cookies en la petición
      });

      // Si el logout fue exitoso
      if (res.ok) {
        // Redirigir al login
        // El middleware volverá a interceptar y verificará que no haya cookie
        router.push("/login");
      }
    } catch (error) {
      console.error("[Logout Error]", error);
    }
  };

  // ============= RENDERIZADO =============

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
      {/* Título de bienvenida */}
      <h1 className="text-4xl font-bold mb-4">
        ¡Bienvenido a Home!
      </h1>

      {/* Descripción */}
      <p className="text-lg mb-6 opacity-80">
        Has iniciado sesión correctamente.
      </p>

      {/* Botón de cerrar sesión */}
      <button
        onClick={handleLogout}
        className="px-6 py-3 rounded-md font-semibold bg-foreground text-background transition hover:brightness-90 cursor-pointer"
      >
        Cerrar sesión
      </button>
    </div>
  );
}