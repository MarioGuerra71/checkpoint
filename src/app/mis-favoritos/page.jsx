"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

export default function MisFavoritosPage() {
  const [juegos, setJuegos]   = useState([]);
  const [loading, setLoading] = useState(true);

  const cargarFavoritos = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/favoritos");
      const data = await res.json();
      const ids  = data.favoritos || [];

      // Enriquecer con RAWG
      const enriched = await Promise.all(
        ids.map(async (id) => {
          try {
            const r    = await fetch(`/api/rawg?id=${id}`);
            const game = await r.json();
            return game;
          } catch {
            return { id, title: `Juego #${id}`, cover: null };
          }
        })
      );
      setJuegos(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarFavoritos(); }, [cargarFavoritos]);

  const quitarFavorito = async (gameId) => {
    try {
      await fetch(`/api/favoritos?gameId=${gameId}`, { method: "DELETE" });
      setJuegos(prev => prev.filter(g => g.id !== gameId));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/homeRegistrado" className="flex items-center gap-3">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={32} height={32} style={{ width: "32px", height: "auto" }} />
          <span className="text-lg font-black tracking-widest text-foreground hidden sm:block">CHECKPOINT</span>
        </Link>
        <Link href="/homeRegistrado" className="text-sm text-foreground/50 hover:text-foreground transition-colors">
          ← Volver
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">Mis Favoritos</h1>
          <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
          <span className="text-xs text-foreground/40">{juegos.length} juego{juegos.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-3/4 rounded-xl bg-foreground/5 border border-foreground/10 animate-pulse" />
            ))}
          </div>
        ) : juegos.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">⭐</p>
            <p className="text-foreground/50 text-sm">Aún no tienes juegos favoritos.</p>
            <Link
              href="/homeRegistrado"
              className="mt-4 inline-block px-6 py-2.5 rounded-xl font-bold text-background bg-foreground text-sm hover:brightness-90 transition-all"
            >
              Explorar juegos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {juegos.map((game) => (
              <div key={game.id} className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 hover:border-foreground/25 hover:-translate-y-1 transition-all duration-200">
                {game.cover ? (
                  <Image src={game.cover} alt={game.title} fill sizes="25vw" className="object-cover group-hover:brightness-50 transition-all duration-300" />
                ) : (
                  <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                    <span className="text-foreground/20 text-xs text-center px-2">{game.title}</span>
                  </div>
                )}

                {/* Info abajo */}
                <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                  <p className="text-xs font-bold text-foreground line-clamp-2">{game.title}</p>
                  <p className="text-[10px] text-foreground/50 mt-0.5">{game.genre}</p>
                  {game.rating > 0 && (
                    <p className="text-xs font-black text-foreground mt-0.5">★ {game.rating}</p>
                  )}
                </div>

                {/* Hover: acciones */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Link
                    href={`/juego/${game.id}`}
                    className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 cursor-pointer"
                  >
                    Ver ficha
                  </Link>
                  <button
                    onClick={() => quitarFavorito(game.id)}
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
    </div>
  );
}