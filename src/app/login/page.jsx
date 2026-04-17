"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import FloatingLines from "@/components/FloatingLines";
import Link from "next/link";

const FloatingLinesBackground = memo(function FloatingLinesBackground() {
  return (
    <FloatingLines
      linesGradient={["#1713ec", "#00e3f6"]}
      animationSpeed={1}
      interactive
      bendRadius={5}
      bendStrength={-0.5}
      mouseDamping={0.05}
      parallax
      parallaxStrength={0.2}
    />
  );
});

export default function LoginPage() {
  // ============= INICIALIZACIONES =============

  const router = useRouter();

  // ============= ESTADOS DEL FORMULARIO =============

  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============= FUNCIONES =============

  /**
   * handleSubmit
   * Se ejecuta cuando el usuario hace clic en el botón o presiona Enter
   * Envía usuario y contraseña al servidor para validación
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!usuario.trim() || !password.trim()) {
      setError("Por favor completa todos los campos");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usuario, password }),
        credentials: "include",
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        router.push("/home");
      } else {
        setError(data.error || "Error al iniciar sesión");
      }
    } catch (err) {
      setLoading(false);
      setError("Error de conexión. Intenta de nuevo.");
    }
  };

  // ============= RENDERIZADO =============

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Fondo animado con FloatingLines */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <FloatingLinesBackground />
      </div>

      {/* Overlay oscuro sutil para contraste */}
      <div className="absolute inset-0 bg-background opacity-40 z-1"></div>

      {/* Contenedor principal */}
      <div className="w-full max-w-5xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* COLUMNA IZQUIERDA: Logo y características */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-12">
            {/* Logo grande y destacado */}
            <div className="relative">
              <div className="absolute inset-0 bg-foreground rounded-3xl blur-3xl opacity-15 animate-pulse"></div>
              <div className="relative bg-background bg-opacity-30 backdrop-blur-xl rounded-3xl p-8 border border-foreground border-opacity-30">
                <Image
                  src="/logotipo.png"
                  alt="CHECKPOINT Logo"
                  width={300}
                  height={300}
                  priority
                  className="drop-shadow-2xl"
                />
              </div>
            </div>

            {/* Tagline y descripción */}
            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black text-foreground drop-shadow-lg">
                CHECKPOINT
              </h1>
              <p className="text-lg text-foreground opacity-90">
                Tu comunidad gaming, catalogada
              </p>
              <p className="text-sm text-foreground opacity-70 max-w-xs mx-auto leading-relaxed">
                Gestiona, valora y comparte tu experiencia con videojuegos. Tu
                espacio gamer social.
              </p>
            </div>

            {/* Características rápidas */}
            <div className="flex flex-col space-y-3 text-center">
              <div className="text-2xl"> Cataloga | Valora | Conecta</div>
            </div>
          </div>

          {/* COLUMNA DERECHA: Formulario */}
          <div className="w-full flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-md bg-background bg-opacity-40 backdrop-blur-2xl border border-foreground border-opacity-30 rounded-3xl p-8 md:p-10 shadow-2xl">
              {/* Encabezado del formulario */}
              <div className="mb-8 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Inicia sesión
                </h2>
                <p className="text-foreground opacity-70 text-sm">
                  Accede a tu cuenta para continuar tu aventura gaming
                </p>
              </div>

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Input usuario */}
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
                    className="w-full px-4 py-3 rounded-lg border border-foreground border-opacity-30 bg-background bg-opacity-30 text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Input contraseña */}
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
                    className="w-full px-4 py-3 rounded-lg border border-foreground border-opacity-30 bg-background bg-opacity-30 text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="px-4 py-3 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50">
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Botón submit */}
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

              {/* Enlace a registro */}
              <p className="text-sm text-foreground opacity-60 text-center mt-6">
                ¿No tienes cuenta?{" "}
                <Link
                  href="/registro"
                  className="text-foreground opacity-100 font-semibold hover:underline"
                >
                  Regístrate
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
