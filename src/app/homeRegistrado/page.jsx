"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GridMotion from "@/components/GridMotion";
import { useUsuario } from "@/lib/useUsuario";
import Link from "next/link";

// ============= CONSTANTES =============

const TAB_TYPES = {
  trending:          "trending",
  nuevos:            "nuevos",
  "mejor valorados": "mejorValorados",
};

const STATUS_COLORS = {
  jugando:    "text-foreground border-foreground",
  completado: "text-green-400 border-green-400",
  "en pausa": "text-yellow-400 border-yellow-400",
  pendiente:  "text-foreground/40 border-foreground/40",
};

// Convierte minutos a texto legible
function formatTiempo(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

// Formatea fecha
function formatFecha(fechaISO) {
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

// ============= SKELETON =============

function GameCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 animate-pulse">
      <div className="w-full h-full bg-foreground/10" />
    </div>
  );
}

function StatSkeleton() {
  return <div className="h-20 rounded-2xl bg-foreground/10 animate-pulse" />;
}

// ============= COMPONENTE PRINCIPAL =============

export default function HomeRegistradoPage() {
  const router = useRouter();

  // Datos del usuario desde la BD
  const { usuario, stats, masJugados, sesiones, resenas, loading: loadingUser } = useUsuario();

  // Estado UI
  const [activeTab, setActiveTab]     = useState("mejor valorados");
  const [scrolled, setScrolled]       = useState(false);
  const [games, setGames]             = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames]   = useState(null);
  const [gridImages, setGridImages]   = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Enriquecer sesiones recientes con info de RAWG
  const [sesionesEnriquecidas, setSesionesEnriquecidas] = useState([]);
  const [resenasEnriquecidas, setResenasEnriquecidas]   = useState([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Enriquecer sesiones con RAWG cuando lleguen
  useEffect(() => {
    if (!sesiones.length) return;
    let cancelled = false;

    async function enrichSesiones() {
      const enriched = await Promise.all(
        sesiones.map(async (s) => {
          try {
            const r    = await fetch(`/api/rawg?id=${s.rawg_game_id}`);
            const game = await r.json();
            return { ...s, title: game.title, cover: game.cover, genre: game.genre };
          } catch {
            return { ...s, title: "Juego desconocido", cover: null };
          }
        })
      );
      if (!cancelled) setSesionesEnriquecidas(enriched);
    }

    enrichSesiones();
    return () => { cancelled = true; };
  }, [sesiones]);

  // Enriquecer reseñas con RAWG cuando lleguen
  useEffect(() => {
    if (!resenas.length) return;
    let cancelled = false;

    async function enrichResenas() {
      const enriched = await Promise.all(
        resenas.map(async (r) => {
          try {
            const res  = await fetch(`/api/rawg?id=${r.rawg_game_id}`);
            const game = await res.json();
            return { ...r, title: game.title, cover: game.cover };
          } catch {
            return { ...r, title: "Juego desconocido", cover: null };
          }
        })
      );
      if (!cancelled) setResenasEnriquecidas(enriched);
    }

    enrichResenas();
    return () => { cancelled = true; };
  }, [resenas]);

  // Fetch juegos descubrir
  const fetchGames = useCallback(async (tab) => {
    setLoadingGames(true);
    setErrorGames(null);
    try {
      const type = TAB_TYPES[tab];
      const res  = await fetch(`/api/rawg?type=${type}`);
      if (!res.ok) throw new Error(`Error ${res.status}`);
      const data = await res.json();
      setGames(data.games || []);

      if (tab === "mejor valorados" && data.games?.length > 0) {
        const covers = data.games.map((g) => g.cover).filter(Boolean);
        setGridImages(covers);
      }
    } catch (err) {
      console.error("[fetchGames Error]", err);
      setErrorGames("No se pudieron cargar los juegos.");
    } finally {
      setLoadingGames(false);
    }
  }, []);

  // Funcion buscar juegos
  const handleSearch = (e) => {
    if (e.key === "Enter" && searchQuery.trim().length >= 2) {
      router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  useEffect(() => {
    fetchGames(activeTab);
  }, [activeTab, fetchGames]);

  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
      if (res.ok) window.location.href = "/home";
    } catch (e) {
      console.error("[Logout Error]", e);
    }
  };

  // Puntuación con minerales
  const renderMinerales = (puntuacion) => {
    const minerales = ["💎", "💎", "💎", "💎", "💎"];
    return minerales.map((m, i) => (
      <span key={i} className={i < puntuacion ? "opacity-100" : "opacity-20"}>{m}</span>
    ));
  };

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-300 ${
        scrolled ? "bg-background/70 backdrop-blur-xl border-b border-foreground/10" : "bg-transparent"
      }`}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={36} height={36} style={{ width: "36px", height: "auto" }} className="drop-shadow-md" />
          <span className="text-xl font-black text-foreground tracking-widest hidden sm:block">CHECKPOINT</span>
        </div>

        {/* Links + buscador */}
        <div className="hidden lg:flex items-center gap-4 flex-1 max-w-lg mx-8">
          <Link
            href="/mis-listas"
            className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors whitespace-nowrap"
          >
            📋 Mis listas
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-foreground/5 border border-foreground/15 rounded-xl px-4 py-2 focus-within:border-foreground/30 transition-all">
            <span className="text-foreground/30 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Buscar juegos o usuarios..."
              className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
            />
          </div>
        </div>
        
        {/* Avatar + nombre + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-foreground">
              {loadingUser ? "..." : usuario?.nombre}
            </span>
            <span className="text-[10px] text-foreground/40 uppercase tracking-wider">Jugador</span>
          </div>
          <Link href="/perfil" className="w-9 h-9 rounded-full bg-foreground/10 border-2 border-foreground/30 flex items-center justify-center text-sm font-bold text-foreground uppercase hover:border-foreground/60 transition-all duration-200">
            {loadingUser ? "?" : usuario?.nombre?.[0] || "U"}
          </Link>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all duration-200 cursor-pointer"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* ── HERO CON GRIDMOTION ── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <GridMotion items={gridImages} gradientColor="#22434c" />
        </div>
        <div className="absolute inset-0 bg-background opacity-50 z-10" />

        <div className="relative z-20 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-foreground rounded-3xl blur-3xl opacity-15 animate-pulse" />
            <div className="relative bg-background/30 backdrop-blur-xl rounded-3xl p-6 border border-foreground/30">
              <Image src="/logotipo.png" alt="CHECKPOINT" width={120} height={120} priority style={{ width: "120px", height: "auto" }} className="drop-shadow-2xl" />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/50 tracking-[0.2em] uppercase">Bienvenido de vuelta</p>
            <h1 className="text-5xl font-black text-foreground tracking-widest drop-shadow-lg">
              {loadingUser ? "CHECKPOINT" : `¡Hola, ${usuario?.nombre}!`}
            </h1>
            <p className="text-lg text-foreground/70 font-light max-w-md mx-auto leading-relaxed">
              {loadingUser ? "Cargando tu perfil..." : `Llevas ${stats?.horasJugadas || 0}h registradas y ${stats?.totalResenas || 0} reseñas escritas.`}
            </p>
          </div>

          {/* Stats reales */}
          <div className="flex gap-8 flex-wrap justify-center pt-6 mt-2 border-t border-foreground/10 w-full">
            {loadingUser ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="text-center">
                  <div className="h-8 w-16 bg-foreground/10 rounded animate-pulse mb-1" />
                  <div className="h-3 w-20 bg-foreground/10 rounded animate-pulse" />
                </div>
              ))
            ) : (
              [
                { num: `${stats?.horasJugadas || 0}h`, label: "Horas jugadas" },
                { num: stats?.totalResenas || 0,       label: "Reseñas" },
                { num: stats?.totalFavoritos || 0,     label: "Favoritos" },
                { num: stats?.totalListas || 0,        label: "Listas" },
              ].map(({ num, label }) => (
                <div key={label} className="text-center">
                  <p className="text-2xl font-black text-foreground">{num}</p>
                  <p className="text-xs text-foreground/50 tracking-wider uppercase mt-0.5">{label}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-20">

        {/* ── MÁS JUGADOS ── */}
        {masJugados.length > 0 && (
          <section id="biblioteca">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Tus más jugados</h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {masJugados.map((game) => (
                <Link key={game.id} href={`/juego/${game.id}`} className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 transition-all duration-300">
                  {game.cover ? (
                    <Image src={game.cover} alt={game.title} fill sizes="16vw" className="object-cover group-hover:brightness-50 transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-xs text-center px-2">{game.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{game.title}</p>
                    <p className="text-[10px] text-foreground/60 mt-1 font-semibold">⏱ {formatTiempo(game.totalMinutos)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── DOS COLUMNAS: Diario + Reseñas ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16" id="diario">

          {/* SESIONES RECIENTES */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Diario</h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
              <a href="#" className="text-xs font-semibold text-foreground/50 tracking-widest uppercase hover:text-foreground transition-colors cursor-pointer">Ver todo →</a>
            </div>

            <div className="flex flex-col gap-3">
              {loadingUser ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-16 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
                ))
              ) : sesionesEnriquecidas.map((s, i) => (
                <div key={i} className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200">
                  {/* Mini cover */}
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                    {s.cover && <Image src={s.cover} alt={s.title} fill sizes="40px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{s.title}</p>
                    <p className="text-xs text-foreground/50">{formatTiempo(s.duracion_minutos)} · {formatFecha(s.fecha_sesion)}</p>
                    {s.comentario && <p className="text-xs text-foreground/40 truncate mt-0.5 italic">&quot;{s.comentario}&quot;</p>}
                  </div>
                  <div className="text-xs font-black text-foreground/60 shrink-0">⏱</div>
                </div>
              ))}
            </div>
          </section>

          {/* RESEÑAS RECIENTES */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Mis Reseñas</h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
              <a href="#" className="text-xs font-semibold text-foreground/50 tracking-widest uppercase hover:text-foreground transition-colors cursor-pointer">Ver todo →</a>
            </div>

            <div className="flex flex-col gap-3">
              {loadingUser ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse" />
                ))
              ) : resenasEnriquecidas.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200">
                  <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                    {r.cover && <Image src={r.cover} alt={r.title} fill sizes="40px" className="object-cover" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">{r.title}</p>
                    <div className="flex gap-0.5 mt-0.5">{renderMinerales(r.puntuacion)}</div>
                    {r.comentario && <p className="text-xs text-foreground/50 truncate mt-0.5 italic">&quot;{r.comentario}&quot;</p>}
                  </div>
                  <div className="text-xs text-foreground/30 shrink-0">{formatFecha(r.fecha_resena)}</div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── DESCUBRIR ── */}
        <section id="explorar">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Descubrir</h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
          </div>

          <div className="flex gap-1 mb-8 border-b border-foreground/10">
            {Object.keys(TAB_TYPES).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-200 border-b-2 -mb-px cursor-pointer ${
                  activeTab === tab ? "text-foreground border-foreground" : "text-foreground/40 border-transparent hover:text-foreground/70"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {errorGames && (
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{errorGames}</p>
              <button onClick={() => fetchGames(activeTab)} className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer ml-4">Reintentar</button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingGames
              ? Array.from({ length: 6 }).map((_, i) => <GameCardSkeleton key={i} />)
              : games.map((game) => (
                <Link key={game.id} href={`/juego/${game.id}`} className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-foreground/10 transition-all duration-300">
                  {game.cover ? (
                    <Image src={game.cover} alt={game.title} fill sizes="16vw" className="object-cover group-hover:brightness-50 transition-all duration-300" />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-xs px-2 text-center">{game.title}</span>
                    </div>
                  )}
                  {game.metacritic && (
                    <div className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm border border-foreground/20 rounded px-1.5 py-0.5">
                      <span className="text-[10px] font-black text-green-400">{game.metacritic}</span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{game.title}</p>
                    <p className="text-[10px] text-foreground/50 mt-0.5">{game.genre}</p>
                    {game.rating > 0 && <p className="text-sm font-black text-foreground mt-1">★ {game.rating}</p>}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <button className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 cursor-pointer">+ Añadir</button>
                  </div>
                </Link>
              ))
            }
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-foreground/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/30">
        <div className="flex items-center gap-2">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={20} height={20} style={{ width: "20px", height: "auto" }} />
          <span className="font-black tracking-widest text-foreground/50">CHECKPOINT</span>
        </div>
        <span>© 2025</span>
      </footer>

    </div>
  );
}