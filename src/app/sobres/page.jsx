"use client";

import { useState, useEffect, useCallback, memo } from "react";
import Image from "next/image";
import Link from "next/link";
import BorderGlow from "@/components/BorderGlow";
import TiltedCard from "@/components/TiltedCard";
import { notify } from "@/lib/notify";

// ============= CONFIGURACIÓN RAREZAS =============

const RAREZA = {
  comun: {
    label: "Común",
    colors: ["#9ca3af", "#6b7280", "#4b5563"],
    glow: "160 10 50",
    bg: "rgba(156,163,175,0.1)",
  },
  raro: {
    label: "Raro",
    colors: ["#60a5fa", "#3b82f6", "#1d4ed8"],
    glow: "217 91 60",
    bg: "rgba(96,165,250,0.1)",
  },
  epico: {
    label: "Épico",
    colors: ["#c084fc", "#a855f7", "#7c3aed"],
    glow: "270 91 65",
    bg: "rgba(192,132,252,0.1)",
  },
  legendario: {
    label: "Legendario",
    colors: ["#fbbf24", "#f59e0b", "#d97706"],
    glow: "43 96 56",
    bg: "rgba(251,191,36,0.15)",
  },
};

// ============= COMPONENTES AUXILIARES =============

const NivelBadge = memo(function NivelBadge({ nivel }) {
  if (!nivel) return null;
  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-foreground/5 border border-foreground/10 rounded-2xl">
      <span className="text-3xl">{nivel.icono}</span>
      <p className="text-xs font-black text-foreground uppercase tracking-widest">
        {nivel.nombre}
      </p>
      <p className="text-[10px] text-foreground/40">{nivel.puntos} pts</p>
      <div className="w-full bg-foreground/10 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full bg-foreground rounded-full transition-all duration-700"
          style={{ width: `${nivel.progreso}%` }}
        />
      </div>
      {nivel.progreso < 100 && (
        <p className="text-[9px] text-foreground/30">
          {nivel.puntosProximo - nivel.puntos} pts para el siguiente nivel
        </p>
      )}
    </div>
  );
});

function ItemCard({ item, equipado, onEquipar }) {
  const cfg = RAREZA[item.rareza] || RAREZA.comun;

  return (
    <BorderGlow
      colors={cfg.colors}
      glowColor={cfg.glow}
      backgroundColor="#22434C"
      borderRadius={16}
      glowRadius={30}
      className="cursor-pointer"
    >
      <div className="p-3 flex flex-col items-center gap-2 min-h-35 justify-between">
        {/* Badge rareza */}
        <span
          className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full self-end"
          style={{ background: cfg.bg, color: cfg.colors[0] }}
        >
          {cfg.label}
        </span>

        {/* Imagen o fallback */}
        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-foreground/10 flex items-center justify-center shrink-0">
          {item.imagen_url ? (
            <Image
              src={item.imagen_url}
              alt={item.nombre}
              fill
              sizes="56px"
              className="object-contain p-1"
            />
          ) : (
            <span className="text-2xl">
              {item.tipo === "avatar" ? "🎮" : "⭕"}
            </span>
          )}
        </div>

        <p className="text-[10px] font-bold text-foreground text-center leading-tight">
          {item.nombre}
        </p>

        {onEquipar && (
          <button
            onClick={() => onEquipar(item.id_item)}
            className={`w-full py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
              equipado
                ? "bg-foreground/20 text-foreground/60"
                : "bg-foreground text-background hover:brightness-90"
            }`}
          >
            {equipado ? "Equipado ✓" : "Equipar"}
          </button>
        )}

        {item.duplicado && (
          <span className="text-[10px] text-yellow-400 font-bold">
            +{item.monedasRecibidas} 🪙
          </span>
        )}
      </div>
    </BorderGlow>
  );
}

// ============= ANIMACIÓN APERTURA SOBRE =============

