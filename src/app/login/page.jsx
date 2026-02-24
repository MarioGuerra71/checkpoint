"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import LoginBranding from "./LoginBranding";

// Importamos un componente visual separado que muestra el título y subtítulo

export default function LoginPage() {
  // ============= INICIALIZACIONES =============

  // useRouter nos permite redirigir al usuario a otras páginas
  const router = useRouter();

  // ============= ESTADOS DEL FORMULARIO =============

  // usuario → almacena el texto que escribe el usuario en el input
  // setUsuario → función para actualizar el valor de usuario
  const [usuario, setUsuario] = useState("");

  // password → almacena la contraseña ingresada
  // setPassword → función para actualizar la contraseña
  const [password, setPassword] = useState("");

  // loading → indica si estamos enviando la petición al servidor
  // true = botón deshabilitado, mostrando "Entrando..."
  // false = botón habilitado, mostrando "Iniciar sesión"
  const [loading, setLoading] = useState(false);

  // error → almacena mensajes de error para mostrar al usuario
  // setError → función para actualizar el mensaje de error
  const [error, setError] = useState("");

  // ============= FUNCIONES =============

  /**
   * handleSubmit
   * Se ejecuta cuando el usuario hace clic en el botón o presiona Enter
   * Envía usuario y contraseña al servidor para validación
   */
  const handleSubmit = async (e) => {
    // Prevenir que el navegador recargue la página (comportamiento por defecto del formulario)
    e.preventDefault();

    // Validar que los campos no estén vacíos
    if (!usuario.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    // Activar estado de carga mientras se envía la petición
    setLoading(true);

    // Limpiar errores previos
    setError("");

    try {
      // Enviar petición POST al endpoint de login
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
        credentials: "include", // Incluir cookies en la petición
      });

      // Convertir la respuesta a formato JSON
      const data = await res.json();

      // Desactivar estado de carga
      setLoading(false);

      // Si el login fue exitoso (status 200 y success = true)
      if (res.ok && data.success) {
        // El servidor establecerá una cookie segura automáticamente
        // Redirigir al usuario a la página de inicio
        router.push("/home");
      } else {
        // Si hay error, mostrar el mensaje recibido del servidor
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      // Si falla la petición (error de red, etc)
      setLoading(false);
      setError("Error de conexión. Intenta de nuevo.");
    }
  };

  // ============= RENDERIZADO =============

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* ============= FONDO DECORATIVO =============
          Efecto visual de fondo con degradados sutiles para dar profundidad */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-foreground rounded-full blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 right-0 w-50 h-50 bg-foreground rounded-full blur-3xl opacity-5"></div>
      </div>

      {/* ============= CONTENEDOR PRINCIPAL =============
          Layout de dos columnas: izquierda visual, derecha formulario */}
      <div className="w-full max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* ============= COLUMNA IZQUIERDA: VISUAL =============
              Sección visual con logo y descripción de la plataforma */}
          <div className="flex flex-col items-center justify-center space-y-8 lg:flex">

            {/* Logo */}
            <div className="relative w-80 h-80 flex items-center justify-center">
              <Image
                src="/logotipo.png"
                alt="CHECKPOINT Logo"
                width={600}
                height={600}
                priority
                className="drop-shadow-2xl"
              />
            </div>

            {/* Descripción de características con iconos */}
            <div className="space-y-5 max-w-sm">
              <div className="flex items-start space-x-4 group cursor-pointer">
                <div className="text-3xl transition-transform group-hover:scale-110">🎮</div>
                <div>
                  <p className="text-foreground font-bold text-base">Cataloga tus juegos</p>
                  <p className="text-white opacity-60 text-sm">Registra cada juego que juegues o desees jugar</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group cursor-pointer">
                <div className="text-3xl transition-transform group-hover:scale-110">⭐</div>
                <div>
                  <p className="text-foreground font-bold text-base">Valora y reseña</p>
                  <p className="text-white opacity-60 text-sm">Comparte tu opinión con puntuaciones y comentarios</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 group cursor-pointer">
                <div className="text-3xl transition-transform group-hover:scale-110">👥</div>
                <div>
                  <p className="text-foreground font-bold text-base">Conecta con amigos</p>
                  <p className="text-white opacity-60 text-sm">Descubre qué juegan tus amigos y sus opiniones</p>
                </div>
              </div>
            </div>
          </div>

          {/* ============= COLUMNA DERECHA: FORMULARIO =============
              Sección del formulario de login */}
          <div className="w-full">
            {/* Contenedor del formulario */}
            <div className="bg-background border border-foreground border-opacity-20 rounded-3xl backdrop-blur-xl p-8 md:p-12 shadow-2xl">

              {/* Encabezado del formulario */}
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Inicia sesión
                </h2>
                <p className="text-white opacity-70 text-sm">
                  Accede a tu cuenta para continuar tu aventura gaming
                </p>
              </div>

              {/* Formulario de login */}
              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Input para el usuario */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Usuario
                  </label>
                  <input
                    type="text"
                    placeholder="Tu usuario"
                    value={usuario}
                    onChange={(e) => setUsuario(e.target.value)}
                    disabled={loading}
                    autoFocus
                    className="w-full px-4 py-3 rounded-lg border border-foreground border-opacity-30 bg-background text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Input para la contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 rounded-lg border border-foreground border-opacity-30 bg-background text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Mostrar mensaje de error si existe */}
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50">
                    <p className="text-black text-sm font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Botón de envío */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-lg font-bold text-background bg-foreground transition-all duration-300 hover:shadow-lg hover:shadow-foreground hover:shadow-opacity-50 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 mt-8"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                      <span>Entrando...</span>
                    </span>
                  ) : (
                    "Iniciar sesión"
                  )}
                </button>
              </form>

              {/* Disclaimer */}
              <p className="text-xs text-white opacity-50 text-center mt-6">
                Al iniciar sesión aceptas nuestros términos de servicio
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}