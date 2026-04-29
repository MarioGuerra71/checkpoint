"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GridMotion from "@/components/GridMotion";
import { useUsuario } from "@/lib/useUsuario";
import Link from "next/link";
import AvatarUsuario from "@/components/AvatarUsuario";
import PillNav from "@/components/PillNav";
import TextExpandible from "@/components/TextExpandible";
import AvatarSimple from "@/components/AvatarSimple";

// ============= CONSTANTES =============

const TAB_TYPES = {
  "mejor valorados": "mejorValorados",
  trending: "trending",
  nuevos: "nuevos",
};

const STATUS_COLORS = {
  jugando: "text-foreground border-foreground",
  completado: "text-green-400 border-green-400",
  "en pausa": "text-yellow-400 border-yellow-400",
  pendiente: "text-foreground/40 border-foreground/40",
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
  return d.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
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
  const {
    usuario,
    stats,
    masJugados,
    sesiones,
    resenas,
    loading: loadingUser,
  } = useUsuario();

  // Estado UI
  const [activeTab, setActiveTab] = useState("mejor valorados");
  const [scrolled, setScrolled] = useState(false);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(true);
  const [errorGames, setErrorGames] = useState(null);
  const [gridImages, setGridImages] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [popularJuegos, setPopularJuegos] = useState([]);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [sobreDisponible, setSobreDisponible] = useState(false);

  const [paginaLista, setPaginaLista] = useState(false);

  useEffect(() => {
    // Pequeño delay para que el GridMotion cargue antes de mostrar
    const t = setTimeout(() => setPaginaLista(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Enriquecer sesiones recientes con info de RAWG
  const [sesionesEnriquecidas, setSesionesEnriquecidas] = useState([]);
  const [resenasEnriquecidas, setResenasEnriquecidas] = useState([]);

  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const [actividadAmigos, setActividadAmigos] = useState([]);
  const [juegosPorId, setJuegosPorId] = useState({});

  useEffect(() => {
    let cancelled = false;
    async function fetchActividad() {
      try {
        const res = await fetch("/api/actividad-amigos");
        const data = await res.json();
        if (cancelled) return;
        const actividad = data.actividad || [];
        setActividadAmigos(actividad);

        // Enriquecer con RAWG
        const idsUnicos = [...new Set(actividad.map((a) => a.rawg_game_id))];
        const juegos = {};
        await Promise.all(
          idsUnicos.map(async (id) => {
            try {
              const r = await fetch(`/api/rawg?id=${id}`);
              const game = await r.json();
              juegos[id] = game;
            } catch {
              juegos[id] = { title: `Juego #${id}`, cover: null };
            }
          }),
        );
        if (!cancelled) setJuegosPorId(juegos);
      } catch (e) {
        console.error(e);
      }
    }
    fetchActividad();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    fetch("/api/sobres")
      .then((r) => r.json())
      .then((data) => {
        setSobreDisponible(data.puedeReclamar || data.sobresPendientes > 0);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function fetchPopular() {
      try {
        const res = await fetch("/api/popular");
        const data = await res.json();
        if (!cancelled) setPopularJuegos(data.juegos || []);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingPopular(false);
      }
    }
    fetchPopular();
    return () => {
      cancelled = true;
    };
  }, []);

  // Enriquecer sesiones con RAWG cuando lleguen
  useEffect(() => {
    if (!sesiones.length) return;
    let cancelled = false;

    async function enrichSesiones() {
      const enriched = await Promise.all(
        sesiones.map(async (s) => {
          try {
            const r = await fetch(`/api/rawg?id=${s.rawg_game_id}`);
            const game = await r.json();
            return {
              ...s,
              title: game.title,
              cover: game.cover,
              genre: game.genre,
            };
          } catch {
            return { ...s, title: "Juego desconocido", cover: null };
          }
        }),
      );
      if (!cancelled) setSesionesEnriquecidas(enriched);
    }

    enrichSesiones();
    return () => {
      cancelled = true;
    };
  }, [sesiones]);

  // Enriquecer reseñas con RAWG cuando lleguen
  useEffect(() => {
    if (!resenas.length) return;
    let cancelled = false;

    async function enrichResenas() {
      const enriched = await Promise.all(
        resenas.map(async (r) => {
          try {
            const res = await fetch(`/api/rawg?id=${r.rawg_game_id}`);
            const game = await res.json();
            return { ...r, title: game.title, cover: game.cover };
          } catch {
            return { ...r, title: "Juego desconocido", cover: null };
          }
        }),
      );
      if (!cancelled) setResenasEnriquecidas(enriched);
    }

    enrichResenas();
    return () => {
      cancelled = true;
    };
  }, [resenas]);

  // Fetch juegos descubrir
  const fetchGames = useCallback(async (tab) => {
    setLoadingGames(true);
    setErrorGames(null);
    try {
      const type = TAB_TYPES[tab];
      const res = await fetch(`/api/rawg?type=${type}`);
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
      const res = await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) window.location.href = "/home";
    } catch (e) {
      console.error("[Logout Error]", e);
    }
  };

  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.trim().length < 2) {
      setSearchResults(null);
      return;
    }
    setSearchLoading(true);
    try {
      const res = await fetch(
        `/api/buscar?q=${encodeURIComponent(value.trim())}`,
      );
      const data = await res.json();
      setSearchResults(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSearchLoading(false);
    }
  };

  // Puntuación con minerales
  const renderMinerales = (puntuacion) => {
    const minerales = ["💎", "💎", "💎", "💎", "💎"];
    return minerales.map((m, i) => (
      <span key={i} className={i < puntuacion ? "opacity-100" : "opacity-20"}>
        {m}
      </span>
    ));
  };

  if (!paginaLista) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
          <p className="text-xs text-foreground/40 uppercase tracking-widest animate-pulse">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-foreground">
      {/* ── NAVBAR ── */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-foreground/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">
          {/* IZQUIERDA — PillNav */}
          <div className="flex items-center shrink-0">
            <PillNav
              logo="/logotipo.png"
              logoAlt="CHECKPOINT"
              activeHref="/homeRegistrado"
              baseColor="#22434C"
              pillColor="#00E3F6"
              hoveredPillTextColor="#00E3F6"
              pillTextColor="#22434C"
              initialLoadAnimation={false}
              className="static"
              items={[
                { href: "/homeRegistrado", label: "Inicio" },
                { href: "/mis-listas", label: "Listas" },
                { href: "/mis-favoritos", label: "Favoritos" },
                { href: "/mis-amigos", label: "Amigos" },
                { href: "/sobres", label: "Sobres" },
              ]}
            />
          </div>

          {/* CENTRO — Buscador */}
          <div
            ref={searchRef}
            className="hidden lg:flex items-center flex-1 max-w-sm relative"
          >
            <div
              className={`w-full flex items-center gap-2 bg-foreground/5 border rounded-xl px-4 py-2 transition-all ${
                searchFocused ? "border-foreground/40" : "border-foreground/15"
              }`}
            >
              <span className="text-foreground/30 text-sm">🔍</span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearchInput(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                    setSearchFocused(false);
                    router.push(
                      `/buscar?q=${encodeURIComponent(searchQuery.trim())}`,
                    );
                  }
                }}
                placeholder="Buscar juegos o usuarios..."
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-foreground/30 focus:outline-none"
              />
              {searchLoading && (
                <span className="w-3 h-3 border border-foreground/30 border-t-foreground rounded-full animate-spin shrink-0" />
              )}
            </div>

            {searchFocused && searchResults && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-foreground/20 rounded-2xl shadow-2xl z-100 overflow-hidden max-h-56 overflow-y-auto">
                {searchResults.usuarios?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 px-4 pt-3 pb-1">
                      Usuarios
                    </p>
                    {searchResults.usuarios.slice(0, 3).map((u) => (
                      <Link
                        key={u.id_usuario}
                        href={`/usuario/${u.nombre_usuario}`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/10 transition-colors"
                      >
                        <div className="w-7 h-7 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-black text-foreground uppercase shrink-0">
                          {u.nombre_usuario?.[0]}
                        </div>
                        <span className="text-sm font-semibold text-foreground">
                          {u.nombre_usuario}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.juegos?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 px-4 pt-3 pb-1">
                      Juegos
                    </p>
                    {searchResults.juegos.slice(0, 4).map((g) => (
                      <Link
                        key={g.id}
                        href={`/juego/${g.id}`}
                        onClick={() => setSearchFocused(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/10 transition-colors"
                      >
                        <div className="relative w-8 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                          {g.cover && (
                            <Image
                              src={g.cover}
                              alt={g.title}
                              fill
                              sizes="32px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">
                            {g.title}
                          </p>
                          <p className="text-xs text-foreground/40">
                            {g.genre}
                          </p>
                        </div>
                        {g.rating > 0 && (
                          <span className="text-xs text-foreground/40 shrink-0">
                            ★ {g.rating}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
                {searchResults.usuarios?.length === 0 &&
                  searchResults.juegos?.length === 0 && (
                    <p className="text-sm text-foreground/40 text-center py-6">
                      Sin resultados para &quot;{searchQuery}&quot;
                    </p>
                  )}
                <div className="border-t border-foreground/10 px-4 py-2.5">
                  <button
                    onClick={() => {
                      setSearchFocused(false);
                      router.push(
                        `/buscar?q=${encodeURIComponent(searchQuery.trim())}`,
                      );
                    }}
                    className="text-xs font-bold text-foreground/50 hover:text-foreground cursor-pointer w-full text-center"
                  >
                    Ver todos los resultados →
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* DERECHA — Perfil + logout */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/perfil"
              className="flex items-center gap-2 bg-foreground/10 border border-foreground/20 rounded-xl px-3 py-1.5 hover:bg-foreground/20 hover:border-foreground/40 transition-all group"
            >
              <AvatarUsuario usuario={usuario} size={28} />
              <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground hidden sm:block">
                Mi perfil
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

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
              <Image
                src="/logotipo.png"
                alt="CHECKPOINT"
                width={120}
                height={120}
                priority
                style={{ width: "120px", height: "auto" }}
                className="drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/50 tracking-[0.2em] uppercase">
              Bienvenido de vuelta
            </p>
            <h1 className="text-5xl font-black text-foreground tracking-widest drop-shadow-lg">
              {loadingUser ? "CHECKPOINT" : `¡Hola, ${usuario?.nombre}!`}
            </h1>
            <p className="text-lg text-foreground/70 font-light max-w-md mx-auto leading-relaxed">
              {loadingUser
                ? "Cargando tu perfil..."
                : `Llevas ${stats?.horasJugadas || 0}h registradas y ${stats?.totalResenas || 0} reseñas escritas.`}
            </p>
          </div>

          {/* Stats reales */}
          <div className="flex gap-8 flex-wrap justify-center pt-6 mt-2 border-t border-foreground/10 w-full">
            {loadingUser
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="text-center">
                    <div className="h-8 w-16 bg-foreground/10 rounded animate-pulse mb-1" />
                    <div className="h-3 w-20 bg-foreground/10 rounded animate-pulse" />
                  </div>
                ))
              : [
                  {
                    num: `${stats?.horasJugadas || 0}h`,
                    label: "Horas jugadas",
                  },
                  { num: stats?.totalResenas || 0, label: "Reseñas" },
                  { num: stats?.totalFavoritos || 0, label: "Favoritos" },
                  { num: stats?.totalListas || 0, label: "Listas" },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black text-foreground">{num}</p>
                    <p className="text-xs text-foreground/50 tracking-wider uppercase mt-0.5">
                      {label}
                    </p>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-20">
        {/* ── POPULAR ESTA SEMANA ── */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">
              🔥Popular esta semana
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
          </div>

          {loadingPopular ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <GameCardSkeleton key={i} />
              ))}
            </div>
          ) : popularJuegos.length === 0 ? (
            <div className="text-center py-10 bg-foreground/5 border border-foreground/10 rounded-2xl">
              <p className="text-foreground/40 text-sm">
                Aún no hay actividad esta semana.
              </p>
              <p className="text-foreground/30 text-xs mt-1">
                ¡Sé el primero en registrar una sesión!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularJuegos.map((game, index) => (
                <Link
                  key={game.id}
                  href={`/juego/${game.id}`}
                  className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-foreground/10 transition-all duration-300"
                >
                  {game.cover ? (
                    <Image
                      src={game.cover}
                      alt={game.title}
                      fill
                      sizes="16vw"
                      className="object-cover group-hover:brightness-50 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-xs text-center px-2">
                        {game.title}
                      </span>
                    </div>
                  )}

                  {/* Badge posición */}
                  <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-background/80 backdrop-blur-sm border border-foreground/20 flex items-center justify-center">
                    <span className="text-[10px] font-black text-foreground">
                      #{index + 1}
                    </span>
                  </div>

                  {/* Info abajo */}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                      {game.title}
                    </p>
                    <p className="text-[10px] text-foreground/50 mt-0.5">
                      {game.genre}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {game.resenas > 0 && (
                        <span className="text-[10px] text-foreground/50">
                          💎 {game.resenas}
                        </span>
                      )}
                      {game.sesiones > 0 && (
                        <span className="text-[10px] text-foreground/50">
                          ⏱ {game.sesiones}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* ── ACTIVIDAD DE AMIGOS ── */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">
              Actividad de amigos
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            <Link
              href="/mis-amigos"
              className="text-xs font-semibold text-foreground/50 tracking-widest uppercase hover:text-foreground transition-colors"
            >
              Ver amigos →
            </Link>
          </div>

          {actividadAmigos.length === 0 ? (
            <div className="text-center py-10 bg-foreground/5 border border-foreground/10 rounded-2xl">
              <p className="text-foreground/40 text-sm">
                Aún no sigues a nadie o tus amigos no tienen actividad reciente.
              </p>
              <Link
                href="/buscar"
                className="mt-3 inline-block text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
              >
                Buscar usuarios →
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {actividadAmigos.map((item, i) => {
                const game = juegosPorId[item.rawg_game_id];
                return (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200"
                  >
                    <Link href={`/usuario/${item.nombre_usuario}`}>
                      <AvatarSimple usuario={item} size={36} />
                    </Link>
                    <div className="relative w-9 h-11 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                      {game?.cover && (
                        <Image
                          src={game.cover}
                          alt={game.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-1.5 flex-wrap">
                        <Link
                          href={`/usuario/${item.nombre_usuario}`}
                          className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors"
                        >
                          {item.nombre_usuario}
                        </Link>
                        <span className="text-xs text-foreground/50">
                          {item.tipo === "resena" ? "reseñó" : "jugó"}
                        </span>
                        <Link
                          href={`/juego/${item.rawg_game_id}`}
                          className="text-xs font-semibold text-foreground hover:text-foreground/70 transition-colors truncate"
                        >
                          {game?.title || `Juego #${item.rawg_game_id}`}
                        </Link>
                      </div>
                      {item.tipo === "resena" && item.puntuacion && (
                        <div className="flex gap-0.5 mt-0.5">
                          {Array.from({ length: 5 }, (_, j) => (
                            <span
                              key={j}
                              className={`text-xs ${j < item.puntuacion ? "opacity-100" : "opacity-20"}`}
                            >
                              💎
                            </span>
                          ))}
                        </div>
                      )}
                      {item.tipo === "sesion" && (
                        <p className="text-xs text-foreground/40 mt-0.5">
                          ⏱ {Math.floor(item.duracion_minutos / 60)}h{" "}
                          {item.duracion_minutos % 60}min
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-foreground/30 shrink-0">
                      {new Date(item.fecha).toLocaleDateString("es-ES", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ── DESCUBRIR ── */}
        <section id="explorar">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">
              Descubrir
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
          </div>

          <div className="flex gap-1 mb-8 border-b border-foreground/10">
            {Object.keys(TAB_TYPES).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all duration-200 border-b-2 -mb-px cursor-pointer ${
                  activeTab === tab
                    ? "text-foreground border-foreground"
                    : "text-foreground/40 border-transparent hover:text-foreground/70"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {errorGames && (
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{errorGames}</p>
              <button
                onClick={() => fetchGames(activeTab)}
                className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer ml-4"
              >
                Reintentar
              </button>
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {loadingGames
              ? Array.from({ length: 6 }).map((_, i) => (
                  <GameCardSkeleton key={i} />
                ))
              : games.map((game) => (
                  <Link
                    key={game.id}
                    href={`/juego/${game.id}`}
                    className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-foreground/10 transition-all duration-300"
                  >
                    {game.cover ? (
                      <Image
                        src={game.cover}
                        alt={game.title}
                        fill
                        sizes="16vw"
                        className="object-cover group-hover:brightness-50 transition-all duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                        <span className="text-foreground/20 text-xs px-2 text-center">
                          {game.title}
                        </span>
                      </div>
                    )}
                    {game.metacritic && (
                      <div className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm border border-foreground/20 rounded px-1.5 py-0.5">
                        <span className="text-[10px] font-black text-green-400">
                          {game.metacritic}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                      <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                        {game.title}
                      </p>
                      <p className="text-[10px] text-foreground/50 mt-0.5">
                        {game.genre}
                      </p>
                      {game.rating > 0 && (
                        <p className="text-sm font-black text-foreground mt-1">
                          ★ {game.rating}
                        </p>
                      )}
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <button className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 cursor-pointer">
                        + Añadir
                      </button>
                    </div>
                  </Link>
                ))}
          </div>
        </section>

        {/* ── MÁS JUGADOS ── */}
        {masJugados.length > 0 && (
          <section id="biblioteca">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">
                Tus más jugados
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {masJugados.map((game) => (
                <Link
                  key={game.id}
                  href={`/juego/${game.id}`}
                  className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 transition-all duration-300"
                >
                  {game.cover ? (
                    <Image
                      src={game.cover}
                      alt={game.title}
                      fill
                      sizes="16vw"
                      className="object-cover group-hover:brightness-50 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                      <span className="text-foreground/20 text-xs text-center px-2">
                        {game.title}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">
                      {game.title}
                    </p>
                    <p className="text-[10px] text-foreground/60 mt-1 font-semibold">
                      ⏱ {formatTiempo(game.totalMinutos)}
                    </p>
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
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">
                Diario
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
              <Link
                href="/perfil"
                className="text-xs font-bold text-foreground/70 tracking-widest uppercase hover:text-foreground transition-colors"
              >
                Ver todo →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {loadingUser
                ? Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse"
                    />
                  ))
                : sesionesEnriquecidas.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200"
                    >
                      {/* Mini cover */}
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                        {s.cover && (
                          <Image
                            src={s.cover}
                            alt={s.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {s.title}
                        </p>
                        <p className="text-xs text-foreground/50">
                          {formatTiempo(s.duracion_minutos)} ·{" "}
                          {formatFecha(s.fecha_sesion)}
                        </p>
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
                      <div className="text-xs font-black text-foreground/60 shrink-0">
                        ⏱
                      </div>
                    </div>
                  ))}
            </div>
          </section>

          {/* RESEÑAS RECIENTES */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">
                Mis Reseñas
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
              <Link
                href="/perfil"
                className="text-xs font-bold text-foreground/70 tracking-widest uppercase hover:text-foreground transition-colors"
              >
                Ver todo →
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {loadingUser
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse"
                    />
                  ))
                : resenasEnriquecidas.map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200"
                    >
                      <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                        {r.cover && (
                          <Image
                            src={r.cover}
                            alt={r.title}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">
                          {r.title}
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {renderMinerales(r.puntuacion)}
                        </div>
                        {r.comentario && (
                          <p className="text-xs text-foreground/50 truncate mt-0.5 italic">
                            &quot;{r.comentario}&quot;
                          </p>
                        )}
                      </div>

                      <div className="text-xs text-foreground/30 shrink-0">
                        {formatFecha(r.fecha_resena)}
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
                    </div>
                  ))}
            </div>
          </section>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-foreground/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/30">
        <div className="flex items-center gap-2">
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={20}
            height={20}
            style={{ width: "20px", height: "auto" }}
          />
          <span className="font-black tracking-widest text-foreground/50">
            CHECKPOINT
          </span>
        </div>
        <span>© 2026</span>
      </footer>
    </div>
  );
}
