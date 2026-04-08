"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ============= MODAL CREAR LISTA =============

function ModalCrearLista({ onClose, onCreada }) {
  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleCrear = async () => {
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/listas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre_lista: nombre.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al crear");
      onCreada();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-foreground">Nueva lista</h3>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground cursor-pointer text-xl">✕</button>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Nombre</p>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCrear()}
            placeholder="ej: Mis favoritos, Pendientes..."
            maxLength={50}
            autoFocus
            className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40"
          />
          <p className="text-xs text-foreground/30 mt-1 text-right">{nombre.length}/50</p>
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleCrear}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Creando..." : "Crear lista"}
        </button>
      </div>
    </div>
  );
}

// ============= MODAL DETALLE DE LISTA =============

function ModalDetalleLista({ lista, onClose, onActualizada }) {
  const [juegosIds, setJuegosIds]     = useState([]);
  const [juegosInfo, setJuegosInfo]   = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const cargarJuegos = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`/api/listas/juegos?listaId=${lista.id_lista}`);
      const data = await res.json();
      const ids  = data.juegos || [];
      setJuegosIds(ids);

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
      setJuegosInfo(enriched);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [lista.id_lista]);

  useEffect(() => { cargarJuegos(); }, [cargarJuegos]);

  const quitarJuego = async (gameId) => {
    try {
      await fetch(`/api/listas/juegos?listaId=${lista.id_lista}&gameId=${gameId}`, {
        method: "DELETE",
      });
      cargarJuegos();
      onActualizada();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-200 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-foreground/10 shrink-0">
          <div>
            <h3 className="text-lg font-black text-foreground">{lista.nombre_lista}</h3>
            <p className="text-xs text-foreground/40">{juegosIds.length} juego{juegosIds.length !== 1 ? "s" : ""}</p>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground cursor-pointer text-xl">✕</button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 p-6">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-xl bg-foreground/5 animate-pulse" />
              ))}
            </div>
          ) : juegosInfo.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📋</p>
              <p className="text-sm text-foreground/40">Esta lista está vacía.</p>
              <p className="text-xs text-foreground/30 mt-1">Añade juegos desde la ficha de cualquier juego.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {juegosInfo.map((game) => (
                <div key={game.id} className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10">
                  {game.cover ? (
                    <Image src={game.cover} alt={game.title} fill sizes="200px" className="object-cover group-hover:brightness-50 transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-xs text-center px-2">{game.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                    <p className="text-xs font-bold text-foreground line-clamp-2">{game.title}</p>
                    <p className="text-[10px] text-foreground/50 mt-0.5">{game.genre}</p>
                  </div>
                  {/* Overlay con acciones */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Link
                      href={`/juego/${game.id}`}
                      className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 cursor-pointer"
                    >
                      Ver ficha
                    </Link>
                    <button
                      onClick={() => quitarJuego(game.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-500/80 text-white text-xs font-bold hover:bg-red-500 cursor-pointer"
                    >
                      Quitar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============= PÁGINA PRINCIPAL =============

export default function MisListasPage() {
  const [listas, setListas]           = useState([]);
  const [loading, setLoading]         = useState(true);
  const [modalCrear, setModalCrear]   = useState(false);
  const [listaDetalle, setListaDetalle] = useState(null);

  const cargarListas = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch("/api/listas");
      const data = await res.json();
      setListas(data.listas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargarListas(); }, [cargarListas]);

  const eliminarLista = async (id_lista) => {
    if (!confirm("¿Eliminar esta lista y todos sus juegos?")) return;
    try {
      await fetch(`/api/listas?id=${id_lista}`, { method: "DELETE" });
      cargarListas();
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
        <div className="flex items-center gap-3">
          <Link href="/homeRegistrado" className="text-sm text-foreground/50 hover:text-foreground transition-colors">← Volver</Link>
          <button
            onClick={() => setModalCrear(true)}
            className="text-sm font-bold text-background bg-foreground px-4 py-1.5 rounded-lg hover:brightness-90 active:scale-95 transition-all cursor-pointer"
          >
            + Nueva lista
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">Mis Listas</h1>
          <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
          <span className="text-xs text-foreground/40">{listas.length} lista{listas.length !== 1 ? "s" : ""}</span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
            ))}
          </div>
        ) : listas.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">📋</p>
            <p className="text-foreground/50 text-sm">Aún no tienes listas creadas.</p>
            <button
              onClick={() => setModalCrear(true)}
              className="mt-4 px-6 py-2.5 rounded-xl font-bold text-background bg-foreground text-sm hover:brightness-90 transition-all cursor-pointer"
            >
              Crear mi primera lista
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {listas.map((lista) => (
              <div
                key={lista.id_lista}
                className="group bg-foreground/5 border border-foreground/10 rounded-2xl p-5 hover:border-foreground/25 transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3">
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => setListaDetalle(lista)}
                  >
                    <h3 className="text-base font-black text-foreground truncate group-hover:text-foreground/80 transition-colors">
                      {lista.nombre_lista}
                    </h3>
                    <p className="text-xs text-foreground/40 mt-1">
                      {lista.total_juegos} juego{lista.total_juegos !== 1 ? "s" : ""}
                    </p>
                    <p className="text-xs text-foreground/30 mt-0.5">
                      Creada el {new Date(lista.fecha_creacion).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => setListaDetalle(lista)}
                      className="text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-foreground/10"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => eliminarLista(lista.id_lista)}
                      className="text-xs text-foreground/40 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modales */}
      {modalCrear && (
        <ModalCrearLista
          onClose={() => setModalCrear(false)}
          onCreada={cargarListas}
        />
      )}

      {listaDetalle && (
        <ModalDetalleLista
          lista={listaDetalle}
          onClose={() => setListaDetalle(null)}
          onActualizada={cargarListas}
        />
      )}
    </div>
  );
}