"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import AvatarUsuario from "@/components/AvatarUsuario";
import NavbarApp from "@/components/NavbarApp";
import { useUsuario } from "@/lib/useUsuario";
import AvatarSimple from "@/components/AvatarSimple";

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatFechaCorta(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

function Minerales({ puntuacion }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`text-sm ${i < puntuacion ? "opacity-100" : "opacity-20"}`}
        >
          💎
        </span>
      ))}
    </div>
  );
}

export default function UsuarioPublicoPage({ params }) {
  const { nombre } = use(params);

  const [perfil, setPerfil] = useState(null);
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [esPropioPerfil, setEsPropioPerfil] = useState(false);
  const [resenasEnriquecidas, setResenasEnriquecidas] = useState([]);

  const [activeTab, setActiveTab] = useState("resenas");

  const [sesionesEnriquecidas, setSesionesEnriquecidas] = useState([]);
  const [favoritosJuegos, setFavoritosJuegos] = useState([]);
  const [loadingExtra, setLoadingExtra] = useState(false);

  const [usuarioLogueado, setUsuarioLogueado] = useState(null);
  useEffect(() => {
    fetch("/api/usuario")
      .then((r) => r.json())
      .then((data) => {
        if (data.usuario) {
          setAutenticado(true);
          setUsuarioLogueado(data.usuario);
          if (data.usuario.nombre === nombre) setEsPropioPerfil(true);
        }
      })
      .catch(() => {});
  }, [nombre]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/home";
  };

  useEffect(() => {
    fetch("/api/usuario")
      .then((r) => r.json())
      .then((data) => {
        if (data.usuario) {
          setAutenticado(true);
          if (data.usuario.nombre === nombre) setEsPropioPerfil(true);
        }
      })
      .catch(() => {});
  }, [nombre]);

  useEffect(() => {
    if (!nombre) return;
    let cancelled = false;

    async function cargar() {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/usuario/publico?nombre=${encodeURIComponent(nombre)}`,
        );
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setPerfil(null);
        } else {
          setPerfil(data);

          const enriched = await Promise.all(
            (data.resenas || []).map(async (r) => {
              try {
                const gr = await fetch(`/api/rawg?id=${r.rawg_game_id}`);
                const game = await gr.json();
                return {
                  ...r,
                  title: game.title,
                  cover: game.cover,
                  genre: game.genre,
                };
              } catch {
                return { ...r, title: `Juego #${r.rawg_game_id}`, cover: null };
              }
            }),
          );
          if (!cancelled) setResenasEnriquecidas(enriched);
          if (data.sesiones?.length > 0) {
            const enrichedSesiones = await Promise.all(
              data.sesiones.map(async (s) => {
                try {
                  const gr = await fetch(`/api/rawg?id=${s.rawg_game_id}`);
                  const game = await gr.json();
                  return { ...s, title: game.title, cover: game.cover };
                } catch {
                  return {
                    ...s,
                    title: `Juego #${s.rawg_game_id}`,
                    cover: null,
                  };
                }
              }),
            );
            if (!cancelled) setSesionesEnriquecidas(enrichedSesiones);
          }

          if (data.favoritosIds?.length > 0) {
            const enrichedFavs = await Promise.all(
              data.favoritosIds.slice(0, 12).map(async (id) => {
                try {
                  const gr = await fetch(`/api/rawg?id=${id}`);
                  const game = await gr.json();
                  return game;
                } catch {
                  return { id, title: `Juego #${id}`, cover: null };
                }
              }),
            );
            if (!cancelled) setFavoritosJuegos(enrichedFavs);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    cargar();
    return () => {
      cancelled = true;
    };
  }, [nombre]);

  useEffect(() => {
    if (!perfil?.usuario?.id) return;
    fetch(`/api/seguimiento?usuarioId=${perfil.usuario.id}`)
      .then((r) => r.json())
      .then((data) => setSeguimiento(data))
      .catch(console.error);
  }, [perfil]);

  const toggleSeguir = async () => {
    if (!autenticado || !perfil || loadingBtn) return;
    setLoadingBtn(true);
    try {
      if (seguimiento?.yoLeSigo) {
        await fetch(`/api/seguimiento?usuarioId=${perfil.usuario.id}`, {
          method: "DELETE",
        });
        setSeguimiento((prev) => ({ ...prev, yoLeSigo: false }));
      } else {
        await fetch("/api/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_seguido: perfil.usuario.id }),
        });
        setSeguimiento((prev) => ({ ...prev, yoLeSigo: true }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBtn(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );

  if (!perfil)
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground/50">
        <p className="text-5xl">👤</p>
        <p className="text-sm">Usuario no encontrado</p>
        <Link
          href="/buscar"
          className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors bg-foreground/5 border border-foreground/15 px-4 py-2 rounded-xl"
        >
          ← Volver al buscador
        </Link>
      </div>
    );

  const { usuario, stats } = perfil;

  return (
    <div className="min-h-screen text-foreground">
      {/* ── NAVBAR ── */}
      <NavbarApp usuario={usuarioLogueado} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-6 py-12 pt-24 space-y-10">
        {/* ── CABECERA ── */}
        <section className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Avatar */}
          <AvatarUsuario
            usuario={usuario}
            size={96}
            className="border-4 border-foreground/10 shrink-0"
          />

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
              <h1 className="text-3xl font-black text-foreground">
                {usuario.nombre}
              </h1>
              {autenticado && !esPropioPerfil && (
                <button
                  onClick={toggleSeguir}
                  disabled={loadingBtn}
                  className={`px-5 py-2 rounded-xl font-bold text-sm transition-all cursor-pointer border ${
                    seguimiento?.yoLeSigo
                      ? "bg-foreground/10 border-foreground/20 text-foreground/70 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400"
                      : "bg-foreground border-foreground text-background hover:brightness-90"
                  } disabled:opacity-60`}
                >
                  {loadingBtn
                    ? "..."
                    : seguimiento?.yoLeSigo
                      ? "✓ Siguiendo"
                      : "+ Seguir"}
                </button>
              )}
              {esPropioPerfil && (
                <Link
                  href="/perfil"
                  className="px-5 py-2 rounded-xl font-bold text-sm bg-foreground/10 border border-foreground/20 text-foreground/70 hover:bg-foreground/20 transition-all"
                >
                  Editar perfil
                </Link>
              )}
            </div>

            <p className="text-xs text-foreground/30 mb-4">
              Miembro desde {formatFecha(usuario.fechaRegistro)}
            </p>

            {/* Stats */}
            <div className="flex gap-6 justify-center sm:justify-start flex-wrap">
              {[
                { num: `${stats.horasJugadas}h`, label: "Jugadas" },
                { num: stats.totalResenas, label: "Reseñas" },
                {
                  num: seguimiento?.seguidores?.length || 0,
                  label: "Seguidores",
                },
                { num: seguimiento?.seguidos?.length || 0, label: "Siguiendo" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-foreground">{num}</p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider mt-0.5">
                    {label}
                  </p>
                </div>
              ))}
            </div>
            {perfil?.nivel && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-base">{perfil.nivel.icono}</span>
                <span className="text-sm font-bold text-foreground">
                  {perfil.nivel.nombre}
                </span>
                <div className="flex items-center gap-1.5 bg-foreground/10 border border-foreground/15 rounded-full px-3 py-0.5">
                  <div className="w-14 bg-foreground/10 rounded-full h-1 overflow-hidden">
                    <div
                      className="h-full bg-foreground rounded-full"
                      style={{ width: `${perfil.nivel.progreso}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-foreground/50">
                    {perfil.nivel.puntos} pts
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── TABS ── */}
        <div className="flex gap-1 border-b border-foreground/10">
          {["resenas", "diario", "favoritos", "comunidad"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-bold transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? "text-foreground border-foreground"
                  : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {tab === "resenas"
                ? `💎 Reseñas (${stats.totalResenas})`
                : tab === "diario"
                  ? "⏱ Diario"
                  : tab === "favoritos"
                    ? "⭐ Favoritos"
                    : "👥 Comunidad"}
            </button>
          ))}
        </div>

        {/* ── TAB RESEÑAS ── */}
        {activeTab === "resenas" && (
          <section>
            {resenasEnriquecidas.length === 0 ? (
              <div className="text-center py-12 bg-foreground/5 border border-foreground/10 rounded-2xl">
                <p className="text-3xl mb-3">💎</p>
                <p className="text-sm text-foreground/40">
                  Aún no hay reseñas.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {resenasEnriquecidas.map((r, i) => (
                  <div
                    key={i}
                    className="group relative bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden hover:border-foreground/20 transition-all duration-200"
                  >
                    {/* Banner de fondo */}
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
                        className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0 bg-foreground/10 hover:scale-105 transition-transform shadow-lg"
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
                              {r.title}
                            </Link>
                            <div className="flex items-center gap-3 mt-1.5">
                              <Minerales puntuacion={r.puntuacion} />
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
                          {r.modo === "cooperativo" && r.companero_nombre && (
                            <p className="text-[10px] text-foreground/50 mt-0.5">
                              👥 Con{" "}
                              <Link
                                href={`/usuario/${r.companero_nombre}`}
                                className="font-bold hover:text-foreground"
                              >
                                {r.companero_nombre}
                              </Link>
                            </p>
                          )}
                          <div className="flex items-center gap-2 shrink-0 mt-0.5">
                            {r.plataforma && (
                              <span className="text-[10px] font-bold bg-foreground/10 border border-foreground/15 px-2 py-0.5 rounded-full text-foreground/60">
                                {r.plataforma}
                              </span>
                            )}
                            <span className="text-xs text-foreground/30">
                              {formatFechaCorta(r.fecha_resena)}
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
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB COMUNIDAD ── */}
        {activeTab === "comunidad" && seguimiento && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Siguiendo */}
            <section>
              <h2 className="text-sm font-black text-foreground/50 tracking-widest uppercase mb-4">
                Siguiendo ({seguimiento.seguidos?.length || 0})
              </h2>
              {!seguimiento.seguidos?.length ? (
                <p className="text-xs text-foreground/30 italic">
                  No sigue a nadie todavía.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {seguimiento.seguidos.map((u) => (
                    <Link
                      key={u.id_usuario}
                      href={`/usuario/${u.nombre_usuario}`}
                      className="flex items-center gap-3 px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl hover:bg-foreground/10 hover:border-foreground/20 transition-all"
                    >
                      <AvatarSimple usuario={u} size={32} />
                      <span className="text-sm font-semibold text-foreground">
                        {u.nombre_usuario}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>

            {/* Seguidores */}
            <section>
              <h2 className="text-sm font-black text-foreground/50 tracking-widest uppercase mb-4">
                Seguidores ({seguimiento.seguidores?.length || 0})
              </h2>
              {!seguimiento.seguidores?.length ? (
                <p className="text-xs text-foreground/30 italic">
                  Aún no tiene seguidores.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {seguimiento.seguidores.map((u) => (
                    <Link
                      key={u.id_usuario}
                      href={`/usuario/${u.nombre_usuario}`}
                      className="flex items-center gap-3 px-4 py-2.5 bg-foreground/5 border border-foreground/10 rounded-xl hover:bg-foreground/10 hover:border-foreground/20 transition-all"
                    >
                      <AvatarSimple usuario={u} size={32} />
                      <span className="text-sm font-semibold text-foreground">
                        {u.nombre_usuario}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
        {/* ── TAB DIARIO ── */}
        {activeTab === "diario" && (
          <section>
            {sesionesEnriquecidas.length === 0 ? (
              <div className="text-center py-12 bg-foreground/5 border border-foreground/10 rounded-2xl">
                <p className="text-foreground/40 text-sm">
                  Aún no hay sesiones registradas.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {sesionesEnriquecidas.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:border-foreground/20 transition-all"
                  >
                    <Link
                      href={`/juego/${s.rawg_game_id}`}
                      className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10"
                    >
                      {s.cover && (
                        <Image
                          src={s.cover}
                          alt={s.title}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      )}
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/juego/${s.rawg_game_id}`}
                        className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors truncate block"
                      >
                        {s.title}
                      </Link>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-foreground/50">
                          ⏱ {Math.floor(s.duracion_minutos / 60)}h{" "}
                          {s.duracion_minutos % 60}min
                        </span>
                        {s.plataforma && (
                          <span className="text-[10px] bg-foreground/10 border border-foreground/15 px-2 py-0.5 rounded-full text-foreground/60">
                            {s.plataforma}
                          </span>
                        )}
                        {s.modo === "cooperativo" && s.companero_nombre && (
                          <span className="text-[10px] text-foreground/50">
                            👥 Con{" "}
                            <Link
                              href={`/usuario/${s.companero_nombre}`}
                              className="font-bold hover:text-foreground"
                            >
                              {s.companero_nombre}
                            </Link>
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-foreground/30 shrink-0">
                      {new Date(s.fecha_sesion).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB FAVORITOS ── */}
        {activeTab === "favoritos" && (
          <section>
            {favoritosJuegos.length === 0 ? (
              <div className="text-center py-12 bg-foreground/5 border border-foreground/10 rounded-2xl">
                <p className="text-foreground/40 text-sm">
                  Aún no tiene favoritos.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {favoritosJuegos.map((game) => (
                  <Link
                    key={game.id}
                    href={`/juego/${game.id}`}
                    className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 hover:border-foreground/25 hover:-translate-y-1 transition-all duration-200"
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
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-foreground/20 text-[10px] text-center px-1">
                          {game.title}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 to-transparent p-2">
                      <p className="text-[10px] font-bold text-foreground line-clamp-2">
                        {game.title}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
