"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// ─── Helpers ───────────────────────────────────────────────────────────────

function formatTiempo(minutos) {
  const h = Math.floor(minutos / 60);
  const m = minutos % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}

function formatFechaCorta(fechaISO) {
  if (!fechaISO) return "";
  const d = new Date(fechaISO);
  return d.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}

// Minerales según puntuación 1-5
const MINERALES = ["⚫", "🪨", "🔮", "💠", "💎"];
function renderMinerales(puntuacion) {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className="text-sm"
      style={{ opacity: i < puntuacion ? 1 : 0.2 }}
    >
      {MINERALES[i]}
    </span>
  ));
}

// ─── Skeletons ──────────────────────────────────────────────────────────────

function Skeleton({ className = "" }) {
  return <div className={`bg-foreground/10 rounded-xl animate-pulse ${className}`} />;
}

// ─── Componentes de sección ──────────────────────────────────────────────────

function SectionHeader({ title, href }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <h2 className="text-sm font-black tracking-[0.2em] uppercase text-foreground/50">
        {title}
      </h2>
      <div className="flex-1 h-px bg-foreground/10" />
      {href && (
        <a
          href={href}
          className="text-xs font-semibold text-foreground/40 tracking-widest uppercase hover:text-foreground transition-colors"
        >
          Ver todo →
        </a>
      )}
    </div>
  );
}

// ─── Componente principal ────────────────────────────────────────────────────

