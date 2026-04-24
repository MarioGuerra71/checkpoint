"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogoLoop from "@/components/LogoLoop";
import RotatingText from "@/components/RotatingText";
import DomeGallery from "@/components/DomeGallery";
import Aurora from "@/components/Aurora";
import RevealSection from "@/components/RevealSection";
import CardSwap, { Card } from "@/components/CardSwap";
import MagicBento from "@/components/MagicBento";
import {
  SiSteam,
  SiEpicgames,
  SiPlaystation,
  SiItchdotio,
  SiTwitch,
  SiDiscord,
  SiGoogleplay,
} from "react-icons/si";
import StatCounter from "@/components/StatCounter";
import { memo } from "react";
import FloatingLines from "@/components/FloatingLines";

const CardBackground = memo(function CardBackground() {
  return (
    <FloatingLines
      linesGradient={["#1713ec", "#00e3f6"]}
      animationSpeed={0.8}
      interactive={false}
      bendRadius={3}
      bendStrength={-0.3}
      mouseDamping={0.05}
      parallax={false}
    />
  );
});

// ============= LOGOS PLATAFORMAS =============

const platformLogos = [
  { node: <SiSteam />, title: "Steam" },
  { node: <SiEpicgames />, title: "Epic Games" },
  { node: <SiPlaystation />, title: "PlayStation" },
  { node: <SiTwitch />, title: "Twitch" },
  { node: <SiDiscord />, title: "Discord" },
  { node: <SiGoogleplay />, title: "Google Play" },
];

// ============= MODAL DE DETALLE DE JUEGO =============

