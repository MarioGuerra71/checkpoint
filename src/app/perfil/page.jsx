"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useUsuario } from "@/lib/useUsuario";
import AvatarUsuario from "@/components/AvatarUsuario";
import { notify } from "@/lib/notify";
import NavbarApp from "@/components/NavbarApp";
import TextExpandible from "@/components/TextExpandible";

// ============= HELPERS =============

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTiempo(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function Minerales({
  puntuacion,
  onSelect,
  interactive = false,
  size = "text-lg",
}) {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { usuario } = useUsuario();
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/home";
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Dentro de ModalEditarResena
  const handleGuardar = async () => {
    if (!puntuacion) {
      setError("Selecciona una puntuación");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resenas", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena: resena.id_resena,
          puntuacion,
          comentario: comentario.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      notify.success(
        "Reseña actualizada",
        "Los cambios se guardaron correctamente.",
      );
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
      notify.error("Error", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-foreground">Editar reseña</h3>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground cursor-pointer text-xl"
          >
            ✕
          </button>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
            Puntuación
          </p>
          <Minerales
            puntuacion={puntuacion}
            onSelect={setPuntuacion}
            interactive
            size="text-2xl"
          />
          {puntuacion > 0 && (
            <p className="text-xs text-foreground/40 mt-1">
              {
                ["", "Muy malo", "Malo", "Regular", "Bueno", "Obra maestra"][
                  puntuacion
                ]
              }
            </p>
          )}
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
            Comentario
          </p>
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
// ============= PÁGINA PRINCIPAL =============

export default function PerfilPage() {
  const {
    usuario,
    stats,
    masJugados,
    tema,
    cambiarTema,
    loading: loadingUser,
  } = useUsuario();

  const [activeTab, setActiveTab] = useState("resenas");

  // ── Reseñas paginadas ──────────────────────────────────────
  const [resenas, setResenas] = useState([]);
  const [resenasPage, setResenasPage] = useState(1);
  const [resenasTotalPages, setResenasTotalPages] = useState(1);
  const [loadingResenas, setLoadingResenas] = useState(false);
  const [resenasEnriquecidas, setResenasEnriquecidas] = useState([]);
  const [editandoResena, setEditandoResena] = useState(null);

  // ── Sesiones paginadas ─────────────────────────────────────
  const [sesiones, setSesiones] = useState([]);
  const [sesionesPage, setSesionesPage] = useState(1);
  const [sesionesTotalPages, setSesionesTotalPages] = useState(1);
  const [loadingSesiones, setLoadingSesiones] = useState(false);
  const [sesionesEnriquecidas, setSesionesEnriquecidas] = useState([]);

  const [confirmacion, setConfirmacion] = useState(null);

  // Búsqueda reseñas
  const [busquedaResena, setBusquedaResena] = useState("");
  const [buscandoResena, setBuscandoResena] = useState(false);

  // Filtro diario
  const [mesFiltro, setMesFiltro] = useState("");
  const [mesesDisponibles, setMesesDisponibles] = useState([]);

  // Añade estado en PerfilPage
  const [perfilData, setPerfilData] = useState(null);

  useEffect(() => {
    fetch("/api/perfil")
      .then((r) => r.json())
      .then((data) => setPerfilData(data))
      .catch(console.error);
  }, []);

  // ── Cargar reseñas ─────────────────────────────────────────
  const cargarResenas = useCallback(async (page = 1, gameIds = null) => {
    setLoadingResenas(true);
    try {
      let url = `/api/usuario/resenas?page=${page}`;
      if (gameIds?.length > 0) url += `&gameIds=${gameIds.join(",")}`;

      const res = await fetch(url);
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
  const cargarSesiones = useCallback(async (page = 1, mes = "") => {
    setLoadingSesiones(true);
    try {
      let url = `/api/sesiones?page=${page}`;
      if (mes) url += `&mes=${mes}`;

      const res = await fetch(url);
      const data = await res.json();
      setSesiones(data.sesiones || []);
      setSesionesTotalPages(data.totalPages || 1);
      setSesionesPage(page);
      if (data.mesesDisponibles) setMesesDisponibles(data.mesesDisponibles);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingSesiones(false);
    }
  }, []);

  useEffect(() => {
    cargarResenas(1);
  }, [cargarResenas]);

  useEffect(() => {
    cargarSesiones(1);
  }, [cargarSesiones]);

  useEffect(() => {
    if (!busquedaResena.trim()) {
      cargarResenas(1, null);
      return;
    }
    const timer = setTimeout(async () => {
      setBuscandoResena(true);
      try {
        const res = await fetch(
          `/api/buscar?q=${encodeURIComponent(busquedaResena.trim())}`,
        );
        const data = await res.json();
        const ids = (data.juegos || []).map((g) => g.id);
        cargarResenas(1, ids.length > 0 ? ids : [-1]);
      } catch (e) {
        console.error(e);
      } finally {
        setBuscandoResena(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busquedaResena, cargarResenas]);

  useEffect(() => {
    cargarSesiones(1, mesFiltro);
  }, [mesFiltro, cargarSesiones]);

  // ── Enriquecer reseñas con RAWG ────────────────────────────
  useEffect(() => {
    if (!resenas.length) return;
    let cancelled = false;
    async function enrich() {
      const enriched = await Promise.all(
        resenas.map(async (r) => {
          try {
            const res = await fetch(`/api/rawg?id=${r.rawg_game_id}`);
            const game = await res.json();
            return { ...r, title: game.title, cover: game.cover };
          } catch {
            return { ...r, title: `Juego #${r.rawg_game_id}`, cover: null };
          }
        }),
      );
      if (!cancelled) setResenasEnriquecidas(enriched);
    }
    enrich();
    return () => {
      cancelled = true;
    };
  }, [resenas]);

  // ── Enriquecer sesiones con RAWG ───────────────────────────
  useEffect(() => {
    if (!sesiones.length) return;
    let cancelled = false;
    async function enrich() {
      const enriched = await Promise.all(
        sesiones.map(async (s) => {
          try {
            const res = await fetch(`/api/rawg?id=${s.rawg_game_id}`);
            const game = await res.json();
            return { ...s, title: game.title, cover: game.cover };
          } catch {
            return { ...s, title: `Juego #${s.rawg_game_id}`, cover: null };
          }
        }),
      );
      if (!cancelled) setSesionesEnriquecidas(enriched);
    }
    enrich();
    return () => {
      cancelled = true;
    };
  }, [sesiones]);

  // ── Eliminar reseña ────────────────────────────────────────
  const eliminarResena = (id_resena) => {
    setConfirmacion({
      mensaje: "¿Eliminar esta reseña? Esta acción no se puede deshacer.",
      onConfirmar: async () => {
        setConfirmacion(null);
        try {
          const res = await fetch(`/api/resenas?id=${id_resena}`, {
            method: "DELETE",
          });
          if (res.ok) {
            cargarResenas(resenasPage);
            notify.success(
              "Reseña eliminada",
              "La reseña se ha borrado correctamente.",
            );
          } else {
            notify.error("Error", "No se pudo eliminar la reseña.");
          }
        } catch (e) {
          notify.error("Error de conexión", "Intenta de nuevo.");
        }
      },
    });
  };

  // ── Eliminar sesión ────────────────────────────────────────
  const eliminarSesion = (id_sesion) => {
    setConfirmacion({
      mensaje:
        "¿Eliminar esta sesión del diario? Esta acción no se puede deshacer.",
      onConfirmar: async () => {
        setConfirmacion(null);
        try {
          const res = await fetch(`/api/sesiones?id=${id_sesion}`, {
            method: "DELETE",
          });
          if (res.ok) {
            cargarSesiones(sesionesPage);
            notify.success(
              "Sesión eliminada",
              "La sesión se ha borrado del diario.",
            );
          } else {
            notify.error("Error", "No se pudo eliminar la sesión.");
          }
        } catch (e) {
          notify.error("Error de conexión", "Intenta de nuevo.");
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
    <div className="min-h-screen text-foreground">
      {/* ── NAVBAR ── */}
      <NavbarApp usuario={usuario} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-6 py-12 pt-24 space-y-12">
        {/* ── CABECERA ── */}
        <section className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">
          {/* Avatar */}
          <AvatarUsuario
            usuario={usuario}
            size={112}
            className="border-4 border-foreground/10"
          />

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {loadingUser ? (
              <div className="space-y-2">
                <div className="h-8 w-48 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-64 bg-foreground/10 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-foreground">
                  {usuario?.nombre}
                </h1>
                <p className="text-sm text-foreground/50 mt-1">
                  {usuario?.email}
                </p>
                <p className="text-xs text-foreground/30 mt-1">
                  Miembro desde {formatFecha(usuario?.fechaRegistro)}
                </p>
              </>
            )}

            <div className="flex gap-6 mt-4 justify-center sm:justify-start flex-wrap">
              {[
                { num: `${stats?.horasJugadas || 0}h`, label: "Jugadas" },
                { num: stats?.totalResenas || 0, label: "Reseñas" },
                { num: stats?.totalFavoritos || 0, label: "Favoritos" },
                { num: stats?.totalListas || 0, label: "Listas" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-foreground">{num}</p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Toggle tema */}
          <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 flex flex-col items-center gap-3 w-44 shrink-0">
            <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
              Tema
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => cambiarTema("oscuro")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tema === "oscuro"
                    ? "bg-foreground text-background"
                    : "bg-foreground/10 text-foreground/50 hover:text-foreground"
                }`}
              >
                🌙 Oscuro
              </button>
              <button
                onClick={() => cambiarTema("claro")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  tema === "claro"
                    ? "bg-foreground text-background"
                    : "bg-foreground/10 text-foreground/50 hover:text-foreground"
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
              <h2 className="text-xl font-black text-foreground tracking-widest uppercase">
                Más jugados
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {masJugados.map((game) => (
                <Link
                  key={game.id}
                  href={`/juego/${game.id}`}
                  className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-1 transition-all duration-200"
                >
                  {game.cover ? (
                    <Image
                      src={game.cover}
                      alt={game.title}
                      fill
                      sizes="16vw"
                      className="object-cover group-hover:brightness-50 transition-all"
                    />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-[10px] text-center px-1">
                        {game.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 to-transparent p-2">
                    <p className="text-[10px] font-bold text-foreground line-clamp-1">
                      {game.title}
                    </p>
                    <p className="text-[9px] text-foreground/60 mt-0.5">
                      ⏱ {formatTiempo(game.totalMinutos)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── TABS ── */}
        <section>
          <div className="flex gap-1 mb-8 border-b border-foreground/10">
            {["resenas", "diario", "logros"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-bold capitalize transition-all border-b-2 -mb-px cursor-pointer ${
                  activeTab === tab
                    ? "text-foreground border-foreground"
                    : "text-foreground/40 border-transparent hover:text-foreground/70"
                }`}
              >
                {tab === "resenas"
                  ? `💎 Reseñas`
                  : tab === "diario"
                    ? `⏱ Diario`
                    : `🏆 Logros`}
              </button>
            ))}
          </div>
          {/* ── RESEÑAS ── */}
          {activeTab === "resenas" && (
            <div className="space-y-4">
              {/* Buscador */}
              <div className="relative">
                <div
                  className={`flex items-center gap-2 bg-foreground/5 border rounded-xl px-4 py-2.5 transition-all ${busquedaResena ? "border-foreground/30" : "border-foreground/15"}`}
                >
                  <span className="text-foreground/30 text-sm">🔍</span>
                  <input
                    type="text"
                    value={busquedaResena}
                    onChange={(e) => setBusquedaResena(e.target.value)}
                    placeholder="Buscar por nombre de juego..."
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
                  />
                  {buscandoResena && (
                    <span className="w-3 h-3 border border-foreground/30 border-t-foreground rounded-full animate-spin shrink-0" />
                  )}
                  {busquedaResena && !buscandoResena && (
                    <button
                      onClick={() => setBusquedaResena("")}
                      className="text-foreground/30 hover:text-foreground transition-colors cursor-pointer text-sm"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {busquedaResena &&
                  !loadingResenas &&
                  resenasEnriquecidas.length === 0 &&
                  !buscandoResena && (
                    <p className="text-xs text-foreground/40 mt-2 px-1">
                      No encontramos reseñas para &quot;{busquedaResena}&quot;
                    </p>
                  )}
              </div>

              {loadingResenas ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-32 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse"
                  />
                ))
              ) : resenasEnriquecidas.length === 0 ? (
                <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-2xl">
                  <p className="text-4xl mb-3">💎</p>
                  <p className="text-sm text-foreground/40">
                    Aún no has escrito ninguna reseña.
                  </p>
                  <Link
                    href="/homeRegistrado"
                    className="mt-4 inline-block text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Explorar juegos →
                  </Link>
                </div>
              ) : (
                <>
                  {resenasEnriquecidas.map((r) => (
                    <div
                      key={r.id_resena}
                      className="group relative bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden hover:border-foreground/20 transition-all duration-200"
                    >
                      {r.cover && (
                        <div className="absolute inset-0 opacity-[0.06]">
                          <Image
                            src={r.cover}
                            alt=""
                            fill
                            sizes="100%"
                            className="object-cover blur-sm"
                          />
                        </div>
                      )}

                      <div className="relative flex items-start gap-5 p-5">
                        <Link
                          href={`/juego/${r.rawg_game_id}`}
                          className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-foreground/10 hover:scale-105 transition-transform duration-200 shadow-lg"
                        >
                          {r.cover && (
                            <Image
                              src={r.cover}
                              alt={r.title}
                              fill
                              sizes="64px"
                              className="object-cover"
                            />
                          )}
                        </Link>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <Link
                                href={`/juego/${r.rawg_game_id}`}
                                className="text-base font-black text-foreground hover:text-foreground/70 transition-colors"
                              >
                                {r.title || `Juego #${r.rawg_game_id}`}
                              </Link>
                              <div className="flex items-center gap-3 mt-1.5">
                                <div className="flex gap-0.5">
                                  {Array.from({ length: 5 }, (_, i) => (
                                    <span
                                      key={i}
                                      className={`text-base ${i < r.puntuacion ? "opacity-100" : "opacity-15"}`}
                                    >
                                      💎
                                    </span>
                                  ))}
                                </div>
                                {r.companero_nombre && (
                                  <p className="text-[10px] text-foreground/50 mt-1">
                                    👥 Jugado con{" "}
                                    <Link
                                      href={`/usuario/${r.companero_nombre}`}
                                      className="font-bold hover:text-foreground transition-colors"
                                    >
                                      {r.companero_nombre}
                                    </Link>
                                  </p>
                                )}
                                <span className="text-xs text-foreground/30">
                                  ·
                                </span>
                                <span className="text-xs text-foreground/40">
                                  {[
                                    "",
                                    "Muy malo",
                                    "Malo",
                                    "Regular",
                                    "Bueno",
                                    "Obra maestra",
                                  ][r.puntuacion] || ""}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 mt-0.5">
                              {r.plataforma && (
                                <span className="text-[10px] font-bold bg-foreground/10 border border-foreground/15 px-2 py-0.5 rounded-full text-foreground/60">
                                  {r.plataforma}
                                </span>
                              )}
                              <span className="text-xs text-foreground/30">
                                {formatFecha(r.fecha_resena)}
                              </span>
                            </div>
                          </div>

                          {r.comentario && (
                            <div className="mt-3 pl-3 border-l-2 border-foreground/15">
                              <p className="text-sm text-foreground/65 leading-relaxed italic line-clamp-3">
                                &quot;{r.comentario}&quot;
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative flex gap-2 px-5 pb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                          onClick={() => setEditandoResena(r)}
                          className="text-xs font-bold text-foreground/60 bg-foreground/5 border border-foreground/15 px-3 py-1.5 rounded-lg hover:bg-foreground/10 hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => eliminarResena(r.id_resena)}
                          className="text-xs font-bold text-red-400/70 bg-red-500/5 border border-red-500/15 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/30 transition-all cursor-pointer"
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}

                  {resenasTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <button
                        onClick={() => cargarResenas(resenasPage - 1)}
                        disabled={resenasPage === 1}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ← Anterior
                      </button>
                      <span className="text-xs text-foreground/40">
                        {resenasPage} / {resenasTotalPages}
                      </span>
                      <button
                        onClick={() => cargarResenas(resenasPage + 1)}
                        disabled={resenasPage === resenasTotalPages}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
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
            <div className="space-y-3">
              {/* Filtro por mes */}
              {mesesDisponibles.length > 0 && (
                <div className="flex items-center gap-2 mb-5 flex-wrap">
                  <span className="text-xs font-bold text-foreground/40 uppercase tracking-widest shrink-0">
                    Filtrar:
                  </span>
                  <button
                    onClick={() => setMesFiltro("")}
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                      mesFiltro === ""
                        ? "bg-foreground text-background border-foreground"
                        : "bg-foreground/5 border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    Todo
                  </button>
                  {mesesDisponibles.map((m) => (
                    <button
                      key={m.mes}
                      onClick={() => setMesFiltro(m.mes)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer capitalize ${
                        mesFiltro === m.mes
                          ? "bg-foreground text-background border-foreground"
                          : "bg-foreground/5 border-foreground/15 text-foreground/60 hover:border-foreground/30 hover:text-foreground"
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
              {loadingSesiones ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse"
                  />
                ))
              ) : sesionesEnriquecidas.length === 0 ? (
                <div className="text-center py-16 bg-foreground/5 border border-foreground/10 rounded-2xl">
                  <p className="text-4xl mb-3">⏱</p>
                  <p className="text-sm text-foreground/40">
                    Aún no has registrado ninguna sesión.
                  </p>
                  <Link
                    href="/homeRegistrado"
                    className="mt-4 inline-block text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Explorar juegos →
                  </Link>
                </div>
              ) : (
                <>
                  {/* Agrupar por fecha */}
                  {(() => {
                    const grupos = {};
                    sesionesEnriquecidas.forEach((s) => {
                      const fecha = new Date(s.fecha_sesion).toLocaleDateString(
                        "es-ES",
                        { weekday: "long", day: "numeric", month: "long" },
                      );
                      if (!grupos[fecha]) grupos[fecha] = [];
                      grupos[fecha].push(s);
                    });
                    return Object.entries(grupos).map(([fecha, sesiones]) => (
                      <div key={fecha}>
                        <p className="text-xs font-bold uppercase tracking-widest text-foreground/30 mb-2 ml-1">
                          {fecha}
                        </p>
                        <div className="space-y-2">
                          {sesiones.map((s) => (
                            <div
                              key={s.id_sesion}
                              className="group relative flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3.5 hover:border-foreground/20 transition-all duration-200 overflow-hidden"
                            >
                              {/* Barra lateral de color */}
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground/30 rounded-l-2xl" />

                              <Link
                                href={`/juego/${s.rawg_game_id}`}
                                className="relative w-11 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10 hover:scale-105 transition-transform ml-2"
                              >
                                {s.cover && (
                                  <Image
                                    src={s.cover}
                                    alt={s.title}
                                    fill
                                    sizes="44px"
                                    className="object-cover"
                                  />
                                )}
                              </Link>

                              <div className="flex-1 min-w-0">
                                <Link
                                  href={`/juego/${s.rawg_game_id}`}
                                  className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors truncate block"
                                >
                                  {s.title || `Juego #${s.rawg_game_id}`}
                                </Link>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-xs font-semibold text-foreground/60">
                                    ⏱ {formatTiempo(s.duracion_minutos)}
                                  </span>
                                  {s.modo === "cooperativo" &&
                                    s.companero_nombre && (
                                      <p className="text-[10px] text-foreground/50 mt-0.5">
                                        👥 Con{" "}
                                        <Link
                                          href={`/usuario/${s.companero_nombre}`}
                                          className="font-bold hover:text-foreground transition-colors"
                                        >
                                          {s.companero_nombre}
                                        </Link>
                                      </p>
                                    )}
                                  {s.plataforma && (
                                    <span className="text-[10px] font-bold bg-foreground/10 border border-foreground/15 px-2 py-0.5 rounded-full text-foreground/60">
                                      {s.plataforma}
                                    </span>
                                  )}
                                  {s.comentario && (
                                    <>
                                      <span className="text-foreground/20 text-xs">
                                        ·
                                      </span>
                                      <TextExpandible
                                        texto={s.comentario}
                                        maxLength={60}
                                        className="text-xs text-foreground/40 italic"
                                      />
                                    </>
                                  )}
                                </div>
                              </div>

                              <button
                                onClick={() => eliminarSesion(s.id_sesion)}
                                className="text-xs font-bold text-red-400/60 bg-red-500/5 border border-red-500/10 px-3 py-1.5 rounded-lg hover:bg-red-500/10 hover:text-red-400 hover:border-red-400/25 transition-all cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                              >
                                Eliminar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ));
                  })()}

                  {/* Paginación sesiones */}
                  {sesionesTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-4">
                      <button
                        onClick={() => cargarSesiones(sesionesPage - 1)}
                        disabled={sesionesPage === 1}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        ← Anterior
                      </button>
                      <span className="text-xs text-foreground/40">
                        {sesionesPage} / {sesionesTotalPages}
                      </span>
                      <button
                        onClick={() => cargarSesiones(sesionesPage + 1)}
                        disabled={sesionesPage === sesionesTotalPages}
                        className="px-4 py-2 rounded-xl text-sm font-semibold bg-foreground/5 border border-foreground/10 text-foreground/50 hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                      >
                        Siguiente →
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
          {/*Tab logros*/}
          {activeTab === "logros" && (
            <div className="flex flex-col gap-3">
              {!perfilData
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl bg-foreground/5 animate-pulse"
                    />
                  ))
                : (perfilData.logros || []).map((logro) => (
                    <div
                      key={logro.id_logro}
                      className={`flex items-center gap-4 rounded-2xl px-5 py-3 border ${
                        logro.obtenido
                          ? "bg-foreground/5 border-foreground/15"
                          : "border-foreground/8 opacity-50"
                      }`}
                    >
                      <span
                        className={`text-xl ${!logro.obtenido && "grayscale"}`}
                      >
                        {logro.icono}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground">
                          {logro.nombre}
                        </p>
                        <p className="text-xs text-foreground/40">
                          {logro.descripcion}
                        </p>
                        {!logro.obtenido && (
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 bg-foreground/10 rounded-full h-1 overflow-hidden">
                              <div
                                className="h-full bg-foreground/40 rounded-full"
                                style={{ width: `${logro.progreso}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-foreground/30">
                              {logro.actual}/{logro.objetivo}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-yellow-400 shrink-0">
                        +{logro.recompensa_monedas} 🪙
                      </span>
                    </div>
                  ))}
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
