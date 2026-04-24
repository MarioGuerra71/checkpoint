"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import AvatarUsuario from "@/components/AvatarUsuario";
import NavbarApp from "@/components/NavbarApp";
import { useUsuario } from "@/lib/useUsuario";

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
      <NavbarApp usuario={usuario} onLogout={handleLogout} />

      <main className="max-w-4xl mx-auto px-6 py-12 pt-24 space-y-10">
        {/* ── CABECERA ── */}
        <section className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {/* Avatar */}
          <AvatarUsuario usuario={usuario} size={96} className="border-4 border-foreground/10 shrink-0" />

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
          </div>
        </section>

        {/* ── TABS ── */}
        <div className="flex gap-1 border-b border-foreground/10">
          {["resenas", "comunidad"].map((tab) => (
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
                      <div className="w-8 h-8 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-black text-foreground uppercase shrink-0">
                        {u.nombre_usuario?.[0]}
                      </div>
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
                      <div className="w-8 h-8 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-black text-foreground uppercase shrink-0">
                        {u.nombre_usuario?.[0]}
                      </div>
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
      </main>
    </div>
  );
}
