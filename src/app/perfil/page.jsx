"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUsuario } from "@/lib/useUsuario";
import AvatarUsuario from "@/components/AvatarUsuario";

// ============= HELPERS =============

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric", month: "short", year: "numeric"
  });
}

function formatTiempo(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function Minerales({ puntuacion, onSelect, interactive = false, size = "text-lg" }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          onClick={() => interactive && onSelect && onSelect(i + 1)}
          className={`${size} transition-all ${
            i < puntuacion ? "opacity-100" : "opacity-20"
          } ${interactive ? "cursor-pointer hover:scale-110" : ""}`}
        >
          💎
        </span>
      ))}
    </div>
  );
}

// ============= MODAL EDITAR RESEÑA =============

function ModalEditarResena({ resena, onClose, onSaved }) {
  const [puntuacion, setPuntuacion] = useState(resena.puntuacion || 0);
  const [comentario, setComentario] = useState(resena.comentario || "");
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState("");

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleGuardar = async () => {
    if (!puntuacion) { setError("Selecciona una puntuación"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resenas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena:  resena.id_resena,
          puntuacion,
          comentario: comentario.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      onSaved();
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
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-foreground">Editar reseña</h3>
          <button onClick={onClose} className="text-foreground/40 hover:text-foreground cursor-pointer text-xl">✕</button>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">Puntuación</p>
          <Minerales puntuacion={puntuacion} onSelect={setPuntuacion} interactive size="text-2xl" />
          {puntuacion > 0 && (
            <p className="text-xs text-foreground/40 mt-1">
              {["", "Muy malo", "Malo", "Regular", "Bueno", "Obra maestra"][puntuacion]}
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">Comentario</p>
          <textarea
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            placeholder="¿Qué te pareció el juego?"
            rows={3}
            className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40 resize-none"
          />
        </div>

        {error && <p className="text-sm text-red-400">{error}</p>}

        <button
          onClick={handleGuardar}
          disabled={loading}
          className="w-full py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  );
}

function ModalConfirmar({ mensaje, onConfirmar, onCancelar }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onCancelar(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancelar]);

  return (
    <div className="fixed inset-0 z-300 flex items-center justify-center p-4" onClick={onCancelar}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-foreground/80 text-center leading-relaxed">{mensaje}</p>
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
// ============= PÁGINA PRINCIPAL =============

export default function PerfilPage() {
  const { usuario, stats, masJugados, tema, cambiarTema, loading: loadingUser } = useUsuario();

  const [activeTab, setActiveTab] = useState("resenas");

  // ── Reseñas paginadas ──────────────────────────────────────
  const [resenas, setResenas]           = useState([]);
  const [resenasPage, setResenasPage]   = useState(1);
  const [resenasTotalPages, setResenasTotalPages] = useState(1);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [resenasEnriquecidas, setResenasEnriquecidas] = useState([]);
  const [editandoResena, setEditandoResena] = useState(null);

  // ── Sesiones paginadas ─────────────────────────────────────
  const [sesiones, setSesiones]         = useState([]);
  const [sesionesPage, setSesionesPage] = useState(1);
  const [sesionesTotalPages, setSesionesTotalPages] = useState(1);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [sesionesEnriquecidas, setSesionesEnriquecidas] = useState([]);

  const [confirmacion, setConfirmacion] = useState(null);

  // ── Cargar reseñas ─────────────────────────────────────────
  const cargarResenas = useCallback(async (page = 1) => {
    setLoadingResenas(true);
    try {
      const res  = await fetch(`/api/usuario/resenas?page=${page}`);
      const data = await res.json();
      setResenas(data.resenas || []);
      setResenasTotalPages(data.totalPages || 1);
      setResenasPage(page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResenas(false);
    }
  }, []);

  // ── Cargar sesiones ────────────────────────────────────────
  const cargarSesiones = useCallback(async (page = 1) => {
    setLoadingSesiones(true);
    try {
      const res  = await fetch(`/api/sesiones?page=${page}`);
      const data = await res.json();
      setSesiones(data.sesiones || []);
      setSesionesTotalPages(data.totalPages || 1);
      setSesionesPage(page);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSesiones(false);
    }
  }, []);

  useEffect(() => { cargarResenas(1); }, [cargarResenas]);
  useEffect(() => { cargarSesiones(1); }, [cargarSesiones]);

  // ── Enriquecer reseñas con RAWG ────────────────────────────
  useEffect(() => {
    if (!resenas.length) return;
    let cancelled = false;
    async function enrich() {
      const enriched = await Promise.all(
        resenas.map(async (r) => {
          try {
            const res  = await fetch(`/api/rawg?id=${r.rawg_game_id}`);
            const game = await res.json();
            return { ...r, title: game.title, cover: game.cover };
          } catch {
            return { ...r, title: `Juego #${r.rawg_game_id}`, cover: null };
          }
        })
      );
      if (!cancelled) setResenasEnriquecidas(enriched);
    }
    enrich();
    return () => { cancelled = true; };
  }, [resenas]);

  // ── Enriquecer sesiones con RAWG ───────────────────────────
  useEffect(() => {
    if (!sesiones.length) return;
    let cancelled = false;
    async function enrich() {
      const enriched = await Promise.all(
        sesiones.map(async (s) => {
          try {
            const res  = await fetch(`/api/rawg?id=${s.rawg_game_id}`);
            const game = await res.json();
            return { ...s, title: game.title, cover: game.cover };
          } catch {
            return { ...s, title: `Juego #${s.rawg_game_id}`, cover: null };
          }
        })
      );
      if (!cancelled) setSesionesEnriquecidas(enriched);
    }
    enrich();
    return () => { cancelled = true; };
  }, [sesiones]);

  // ── Eliminar reseña ────────────────────────────────────────
  const eliminarResena = (id_resena) => {
  setConfirmacion({
    mensaje: "¿Eliminar esta reseña? Esta acción no se puede deshacer.",
    onConfirmar: async () => {
      setConfirmacion(null);
      try {
        const res = await fetch(`/api/resenas?id=${id_resena}`, { method: "DELETE" });
        if (res.ok) cargarResenas(resenasPage);
      } catch (e) {
        console.error(e);
      }
    },
  });
};

  // ── Eliminar sesión ────────────────────────────────────────
  const eliminarSesion = (id_sesion) => {
  setConfirmacion({
    mensaje: "¿Eliminar esta sesión del diario? Esta acción no se puede deshacer.",
    onConfirmar: async () => {
      setConfirmacion(null);
      try {
        const res = await fetch(`/api/sesiones?id=${id_sesion}`, { method: "DELETE" });
        if (res.ok) cargarSesiones(sesionesPage);
      } catch (e) {
        console.error(e);
      }
    },
  });
};

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/home";
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
          <button onClick={handleLogout} className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all cursor-pointer">
            Salir
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* ── CABECERA ── */}
        <section className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">

          {/* Avatar */}
          <AvatarUsuario usuario={usuario} size={112} className="border-4 border-foreground/10" />

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {loadingUser ? (
              <div className="space-y-2">
                <div className="h-8 w-48 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-64 bg-foreground/10 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-foreground">{usuario?.nombre}</h1>
                <p className="text-sm text-foreground/50 mt-1">{usuario?.email}</p>
                <p className="text-xs text-foreground/30 mt-1">
                  Miembro desde {formatFecha(usuario?.fechaRegistro)}
                </p>
              </>
            )}

            <div className="flex gap-6 mt-4 justify-center sm:justify-start flex-wrap">
              {[
                { num: `${stats?.horasJugadas || 0}h`, label: "Jugadas" },
                { num: stats?.totalResenas || 0,       label: "Reseñas" },
                { num: stats?.totalFavoritos || 0,     label: "Favoritos" },
                { num: stats?.totalListas || 0,        label: "Listas" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-foreground">{num}</p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle tema */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 flex flex-col items-center gap-3 w-44 shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Tema</p>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarTema("oscuro")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tema === "oscuro" ? "bg-foreground text-background" : "bg-foreground/10 text-foreground/50 hover:text-foreground"
                }`}
              >
                🌙 Oscuro
              </button>
              <button
                onClick={() => cambiarTema("claro")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tema === "claro" ? "bg-foreground text-background" : "bg-foreground/10 text-foreground/50 hover:text-foreground"
                }`}
              >
                ☀️ Claro
              </button>
            </div>
          </div>
        </section>

        {/* ── MÁS JUGADOS ── */}
        {masJugados.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-xl font-black text-foreground tracking-widest uppercase">Más jugados</h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {masJugados.map((game) => (
                <Link key={game.id} href={`/juego/${game.id}`} className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-1 transition-all duration-200">
                  {game.cover ? (
                    <Image src={game.cover} alt={game.title} fill sizes="16vw" className="object-cover group-hover:brightness-50 transition-all" />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-[10px] text-center px-1">{game.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 to-transparent p-2">
                    <p className="text-[10px] font-bold text-foreground line-clamp-1">{game.title}</p>
                    <p className="text-[9px] text-foreground/60 mt-0.5">⏱ {formatTiempo(game.totalMinutos)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── TABS ── */}
        <section>
          <div className="flex gap-1 mb-6 border-b border-foreground/10">
            {["resenas", "diario"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === tab ? "text-foreground border-foreground" : "text-foreground/40 border-transparent hover:text-foreground/70"
                }`}
              >
                {tab === "resenas" ? `Reseñas (${stats?.totalResenas || 0})` : `Diario`}
              </button>
            ))}
          </div>

          {/* ── RESEÑAS ── */}
          {activeTab === "resenas" && (
            <div className="space-y-4">
              {loadingResenas ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
                ))
              ) : resenasEnriquecidas.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-8">Aún no has escrito ninguna reseña.</p>
              ) : (
                <>
                  {resenasEnriquecidas.map((r) => (
                    <div key={r.id_resena} className="flex items-start gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:border-foreground/20 transition-all">
                      <Link href={`/juego/${r.rawg_game_id}`} className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10 hover:brightness-75 transition-all">
                        {r.cover && <Image src={r.cover} alt={r.title} fill sizes="48px" className="object-cover" />}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/juego/${r.rawg_game_id}`} className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors truncate block">
                          {r.title}
                        </Link>
                        <Minerales puntuacion={r.puntuacion} size="text-sm" />
                        {r.comentario && (
                          <p className="text-xs text-foreground/50 mt-1 italic line-clamp-2">&quot;{r.comentario}&quot;</p>
                        )}
                        <p className="text-xs text-foreground/30 mt-1">{formatFecha(r.fecha_resena)}</p>
                      </div>
                      {/* Acciones */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          onClick={() => setEditandoResena(r)}
                          className="text-xs text-foreground/40 hover:text-foreground transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-foreground/10"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarResena(r.id_resena)}
                          className="text-xs text-foreground/40 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Paginación reseñas */}
                  {resenasTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => cargarResenas(resenasPage - 1)}
                        disabled={resenasPage === 1}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ← Anterior
                      </button>
                      <span className="text-xs text-foreground/40">
                        {resenasPage} / {resenasTotalPages}
                      </span>
                      <button
                        onClick={() => cargarResenas(resenasPage + 1)}
                        disabled={resenasPage === resenasTotalPages}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* ── DIARIO ── */}
          {activeTab === "diario" && (
            <div className="space-y-4">
              {loadingSesiones ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
                ))
              ) : sesionesEnriquecidas.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-8">Aún no has registrado ninguna sesión.</p>
              ) : (
                <>
                  {sesionesEnriquecidas.map((s) => (
                    <div key={s.id_sesion} className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:border-foreground/20 transition-all">
                      <Link href={`/juego/${s.rawg_game_id}`} className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10 hover:brightness-75 transition-all">
                        {s.cover && <Image src={s.cover} alt={s.title} fill sizes="48px" className="object-cover" />}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link href={`/juego/${s.rawg_game_id}`} className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors truncate block">
                          {s.title}
                        </Link>
                        <p className="text-xs text-foreground/50 mt-0.5">
                          ⏱ {formatTiempo(s.duracion_minutos)} · {formatFecha(s.fecha_sesion)}
                        </p>
                        {s.comentario && (
                          <p className="text-xs text-foreground/40 mt-0.5 italic truncate">&quot;{s.comentario}&quot;</p>
                        )}
                      </div>
                      <button
                        onClick={() => eliminarSesion(s.id_sesion)}
                        className="text-xs text-foreground/40 hover:text-red-400 transition-colors cursor-pointer px-2 py-1 rounded-lg hover:bg-red-500/10 shrink-0"
                      >
                        🗑️
                      </button>
                    </div>
                  ))}

                  {/* Paginación sesiones */}
                  {sesionesTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4">
                      <button
                        onClick={() => cargarSesiones(sesionesPage - 1)}
                        disabled={sesionesPage === 1}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ← Anterior
                      </button>
                      <span className="text-xs text-foreground/40">
                        {sesionesPage} / {sesionesTotalPages}
                      </span>
                      <button
                        onClick={() => cargarSesiones(sesionesPage + 1)}
                        disabled={sesionesPage === sesionesTotalPages}
                        className="px-4 py-2 rounded-lg text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </section>

      </main>

      {/* ── MODAL EDITAR RESEÑA ── */}
      {editandoResena && (
        <ModalEditarResena
          resena={editandoResena}
          onClose={() => setEditandoResena(null)}
          onSaved={() => cargarResenas(resenasPage)}
        />
      )}

      {confirmacion && (
        <ModalConfirmar
          mensaje={confirmacion.mensaje}
          onConfirmar={confirmacion.onConfirmar}
          onCancelar={() => setConfirmacion(null)}
        />
      )}

    </div>
  );
}