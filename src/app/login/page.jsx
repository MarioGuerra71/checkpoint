"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import LoginBranding from "./LoginBranding";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ usuario, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (res.ok && data.success) {
      localStorage.setItem("loggedIn", "true");
      router.push("/home");
    } else {
      setError(data.error || "Error al iniciar sesión");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-white/90 dark:bg-black/80 rounded-xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
        <LoginBranding />
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="text"
            placeholder="Usuario"
            className="border border-foreground/30 rounded-md p-3 bg-transparent focus:outline-none focus:border-foreground text-black dark:text-white placeholder:text-foreground/60"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            autoFocus
          />
          <input
            type="password"
            placeholder="Contraseña"
            className="border border-foreground/30 rounded-md p-3 bg-transparent focus:outline-none focus:border-foreground text-black dark:text-white placeholder:text-foreground/60"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            className="bg-foreground text-background font-semibold rounded-md p-3 mt-2 transition hover:brightness-90 disabled:opacity-60"
            disabled={loading}
            type="submit"
          >
            {loading ? "Entrando..." : "Iniciar sesión"}
          </button>
          {error && <div className="text-red-500 text-sm text-center mt-2">{error}</div>}
        </form>
      </div>
    </div>
  );
}