function GameInfoPanel({ gameId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!gameId) return;
    setLoading(true);
    setDetail(null);

    async function fetchDetail() {
      try {
        const res = await fetch(`/api/rawg?id=${gameId}`);
        const data = await res.json();
        setDetail(data);
      } catch (e) {
        console.error("[GameInfoPanel]", e);
      } finally {
        setLoading(false);
      }
    }
    fetchDetail();
  }, [gameId]);

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="inline-block w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );

  if (!detail)
    return (
      <div className="flex-1 flex items-center justify-center text-xs text-foreground/40">
        No se pudo cargar
      </div>
    );

  return (
    <div className="flex flex-col gap-3 p-4 overflow-y-auto">
      {/* Cover */}
      {detail.cover && (
        <div className="relative w-full h-36 rounded-xl overflow-hidden shrink-0">
          <Image
            src={detail.cover}
            alt={detail.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 672px"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 to-transparent" />
        </div>
      )}

      {/* Título */}
      <h3 className="text-base font-black text-foreground leading-tight">
        {detail.title}
      </h3>

      {/* Géneros */}
      {detail.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {detail.genres.map((g) => (
            <span
              key={g}
              className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-foreground/10 border border-foreground/20 text-foreground/70"
            >
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {detail.rating > 0 && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-foreground">
              ★ {detail.rating}
            </p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">
              Rating
            </p>
          </div>
        )}
        {detail.metacritic && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-green-400">
              {detail.metacritic}
            </p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">
              Metacritic
            </p>
          </div>
        )}
        {detail.playtime > 0 && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-foreground">
              {detail.playtime}h
            </p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">
              Promedio
            </p>
          </div>
        )}
        {detail.released && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-foreground">
              {detail.released}
            </p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">
              Lanzamiento
            </p>
          </div>
        )}
      </div>

      {/* Sinopsis */}
      {detail.description && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">
            Sinopsis
          </h4>
          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-5">
            {detail.description}
          </p>
        </div>
      )}

      {/* Desarrollador */}
      {detail.developers.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">
            Desarrollador
          </h4>
          <p className="text-xs text-foreground/70">
            {detail.developers.join(", ")}
          </p>
        </div>
      )}

      {/* Plataformas */}
      {detail.platforms.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">
            Plataformas
          </h4>
          <div className="flex flex-wrap gap-1">
            {detail.platforms.slice(0, 5).map((p) => (
              <span
                key={p}
                className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-foreground/60"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
// ============= COMPONENTE PRINCIPAL =============

export default function HomePage() {
  const [trendingGames, setTrendingGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);

  // Cargar portadas para DomeGallery
  // Cargar portadas para DomeGallery
  useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      try {
        const res = await fetch("/api/rawg?type=trending");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        // Eliminar duplicados por ID
        const seen = new Set();
        const unique = (data.games || []).filter((g) => {
          if (!g.cover || seen.has(g.id)) return false;
          seen.add(g.id);
          return true;
        });

        // Shuffle para variar el orden en el domo
        const shuffled = [...unique].sort(() => Math.random() - 0.5);
        setTrendingGames(shuffled);
      } catch (e) {
        if (!cancelled) console.error("[fetchTrending]", e);
      }
    }

    fetchTrending();
    return () => {
      cancelled = true;
    };
  }, []);

  const domeImages = trendingGames.map((g) => ({
    src: g.cover,
    alt: g.title,
    id: g.id,
  }));

  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* ── AURORA GLOBAL DE FONDO ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Aurora
          colorStops={["#00E3F6", "#22434C", "#00b8c9"]}
          amplitude={1.0}
          blend={0.5}
        />
        <div className="absolute inset-0 bg-background/70" />
      </div>

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-background/60 backdrop-blur-xl border-b border-foreground/10">
        <div className="flex items-center">
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={48}
            height={48}
            style={{ width: "48px", height: "auto" }}
            className="drop-shadow-md hover:scale-105 transition-transform duration-200"
          />
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm font-medium text-foreground/70 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all duration-200"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/registro"
            className="text-sm font-bold text-background bg-foreground px-4 py-1.5 rounded-lg hover:brightness-90 active:scale-95 transition-all duration-200"
          >
            Registrarse
          </Link>
        </div>
      </nav>

      {/* ── HERO CON AURORA ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Overlay sutil para contraste */}
        <div className="absolute inset-0 z-0 bg-background/50" />

        {/* Contenido horizontal: izquierda texto, derecha stats */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* IZQUIERDA — título y CTAs */}
          <div className="flex flex-col gap-6">
            <p className="text-xs font-semibold text-foreground/50 tracking-[0.2em] uppercase">
              Tu diario de videojuegos
            </p>

            <h1 className="text-7xl font-black text-foreground tracking-widest drop-shadow-lg leading-none">
              CHECK
              <br />
              POINT
            </h1>

            {/* Rotating text grande */}
            <div className="flex items-center gap-3 text-3xl font-bold text-foreground/80 flex-wrap">
              <span>Tu espacio para</span>
              <RotatingText
                texts={[
                  "Catalogar",
                  "Valorar",
                  "Compartir",
                  "Conectar",
                  "Descubrir",
                ]}
                mainClassName="px-3 py-1 bg-foreground/20 border border-foreground/30 text-foreground overflow-hidden rounded-lg backdrop-blur-sm text-3xl"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </div>

            <p className="text-lg text-foreground/60 font-light leading-relaxed max-w-lg">
              Lleva un registro de todo lo que juegas, descubre títulos nuevos y
              comparte tu experiencia con una comunidad apasionada.
            </p>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/registro"
                className="px-8 py-3 rounded-xl font-bold text-background bg-foreground hover:shadow-lg hover:shadow-foreground/30 active:scale-95 transition-all duration-200"
              >
                Empieza gratis
              </Link>
              <Link
                href="/login"
                className="px-8 py-3 rounded-xl font-semibold text-foreground bg-foreground/10 border border-foreground/30 hover:bg-foreground/20 active:scale-95 transition-all duration-200"
              >
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* DERECHA — stats */}
          {/* DERECHA — stats con MagicBento */}
          <RevealSection direction="right">
            <MagicBento
              glowColor="0, 227, 246"
              enableSpotlight={true}
              enableBorderGlow={true}
              enableStars={true}
              enableTilt={false}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={250}
              particleCount={8}
              textAutoHide={false}
              cardData={[
                {
                  color: "#1a3540",
                  label: "HORAS",
                  title: stats ? `${stats.horas}h` : "—",
                  description: "de partidas registradas por la comunidad",
                },
                {
                  color: "#1a3540",
                  label: "RESEÑAS",
                  title: stats ? `${stats.resenas}` : "—",
                  description: "opiniones escritas sobre videojuegos",
                },
                {
                  color: "#1a3540",
                  label: "JUGADORES",
                  title: stats ? `${stats.usuarios}` : "—",
                  description: "usuarios activos en la plataforma",
                },
                {
                  color: "#1a3540",
                  label: "SESIONES",
                  title: stats ? `${stats.sesiones}` : "—",
                  description: "partidas guardadas en el diario",
                },
              ]}
            />
          </RevealSection>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        id="características"
        className="relative z-10 px-6 py-24 max-w-6xl mx-auto w-full"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center min-h-125">
          {/* IZQUIERDA — texto */}
          <RevealSection direction="left">
            <div className="flex flex-col gap-6">
              <p className="text-xs font-semibold text-foreground/40 tracking-[0.2em] uppercase">
                ¿Qué puedes hacer?
              </p>
              <h2 className="text-5xl font-black tracking-widest uppercase leading-tight text-foreground">
                Todo en un solo lugar
              </h2>
              <p className="text-foreground/60 leading-relaxed text-lg font-light max-w-sm">
                CHECKPOINT reúne todo lo que necesitas como gamer. Desde tu
                diario de partidas hasta conectar con la comunidad.
              </p>
              <div className="flex flex-col gap-2.5">
                {[
                  {
                    icon: "•",
                    text: "Cataloga todos tus juegos con estado y progreso",
                  },
                  {
                    icon: "•",
                    text: "Puntúa con minerales y escribe reseñas",
                  },
                  {
                    icon: "•",
                    text: "Sigue amigos y ve su actividad en tiempo real",
                  },
                  {
                    icon: "•",
                    text: "Estadísticas de horas jugadas y rachas",
                  },
                  {
                    icon: "•",
                    text: "Trending semanal basado en la comunidad",
                  },
                  { icon: "•", text: "Listas temáticas personalizadas" },
                ].map(({ icon, text }) => (
                  <div
                    key={text}
                    className="flex items-center gap-3 text-foreground/65 text-sm"
                  >
                    <span className="w-6 text-base text-center">{icon}</span>
                    <span>{text}</span>
                  </div>
                ))}
              </div>
              <Link
                href="/registro"
                className="self-start mt-2 px-8 py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all duration-200"
              >
                Empieza gratis →
              </Link>
            </div>
          </RevealSection>

          {/* DERECHA — CardSwap */}
          <RevealSection
            direction="right"
            className="relative h-120 hidden lg:block"
          >
            <CardSwap
              width={480}
              height={340}
              cardDistance={50}
              verticalDistance={60}
              delay={3500}
              pauseOnHover
              skewAmount={3}
              easing="elastic"
            >
              {/* Card 1 — Reseñar */}
              <Card customClass="overflow-hidden border-foreground/20 bg-background">
                <div className="absolute inset-0">
                  <CardBackground />
                  <div className="absolute inset-0 bg-background/75" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  {/* Barra superior mockup */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-background/40 backdrop-blur-sm shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-[10px] text-foreground/40 ml-1">
                      Valora y reseña tus juegos
                    </span>
                  </div>
                  {/* Contenido */}
                  <div className="flex items-center gap-4 p-5 flex-1">
                    <div className="w-14 h-20 rounded-lg bg-foreground/10 border border-foreground/20 shrink-0 flex items-center justify-center text-2xl">
                      🗡️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-foreground">
                        Elden Ring
                      </p>
                      <p className="text-[10px] text-foreground/40 mb-2">
                        RPG · FromSoftware
                      </p>
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <span key={i} className="text-sm">
                            💎
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-foreground/50 italic line-clamp-2">
                        &quot;Una obra maestra del género soulslike. 100%
                        recomendado.&quot;
                      </p>
                      <div className="mt-2 flex gap-2">
                        <span className="text-[9px] bg-foreground/10 border border-foreground/20 px-2 py-0.5 rounded-full text-foreground/60">
                          💾 Guardado
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2 — Diario */}
              <Card customClass="overflow-hidden border-foreground/20 bg-background">
                <div className="absolute inset-0">
                  <CardBackground />
                  <div className="absolute inset-0 bg-background/75" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-background/40 backdrop-blur-sm shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-[10px] text-foreground/40 ml-1">
                      Actualiza tu diario a tu gusto
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <p className="text-xs font-black text-foreground uppercase tracking-wider mb-1">
                      Mi Diario
                    </p>
                    {[
                      {
                        juego: "Cyberpunk 2077",
                        tiempo: "2h 30min",
                        fecha: "Hoy",
                        emoji: "🌆",
                      },
                      {
                        juego: "Elden Ring",
                        tiempo: "1h 45min",
                        fecha: "Ayer",
                        emoji: "🗡️",
                      },
                      {
                        juego: "Hades II",
                        tiempo: "3h 10min",
                        fecha: "Lun",
                        emoji: "🔱",
                      },
                    ].map((s) => (
                      <div
                        key={s.juego}
                        className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2"
                      >
                        <span className="text-base">{s.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-bold text-foreground truncate">
                            {s.juego}
                          </p>
                          <p className="text-[9px] text-foreground/40">
                            ⏱ {s.tiempo}
                          </p>
                        </div>
                        <span className="text-[9px] text-foreground/30">
                          {s.fecha}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Card 3 — Trending */}
              <Card customClass="overflow-hidden border-foreground/20 bg-background">
                <div className="absolute inset-0">
                  <CardBackground />
                  <div className="absolute inset-0 bg-background/75" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-background/40 backdrop-blur-sm shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-[10px] text-foreground/40 ml-1">
                      Informate sobre los juegos que estan trending
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <p className="text-xs font-black text-foreground uppercase tracking-wider mb-1">
                      🔥 Esta semana
                    </p>
                    {[
                      {
                        pos: 1,
                        juego: "Monster Hunter Wilds",
                        pts: "2.4k",
                        emoji: "🐉",
                      },
                      { pos: 2, juego: "GTA VI", pts: "1.8k", emoji: "🚗" },
                      {
                        pos: 3,
                        juego: "Hollow Knight: Silksong",
                        pts: "980",
                        emoji: "🦋",
                      },
                    ].map((t) => (
                      <div
                        key={t.juego}
                        className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2"
                      >
                        <span className="text-[11px] font-black text-foreground/40 w-4">
                          #{t.pos}
                        </span>
                        <span className="text-base">{t.emoji}</span>
                        <p className="text-[11px] font-bold text-foreground flex-1 truncate">
                          {t.juego}
                        </p>
                        <span className="text-[9px] text-foreground/40">
                          {t.pts}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Card 4 — Perfil/Stats */}
              <Card customClass="overflow-hidden border-foreground/20 bg-background">
                <div className="absolute inset-0">
                  <CardBackground />
                  <div className="absolute inset-0 bg-background/75" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-background/40 backdrop-blur-sm shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-[10px] text-foreground/40 ml-1">
                      Edita tu perfil
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-foreground/10 border-2 border-foreground/30 flex items-center justify-center text-base font-black text-foreground">
                        A
                      </div>
                      <div>
                        <p className="text-sm font-black text-foreground">
                          admin
                        </p>
                        <p className="text-[9px] text-foreground/40">
                          Miembro desde Mar 2026
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { n: "12h", l: "Jugadas" },
                        { n: "5", l: "Reseñas" },
                        { n: "3", l: "Listas" },
                      ].map(({ n, l }) => (
                        <div
                          key={l}
                          className="bg-foreground/5 border border-foreground/10 rounded-lg p-2 text-center"
                        >
                          <p className="text-sm font-black text-foreground">
                            {n}
                          </p>
                          <p className="text-[9px] text-foreground/40">{l}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {["💎 5 reseñas", "⏱ 10h jugadas", "🔥 Activo"].map(
                        (b) => (
                          <span
                            key={b}
                            className="text-[9px] bg-foreground/10 border border-foreground/15 px-2 py-0.5 rounded-full text-foreground/60"
                          >
                            {b}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 5 — Listas */}
              <Card customClass="overflow-hidden border-foreground/20 bg-background">
                <div className="absolute inset-0">
                  <CardBackground />
                  <div className="absolute inset-0 bg-background/75" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-background/40 backdrop-blur-sm shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-[10px] text-foreground/40 ml-1">
                      Crea tus listas
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col gap-2">
                    <p className="text-xs font-black text-foreground uppercase tracking-wider mb-1">
                      📋 Mis Listas
                    </p>
                    {[
                      { nombre: "Mis favoritos", juegos: 8, emoji: "❤️" },
                      { nombre: "RPGs épicos", juegos: 5, emoji: "⚔️" },
                      {
                        nombre: "Pendientes de jugar",
                        juegos: 12,
                        emoji: "📌",
                      },
                    ].map((l) => (
                      <div
                        key={l.nombre}
                        className="flex items-center gap-3 bg-foreground/5 border border-foreground/10 rounded-lg px-3 py-2"
                      >
                        <span className="text-base">{l.emoji}</span>
                        <p className="text-[11px] font-bold text-foreground flex-1 truncate">
                          {l.nombre}
                        </p>
                        <span className="text-[9px] text-foreground/40">
                          {l.juegos} juegos
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Card 6 — Sobres */}
              <Card customClass="overflow-hidden border-foreground/20 bg-background">
                <div className="absolute inset-0">
                  <CardBackground />
                  <div className="absolute inset-0 bg-background/75" />
                </div>
                <div className="relative z-10 h-full flex flex-col">
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-background/40 backdrop-blur-sm shrink-0">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/60" />
                    </div>
                    <span className="text-[10px] text-foreground/40 ml-1">
                      Abre tus sobres diarios
                    </span>
                  </div>
                  <div className="p-5 flex-1 flex flex-col items-center justify-center gap-3 text-center">
                    <div className="w-16 h-20 rounded-2xl bg-yellow-400/10 border-2 border-yellow-400/40 flex items-center justify-center text-4xl animate-pulse">
                      📦
                    </div>
                    <p className="text-sm font-black text-foreground">
                      ¡Sobre diario listo!
                    </p>
                    <p className="text-[10px] text-foreground/40">
                      Abre tu sobre y consigue avatares exclusivos
                    </p>
                    <div className="flex gap-2">
                      {["⬜ Común", "🟦 Raro", "🟣 Épico", "🟡 Legendario"].map(
                        (r) => (
                          <span
                            key={r}
                            className="text-[8px] text-foreground/50"
                          >
                            {r}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </CardSwap>
          </RevealSection>
        </div>
      </section>

      {/* ── DOME GALLERY — TRENDING ── */}
      <section
        id="trending"
        className="relative py-20 border-y border-foreground/10 overflow-hidden"
      >
        <div className="absolute inset-0 z-0 bg-background/60" />

        {/* Título */}
        <RevealSection className="relative z-10 text-center mb-4 px-4">
          <p className="text-xs font-semibold text-foreground/40 tracking-[0.2em] uppercase mb-2">
            Esta semana
          </p>
          <h2 className="text-4xl font-black tracking-widest uppercase mb-2">
            Trending ahora
          </h2>
          <p className="text-sm text-foreground/50">
            Pulsa sobre cualquier juego para ver más información
          </p>
        </RevealSection>

        {/* Dome + panel flotante */}
        <RevealSection
          delay={200}
          direction="up"
          className="relative z-10"
          style={{ height: "500px" }}
        >
          <div className="relative z-10" style={{ height: "500px" }}>
            {/* DomeGallery ocupa todo */}
            {trendingGames.length > 0 ? (
              <DomeGallery
                images={domeImages}
                onGameClick={(id) => setSelectedGameId(id)}
                onDomeClose={() => setSelectedGameId(null)}
                fit={0.8}
                minRadius={600}
                maxVerticalRotationDeg={0}
                segments={34}
                dragDampening={2}
                grayscale={false}
                overlayBlurColor="transparent"
              />
            ) : (
              <div className="flex gap-4 justify-center flex-wrap mt-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-32 h-44 rounded-xl bg-foreground/10 animate-pulse"
                  />
                ))}
              </div>
            )}

            {/* Panel flotante sobre el dome — esquina derecha */}
            <div
              className={`absolute top-4 right-4 w-72 h-[calc(100%-2rem)] z-50 transition-all duration-500 ${
                selectedGameId
                  ? "opacity-100 translate-x-0 pointer-events-auto"
                  : "opacity-0 translate-x-8 pointer-events-none"
              }`}
            >
              {selectedGameId && (
                <div className="h-full bg-background/85 backdrop-blur-2xl border border-foreground/20 rounded-2xl overflow-y-auto flex flex-col shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0 border-b border-foreground/10">
                    <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">
                      Info del juego
                    </p>
                    <button
                      onClick={() => setSelectedGameId(null)}
                      className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-foreground/10"
                    >
                      ✕
                    </button>
                  </div>

                  <GameInfoPanel
                    gameId={selectedGameId}
                    onClose={() => setSelectedGameId(null)}
                  />
                </div>
              )}
            </div>
          </div>
        </RevealSection>
      </section>

      {/* ── LOGO LOOP — PLATAFORMAS ── */}
      <section className="relative z-10 py-12 border-b border-foreground/10">
        <RevealSection>
          <p className="text-center text-xs font-semibold text-foreground/30 tracking-[0.2em] uppercase mb-6">
            Compatible con todas las plataformas
          </p>
        </RevealSection>
        <RevealSection delay={150}>
          <div
            style={{ height: "60px", position: "relative", overflow: "hidden" }}
          >
            <LogoLoop
              logos={platformLogos}
              speed={40}
              direction="right"
              logoHeight={36}
              gap={80}
              hoverSpeed={0}
              scaleOnHover
              fadeOut
              fadeOutColor="#22434c"
              ariaLabel="Plataformas de juego"
            />
          </div>
        </RevealSection>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="relative z-10 py-24 px-4 text-center">
        <RevealSection direction="up">
          <h2 className="text-4xl font-black tracking-widest uppercase mb-4">
            ¿Listo para empezar?
          </h2>
          <p className="text-foreground/60 mb-8 max-w-md mx-auto">
            Únete a la comunidad y empieza a llevar el control de tu experiencia
            gamer hoy mismo.
          </p>
          <Link
            href="/registro"
            className="inline-block px-10 py-4 rounded-xl font-black text-background bg-foreground text-lg hover:shadow-lg hover:shadow-foreground/30 active:scale-95 transition-all duration-200 tracking-widest uppercase"
          >
            Crear cuenta gratis
          </Link>
        </RevealSection>
      </section>

      {/* ── FOOTER ── */}
      <footer className="relative z-10 border-t border-foreground/10 px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-foreground/30">
        <RevealSection direction="none">
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
        </RevealSection>
      </footer>
    </div>
  );
}
