"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import GridMotion from "@/components/GridMotion";

// ============= MOCK DATA (actividad y biblioteca — hasta integrar BD) =============

const RECENT_ACTIVITY = [
  { id: 1, user: "alexgames",   avatar: "A", action: "completó",       game: "Elden Ring",    time: "hace 2h",  stars: 5 },
  { id: 2, user: "marta_plays", avatar: "M", action: "reseñó",         game: "Celeste",       time: "hace 4h",  stars: 4 },
  { id: 3, user: "javi_ctrl",   avatar: "J", action: "añadió a lista", game: "Hades",         time: "hace 6h",  stars: null },
  { id: 4, user: "lunadgames",  avatar: "L", action: "empezó a jugar", game: "Hollow Knight", time: "hace 8h",  stars: null },
  { id: 5, user: "pablogaming", avatar: "P", action: "puntuó",         game: "God of War",    time: "hace 10h", stars: 5 },
];

const MY_LIBRARY = [
  { id: 1, title: "Cyberpunk 2077", status: "jugando",    progress: 65,  cover: "https://media.rawg.io/media/games/26d/26d4437715bee60138dab4a7c8c59c92.jpg" },
  { id: 2, title: "Elden Ring",     status: "completado", progress: 100, cover: "https://media.rawg.io/media/games/b29/b294fdd866dcdb643e7bab370a552855.jpg" },
  { id: 3, title: "Hades",          status: "en pausa",   progress: 42,  cover: "https://media.rawg.io/media/games/1f4/1f47a270b8f241f3bf187e930275251f.jpg" },
  { id: 4, title: "Celeste",        status: "pendiente",  progress: 0,   cover: "https://media.rawg.io/media/games/594/59487800889ebac294c7c2c070d02356.jpg" },
];

const STATUS_COLORS = {
  jugando:    "text-foreground border-foreground",
  completado: "text-green-400 border-green-400",
  "en pausa": "text-yellow-400 border-yellow-400",
  pendiente:  "text-foreground/40 border-foreground/40",
};

const STATUS_BAR_COLORS = {
  jugando:    "bg-foreground",
  completado: "bg-green-400",
  "en pausa": "bg-yellow-400",
  pendiente:  "bg-foreground/20",
};

// Mapa de tabs a los ?type= del endpoint interno
const TAB_TYPES = {
  trending:           "trending",
  nuevos:             "nuevos",
  "mejor valorados":  "mejorValorados",
};

// ============= COMPONENTE: Skeleton de carga =============

function GameCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden aspect-[3/4] bg-foreground/5 border border-foreground/10 animate-pulse">
      <div className="w-full h-full bg-foreground/10" />
    </div>
  );
}

// ============= COMPONENTE PRINCIPAL =============

