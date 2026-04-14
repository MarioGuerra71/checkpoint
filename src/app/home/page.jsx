"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import LogoLoop from "@/components/LogoLoop";
import RotatingText from "@/components/RotatingText";
import DomeGallery from "@/components/DomeGallery";
import Aurora from "@/components/Aurora";
import {
  SiSteam,
  SiEpicgames,
  SiPlaystation,
  SiItchdotio,
  SiTwitch,
  SiDiscord,
  SiGoogleplay,
} from "react-icons/si";

// ============= LOGOS PLATAFORMAS =============

const platformLogos = [
  { node: <SiSteam />,       title: "Steam" },
  { node: <SiEpicgames />,   title: "Epic Games" },
  { node: <SiPlaystation />, title: "PlayStation" },
  { node: <SiTwitch />,      title: "Twitch" },
  { node: <SiDiscord />,     title: "Discord" },
  { node: <SiGoogleplay />,  title: "Google Play" },
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
        const res  = await fetch(`/api/rawg?id=${gameId}`);
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="inline-block w-6 h-6 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
    </div>
  );

  if (!detail) return (
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
      <h3 className="text-base font-black text-foreground leading-tight">{detail.title}</h3>

      {/* Géneros */}
      {detail.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {detail.genres.map((g) => (
            <span key={g} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-foreground/10 border border-foreground/20 text-foreground/70">
              {g}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2">
        {detail.rating > 0 && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-foreground">★ {detail.rating}</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">Rating</p>
          </div>
        )}
        {detail.metacritic && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-green-400">{detail.metacritic}</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">Metacritic</p>
          </div>
        )}
        {detail.playtime > 0 && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-sm font-black text-foreground">{detail.playtime}h</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">Promedio</p>
          </div>
        )}
        {detail.released && (
          <div className="bg-foreground/5 border border-foreground/10 rounded-xl p-2 text-center">
            <p className="text-xs font-black text-foreground">{detail.released}</p>
            <p className="text-[10px] text-foreground/50 uppercase tracking-wider">Lanzamiento</p>
          </div>
        )}
      </div>

      {/* Sinopsis */}
      {detail.description && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Sinopsis</h4>
          <p className="text-xs text-foreground/70 leading-relaxed line-clamp-5">
            {detail.description}
          </p>
        </div>
      )}

      {/* Desarrollador */}
      {detail.developers.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Desarrollador</h4>
          <p className="text-xs text-foreground/70">{detail.developers.join(", ")}</p>
        </div>
      )}

      {/* Plataformas */}
      {detail.platforms.length > 0 && (
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-1">Plataformas</h4>
          <div className="flex flex-wrap gap-1">
            {detail.platforms.slice(0, 5).map((p) => (
              <span key={p} className="text-[10px] px-1.5 py-0.5 rounded bg-foreground/5 border border-foreground/10 text-foreground/60">
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Botón */}
      <Link
        href="/registro"
        className="w-full py-2 rounded-xl font-bold text-background bg-foreground text-center text-xs hover:brightness-90 active:scale-95 transition-all duration-200 mt-1"
      >
        + Añadir a mi biblioteca
      </Link>

    </div>
  );
}
// ============= COMPONENTE PRINCIPAL =============

export default function HomePage() {
  const [trendingGames, setTrendingGames]   = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(null);

  // Cargar portadas para DomeGallery
  useEffect(() => {
    let cancelled = false;

    async function fetchTrending() {
      try {
        const res  = await fetch("/api/rawg?type=trending");
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;
        // Sin duplicados — RAWG a veces repite
        const seen = new Set();
        const unique = (data.games || []).filter((g) => {
          if (!g.cover || seen.has(g.id)) return false;
          seen.add(g.id);
          return true;
        });
        setTrendingGames(unique);
      } catch (e) {
        if (!cancelled) console.error("[fetchTrending]", e);
      }
    }

    fetchTrending();
    return () => { cancelled = true; };
  }, []);

  const domeImages = trendingGames.map((g) => ({ src: g.cover, alt: g.title, id: g.id }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

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
          <Link href="/login" className="text-sm font-medium text-foreground/70 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all duration-200">
            Iniciar sesión
          </Link>
          <Link href="/registro" className="text-sm font-bold text-background bg-foreground px-4 py-1.5 rounded-lg hover:brightness-90 active:scale-95 transition-all duration-200">
            Registrarse
          </Link>
        </div>
      </nav>

      {/* ── HERO CON AURORA ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">

        {/* Aurora de fondo */}
        <div className="absolute inset-0 z-0">
          <Aurora
            colorStops={["#00E3F6", "#22434C", "#00b8c9"]}
            amplitude={1.2}
            blend={0.6}
          />
        </div>
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
              CHECK<br />POINT
            </h1>

            {/* Rotating text grande */}
            <div className="flex items-center gap-3 text-3xl font-bold text-foreground/80 flex-wrap">
              <span>Tu espacio para</span>
              <RotatingText
                texts={["Catalogar", "Valorar", "Compartir", "Conectar", "Descubrir"]}
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
              Lleva un registro de todo lo que juegas, descubre títulos nuevos y comparte tu experiencia con una comunidad apasionada.
            </p>

            {/* CTAs */}
            <div className="flex gap-4 flex-wrap">
              <Link href="/registro" className="px-8 py-3 rounded-xl font-bold text-background bg-foreground hover:shadow-lg hover:shadow-foreground/30 active:scale-95 transition-all duration-200">
                Empieza gratis
              </Link>
              <Link href="/login" className="px-8 py-3 rounded-xl font-semibold text-foreground bg-foreground/10 border border-foreground/30 hover:bg-foreground/20 active:scale-95 transition-all duration-200">
                Iniciar sesión
              </Link>
            </div>
          </div>

          {/* DERECHA — stats */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "2.4K", label: "Juegos registrados",  icon: "🎮" },
              { num: "847",  label: "Reseñas esta semana", icon: "⭐" },
              { num: "12K",  label: "Horas jugadas",       icon: "⏱️" },
              { num: "340",  label: "Usuarios activos",    icon: "👥" },
            ].map(({ num, label, icon }) => (
              <div key={label} className="bg-background/40 backdrop-blur-sm border border-foreground/15 rounded-2xl p-6 text-center hover:border-foreground/30 transition-all duration-200">
                <div className="text-3xl mb-2">{icon}</div>
                <p className="text-3xl font-black text-foreground">{num}</p>
                <p className="text-xs text-foreground/50 tracking-wider uppercase mt-1">{label}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="características" className="px-6 py-20 max-w-5xl mx-auto w-full">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-foreground/40 tracking-[0.2em] uppercase mb-2">¿Qué puedes hacer?</p>
          <h2 className="text-4xl font-black tracking-widest uppercase">Todo en un solo lugar</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: "🎮", title: "Cataloga",      desc: "Lleva un registro completo de todos los juegos que has jugado, estás jugando o tienes pendientes." },
            { icon: "⭐", title: "Valora",         desc: "Puntúa y escribe reseñas detalladas. Comenta las reseñas de otros usuarios." },
            { icon: "👥", title: "Conecta",        desc: "Sigue a amigos, ve su actividad y descubre nuevos juegos a través de la comunidad." },
            { icon: "📊", title: "Estadísticas",   desc: "Visualiza cuántas horas has jugado, tus géneros favoritos y tus rachas." },
            { icon: "🔥", title: "Trending",       desc: "Descubre qué juegos están arrasando esta semana entre la comunidad." },
            { icon: "📋", title: "Listas",         desc: "Crea listas temáticas personalizadas y compártelas con quien quieras." },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 hover:border-foreground/25 hover:-translate-y-1 transition-all duration-200 cursor-default">
              <div className="text-3xl mb-3">{icon}</div>
              <h3 className="text-base font-black tracking-widest uppercase mb-2">{title}</h3>
              <p className="text-sm text-foreground/55 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DOME GALLERY — TRENDING ── */}
      <section id="trending" className="relative py-20 border-y border-foreground/10 overflow-hidden">

        {/* Aurora de fondo */}
        <div className="absolute inset-0 z-0 opacity-40">
          <Aurora
            colorStops={["#22434C", "#00E3F6", "#22434C"]}
            amplitude={0.8}
            blend={0.4}
          />
        </div>
        <div className="absolute inset-0 z-0 bg-background/60" />

        {/* Título */}
        <div className="relative z-10 text-center mb-4 px-4">
          <p className="text-xs font-semibold text-foreground/40 tracking-[0.2em] uppercase mb-2">Esta semana</p>
          <h2 className="text-4xl font-black tracking-widest uppercase mb-2">Trending ahora</h2>
          <p className="text-sm text-foreground/50">Pulsa sobre cualquier juego para ver más información</p>
        </div>

        {/* Dome + panel flotante */}
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
                <div key={i} className="w-32 h-44 rounded-xl bg-foreground/10 animate-pulse" />
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
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/40">Info del juego</p>
                  <button
                    onClick={() => setSelectedGameId(null)}
                    className="text-foreground/40 hover:text-foreground transition-colors cursor-pointer w-6 h-6 flex items-center justify-center rounded-full hover:bg-foreground/10"
                  >
                    ✕
                  </button>
                </div>

                <GameInfoPanel gameId={selectedGameId} onClose={() => setSelectedGameId(null)} />
              </div>
            )}
          </div>

        </div>
      </section>

      {/* ── LOGO LOOP — PLATAFORMAS ── */}
      <section className="py-12 border-b border-foreground/10">
        <p className="text-center text-xs font-semibold text-foreground/30 tracking-[0.2em] uppercase mb-6">
          Compatible con todas las plataformas
        </p>
        <div style={{ height: "60px", position: "relative", overflow: "hidden" }}>
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
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-4xl font-black tracking-widest uppercase mb-4">¿Listo para empezar?</h2>
        <p className="text-foreground/60 mb-8 max-w-md mx-auto">
          Únete a la comunidad y empieza a llevar el control de tu experiencia gamer hoy mismo.
        </p>
        <Link
          href="/registro"
          className="inline-block px-10 py-4 rounded-xl font-black text-background bg-foreground text-lg hover:shadow-lg hover:shadow-foreground/30 active:scale-95 transition-all duration-200 tracking-widest uppercase"
        >
          Crear cuenta gratis
        </Link>
      </section>

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
          <span className="font-black tracking-widest text-foreground/50">CHECKPOINT</span>
        </div>
        <span>© 2026</span>
      </footer>
    </div>
  );
}