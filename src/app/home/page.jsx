"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, useCallback } from "react";
import LogoLoop from "@/components/LogoLoop";
import RotatingText from "@/components/RotatingText";
import DomeGallery from "@/components/DomeGallery";
import {
  SiSteam,
  SiEpicgames,
  SiPlaystation,
  SiXbox,
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
  { node: <SiItchdotio />,   title: "Itch.io" },
  { node: <SiTwitch />,      title: "Twitch" },
  { node: <SiDiscord />,     title: "Discord" },
  { node: <SiGoogleplay />,  title: "Google Play" },
];

// ============= COMPONENTE AURORA BOREAL =============

function AuroraBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Capa base oscura */}
      <div className="absolute inset-0 bg-background" />

      {/* Auroras animadas con CSS */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(0,227,246,0.15) 0%, transparent 60%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(34,67,76,0.4) 0%, transparent 55%),
            radial-gradient(ellipse 50% 60% at 50% 20%, rgba(0,180,210,0.1) 0%, transparent 70%)
          `,
          animation: "aurora1 8s ease-in-out infinite alternate",
        }}
      />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(ellipse 70% 40% at 70% 30%, rgba(0,227,246,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 40% 50% at 30% 70%, rgba(0,150,180,0.15) 0%, transparent 55%)
          `,
          animation: "aurora2 12s ease-in-out infinite alternate",
        }}
      />

      {/* Grid sutil */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,227,246,1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,227,246,1) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
        }}
      />

      <style>{`
        @keyframes aurora1 {
          0%   { transform: translate(0, 0) scale(1); }
          100% { transform: translate(3%, 5%) scale(1.05); }
        }
        @keyframes aurora2 {
          0%   { transform: translate(0, 0) scale(1.05); }
          100% { transform: translate(-3%, -3%) scale(1); }
        }
        @keyframes float {
          0%   { transform: translateY(0px) translateX(0px); opacity: 0.2; }
          100% { transform: translateY(-20px) translateX(10px); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// ============= COMPONENTE PRINCIPAL =============

export default function HomePage() {
  const [trendingCovers, setTrendingCovers] = useState([]);

  // Cargar portadas para DomeGallery
  useEffect(() => {
  let cancelled = false;

  async function fetchTrending() {
    try {
      const res  = await fetch("/api/rawg?type=trending");
      if (!res.ok) return;
      const data = await res.json();
      if (cancelled) return;
      const covers = (data.games || [])
        .map((g) => g.cover)
        .filter(Boolean);
      setTrendingCovers(covers);
    } catch (e) {
      if (!cancelled) console.error("[fetchTrending]", e);
    }
  }

  fetchTrending();
    return () => { cancelled = true; };
  }, []);

  // Preparar items para DomeGallery
  const domeItems = trendingCovers.map((src, i) => ({
    src,
    alt: `Trending game ${i + 1}`,
  }));

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 h-16 bg-background/60 backdrop-blur-xl border-b border-foreground/10">

        {/* Logo solo, sin texto */}
        <div className="flex items-center">
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={40}
            height={40}
            className="drop-shadow-md hover:scale-105 transition-transform duration-200"
          />
        </div>

        {/* Links centrales */}
        <ul className="hidden lg:flex items-center gap-8 list-none">
          {["Características", "Comunidad", "Trending"].map((link) => (
            <li key={link}>
              <a href={`#${link.toLowerCase()}`} className="text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-200">
                {link}
              </a>
            </li>
          ))}
        </ul>

        {/* Botones derecha */}
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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <AuroraBackground />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto flex flex-col items-center gap-8">

          {/* Logo */}
          <div className="relative">
            <div className="absolute inset-0 bg-foreground rounded-3xl blur-3xl opacity-10 animate-pulse" />
            <div className="relative bg-background/30 backdrop-blur-xl rounded-3xl p-6 border border-foreground/20">
              <Image
                src="/logotipo.png"
                alt="CHECKPOINT"
                width={110}
                height={110}
                priority
                className="drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Título con RotatingText */}
          <div className="space-y-4">
            <p className="text-xs font-semibold text-foreground/50 tracking-[0.2em] uppercase">
              Tu diario de videojuegos
            </p>
            <h1 className="text-6xl font-black text-foreground tracking-widest drop-shadow-lg">
              CHECKPOINT
            </h1>

            {/* Rotating text */}
            <div className="flex items-center justify-center gap-3 text-2xl font-bold text-foreground/80">
              <span>Tu espacio para</span>
              <RotatingText
                texts={["Catalogar", "Valorar", "Compartir", "Conectar", "Descubrir"]}
                mainClassName="px-3 py-1 bg-foreground/20 border border-foreground/30 text-foreground overflow-hidden rounded-lg backdrop-blur-sm"
                staggerFrom="last"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "-120%" }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5"
                transition={{ type: "spring", damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
              <span>videojuegos</span>
            </div>

            <p className="text-lg text-foreground/60 font-light leading-relaxed max-w-xl mx-auto">
              Lleva un registro de todo lo que juegas, descubre títulos nuevos y comparte tu experiencia con una comunidad apasionada.
            </p>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 flex-wrap justify-center">
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

          {/* Stats */}
          <div className="flex gap-10 flex-wrap justify-center pt-6 border-t border-foreground/10 w-full max-w-xl">
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

      {/* ── LOGO LOOP — PLATAFORMAS ── */}
      <section className="py-12 border-y border-foreground/10 bg-background/80">
        <p className="text-center text-xs font-semibold text-foreground/30 tracking-[0.2em] uppercase mb-6">
          Compatible con todas las plataformas
        </p>
        <div style={{ height: "70px", position: "relative", overflow: "hidden" }}>
          <LogoLoop
            logos={platformLogos}
            speed={60}
            direction="right"
            logoHeight={40}
            gap={80}
            hoverSpeed={0}
            scaleOnHover
            fadeOut
            fadeOutColor="#22434C"
            ariaLabel="Plataformas de juego"
          />
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
            { icon: "🎮", title: "Cataloga",   desc: "Lleva un registro completo de todos los juegos que has jugado, estás jugando o tienes pendientes. Con estados, progreso y sesiones de juego." },
            { icon: "⭐", title: "Valora",     desc: "Puntúa y escribe reseñas detalladas. Comenta las reseñas de otros usuarios y descubre nuevas perspectivas sobre tus juegos favoritos." },
            { icon: "👥", title: "Conecta",    desc: "Sigue a amigos, ve su actividad en tiempo real y descubre nuevos juegos a través de la comunidad. Crea listas temáticas y compártelas." },
            { icon: "📊", title: "Estadísticas", desc: "Visualiza cuántas horas has jugado, tus géneros favoritos, tus rachas y mucho más. Conoce mejor tus hábitos de juego." },
            { icon: "🔥", title: "Trending",   desc: "Descubre qué juegos están arrasando esta semana entre la comunidad. Mantente al día con los títulos más populares del momento." },
            { icon: "📋", title: "Listas",     desc: "Crea listas temáticas personalizadas: mis favoritos, juegos de terror, RPGs épicos... y compártelas con quien quieras." },
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
      <section id="trending" className="py-20 bg-foreground/5 border-y border-foreground/10">
        <div className="text-center mb-4 px-4">
          <p className="text-xs font-semibold text-foreground/40 tracking-[0.2em] uppercase mb-2">Esta semana</p>
          <h2 className="text-4xl font-black tracking-widest uppercase mb-2">Trending ahora</h2>
          <p className="text-sm text-foreground/50">Los juegos más añadidos por la comunidad esta semana</p>
        </div>
        {trendingCovers.length > 0 ? (
          <div style={{ width: "100%", height: "500px" }}>
            <DomeGallery
              images={trendingCovers}
              fit={0.8}
              minRadius={600}
              maxVerticalRotationDeg={0}
              segments={34}
              dragDampening={2}
              grayscale={false}
              overlayBlurColor="#22434c"
            />
          </div>
        ) : (
          // Skeleton mientras carga
          <div className="flex gap-4 justify-center px-6 flex-wrap mt-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-32 h-44 rounded-xl bg-foreground/10 animate-pulse" />
            ))}
          </div>
        )}
      </section>

      {/* ── CTA FINAL ── */}
      <section className="py-24 px-4 text-center">
        <h2 className="text-4xl font-black tracking-widest uppercase mb-4">
          ¿Listo para empezar?
        </h2>
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
          <Image src="/logotipo.png" alt="CHECKPOINT" width={20} height={20} />
          <span className="font-black tracking-widest text-foreground/50">CHECKPOINT</span>
        </div>
        <span>© 2025</span>
      </footer>

    </div>
  );
}