export default function PerfilPage() {
  const router = useRouter();

  // ── Estado del perfil ──────────────────────────────────────
  const [perfil, setPerfil]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);

  // ── Juegos enriquecidos con RAWG ──────────────────────────
  const [masJugados, setMasJugados]     = useState([]);
  const [resenas, setResenas]           = useState([]);
  const [sesiones, setSesiones]         = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);

  // ── UI ────────────────────────────────────────────────────
  const [tema, setTema]                 = useState("oscuro");
  const [scrolled, setScrolled]         = useState(false);
  const [activeTab, setActiveTab]       = useState("jugados"); // jugados | resenas | sesiones | listas

  // ── Scroll handler ────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Aplicar tema al documento ─────────────────────────────
  useEffect(() => {
    if (tema === "claro") {
      document.documentElement.style.setProperty("--background", "#f0f4f5");
      document.documentElement.style.setProperty("--foreground", "#0a2d35");
    } else {
      document.documentElement.style.setProperty("--background", "#22434C");
      document.documentElement.style.setProperty("--foreground", "#00E3F6");
    }
  }, [tema]);

  // ── Cargar perfil ─────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    async function cargar() {
      try {
        const res = await fetch("/api/perfil");
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        if (!res.ok) throw new Error("Error al cargar perfil");
        const data = await res.json();
        if (cancelled) return;

        setPerfil(data);
        setTema(data.tema || "oscuro");

        // Enriquecer con RAWG en paralelo
        setLoadingGames(true);
        enriquecerGames(data, cancelled);

      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    cargar();
    return () => { cancelled = true; };
  }, [router]);

  // ── Enriquecer IDs de RAWG con info completa ──────────────
  async function enriquecerGames(data, cancelled) {
    try {
      const fetchGame = async (rawg_game_id) => {
        try {
          const r    = await fetch(`/api/rawg?id=${rawg_game_id}`);
          const game = await r.json();
          return { ...game, rawg_game_id };
        } catch {
          return { id: rawg_game_id, rawg_game_id, title: "Juego desconocido", cover: null };
        }
      };

      // Juegos más jugados
      const jugados = await Promise.all(
        data.masJugados.map(async (item) => {
          const game = await fetchGame(item.rawg_game_id);
          return { ...game, totalMinutos: parseInt(item.total_minutos) };
        })
      );
      if (!cancelled) setMasJugados(jugados);

      // Reseñas
      const res = await Promise.all(
        data.resenas.map(async (item) => {
          const game = await fetchGame(item.rawg_game_id);
          return { ...game, puntuacion: item.puntuacion, comentario: item.comentario, fecha_resena: item.fecha_resena };
        })
      );
      if (!cancelled) setResenas(res);

      // Sesiones
      const ses = await Promise.all(
        data.sesiones.map(async (item) => {
          const game = await fetchGame(item.rawg_game_id);
          return { ...game, duracion_minutos: item.duracion_minutos, fecha_sesion: item.fecha_sesion, comentario: item.comentario };
        })
      );
      if (!cancelled) setSesiones(ses);

    } finally {
      if (!cancelled) setLoadingGames(false);
    }
  }

  // ── Toggle tema ───────────────────────────────────────────
  const toggleTema = useCallback(async () => {
    const nuevoTema = tema === "oscuro" ? "claro" : "oscuro";
    setTema(nuevoTema);
    try {
      await fetch("/api/perfil", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tema: nuevoTema }),
      });
    } catch (err) {
      console.error("Error guardando tema:", err);
    }
  }, [tema]);

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST", credentials: "include" });
      window.location.href = "/home";
    } catch (err) {
      console.error(err);
    }
  };

  // ── Renderizado de error ───────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-foreground/50 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs font-bold border border-foreground/20 px-4 py-2 rounded-lg hover:border-foreground/50 transition-colors cursor-pointer"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  const { usuario, stats, listas } = perfil || {};

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ────────────────────────────────────────────── */}
      <nav className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 transition-all duration-300 ${
        scrolled ? "bg-background/70 backdrop-blur-xl border-b border-foreground/10" : "bg-transparent"
      }`}>
        {/* Logo */}
        <button
          onClick={() => router.push("/homeRegistrado")}
          className="flex items-center gap-3 cursor-pointer"
        >
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={32}
            height={32}
            style={{ width: "32px", height: "auto" }}
            className="drop-shadow-md"
          />
          <span className="text-lg font-black tracking-widest hidden sm:block">CHECKPOINT</span>
        </button>

        {/* Nav links */}
        <ul className="hidden lg:flex items-center gap-6 list-none">
          {[
            { label: "Inicio",        href: "/homeRegistrado" },
            { label: "Explorar",      href: "#" },
            { label: "Biblioteca",    href: "#" },
            { label: "Diario",        href: "#" },
            { label: "Listas",        href: "#" },
          ].map(({ label, href }) => (
            <li key={label}>
              <a
                href={href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  label === "Inicio" ? "text-foreground" : "text-foreground/50 hover:text-foreground"
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        {/* Derecha: tema + avatar + salir */}
        <div className="flex items-center gap-3">
          {/* Toggle tema */}
          <button
            onClick={toggleTema}
            className="w-8 h-8 rounded-full border border-foreground/20 flex items-center justify-center text-sm hover:border-foreground/50 transition-colors cursor-pointer"
            title={tema === "oscuro" ? "Cambiar a claro" : "Cambiar a oscuro"}
          >
            {tema === "oscuro" ? "☀️" : "🌙"}
          </button>

          {/* Avatar + nombre */}
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-xs font-bold text-foreground">
              {loading ? "..." : usuario?.nombre}
            </span>
            <span className="text-[10px] text-foreground/40 uppercase tracking-wider">Jugador</span>
          </div>

          {loading ? (
            <div className="w-9 h-9 rounded-full bg-foreground/10 animate-pulse" />
          ) : usuario?.avatar ? (
            <Image
              src={usuario.avatar}
              alt={usuario.nombre}
              width={36}
              height={36}
              className="w-9 h-9 rounded-full object-cover border-2 border-foreground/30"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-foreground/10 border-2 border-foreground/30 flex items-center justify-center text-sm font-black text-foreground uppercase">
              {usuario?.nombre?.[0] || "U"}
            </div>
          )}

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all cursor-pointer"
          >
            Salir
          </button>
        </div>
      </nav>

      {/* ── HERO / CABECERA DEL PERFIL ───────────────────────── */}
      <section className="pt-32 pb-16 px-6 max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-8">

          {/* Avatar grande */}
          <div className="relative shrink-0">
            {loading ? (
              <Skeleton className="w-28 h-28 rounded-2xl" />
            ) : usuario?.avatar ? (
              <Image
                src={usuario.avatar}
                alt={usuario.nombre}
                width={112}
                height={112}
                className="w-28 h-28 rounded-2xl object-cover border-2 border-foreground/20 shadow-2xl"
              />
            ) : (
              <div className="w-28 h-28 rounded-2xl bg-foreground/10 border-2 border-foreground/20 flex items-center justify-center">
                <span className="text-4xl font-black text-foreground uppercase">
                  {usuario?.nombre?.[0] || "U"}
                </span>
              </div>
            )}
            {/* Indicador online */}
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-400 border-2 border-background" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-black tracking-widest text-foreground uppercase">
                  {usuario?.nombre}
                </h1>
                <p className="text-xs text-foreground/40 uppercase tracking-widest mt-1">
                  Miembro desde {formatFecha(usuario?.fechaRegistro)}
                </p>
              </>
            )}

            {/* Stats en fila */}
            <div className="flex flex-wrap gap-8 mt-6">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="text-center space-y-1">
                    <Skeleton className="h-6 w-12 mx-auto" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                ))
              ) : (
                [
                  { num: `${stats?.horasJugadas || 0}h`,  label: "Jugadas" },
                  { num: stats?.totalResenas || 0,         label: "Reseñas" },
                  { num: stats?.totalFavoritos || 0,       label: "Favoritos" },
                  { num: stats?.totalListas || 0,          label: "Listas" },
                  { num: stats?.seguidores || 0,           label: "Seguidores" },
                  { num: stats?.siguiendo || 0,            label: "Siguiendo" },
                ].map(({ num, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black text-foreground">{num}</p>
                    <p className="text-[10px] text-foreground/40 uppercase tracking-widest mt-0.5">{label}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Botón editar (solo perfil propio) */}
          {perfil?.esPropio && !loading && (
            <button className="shrink-0 text-xs font-bold border border-foreground/20 px-5 py-2.5 rounded-xl hover:border-foreground/50 hover:bg-foreground/5 transition-all cursor-pointer">
              ✏️ Editar perfil
            </button>
          )}
        </div>
      </section>

      {/* ── CONTENIDO PRINCIPAL ──────────────────────────────── */}
      <main className="max-w-5xl mx-auto px-6 pb-20 space-y-16">

        {/* ── TABS ── */}
        <div className="border-b border-foreground/10">
          <div className="flex gap-0">
            {[
              { id: "jugados",  label: "Más jugados" },
              { id: "resenas",  label: "Reseñas" },
              { id: "sesiones", label: "Diario" },
              { id: "listas",   label: "Listas" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? "text-foreground border-foreground"
                    : "text-foreground/40 border-transparent hover:text-foreground/70"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── TAB: MÁS JUGADOS ── */}
        {activeTab === "jugados" && (
          <section>
            <SectionHeader title="Juegos más jugados" />
            {loadingGames || loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-3/4 rounded-xl" />
                ))}
              </div>
            ) : masJugados.length === 0 ? (
              <EmptyState
                icon="🎮"
                mensaje="Aún no tienes sesiones registradas."
                sub="Empieza a registrar tu tiempo de juego para verlos aquí."
              />
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {masJugados.map((game) => (
                  <GameCard
                    key={game.rawg_game_id}
                    game={game}
                    badge={formatTiempo(game.totalMinutos)}
                  />
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: RESEÑAS ── */}
        {activeTab === "resenas" && (
          <section>
            <SectionHeader title="Mis reseñas" />
            {loadingGames || loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-2xl" />
                ))}
              </div>
            ) : resenas.length === 0 ? (
              <EmptyState
                icon="✍️"
                mensaje="Todavía no has escrito ninguna reseña."
                sub="Ve a la ficha de un juego y añade tu primera valoración."
              />
            ) : (
              <div className="space-y-3">
                {resenas.map((r, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-4 hover:bg-foreground/8 hover:border-foreground/20 transition-all duration-200 cursor-pointer"
                  >
                    {/* Cover */}
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                      {r.cover && (
                        <Image src={r.cover} alt={r.title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{r.title}</p>
                      <div className="flex gap-0.5 mt-1">
                        {r.puntuacion ? renderMinerales(r.puntuacion) : (
                          <span className="text-xs text-foreground/30 italic">Sin puntuación</span>
                        )}
                      </div>
                      {r.comentario && (
                        <p className="text-xs text-foreground/50 truncate mt-1 italic">
                          &ldquo;{r.comentario}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Fecha */}
                    <p className="text-xs text-foreground/30 shrink-0 tabular-nums">
                      {formatFechaCorta(r.fecha_resena)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: DIARIO / SESIONES ── */}
        {activeTab === "sesiones" && (
          <section>
            <SectionHeader title="Diario de sesiones" />
            {loadingGames || loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-2xl" />
                ))}
              </div>
            ) : sesiones.length === 0 ? (
              <EmptyState
                icon="📔"
                mensaje="Tu diario está vacío."
                sub="Registra tus sesiones de juego para llevar el control de tus horas."
              />
            ) : (
              <div className="space-y-3">
                {sesiones.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-4 hover:bg-foreground/8 hover:border-foreground/20 transition-all duration-200"
                  >
                    {/* Cover */}
                    <div className="relative w-12 h-14 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                      {s.cover && (
                        <Image src={s.cover} alt={s.title} fill sizes="48px" className="object-cover" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{s.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-foreground/60">
                          ⏱ {formatTiempo(s.duracion_minutos)}
                        </span>
                        <span className="text-foreground/20">·</span>
                        <span className="text-xs text-foreground/40">
                          {formatFecha(s.fecha_sesion)}
                        </span>
                      </div>
                      {s.comentario && (
                        <p className="text-xs text-foreground/40 truncate mt-1 italic">
                          &ldquo;{s.comentario}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Horas badge */}
                    <div className="shrink-0 text-right">
                      <p className="text-xs font-black text-foreground/50 tabular-nums">
                        {formatTiempo(s.duracion_minutos)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB: LISTAS ── */}
        {activeTab === "listas" && (
          <section>
            <SectionHeader title="Mis listas" />
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-2xl" />
                ))}
              </div>
            ) : !listas || listas.length === 0 ? (
              <EmptyState
                icon="📋"
                mensaje="No has creado ninguna lista todavía."
                sub="Crea listas temáticas para organizar tus juegos."
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {listas.map((lista) => (
                  <div
                    key={lista.id_lista}
                    className="bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-5 hover:bg-foreground/8 hover:border-foreground/20 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground truncate group-hover:text-foreground transition-colors">
                          {lista.nombre_lista}
                        </p>
                        <p className="text-xs text-foreground/40 mt-1 uppercase tracking-widest">
                          {lista.total_juegos} {lista.total_juegos === 1 ? "juego" : "juegos"}
                        </p>
                      </div>
                      <div className="text-lg shrink-0">📋</div>
                    </div>
                    <p className="text-[10px] text-foreground/25 mt-3 uppercase tracking-widest">
                      Creada {formatFechaCorta(lista.fecha_creacion)}
                    </p>
                  </div>
                ))}

                {/* Botón nueva lista */}
                <button className="bg-foreground/3 border border-dashed border-foreground/15 rounded-2xl px-5 py-5 hover:border-foreground/30 hover:bg-foreground/5 transition-all duration-200 cursor-pointer text-left group">
                  <div className="text-2xl mb-2 text-foreground/20 group-hover:text-foreground/40 transition-colors">+</div>
                  <p className="text-sm font-bold text-foreground/30 group-hover:text-foreground/60 transition-colors">
                    Nueva lista
                  </p>
                </button>
              </div>
            )}
          </section>
        )}

      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-foreground/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/30">
        <div className="flex items-center gap-2">
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={18}
            height={18}
            style={{ width: "18px", height: "auto" }}
          />
          <span className="font-black tracking-widest text-foreground/40">CHECKPOINT</span>
        </div>
        <span>© 2025</span>
      </footer>

    </div>
  );
}

// ─── Subcomponentes ──────────────────────────────────────────────────────────

function GameCard({ game, badge }) {
  return (
    <div className="group relative rounded-xl overflow-hidden aspect-3/4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:-translate-y-2 hover:shadow-xl hover:shadow-foreground/10 transition-all duration-300">
      {game.cover ? (
        <Image
          src={game.cover}
          alt={game.title}
          fill
          sizes="16vw"
          className="object-cover group-hover:brightness-50 transition-all duration-300"
        />
      ) : (
        <div className="w-full h-full bg-foreground/10 flex items-center justify-center p-2">
          <span className="text-foreground/20 text-xs text-center leading-tight">{game.title}</span>
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-background/95 via-background/50 to-transparent p-3">
        <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{game.title}</p>
        {badge && (
          <p className="text-[10px] text-foreground/60 mt-1 font-semibold">⏱ {badge}</p>
        )}
      </div>
    </div>
  );
}

function EmptyState({ icon, mensaje, sub }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center space-y-3">
      <div className="text-5xl opacity-20">{icon}</div>
      <p className="text-sm font-semibold text-foreground/40">{mensaje}</p>
      {sub && <p className="text-xs text-foreground/25 max-w-xs">{sub}</p>}
    </div>
  );
}
