"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useUsuario } from "@/lib/useUsuario";

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric", month: "long", year: "numeric"
  });
}

function formatTiempo(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function renderMinerales(puntuacion) {
  return Array.from({ length: 5 }, (_, i) => (
    <span key={i} className={i < puntuacion ? "opacity-100" : "opacity-20"}>💎</span>
  ));
}

export default function PerfilPage() {
  const router = useRouter();
  const { usuario, stats, masJugados, sesiones, resenas, tema, cambiarTema, loading } = useUsuario();
  const [activeTab, setActiveTab] = useState("resenas");

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
      if (res.ok) window.location.href = "/home";
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
          <Link href="/homeRegistrado" className="text-sm text-foreground/50 hover:text-foreground transition-colors">
            ← Volver
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all duration-200 cursor-pointer"
          >
            Salir
          </button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-12">

        {/* ── CABECERA DEL PERFIL ── */}
        <section className="flex flex-col sm:flex-row gap-8 items-center sm:items-start">

          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-full bg-foreground/10 border-4 border-foreground/20 flex items-center justify-center text-5xl font-black text-foreground uppercase overflow-hidden">
              {loading ? "?" : usuario?.nombre?.[0] || "U"}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            {loading ? (
              <div className="space-y-2">
                <div className="h-8 w-48 bg-foreground/10 rounded animate-pulse" />
                <div className="h-4 w-64 bg-foreground/10 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-black text-foreground tracking-wide">{usuario?.nombre}</h1>
                <p className="text-sm text-foreground/50 mt-1">{usuario?.email}</p>
                <p className="text-xs text-foreground/30 mt-1">
                  Miembro desde {formatFecha(usuario?.fechaRegistro)}
                </p>
              </>
            )}

            {/* Stats rápidos */}
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

          {/* Ajustes rápidos */}
          <div className="flex flex-col gap-3 items-center shrink-0">

            {/* Toggle tema */}
            <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 flex flex-col items-center gap-3 w-40">
              <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Tema</p>
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

          </div>
        </section>

        {/* ── MÁS JUGADOS ── */}
        {masJugados.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="text-xl font-black text-foreground tracking-widest uppercase">Más jugados</h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
              {masJugados.map((game) => (
                <div key={game.id} className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-1 transition-all duration-200">
                  {game.cover ? (
                    <Image src={game.cover} alt={game.title} fill sizes="16vw" className="object-cover group-hover:brightness-50 transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-[10px] text-center px-1">{game.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 to-transparent p-2">
                    <p className="text-[10px] font-bold text-foreground leading-tight line-clamp-1">{game.title}</p>
                    <p className="text-[9px] text-foreground/60 mt-0.5">⏱ {formatTiempo(game.totalMinutos)}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TABS: Reseñas / Diario ── */}
        <section>
          <div className="flex gap-1 mb-6 border-b border-foreground/10">
            {["resenas", "diario"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-200 border-b-2 -mb-px cursor-pointer ${
                  activeTab === tab
                    ? "text-foreground border-foreground"
                    : "text-foreground/40 border-transparent hover:text-foreground/70"
                }`}
              >
                {tab === "resenas" ? "Reseñas" : "Diario"}
              </button>
            ))}
          </div>

          {/* RESEÑAS */}
          {activeTab === "resenas" && (
            <div className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
                ))
              ) : resenas.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-8">Aún no has escrito ninguna reseña.</p>
              ) : resenas.map((r, i) => (
                <div key={i} className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 transition-all duration-200">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                    {r.cover && <Image src={r.cover} alt={r.title || ""} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{r.title || `Juego #${r.rawg_game_id}`}</p>
                    <div className="flex gap-0.5 mt-0.5 text-sm">{renderMinerales(r.puntuacion)}</div>
                    {r.comentario && (
                      <p className="text-xs text-foreground/50 mt-1 italic line-clamp-2">&quot;{r.comentario}&quot;</p>
                    )}
                  </div>
                  <p className="text-xs text-foreground/30 shrink-0">{formatFecha(r.fecha_resena)}</p>
                </div>
              ))}
            </div>
          )}

          {/* DIARIO */}
          {activeTab === "diario" && (
            <div className="flex flex-col gap-3">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
                ))
              ) : sesiones.length === 0 ? (
                <p className="text-sm text-foreground/40 text-center py-8">Aún no has registrado ninguna sesión.</p>
              ) : sesiones.map((s, i) => (
                <div key={i} className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 transition-all duration-200">
                  <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                    {s.cover && <Image src={s.cover} alt={s.title || ""} fill sizes="48px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{s.title || `Juego #${s.rawg_game_id}`}</p>
                    <p className="text-xs text-foreground/50">
                      {formatTiempo(s.duracion_minutos)} · {formatFecha(s.fecha_sesion)}
                    </p>
                    {s.comentario && (
                      <p className="text-xs text-foreground/40 mt-0.5 italic truncate">&quot;{s.comentario}&quot;</p>
                    )}
                  </div>
                  <div className="text-lg shrink-0">⏱</div>
                </div>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}