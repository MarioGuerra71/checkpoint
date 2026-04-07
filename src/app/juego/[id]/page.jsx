"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";

// ============= HELPERS =============

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function renderMinerales(puntuacion, size = "text-base") {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={`${size} ${i < puntuacion ? "opacity-100" : "opacity-20"}`}>💎</span>
  ));
}

// ============= MODAL RESEÑA/SESIÓN =============

function ModalAccion({ game, onClose, onSuccess }) {
  const [activeTab, setActiveTab]   = useState("resena");
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [duracion, setDuracion]     = useState("");
  const [fecha, setFecha]           = useState(new Date().toISOString().split("T")[0]);
  const [sesionComentario, setSesionComentario] = useState("");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleReseña = async () => {
    if (!puntuacion) { setError("Selecciona una puntuación"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawg_game_id: game.id,
          puntuacion,
          comentario: comentario.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      onSuccess("reseña");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSesion = async () => {
    if (!duracion || !fecha) { setError("Rellena todos los campos"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawg_game_id:    game.id,
          duracion_minutos: parseInt(duracion),
          fecha_sesion:    fecha,
          comentario:      sesionComentario.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      onSuccess("sesión");
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
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            {game.cover && (
              <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0">
                <Image src={game.cover} alt={game.title} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-foreground leading-tight">{game.title}</h3>
              <p className="text-xs text-foreground/40">{game.genre}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground cursor-pointer text-xl leading-none">✕</button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-foreground/10">
          {["resena", "sesion"].map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setError(""); }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? "text-foreground border-foreground"
                  : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {tab === "resena" ? "💎 Reseñar" : "⏱ Sesión"}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-4">

          {/* ── TAB RESEÑA ── */}
          {activeTab === "resena" && (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Puntuación</p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPuntuacion(n)}
                      className={`text-2xl transition-all cursor-pointer hover:scale-110 ${n <= puntuacion ? "opacity-100" : "opacity-25"}`}
                    >
                      💎
                    </button>
                  ))}
                </div>
                {puntuacion > 0 && (
                  <p className="text-xs text-center text-foreground/40 mt-1">
                    {["", "Muy malo", "Malo", "Regular", "Bueno", "Obra maestra"][puntuacion]}
                  </p>
                )}
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Comentario (opcional)</p>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="¿Qué te pareció el juego?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40 resize-none"
                />
              </div>
            </>
          )}

          {/* ── TAB SESIÓN ── */}
          {activeTab === "sesion" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Duración (min)</p>
                  <input
                    type="number"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    placeholder="ej: 90"
                    min="1"
                    max="1440"
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Fecha</p>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm focus:outline-none focus:border-foreground/40"
                  />
                </div>
              </div>

              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Comentario (opcional)</p>
                <textarea
                  value={sesionComentario}
                  onChange={(e) => setSesionComentario(e.target.value)}
                  placeholder="¿Cómo fue la sesión?"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40 resize-none"
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            onClick={activeTab === "resena" ? handleReseña : handleSesion}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Guardando...
              </span>
            ) : activeTab === "resena" ? "Guardar reseña" : "Registrar sesión"}
          </button>

        </div>
      </div>
    </div>
  );
}

// ============= PÁGINA PRINCIPAL =============

export default function JuegoPage({ params }) {
  const { id } = use(params);

  const [game, setGame]         = useState(null);
  const [resenas, setResenas]   = useState([]);
  const [loadingGame, setLoadingGame]     = useState(true);
  const [loadingResenas, setLoadingResenas] = useState(true);
  const [autenticado, setAutenticado]     = useState(false);
  const [modalOpen, setModalOpen]         = useState(false);
  const [exito, setExito]                 = useState("");

  // Comprobar si está logueado
  useEffect(() => {
    fetch("/api/usuario")
      .then((r) => { if (r.ok) setAutenticado(true); })
      .catch(() => {});
  }, []);

  // Cargar info del juego desde RAWG
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchGame() {
      try {
        const res  = await fetch(`/api/rawg?id=${id}`);
        const data = await res.json();
        if (!cancelled) setGame(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingGame(false);
      }
    }

    fetchGame();
    return () => { cancelled = true; };
  }, [id]);

  // Cargar reseñas de la BD
  const cargarResenas = async () => {
    setLoadingResenas(true);
    try {
      const res  = await fetch(`/api/resenas?gameId=${id}`);
      const data = await res.json();
      setResenas(data.resenas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResenas(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    cargarResenas();
  }, [id]);

  const handleSuccess = (tipo) => {
    setExito(`¡${tipo.charAt(0).toUpperCase() + tipo.slice(1)} guardada correctamente!`);
    setTimeout(() => setExito(""), 3000);
    if (tipo === "reseña") cargarResenas();
  };

  if (loadingGame) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
    </div>
  );

  if (!game) return (
    <div className="min-h-screen bg-background flex items-center justify-center text-foreground/50">
      Juego no encontrado.
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href={autenticado ? "/homeRegistrado" : "/home"} className="flex items-center gap-3">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={32} height={32} style={{ width: "32px", height: "auto" }} />
          <span className="text-lg font-black tracking-widest text-foreground hidden sm:block">CHECKPOINT</span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={autenticado ? "/homeRegistrado" : "/home"}
            className="text-sm text-foreground/50 hover:text-foreground transition-colors"
          >
            ← Volver
          </Link>
          {!autenticado && (
            <Link href="/login" className="text-sm font-bold text-background bg-foreground px-4 py-1.5 rounded-lg hover:brightness-90 transition-all">
              Iniciar sesión
            </Link>
          )}
        </div>
      </nav>

      {/* ── HERO DEL JUEGO ── */}
      <section className="relative h-72 overflow-hidden">
        {game.cover && (
          <>
            <Image src={game.cover} alt={game.title} fill sizes="100vw" className="object-cover brightness-40" />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-6 flex items-end gap-6">
          {/* Portada pequeña */}
          {game.cover && (
            <div className="relative w-24 h-32 rounded-xl overflow-hidden border-2 border-foreground/20 shadow-2xl shrink-0 hidden sm:block">
              <Image src={game.cover} alt={game.title} fill sizes="96px" className="object-cover" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-widest mb-1">{game.genre}</p>
            <h1 className="text-3xl font-black text-foreground leading-tight">{game.title}</h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {game.rating > 0 && (
                <span className="text-sm font-bold text-foreground">★ {game.rating}</span>
              )}
              {game.metacritic && (
                <span className="text-xs font-black text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded">
                  MC {game.metacritic}
                </span>
              )}
              {game.released && (
                <span className="text-xs text-foreground/40">{game.released}</span>
              )}
              {game.playtime > 0 && (
                <span className="text-xs text-foreground/40">⏱ ~{game.playtime}h promedio</span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">

        {/* Mensaje éxito */}
        {exito && (
          <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-green-400 text-sm font-medium text-center">{exito}</p>
          </div>
        )}

        {/* ── INFO + BOTONES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Descripción */}
          <div className="lg:col-span-2 space-y-6">
            {game.description && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Descripción</h2>
                <p className="text-sm text-foreground/70 leading-relaxed">{game.description}</p>
              </div>
            )}

            {game.genres?.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Géneros</h2>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((g) => (
                    <span key={g} className="text-xs px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 text-foreground/70">
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {game.platforms?.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Plataformas</h2>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p) => (
                    <span key={p} className="text-xs px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/60">
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-4">

            {/* Desarrolladores */}
            {game.developers?.length > 0 && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Desarrollador</p>
                <p className="text-sm text-foreground/80">{game.developers.join(", ")}</p>
              </div>
            )}

            {game.publishers?.length > 0 && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-2">Publisher</p>
                <p className="text-sm text-foreground/80">{game.publishers.join(", ")}</p>
              </div>
            )}

            {/* Botón acción */}
            {autenticado ? (
              <button
                onClick={() => setModalOpen(true)}
                className="w-full py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all duration-200 cursor-pointer"
              >
                💎 Reseñar / ⏱ Registrar sesión
              </button>
            ) : (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-center space-y-3">
                <p className="text-xs text-foreground/50">Inicia sesión para reseñar este juego</p>
                <Link
                  href="/login"
                  className="block w-full py-2.5 rounded-xl font-bold text-background bg-foreground text-sm hover:brightness-90 transition-all"
                >
                  Iniciar sesión
                </Link>
              </div>
            )}

            {game.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noreferrer"
                className="block w-full py-2.5 rounded-xl font-semibold text-foreground bg-foreground/10 border border-foreground/20 text-sm text-center hover:bg-foreground/20 transition-all"
              >
                Web oficial ↗
              </a>
            )}
          </div>
        </div>
        
        {/* ── RESEÑAS DE LA COMUNIDAD ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-black text-foreground tracking-widest uppercase">
              Reseñas de la comunidad
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            <span className="text-xs text-foreground/40">{resenas.length} reseñas</span>
          </div>

          {loadingResenas ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
              ))}
            </div>
          ) : resenas.length === 0 ? (
            <div className="text-center py-12 bg-foreground/5 border border-foreground/10 rounded-2xl">
              <p className="text-foreground/40 text-sm">Aún no hay reseñas para este juego.</p>
              {autenticado && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 text-sm font-bold text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                >
                  ¡Sé el primero en reseñarlo!
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {resenas.map((r) => (
                <div key={r.id_resena} className="bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-4 hover:border-foreground/20 transition-all duration-200">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-black text-foreground uppercase shrink-0">
                        {r.nombre_usuario?.[0] || "U"}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{r.nombre_usuario}</p>
                        <div className="flex gap-0.5 mt-0.5">{renderMinerales(r.puntuacion, "text-sm")}</div>
                      </div>
                    </div>
                    <p className="text-xs text-foreground/30 shrink-0">{formatFecha(r.fecha_resena)}</p>
                  </div>
                  {r.comentario && (
                    <p className="text-sm text-foreground/70 mt-3 leading-relaxed italic">
                      &quot;{r.comentario}&quot;
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
        </main>

      {/* ── MODAL ── */}
      {modalOpen && game && (
        <ModalAccion
          game={game}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

    </div>
  );
}