"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { notify } from "@/lib/notify";

function ModalConfirmar({ mensaje, onConfirmar, onCancelar }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onCancelar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancelar]);

  return (
    <div
      className="fixed inset-0 z-300 flex items-center justify-center p-4"
      onClick={onCancelar}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-foreground/80 text-center leading-relaxed">
          {mensaje}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancelar}
            className="flex-1 py-2.5 rounded-xl font-semibold text-sm text-foreground/60 bg-foreground/5 border border-foreground/15 hover:bg-foreground/10 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white bg-red-500/80 hover:bg-red-500 transition-all cursor-pointer"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MisFavoritosPage() {
  const [juegos, setJuegos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmId, setConfirmId] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  const cargarFavoritos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/favoritos");
      const data = await res.json();
      const ids = data.favoritos || [];

      const enriched = await Promise.all(
        ids.map(async (id) => {
          try {
            const r = await fetch(`/api/rawg?id=${id}`);
            const game = await r.json();
            return game;
          } catch {
            return { id, title: `Juego #${id}`, cover: null };
          }
        }),
      );
      setJuegos(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarFavoritos();
  }, [cargarFavoritos]);

  const quitarFavorito = async (gameId) => {
    try {
      await fetch(`/api/favoritos?gameId=${gameId}`, { method: "DELETE" });
      setJuegos((prev) => prev.filter((g) => g.id !== gameId));
      setConfirmId(null);
      notify.success(
        "Eliminado de favoritos",
        "El juego ya no está en tu lista.",
      );
    } catch (e) {
      notify.error("Error", "No se pudo eliminar.");
    }
  };

  const juegosFiltrados = juegos.filter((g) =>
    g.title?.toLowerCase().includes(busqueda.toLowerCase()),
  );

  return (
    <div className="min-h-screen text-foreground">
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
        <Link
          href="/homeRegistrado"
          className="flex items-center gap-2 text-sm font-semibold text-foreground/70 bg-foreground/5 border border-foreground/15 px-4 py-2 rounded-xl hover:bg-foreground/10 hover:text-foreground hover:border-foreground/30 transition-all"
        >
          ← Volver
        </Link>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* Cabecera */}
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">
              Mis Favoritos
            </h1>
            <p className="text-sm text-foreground/40 mt-1">
              {juegos.length} juego{juegos.length !== 1 ? "s" : ""} guardados
            </p>
          </div>
          <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
        </div>

        {/* Buscador */}
        {juegos.length > 0 && (
          <div className="flex items-center gap-2 bg-foreground/5 border border-foreground/15 rounded-xl px-4 py-2.5">
            <span className="text-foreground/30 text-sm">🔍</span>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar en tus favoritos..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
            />
            {busqueda && (
              <button
                onClick={() => setBusqueda("")}
                className="text-foreground/30 hover:text-foreground transition-colors cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="aspect-3/4 rounded-xl bg-foreground/5 border border-foreground/10 animate-pulse"
              />
            ))}
          </div>
        ) : juegos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-foreground/50 text-sm">
              Aún no tienes juegos favoritos.
            </p>
            <Link
              href="/homeRegistrado"
              className="mt-4 inline-block px-6 py-2.5 rounded-xl font-bold text-background bg-foreground text-sm hover:brightness-90 transition-all"
            >
              Explorar juegos
            </Link>
          </div>
        ) : juegosFiltrados.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-foreground/40 text-sm">
              No encontramos &quot;{busqueda}&quot; en tus favoritos.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {juegosFiltrados.map((game) => (
              <div
                key={game.id}
                className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 hover:border-foreground/30 hover:-translate-y-1 transition-all duration-200"
              >
                {/* Portada */}
                {game.cover ? (
                  <Image
                    src={game.cover}
                    alt={game.title}
                    fill
                    sizes="20vw"
                    className="object-cover group-hover:brightness-50 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                    <span className="text-foreground/20 text-xs text-center px-2">
                      {game.title}
                    </span>
                  </div>
                )}

                {/* Badge rating */}
                {game.rating > 0 && (
                  <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-foreground/20 rounded-lg px-1.5 py-0.5">
                    <span className="text-[10px] font-black text-foreground">
                      ★ {game.rating}
                    </span>
                  </div>
                )}

                {/* Info abajo */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/60 to-transparent p-3">
                  <p className="text-xs font-bold text-foreground line-clamp-2 leading-tight">
                    {game.title}
                  </p>
                  <p className="text-[10px] text-foreground/50 mt-0.5">
                    {game.genre}
                  </p>
                </div>

                {/* Overlay hover */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={`/juego/${game.id}`}
                    className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 cursor-pointer"
                  >
                    Ver ficha
                  </Link>
                  <button
                    onClick={() => setConfirmId(game.id)}
                    className="px-4 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-bold hover:bg-red-500 cursor-pointer"
                  >
                    Quitar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {confirmId && (
        <ModalConfirmar
          mensaje="¿Quitar este juego de favoritos?"
          onConfirmar={() => quitarFavorito(confirmId)}
          onCancelar={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
