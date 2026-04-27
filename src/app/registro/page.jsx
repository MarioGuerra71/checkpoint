"use client";

import { useState, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import FloatingLines from "@/components/FloatingLines";
import { notify } from "@/lib/notify";

// ============= FONDO MEMOIZADO (no se reinicia al escribir) =============

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

// ============= COMPONENTE PRINCIPAL =============

export default function RegistroPage() {
  const router = useRouter();

  // ============= ESTADOS DEL FORMULARIO =============

  const [nombreUsuario, setNombreUsuario] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  // ============= VALIDACIONES EN CLIENTE =============

  const validar = () => {
    if (
      !nombreUsuario.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirmar.trim()
    ) {
      return "Todos los campos son obligatorios";
    }
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(nombreUsuario.trim())) {
      return "El usuario debe tener entre 3 y 20 caracteres (letras, números o _)";
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "El formato del email no es válido";
    }
    if (password.length < 8) {
      return "La contraseña debe tener al menos 8 caracteres";
    }
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
      return "La contraseña debe contener al menos una letra y un número";
    }
    if (password !== confirmar) {
      return "Las contraseñas no coinciden";
    }
    return null;
  };

  // ============= SUBMIT =============

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar en cliente antes de llamar al servidor
    const errorValidacion = validar();
    if (errorValidacion) {
      setError(errorValidacion);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/registro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_usuario: nombreUsuario.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok && data.success) {
        // Mostrar mensaje de éxito y redirigir al login tras 2 segundos
        setExito(true);
        notify.success(
          "¡Cuenta creada!",
          "Redirigiendo al inicio de sesión...",
        );
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(data.error || "Error al crear la cuenta");
      }
    } catch (err) {
      setLoading(false);
      setError("Error de conexión. Intenta de nuevo.");
    }
  };

  // ============= RENDERIZADO =============

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Fondo animado */}
      <div className="absolute inset-0 z-0 w-full h-full">
        <FloatingLinesBackground />
      </div>

      {/* Overlay */}
      <div className="absolute inset-0 bg-background opacity-40 z-1"></div>

      {/* Contenedor principal */}
      <div className="w-full max-w-5xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* COLUMNA IZQUIERDA: Logo */}
          <div className="hidden lg:flex flex-col items-center justify-center space-y-12">
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

            <div className="text-center space-y-4">
              <h1 className="text-5xl font-black text-foreground drop-shadow-lg">
                CHECKPOINT
              </h1>
              <p className="text-lg text-foreground opacity-90">
                Tu comunidad gaming, catalogada
              </p>
              <p className="text-sm text-foreground opacity-70 max-w-xs mx-auto leading-relaxed">
                Únete y empieza a catalogar tus videojuegos, escribir reseñas y
                conectar con otros jugadores.
              </p>
            </div>

            <div className="text-center text-2xl">
              Cataloga | Valora | Conecta
            </div>
          </div>

          {/* COLUMNA DERECHA: Formulario */}
          <div className="w-full flex items-center justify-center lg:justify-end">
            <div className="w-full max-w-md bg-background bg-opacity-40 backdrop-blur-2xl border border-foreground border-opacity-30 rounded-3xl p-6 shadow-2xl">
              {/* Encabezado */}
              <div className="mb-5 text-center lg:text-left">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Crear cuenta
                </h2>
                <p className="text-foreground opacity-70 text-sm">
                  Únete a la comunidad gamer de CHECKPOINT
                </p>
              </div>

              {/* Mensaje de éxito */}
              {exito && (
                <div className="px-4 py-3 rounded-lg bg-green-500 bg-opacity-20 border border-green-500 border-opacity-50 mb-4">
                  <p className="text-green-400 text-sm font-medium text-center">
                    ¡Cuenta creada! Redirigiendo al login...
                  </p>
                </div>
              )}

              {/* Formulario */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {/* Nombre de usuario */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    Nombre de usuario
                  </label>
                  <input
                    type="text"
                    placeholder="Tu usuario (3-20 caracteres)"
                    value={nombreUsuario}
                    onChange={(e) => setNombreUsuario(e.target.value)}
                    disabled={loading || exito}
                    autoFocus
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground border-opacity-30 bg-background bg-opacity-30 text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading || exito}
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground border-opacity-30 bg-background bg-opacity-30 text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Mínimo 8 caracteres con letras y números"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading || exito}
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground border-opacity-30 bg-background bg-opacity-30 text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Confirmar contraseña */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">
                    Confirmar contraseña
                  </label>
                  <input
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmar}
                    onChange={(e) => setConfirmar(e.target.value)}
                    disabled={loading || exito}
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground border-opacity-30 bg-background bg-opacity-30 text-foreground placeholder:text-foreground placeholder:opacity-50 focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-opacity-20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Error */}
                {error && (
                  <div className="px-4 py-2.5 rounded-lg bg-red-500 bg-opacity-20 border border-red-500 border-opacity-50">
                    <p className="text-black text-sm font-medium">{error}</p>
                  </div>
                )}

                {/* Botón submit */}
                <button
                  type="submit"
                  disabled={loading || exito}
                  className="w-full py-3 px-4 rounded-lg font-bold text-background bg-foreground transition-all duration-300 hover:shadow-lg hover:shadow-foreground/30 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <span className="inline-block w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin"></span>
                      <span>Creando cuenta...</span>
                    </span>
                  ) : (
                    "Crear cuenta"
                  )}
                </button>
              </form>

              {/* Enlace al login */}
              <p className="text-sm text-foreground opacity-60 text-center mt-4">
                ¿Ya tienes cuenta?{" "}
                <Link
                  href="/login"
                  className="text-foreground opacity-100 font-semibold hover:underline"
                >
                  Inicia sesión
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
