"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUsuario } from "@/lib/useUsuario";

export default function MisAmigosPage() {
  const { usuario, loading: loadingUser } = useUsuario();
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("siguiendo");

  useEffect(() => {
    if (!usuario?.id) return;

    fetch(`/api/seguimiento?usuarioId=${usuario.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSeguimiento(data);
        setLoading(false);
      })
      .catch(console.error);
  }, [usuario]);

  const dejarDeSeguir = async (id_usuario) => {
    try {
      await fetch(`/api/seguimiento?usuarioId=${id_usuario}`, {
        method: "DELETE",
      });
      setSeguimiento((prev) => ({
        ...prev,
        seguidos: prev.seguidos.filter((u) => u.id_usuario !== id_usuario),
      }));
    } catch (e) {
      console.error(e);
    }
  };

  const lista =
    activeTab === "siguiendo"
      ? seguimiento?.seguidos || []
      : seguimiento?.seguidores || [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/homeRegistrado" className="flex items-center gap-3">
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={32}
            height={32}
            style={{ width: "32px", height: "auto" }}
          />
          <span className="text-lg font-black tracking-widest text-foreground hidden sm:block">
            CHECKPOINT
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/homeRegistrado"
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            ← Volver
          </Link>
          <Link
            href="/buscar"
            className="text-sm font-bold text-background bg-foreground px-4 py-1.5 rounded-lg hover:brightness-90 transition-all cursor-pointer"
          >
            Buscar usuarios
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-8">
        <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">
          Mis Amigos
        </h1>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-foreground/10">
          {["siguiendo", "seguidores"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? "text-foreground border-foreground"
                  : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {tab === "siguiendo"
                ? `Siguiendo (${seguimiento?.seguidos?.length || 0})`
                : `Seguidores (${seguimiento?.seguidores?.length || 0})`}
            </button>
          ))}
        </div>

        {loading || loadingUser ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse"
              />
            ))}
          </div>
        ) : lista.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">
              {activeTab === "siguiendo" ? "🔭" : "👥"}
            </p>
            <p className="text-foreground/50 text-sm">
              {activeTab === "siguiendo"
                ? "Aún no sigues a nadie."
                : "Aún nadie te sigue."}
            </p>
            {activeTab === "siguiendo" && (
              <Link
                href="/buscar"
                className="mt-4 inline-block px-6 py-2.5 rounded-xl font-bold text-background bg-foreground text-sm hover:brightness-90 transition-all"
              >
                Buscar usuarios
              </Link>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {lista.map((u) => (
              <div
                key={u.id_usuario}
                className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:border-foreground/20 transition-all"
              >
                <div className="w-10 h-10 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-sm font-black text-foreground uppercase shrink-0">
                  {u.nombre_usuario?.[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-foreground">
                    {u.nombre_usuario}
                  </p>
                  <p className="text-xs text-foreground/40">
                    Usuario de CHECKPOINT
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/usuario/${u.nombre_usuario}`}
                    className="text-xs font-semibold text-foreground/50 border border-foreground/20 px-3 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/40 transition-all"
                  >
                    Ver perfil
                  </Link>
                  {activeTab === "siguiendo" && (
                    <button
                      onClick={() => dejarDeSeguir(u.id_usuario)}
                      className="text-xs font-semibold text-red-400/70 border border-red-400/20 px-3 py-1.5 rounded-lg hover:text-red-400 hover:border-red-400/40 transition-all cursor-pointer"
                    >
                      Dejar de seguir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