export default function HomePage() {
  const router = useRouter();

  // ── Estado UI ──────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("trending");
  const [scrolled, setScrolled]   = useState(false);

  // ── Estado API ─────────────────────────────────────────────
  const [games, setGames]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const [gridImages, setGridImages] = useState([]);

  // ── Scroll listener ───────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Fetch juegos según tab activo ─────────────────────────
  const fetchGames = useCallback(async (tab) => {
  setLoading(true);
  setError(null);

  try {
    const type = TAB_TYPES[tab];
    const res  = await fetch(`/api/rawg?type=${type}`);

    if (!res.ok) throw new Error(`Error ${res.status}`);

    const data = await res.json();
    setGames(data.games || []);

    // Si es la carga inicial (trending), rellenamos el grid del hero
    // Repetimos las portadas para llegar a los 28 items que necesita GridMotion
    if (tab === "trending" && data.games?.length > 0) {
      const covers = data.games
        .map((g) => g.cover)
        .filter(Boolean);
      
      // Repetir hasta tener 28
      const filled = Array.from({ length: 28 }, (_, i) => covers[i % covers.length]);
      setGridImages(filled);
    }

  } catch (err) {
    console.error("[fetchGames Error]", err);
    setError("No se pudieron cargar los juegos. Intenta de nuevo.");
  } finally {
    setLoading(false);
  }
}, []);

  // Carga inicial y al cambiar de tab
  useEffect(() => {
    fetchGames(activeTab);
  }, [activeTab, fetchGames]);

  // ── Logout ─────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      const res = await fetch("/api/logout", { method: "POST", credentials: "include" });
      if (res.ok) router.push("/login");
    } catch (e) {
      console.error("[Logout Error]", e);
    }
  };

  // ============= RENDERIZADO =============

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur-xl border-b border-foreground/10"
          : "bg-transparent"
      }`}>

        {/* Logo */}
        <div className="flex items-center gap-3">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={32} height={32} className="drop-shadow-md" />
          <span className="text-xl font-black text-foreground tracking-widest">CHECKPOINT</span>
        </div>

        {/* Links */}
        <ul className="hidden lg:flex items-center gap-8 list-none">
          {["Inicio", "Explorar", "Mi Biblioteca", "Amigos", "Listas"].map((link) => (
            <li key={link}>
              <a href="#" className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-200">
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Avatar + logout */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-foreground/10 border-2 border-foreground/30 flex items-center justify-center text-sm font-bold text-foreground">
            U
          </div>
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

        {/* GridMotion de fondo */}
        <div className="absolute inset-0 z-0">
          <GridMotion items={gridImages} gradientColor="#22434c" />
        </div>

        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-background opacity-50 z-10" />

        {/* Contenido del hero */}
        <div className="relative z-20 text-center px-4 max-w-3xl mx-auto flex flex-col items-center gap-6">

          {/* Logo con glow — igual que en el login */}
          <div className="relative">
            <div className="absolute inset-0 bg-foreground rounded-3xl blur-3xl opacity-15 animate-pulse" />
            <div className="relative bg-background/30 backdrop-blur-xl rounded-3xl p-6 border border-foreground border-opacity-30">
              <Image
                src="/logotipo.png"
                alt="CHECKPOINT"
                width={120}
                height={120}
                priority
                className="drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Título y subtítulo */}
          <div className="space-y-2">
            <p className="text-xs font-semibold text-foreground/50 tracking-[0.2em] uppercase">
              Tu diario de videojuegos
            </p>
            <h1 className="text-6xl font-black text-foreground tracking-widest drop-shadow-lg">
              CHECKPOINT
            </h1>
            <p className="text-lg text-foreground opacity-80 font-light max-w-md mx-auto leading-relaxed">
              Registra, puntúa y comparte tu experiencia. Descubre qué están jugando tus amigos.
            </p>
          </div>

          {/* Botones — mismo estilo que el login */}
          <div className="flex gap-4 flex-wrap justify-center mt-2">
            <button className="px-8 py-3 rounded-xl font-bold text-background bg-foreground hover:shadow-lg hover:shadow-foreground/30 active:scale-95 transition-all duration-200 cursor-pointer">
              Explorar juegos
            </button>
            <button className="px-8 py-3 rounded-xl font-semibold text-foreground bg-foreground/10 border border-foreground border-opacity-30 backdrop-blur-sm hover:bg-foreground/20 active:scale-95 transition-all duration-200 cursor-pointer">
              Ver tendencias
            </button>
          </div>

          {/* Stats */}
          <div className="flex gap-10 flex-wrap justify-center pt-6 mt-2 border-t border-foreground/10 w-full">
            {[
              { num: "2.4K", label: "Juegos registrados" },
              { num: "847",  label: "Reseñas esta semana" },
              { num: "12K",  label: "Horas jugadas" },
              { num: "340",  label: "Usuarios activos" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-black text-foreground">{num}</p>
                <p className="text-xs text-foreground/50 tracking-wider uppercase mt-0.5">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ── */}
      <main className="max-w-6xl mx-auto px-6 py-20 space-y-20">

        {/* ── SECCIÓN DESCUBRIR ── */}
        <section>
          <div className="flex items-center gap-4 mb-8">
            <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Descubrir</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-foreground/20 to-transparent" />
            <a href="#" className="text-xs font-semibold text-foreground/50 tracking-widest uppercase hover:text-foreground transition-colors cursor-pointer">
              Ver todo →
            </a>
          </div>

          {/* Tabs */}
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

          {/* Error con botón reintentar */}
          {error && (
            <div className="flex items-center justify-between bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={() => fetchGames(activeTab)}
                className="text-xs font-bold text-red-400 hover:text-red-300 cursor-pointer ml-4"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Grid de portadas */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">

            {/* Skeletons mientras carga */}
            {loading && Array.from({ length: 6 }).map((_, i) => (
              <GameCardSkeleton key={i} />
            ))}

            {/* Tarjetas reales de RAWG */}
            {!loading && !error && games.map((game) => (
              <div
                key={game.id}
                className="group relative rounded-xl overflow-hidden aspect-[3/4] bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-foreground/10 transition-all duration-300"
              >
                {/* Portada */}
                {game.cover ? (
                  <Image
                    src={game.cover}
                    alt={game.title}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                    className="object-cover group-hover:brightness-50 transition-all duration-300"
                  />
                ) : (
                  <div className="w-full h-full bg-foreground/10 flex items-center justify-center">
                    <span className="text-foreground/20 text-xs text-center px-2">{game.title}</span>
                  </div>
                )}

                {/* Metacritic badge (esquina superior izquierda) */}
                {game.metacritic && (
                  <div className="absolute top-2 left-2 bg-background/70 backdrop-blur-sm border border-foreground/20 rounded px-1.5 py-0.5">
                    <span className="text-[10px] font-black text-green-400">{game.metacritic}</span>
                  </div>
                )}

                {/* Info abajo — siempre visible */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/50 to-transparent p-3">
                  <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{game.title}</p>
                  <p className="text-[10px] text-foreground/50 mt-0.5">{game.genre}</p>
                  {game.rating > 0 && (
                    <p className="text-sm font-black text-foreground mt-1">★ {game.rating}</p>
                  )}
                </div>

                {/* Hover: botón añadir */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="px-4 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 cursor-pointer">
                    + Añadir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── DOS COLUMNAS: Actividad + Biblioteca ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* ── ACTIVIDAD RECIENTE ── */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Actividad</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-foreground/20 to-transparent" />
            </div>

            <div className="flex flex-col gap-3">
              {RECENT_ACTIVITY.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-background/50 backdrop-blur-sm border border-foreground/30 flex items-center justify-center text-sm font-bold text-foreground flex-shrink-0">
                    {item.avatar}
                  </div>
                  <div className="flex-1 text-sm leading-snug">
                    <span className="font-bold text-foreground">{item.user}</span>{" "}
                    <span className="text-foreground/50">{item.action}</span>{" "}
                    <span className="font-semibold text-foreground">{item.game}</span>
                    {item.stars && (
                      <div className="flex gap-0.5 mt-1">
                        {Array.from({ length: 5 }, (_, i) => (
                          <span key={i} className={`text-xs ${i < item.stars ? "text-yellow-400" : "text-foreground/20"}`}>★</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-foreground/30 whitespace-nowrap">{item.time}</span>
                </div>
              ))}
            </div>
          </section>

          {/* ── MI BIBLIOTECA ── */}
          <section>
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-2xl font-black text-foreground tracking-widest uppercase">Mi Biblioteca</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-foreground/20 to-transparent" />
              <a href="#" className="text-xs font-semibold text-foreground/50 tracking-widest uppercase hover:text-foreground transition-colors cursor-pointer">
                Ver todo →
              </a>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {MY_LIBRARY.map((game) => (
                <div
                  key={game.id}
                  className="group relative bg-foreground/5 border border-foreground/10 rounded-2xl overflow-hidden hover:border-foreground/25 hover:-translate-y-1 transition-all duration-200 cursor-pointer"
                >
                  <div className="relative h-24 overflow-hidden">
                    <Image
                      src={game.cover}
                      alt={game.title}
                      fill
                      sizes="(max-width: 1024px) 50vw, 25vw"
                      className="object-cover brightness-50 group-hover:brightness-60 transition-all duration-300"
                    />
                    <div className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border bg-background/60 backdrop-blur-sm ${STATUS_COLORS[game.status]}`}>
                      {game.status}
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-foreground truncate mb-2">{game.title}</p>
                    <div className="h-1 bg-foreground/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${STATUS_BAR_COLORS[game.status]}`}
                        style={{ width: `${game.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[10px] text-foreground/40">Progreso</span>
                      <span className="text-[10px] font-bold text-foreground/60">{game.progress}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-foreground/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/30">
        <div className="flex items-center gap-2">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={20} height={20} />
          <span className="font-black tracking-widest text-foreground/50">CHECKPOINT</span>
        </div>
        <span>TFG · Grado Superior DAW · Instituto Cristóbal de Monroy</span>
        <span>© 2025</span>
      </footer>

    </div>
  );
}
