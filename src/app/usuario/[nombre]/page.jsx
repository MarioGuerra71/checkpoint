"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric"
  });
}

function Minerales({ puntuacion }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={`text-sm ${i < puntuacion ? "opacity-100" : "opacity-20"}`}>💎</span>
      ))}
    </div>
  );
}

export default function UsuarioPublicoPage({ params }) {
  const { nombre } = use(params);

  const [perfil, setPerfil]           = useState(null);
  const [seguimiento, setSeguimiento] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [loadingBtn, setLoadingBtn]   = useState(false);
  const [autenticado, setAutenticado] = useState(false);
  const [esPropioPerfil, setEsPropioPerfil] = useState(false);
  const [resenasEnriquecidas, setResenasEnriquecidas] = useState([]);

  // Comprobar sesión
  useEffect(() => {
    fetch("/api/usuario")
      .then(r => r.json())
      .then(data => {
        if (data.usuario) {
          setAutenticado(true);
          if (data.usuario.nombre === nombre) setEsPropioPerfil(true);
        }
      })
      .catch(() => {});
  }, [nombre]);

  // Cargar perfil público
  useEffect(() => {
    if (!nombre) return;
    let cancelled = false;

    async function cargar() {
      setLoading(true);
      try {
        const res  = await fetch(`/api/usuario/publico?nombre=${encodeURIComponent(nombre)}`);
        const data = await res.json();
        if (cancelled) return;

        if (!res.ok) {
          setPerfil(null);
        } else {
          setPerfil(data);

          // Enriquecer reseñas con RAWG
          const enriched = await Promise.all(
            (data.resenas || []).map(async (r) => {
              try {
                const gr   = await fetch(`/api/rawg?id=${r.rawg_game_id}`);
                const game = await gr.json();
                return { ...r, title: game.title, cover: game.cover };
              } catch {
                return { ...r, title: `Juego #${r.rawg_game_id}`, cover: null };
              }
            })
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
    return () => { cancelled = true; };
  }, [nombre]);

  // Cargar info de seguimiento
  useEffect(() => {
    if (!perfil?.usuario?.id) return;

    fetch(`/api/seguimiento?usuarioId=${perfil.usuario.id}`)
      .then(r => r.json())
      .then(data => setSeguimiento(data))
      .catch(console.error);
  }, [perfil]);

  const toggleSeguir = async () => {
    if (!autenticado || !perfil || loadingBtn) return;
    setLoadingBtn(true);
    try {
      if (seguimiento?.yoLeSigo) {
        await fetch(`/api/seguimiento?usuarioId=${perfil.usuario.id}`, { method: "DELETE" });
        setSeguimiento(prev => ({
          ...prev,
          yoLeSigo:   false,
          seguidores: prev.seguidores.filter(s => s.nombre_usuario !== nombre),
        }));
      } else {
        await fetch("/api/seguimiento", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id_seguido: perfil.usuario.id }),
        });
        setSeguimiento(prev => ({ ...prev, yoLeSigo: true }));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingBtn(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <span className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
    </div>
  );

  if (!perfil) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-foreground/50">
      <p className="text-5xl">👤</p>
      <p>Usuario no encontrado</p>
      <Link href="/buscar" className="text-sm text-foreground/60 hover:text-foreground transition-colors">← Volver al buscador</Link>
    </div>
  );

  const { usuario, stats } = perfil;

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href={autenticado ? "/homeRegistrado" : "/home"} className="flex items-center gap-3">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={32} height={32} style={{ width: "32px", height: "auto" }} />
          <span className="text-lg font-black tracking-widest text-foreground hidden sm:block">CHECKPOINT</span>
        </Link>
        <Link href={autenticado ? "/homeRegistrado" : "/home"} className="text-sm text-foreground/50 hover:text-foreground transition-colors">
          ← Volver
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12 space-y-10">

        {/* ── CABECERA ── */}
        <section className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">

          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-foreground/10 border-4 border-foreground/20 flex items-center justify-center text-4xl font-black text-foreground uppercase shrink-0">
            {usuario.nombre?.[0] || "U"}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h1 className="text-3xl font-black text-foreground">{usuario.nombre}</h1>
            <p className="text-xs text-foreground/30 mt-1">
              Miembro desde {formatFecha(usuario.fechaRegistro)}
            </p>

            {/* Stats */}
            <div className="flex gap-6 mt-4 justify-center sm:justify-start">
              {[
                { num: `${stats.horasJugadas}h`, label: "Jugadas" },
                { num: stats.totalResenas,        label: "Reseñas" },
                { num: seguimiento?.seguidores?.length || 0, label: "Seguidores" },
                { num: seguimiento?.seguidos?.length || 0,   label: "Siguiendo" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-xl font-black text-foreground">{num}</p>
                  <p className="text-[10px] text-foreground/40 uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Botón seguir */}
          {autenticado && !esPropioPerfil && (
            <button
              onClick={toggleSeguir}
              disabled={loadingBtn}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer shrink-0 border ${
                seguimiento?.yoLeSigo
                  ? "bg-foreground/10 border-foreground/20 text-foreground/70 hover:bg-red-500/10 hover:border-red-400/30 hover:text-red-400"
                  : "bg-foreground border-foreground text-background hover:brightness-90"
              } disabled:opacity-60`}
            >
              {loadingBtn ? "..." : seguimiento?.yoLeSigo ? "✓ Siguiendo" : "+ Seguir"}
            </button>
          )}

          {esPropioPerfil && (
            <Link
              href="/perfil"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-foreground/10 border border-foreground/20 text-foreground/70 hover:bg-foreground/20 transition-all shrink-0"
            >
              Editar perfil
            </Link>
          )}
        </section>

        {/* ── RESEÑAS RECIENTES ── */}
        {resenasEnriquecidas.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-xl font-black text-foreground tracking-widest uppercase">Reseñas recientes</h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            </div>
            <div className="flex flex-col gap-3">
              {resenasEnriquecidas.map((r, i) => (
                <Link
                  key={i}
                  href={`/juego/${r.rawg_game_id}`}
                  className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all"
                >
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                    {r.cover && <Image src={r.cover} alt={r.title} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{r.title}</p>
                    <Minerales puntuacion={r.puntuacion} />
                    {r.comentario && (
                      <p className="text-xs text-foreground/50 mt-0.5 italic truncate">&quot;{r.comentario}&quot;</p>
                    )}
                  </div>
                  <p className="text-xs text-foreground/30 shrink-0">
                    {new Date(r.fecha_resena).toLocaleDateString("es-ES", { day: "numeric", month: "short" })}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── SIGUIENDO / SEGUIDORES ── */}
        {seguimiento && (seguimiento.seguidos?.length > 0 || seguimiento.seguidores?.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

            {seguimiento.seguidos?.length > 0 && (
              <section>
                <h2 className="text-sm font-black text-foreground tracking-widest uppercase mb-4">
                  Siguiendo ({seguimiento.seguidos.length})
                </h2>
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
                      <span className="text-sm font-semibold text-foreground">{u.nombre_usuario}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {seguimiento.seguidores?.length > 0 && (
              <section>
                <h2 className="text-sm font-black text-foreground tracking-widest uppercase mb-4">
                  Seguidores ({seguimiento.seguidores.length})
                </h2>
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
                      <span className="text-sm font-semibold text-foreground">{u.nombre_usuario}</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

      </main>
    </div>
  );
}