function AnimacionSobre({ items, onCerrar }) {
  const [fase, setFase] = useState("cerrado");
  const [itemsMostrados, setItemsMostrados] = useState([]);

  useEffect(() => {
    const t1 = setTimeout(() => setFase("abriendo"), 300);
    const t2 = setTimeout(() => {
      setFase("revelando");
      items.forEach((item, i) => {
        setTimeout(() => setItemsMostrados((prev) => [...prev, item]), i * 500);
      });
    }, 1200);
    const t3 = setTimeout(
      () => setFase("final"),
      1200 + items.length * 500 + 500,
    );
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [items]);

  return (
    <div className="fixed inset-0 z-400 flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center space-y-8 px-4 max-w-2xl w-full">
        {(fase === "cerrado" || fase === "abriendo") && (
          <div
            className={`mx-auto transition-all duration-700 ${fase === "abriendo" ? "scale-150 opacity-0" : "scale-100 opacity-100"}`}
          >
            <BorderGlow
              colors={["#fbbf24", "#f59e0b", "#d97706"]}
              glowColor="43 96 56"
              backgroundColor="#22434C"
              borderRadius={24}
              glowRadius={60}
              animated
              className="w-40 h-48 mx-auto"
            >
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-7xl">📦</span>
              </div>
            </BorderGlow>
            <p className="text-foreground/60 text-sm mt-6 animate-pulse">
              Abriendo sobre...
            </p>
          </div>
        )}

        {(fase === "revelando" || fase === "final") && (
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-foreground tracking-widest">
              ¡Has obtenido!
            </h2>
            <div className="flex gap-4 justify-center flex-wrap">
              {itemsMostrados.map((item, i) => {
                const cfg = RAREZA[item.rareza] || RAREZA.comun;
                return (
                  <div key={i} className="w-36">
                    <TiltedCard
                      imageSrc={item.imagen_url || "/avatars/placeholder.png"}
                      altText={item.nombre}
                      captionText={item.nombre}
                      containerHeight="180px"
                      containerWidth="144px"
                      imageHeight="180px"
                      imageWidth="144px"
                      scaleOnHover={1.05}
                      rotateAmplitude={10}
                      showMobileWarning={false}
                      showTooltip={true}
                      overlayContent={
                        <div className="absolute inset-0 rounded-2xl flex flex-col items-center justify-end p-3 bg-linear-to-t from-black/80 to-transparent">
                          <p className="text-xs font-black text-white text-center">
                            {item.nombre}
                          </p>
                          <span
                            className="text-[9px] font-bold mt-0.5"
                            style={{ color: cfg.colors[0] }}
                          >
                            {cfg.label}
                          </span>
                          {item.duplicado && (
                            <span className="text-[10px] text-yellow-400 font-bold">
                              +{item.monedasRecibidas} 🪙
                            </span>
                          )}
                        </div>
                      }
                      displayOverlayContent
                    />
                  </div>
                );
              })}
              {Array.from({ length: 3 - itemsMostrados.length }).map((_, i) => (
                <div
                  key={`p-${i}`}
                  className="w-36 h-44 rounded-2xl bg-foreground/5 border-2 border-foreground/10 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {fase === "final" && (
          <button
            onClick={onCerrar}
            className="px-8 py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all cursor-pointer"
          >
            ¡Genial!
          </button>
        )}
      </div>
    </div>
  );
}

// ============= PÁGINA PRINCIPAL =============

export default function SobresPage() {
  const [activeTab, setActiveTab] = useState("sobres");
  const [estadoSobre, setEstadoSobre] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [avatarActivo, setAvatarActivo] = useState(null);
  const [bordeActivo, setBordeActivo] = useState(null);
  const [tienda, setTienda] = useState([]);
  const [nivel, setNivel] = useState(null);
  const [logros, setLogros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [abriendo, setAbriendo] = useState(false);
  const [itemsObtenidos, setItemsObtenidos] = useState(null);
  const [tiempoRestante, setTiempoRestante] = useState("");
  const [filtroInventario, setFiltroInventario] = useState("todo");
  const [filtroLogros, setFiltroLogros] = useState("todo");

  const cargarEstado = useCallback(async () => {
    try {
      const [sobresRes, invRes, perfilRes] = await Promise.all([
        fetch("/api/sobres"),
        fetch("/api/inventario"),
        fetch("/api/perfil"),
      ]);
      const sobresData = await sobresRes.json();
      const invData = await invRes.json();
      const perfilData = await perfilRes.json();

      setEstadoSobre(sobresData);
      setInventario(invData.items || []);
      setAvatarActivo(invData.avatarActivo);
      setBordeActivo(invData.bordeActivo);
      setNivel(perfilData.nivel);
      setLogros(perfilData.logros || []);

      // Notificar logros nuevos
      if (perfilData.logrosNuevos?.length > 0) {
        perfilData.logrosNuevos.forEach((l) => {
          notify.success(`${l.icono} ¡Logro desbloqueado!`, l.nombre);
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarTienda = useCallback(async () => {
    try {
      const res = await fetch("/api/tienda");
      const data = await res.json();
      setTienda(data.items || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    cargarEstado();
  }, [cargarEstado]);
  useEffect(() => {
    if (activeTab === "tienda") cargarTienda();
  }, [activeTab, cargarTienda]);

  // Contador regresivo
  useEffect(() => {
    if (!estadoSobre?.horasRestantes || estadoSobre.puedeReclamar) return;
    const objetivo = new Date(
      Date.now() + estadoSobre.horasRestantes * 3600000,
    );
    const tick = () => {
      const diff = objetivo - new Date();
      if (diff <= 0) {
        setTiempoRestante("00:00:00");
        cargarEstado();
        return;
      }
      const h = Math.floor(diff / 3600000)
        .toString()
        .padStart(2, "0");
      const m = Math.floor((diff % 3600000) / 60000)
        .toString()
        .padStart(2, "0");
      const s = Math.floor((diff % 60000) / 1000)
        .toString()
        .padStart(2, "0");
      setTiempoRestante(`${h}:${m}:${s}`);
    };
    tick();
    const iv = setInterval(tick, 1000);
    return () => clearInterval(iv);
  }, [estadoSobre, cargarEstado]);

  const abrirSobre = async (tipo) => {
    setAbriendo(true);
    try {
      const res = await fetch("/api/sobres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItemsObtenidos(data.items);
      cargarEstado();
    } catch (err) {
      notify.error("Error", err.message);
    } finally {
      setAbriendo(false);
    }
  };

  const equiparItem = async (id_item) => {
    try {
      const res = await fetch("/api/inventario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_item }),
      });
      if (res.ok) {
        const item = inventario.find((i) => i.id_item === id_item);
        if (item?.tipo === "avatar") setAvatarActivo(id_item);
        else setBordeActivo(id_item);
        notify.success("¡Equipado!", `${item?.nombre} ahora está activo.`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const comprarItem = async (id_item) => {
    try {
      const res = await fetch("/api/tienda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_item }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      notify.success("¡Comprado!", `Te quedan ${data.monedasRestantes} 🪙`);
      cargarEstado();
      cargarTienda();
    } catch (err) {
      notify.error("Error", err.message);
    }
  };

  const avatares = inventario.filter((i) => i.tipo === "avatar");
  const bordes = inventario.filter((i) => i.tipo === "borde");
  const filtrados =
    filtroInventario === "todo"
      ? inventario
      : filtroInventario === "avatar"
        ? avatares
        : bordes;

  const logrosFiltrados =
    filtroLogros === "todo"
      ? logros
      : filtroLogros === "obtenidos"
        ? logros.filter((l) => l.obtenido)
        : logros.filter((l) => !l.obtenido);

  const TABS = ["sobres", "inventario", "logros", "tienda"];

  return (
    <div className="min-h-screen text-foreground">
      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/homeRegistrado" className="flex items-center gap-3">
          <Image
            src="/logotipo.png"
            alt="CHECKPOINT"
            width={32}
            height={32}
            style={{ width: "32px", height: "auto" }}
          />
          <span className="text-lg font-black tracking-widest text-foreground hidden sm:block">
            CHECKPOINT
          </span>
        </Link>
        <div className="flex items-center gap-4">
          {estadoSobre && (
            <span className="text-sm font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-3 py-1 rounded-lg">
              🪙 {estadoSobre.monedas}
            </span>
          )}
          <Link
            href="/homeRegistrado"
            className="text-sm font-semibold text-foreground/70 bg-foreground/5 border border-foreground/15 px-4 py-1.5 rounded-xl hover:bg-foreground/10 transition-all"
          >
            ← Volver
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12 space-y-8">
        {/* ── CABECERA ── */}
        <div className="flex items-start justify-between gap-6 flex-wrap">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">
              📦 Sobres
            </h1>
            <p className="text-sm text-foreground/40 mt-1">
              Abre sobres diarios y consigue items exclusivos
            </p>
          </div>
          {nivel && <NivelBadge nivel={nivel} />}
        </div>

        {/* ── TABS ── */}
        <div className="flex gap-1 border-b border-foreground/10">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-bold capitalize transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? "text-foreground border-foreground"
                  : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {tab === "sobres"
                ? "📦 Sobres"
                : tab === "inventario"
                  ? `🎒 Inventario (${inventario.length})`
                  : tab === "logros"
                    ? `🏆 Logros (${logros.filter((l) => l.obtenido).length}/${logros.length})`
                    : "🛒 Tienda"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <span className="w-8 h-8 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── TAB SOBRES ── */}
            {activeTab === "sobres" && estadoSobre && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sobre diario */}
                <div className="space-y-4">
                  <h2 className="text-lg font-black text-foreground uppercase tracking-widest">
                    Sobre diario
                  </h2>
                  <BorderGlow
                    colors={
                      estadoSobre.puedeReclamar
                        ? ["#fbbf24", "#f59e0b", "#d97706"]
                        : ["#4b5563", "#374151", "#1f2937"]
                    }
                    glowColor={
                      estadoSobre.puedeReclamar ? "43 96 56" : "0 0 30"
                    }
                    backgroundColor="#1a3540"
                    borderRadius={24}
                    glowRadius={estadoSobre.puedeReclamar ? 50 : 20}
                    animated={estadoSobre.puedeReclamar}
                    className="w-full"
                  >
                    <div className="p-8 flex flex-col items-center gap-4">
                      <div
                        className={`text-7xl transition-all duration-300 ${estadoSobre.puedeReclamar ? "animate-bounce" : "opacity-40"}`}
                      >
                        {estadoSobre.puedeReclamar ? "📦" : "🔒"}
                      </div>

                      {estadoSobre.puedeReclamar ? (
                        <>
                          <p className="text-sm text-foreground/70 text-center">
                            ¡Tu sobre diario está listo!
                          </p>
                          <button
                            onClick={() => !abriendo && abrirSobre("diario")}
                            disabled={abriendo}
                            className="px-8 py-3 rounded-xl font-bold text-background bg-yellow-400 hover:brightness-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                          >
                            {abriendo ? "Abriendo..." : "¡Abrir sobre!"}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-sm text-foreground/50 text-center">
                            Próximo sobre en
                          </p>
                          <p className="text-3xl font-black text-foreground font-mono tracking-widest">
                            {tiempoRestante || `${estadoSobre.horasRestantes}h`}
                          </p>
                        </>
                      )}
                    </div>
                  </BorderGlow>
                </div>

                {/* Panel derecho: sobres pendientes + probabilidades */}
                <div className="space-y-4">
                  {estadoSobre.sobresPendientes > 0 && (
                    <div>
                      <h2 className="text-lg font-black text-foreground uppercase tracking-widest mb-3">
                        Sobres pendientes
                      </h2>
                      <BorderGlow
                        colors={["#60a5fa", "#3b82f6", "#1d4ed8"]}
                        glowColor="217 91 60"
                        backgroundColor="#1a3540"
                        borderRadius={20}
                        className="w-full"
                      >
                        <div className="p-6 flex items-center justify-between gap-4">
                          <div>
                            <p className="text-4xl font-black text-foreground">
                              {estadoSobre.sobresPendientes}
                            </p>
                            <p className="text-xs text-foreground/40 mt-0.5">
                              Sobres de bienvenida
                            </p>
                          </div>
                          <button
                            onClick={() => !abriendo && abrirSobre("pendiente")}
                            disabled={abriendo}
                            className="px-6 py-2.5 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                          >
                            {abriendo ? "..." : "Abrir"}
                          </button>
                        </div>
                      </BorderGlow>
                    </div>
                  )}

                  {/* Probabilidades */}
                  <div>
                    <h2 className="text-sm font-black text-foreground/40 uppercase tracking-widest mb-3">
                      Probabilidades
                    </h2>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.entries(RAREZA).map(([rareza, cfg]) => (
                        <div
                          key={rareza}
                          className="px-3 py-2 rounded-xl border flex items-center justify-between"
                          style={{
                            borderColor: `${cfg.colors[0]}40`,
                            background: cfg.bg,
                          }}
                        >
                          <span
                            className="text-xs font-bold"
                            style={{ color: cfg.colors[0] }}
                          >
                            {cfg.label}
                          </span>
                          <span className="text-xs text-foreground/50">
                            {rareza === "comun"
                              ? "60%"
                              : rareza === "raro"
                                ? "25%"
                                : rareza === "epico"
                                  ? "12%"
                                  : "3%"}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB INVENTARIO ── */}
            {activeTab === "inventario" && (
              <div className="space-y-6">
                {/* Filtros */}
                <div className="flex gap-2">
                  {["todo", "avatar", "borde"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFiltroInventario(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                        filtroInventario === f
                          ? "bg-foreground text-background border-foreground"
                          : "bg-foreground/5 border-foreground/15 text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {f === "todo"
                        ? "Todo"
                        : f === "avatar"
                          ? `Avatares (${avatares.length})`
                          : `Bordes (${bordes.length})`}
                    </button>
                  ))}
                </div>

                {filtrados.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">🎒</p>
                    <p className="text-foreground/40 text-sm">
                      Tu inventario está vacío. ¡Abre sobres para conseguir
                      items!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                    {filtrados.map((item) => (
                      <ItemCard
                        key={item.id_item}
                        item={item}
                        equipado={
                          item.tipo === "avatar"
                            ? avatarActivo === item.id_item
                            : bordeActivo === item.id_item
                        }
                        onEquipar={equiparItem}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── TAB LOGROS ── */}
            {activeTab === "logros" && (
              <div className="space-y-6">
                {/* Resumen */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-foreground">
                      {logros.filter((l) => l.obtenido).length}
                    </p>
                    <p className="text-xs text-foreground/40 mt-0.5 uppercase tracking-widest">
                      Completados
                    </p>
                  </div>
                  <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-foreground">
                      {logros.length}
                    </p>
                    <p className="text-xs text-foreground/40 mt-0.5 uppercase tracking-widest">
                      Total
                    </p>
                  </div>
                  <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 text-center">
                    <p className="text-2xl font-black text-foreground">
                      {logros
                        .filter((l) => l.obtenido)
                        .reduce((acc, l) => acc + l.recompensa_monedas, 0)}
                    </p>
                    <p className="text-xs text-foreground/40 mt-0.5 uppercase tracking-widest">
                      Monedas ganadas
                    </p>
                  </div>
                </div>

                {/* Filtros */}
                <div className="flex gap-2">
                  {["todo", "obtenidos", "pendientes"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFiltroLogros(f)}
                      className={`px-4 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                        filtroLogros === f
                          ? "bg-foreground text-background border-foreground"
                          : "bg-foreground/5 border-foreground/15 text-foreground/60 hover:text-foreground"
                      }`}
                    >
                      {f === "todo"
                        ? "Todos"
                        : f === "obtenidos"
                          ? "Completados"
                          : "Pendientes"}
                    </button>
                  ))}
                </div>

                {/* Lista de logros */}
                <div className="flex flex-col gap-3">
                  {logrosFiltrados.map((logro) => (
                    <div
                      key={logro.id_logro}
                      className={`flex items-center gap-4 rounded-2xl px-5 py-4 border transition-all ${
                        logro.obtenido
                          ? "bg-foreground/5 border-foreground/15"
                          : "bg-background border-foreground/8 opacity-60"
                      }`}
                    >
                      <span
                        className={`text-2xl shrink-0 ${!logro.obtenido && "grayscale opacity-50"}`}
                      >
                        {logro.icono}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p
                            className={`text-sm font-bold ${logro.obtenido ? "text-foreground" : "text-foreground/50"}`}
                          >
                            {logro.nombre}
                          </p>
                          {logro.obtenido && (
                            <span className="text-[10px] font-bold text-green-400 bg-green-400/10 border border-green-400/20 px-2 py-0.5 rounded-full">
                              ✓ Completado
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-foreground/40 mt-0.5">
                          {logro.descripcion}
                        </p>
                        {!logro.obtenido && (
                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 bg-foreground/10 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="h-full bg-foreground/40 rounded-full transition-all duration-700"
                                style={{ width: `${logro.progreso}%` }}
                              />
                            </div>
                            <span className="text-[10px] text-foreground/30 shrink-0">
                              {logro.actual}/{logro.objetivo}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-yellow-400">
                          +{logro.recompensa_monedas} 🪙
                        </p>
                        {logro.obtenido && logro.fecha && (
                          <p className="text-[10px] text-foreground/30 mt-0.5">
                            {new Date(logro.fecha).toLocaleDateString("es-ES", {
                              day: "numeric",
                              month: "short",
                            })}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB TIENDA ── */}
            {activeTab === "tienda" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground/50">
                    Compra items directamente con monedas
                  </p>
                  <span className="text-sm font-bold text-yellow-400">
                    🪙 {estadoSobre?.monedas || 0}
                  </span>
                </div>

                {tienda.length === 0 ? (
                  <p className="text-center text-foreground/40 py-10">
                    No hay items disponibles.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {tienda.map((item) => {
                      const cfg = RAREZA[item.rareza] || RAREZA.comun;
                      const loPosee = inventario.some(
                        (i) => i.id_item === item.id_item,
                      );
                      const puedePagar =
                        (estadoSobre?.monedas || 0) >= item.precio_monedas;

                      return (
                        <BorderGlow
                          key={item.id_item}
                          colors={cfg.colors}
                          glowColor={cfg.glow}
                          backgroundColor="#1a3540"
                          borderRadius={16}
                          glowRadius={25}
                        >
                          <div className="p-4 flex flex-col items-center gap-3">
                            <span
                              className="text-[10px] font-black uppercase self-end"
                              style={{ color: cfg.colors[0] }}
                            >
                              {cfg.label}
                            </span>
                            <div className="relative w-14 h-14 rounded-xl bg-foreground/10 flex items-center justify-center">
                              {item.imagen_url && (
                                <Image
                                  src={item.imagen_url}
                                  alt={item.nombre}
                                  fill
                                  sizes="56px"
                                  className="object-contain p-1"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                              )}
                              <span className="text-2xl">
                                {item.tipo === "avatar" ? "🎮" : "⭕"}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-foreground text-center">
                              {item.nombre}
                            </p>
                            <p className="text-sm font-black text-yellow-400">
                              🪙 {item.precio_monedas}
                            </p>
                            {loPosee ? (
                              <span className="text-[10px] text-foreground/40 font-semibold">
                                Ya lo tienes
                              </span>
                            ) : (
                              <button
                                onClick={() => comprarItem(item.id_item)}
                                disabled={!puedePagar}
                                className="w-full py-1.5 rounded-lg text-xs font-bold text-background bg-foreground hover:brightness-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                              >
                                {puedePagar ? "Comprar" : "Sin monedas"}
                              </button>
                            )}
                          </div>
                        </BorderGlow>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {itemsObtenidos && (
        <AnimacionSobre
          items={itemsObtenidos}
          onCerrar={() => {
            setItemsObtenidos(null);
            cargarEstado();
          }}
        />
      )}
    </div>
  );
}
