"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ============= COLORES POR RAREZA =============
const RAREZA_CONFIG = {
  comun:      { color: "border-gray-400/50",    bg: "bg-gray-400/10",    texto: "text-gray-400",    label: "Común",      glow: "" },
  raro:       { color: "border-blue-400/60",    bg: "bg-blue-400/10",    texto: "text-blue-400",    label: "Raro",       glow: "shadow-blue-400/20" },
  epico:      { color: "border-purple-400/60",  bg: "bg-purple-400/10",  texto: "text-purple-400",  label: "Épico",      glow: "shadow-purple-400/30" },
  legendario: { color: "border-yellow-400/70",  bg: "bg-yellow-400/10",  texto: "text-yellow-400",  label: "Legendario", glow: "shadow-yellow-400/40" },
};

// ============= COMPONENTE ITEM CARD =============
function ItemCard({ item, equipado, onEquipar, compacto = false }) {
  const cfg = RAREZA_CONFIG[item.rareza] || RAREZA_CONFIG.comun;

  return (
    <div className={`relative border-2 ${cfg.color} ${cfg.bg} rounded-2xl p-3 flex flex-col items-center gap-2 transition-all duration-200 hover:-translate-y-1 ${item.duplicado ? "opacity-60" : ""} ${equipado ? "ring-2 ring-foreground/40" : ""}`}>

      {/* Badge rareza */}
      <span className={`absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.texto} border ${cfg.color}`}>
        {cfg.label}
      </span>

      {/* Imagen */}
      <div className={`relative ${compacto ? "w-12 h-12" : "w-16 h-16"} rounded-xl overflow-hidden bg-background/50 flex items-center justify-center`}>
        <Image
          src={item.imagen_url}
          alt={item.nombre}
          fill
          sizes="64px"
          className="object-contain p-1"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        {/* Fallback emoji si no hay imagen */}
        <span className="text-2xl">{item.tipo === "avatar" ? "🎮" : "⭕"}</span>
      </div>

      <p className={`${compacto ? "text-[10px]" : "text-xs"} font-bold text-foreground text-center leading-tight`}>{item.nombre}</p>
      <p className="text-[9px] text-foreground/40 capitalize">{item.tipo}</p>

      {item.duplicado && (
        <span className="text-[10px] text-yellow-400 font-bold">+{item.monedasRecibidas} 🪙</span>
      )}

      {onEquipar && !item.duplicado && (
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
    </div>
  );
}

// ============= ANIMACIÓN SOBRE =============
function AnimacionSobre({ items, onCerrar }) {
  const [fase, setFase]           = useState("cerrado"); // cerrado → abriendo → revelando → final
  const [itemsMostrados, setItemsMostrados] = useState([]);

  useEffect(() => {
    const t1 = setTimeout(() => setFase("abriendo"), 300);
    const t2 = setTimeout(() => {
      setFase("revelando");
      items.forEach((item, i) => {
        setTimeout(() => {
          setItemsMostrados(prev => [...prev, item]);
        }, i * 400);
      });
    }, 1200);
    const t3 = setTimeout(() => setFase("final"), 1200 + items.length * 400 + 300);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [items]);

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center bg-black/90 backdrop-blur-md">
      <div className="text-center space-y-8 px-4 max-w-lg w-full">

        {/* Sobre animado */}
        {(fase === "cerrado" || fase === "abriendo") && (
          <div className={`mx-auto transition-all duration-700 ${fase === "abriendo" ? "scale-125 opacity-0" : "scale-100 opacity-100"}`}>
            <div className="w-32 h-40 mx-auto bg-gradient-to-b from-yellow-400/80 to-yellow-600/80 rounded-2xl border-2 border-yellow-400 shadow-2xl shadow-yellow-400/30 flex items-center justify-center">
              <span className="text-6xl">📦</span>
            </div>
            <p className="text-foreground/60 text-sm mt-4 animate-pulse">Abriendo sobre...</p>
          </div>
        )}

        {/* Items revelados */}
        {(fase === "revelando" || fase === "final") && (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-foreground tracking-widest">¡Has obtenido!</h2>
            <div className="flex gap-4 justify-center flex-wrap">
              {itemsMostrados.map((item, i) => (
                <div
                  key={i}
                  className="animate-bounce"
                  style={{ animationDuration: "0.5s", animationIterationCount: 1 }}
                >
                  <ItemCard item={item} compacto={false} />
                </div>
              ))}
              {/* Placeholders mientras cargan */}
              {Array.from({ length: 3 - itemsMostrados.length }).map((_, i) => (
                <div key={`placeholder-${i}`} className="w-24 h-36 rounded-2xl bg-foreground/5 border-2 border-foreground/10 animate-pulse" />
              ))}
            </div>
          </div>
        )}

        {/* Botón cerrar */}
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
  const [activeTab, setActiveTab]   = useState("sobres");
  const [estadoSobre, setEstadoSobre] = useState(null);
  const [inventario, setInventario] = useState([]);
  const [avatarActivo, setAvatarActivo] = useState(null);
  const [bordeActivo, setBordeActivo]   = useState(null);
  const [tienda, setTienda]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [abriendo, setAbriendo]     = useState(false);
  const [itemsObtenidos, setItemsObtenidos] = useState(null);
  const [mensaje, setMensaje]       = useState("");

  const cargarEstado = useCallback(async () => {
    try {
      const [sobresRes, invRes] = await Promise.all([
        fetch("/api/sobres"),
        fetch("/api/inventario"),
      ]);
      const sobresData = await sobresRes.json();
      const invData    = await invRes.json();
      setEstadoSobre(sobresData);
      setInventario(invData.items || []);
      setAvatarActivo(invData.avatarActivo);
      setBordeActivo(invData.bordeActivo);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  const cargarTienda = useCallback(async () => {
    try {
      const res  = await fetch("/api/tienda");
      const data = await res.json();
      setTienda(data.items || []);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => { cargarEstado(); }, [cargarEstado]);
  useEffect(() => { if (activeTab === "tienda") cargarTienda(); }, [activeTab, cargarTienda]);

  const abrirSobre = async (tipo) => {
    setAbriendo(true);
    try {
      const res  = await fetch("/api/sobres", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipo }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setItemsObtenidos(data.items);
      cargarEstado();
    } catch (err) {
      setMensaje(err.message);
      setTimeout(() => setMensaje(""), 3000);
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
        const item = inventario.find(i => i.id_item === id_item);
        if (item?.tipo === "avatar") setAvatarActivo(id_item);
        else setBordeActivo(id_item);
        setMensaje("¡Equipado correctamente!");
        setTimeout(() => setMensaje(""), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const comprarItem = async (id_item) => {
    try {
      const res  = await fetch("/api/tienda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_item }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje(`¡Comprado! Te quedan ${data.monedasRestantes} 🪙`);
      setTimeout(() => setMensaje(""), 3000);
      cargarEstado();
      cargarTienda();
    } catch (err) {
      setMensaje(err.message);
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const avatares  = inventario.filter(i => i.tipo === "avatar");
  const bordes    = inventario.filter(i => i.tipo === "borde");

  return (
    <div className="min-h-screen bg-background text-foreground">

      {/* ── NAVBAR ── */}
      <nav className="flex items-center justify-between px-8 h-16 border-b border-foreground/10 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <Link href="/homeRegistrado" className="flex items-center gap-3">
          <Image src="/logotipo.png" alt="CHECKPOINT" width={32} height={32} style={{ width: "32px", height: "auto" }} />
          <span className="text-lg font-black tracking-widest text-foreground hidden sm:block">CHECKPOINT</span>
        </Link>
        <div className="flex items-center gap-4">
          {estadoSobre && (
            <span className="text-sm font-bold text-yellow-400">🪙 {estadoSobre.monedas}</span>
          )}
          <Link href="/homeRegistrado" className="text-sm text-foreground/50 hover:text-foreground transition-colors">← Volver</Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">

        <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">📦 Sobres</h1>

        {/* Mensaje feedback */}
        {mensaje && (
          <div className="px-4 py-3 rounded-xl bg-foreground/10 border border-foreground/20 text-sm text-foreground text-center">
            {mensaje}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-foreground/10">
          {["sobres", "inventario", "tienda"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold capitalize transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab ? "text-foreground border-foreground" : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {tab === "sobres" ? "📦 Sobres" : tab === "inventario" ? "🎒 Inventario" : "🛒 Tienda"}
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
              <div className="space-y-8">

                {/* Sobre diario */}
                <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-8 text-center space-y-4">
                  <h2 className="text-xl font-black text-foreground tracking-widest uppercase">Sobre diario</h2>

                  <div className={`w-32 h-40 mx-auto rounded-2xl border-2 flex items-center justify-center transition-all duration-300 ${
                    estadoSobre.puedeReclamar
                      ? "bg-yellow-400/10 border-yellow-400 shadow-lg shadow-yellow-400/20 cursor-pointer hover:scale-105"
                      : "bg-foreground/5 border-foreground/20 opacity-50"
                  }`}
                    onClick={() => estadoSobre.puedeReclamar && !abriendo && abrirSobre("diario")}
                  >
                    <span className="text-6xl">{estadoSobre.puedeReclamar ? "📦" : "🔒"}</span>
                  </div>

                  {estadoSobre.puedeReclamar ? (
                    <div className="space-y-3">
                      <p className="text-sm text-foreground/60">¡Tu sobre diario está listo!</p>
                      <button
                        onClick={() => !abriendo && abrirSobre("diario")}
                        disabled={abriendo}
                        className="px-8 py-3 rounded-xl font-bold text-background bg-yellow-400 hover:brightness-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                      >
                        {abriendo ? "Abriendo..." : "¡Abrir sobre!"}
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/50">
                      Próximo sobre en <span className="font-bold text-foreground">{estadoSobre.horasRestantes}h</span>
                    </p>
                  )}
                </div>

                {/* Sobres pendientes */}
                {estadoSobre.sobresPendientes > 0 && (
                  <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-6 text-center space-y-4">
                    <h2 className="text-lg font-black text-foreground tracking-widest uppercase">
                      Sobres pendientes
                    </h2>
                    <p className="text-4xl font-black text-foreground">{estadoSobre.sobresPendientes}</p>
                    <p className="text-xs text-foreground/40">Sobres de bienvenida sin abrir</p>
                    <button
                      onClick={() => !abriendo && abrirSobre("pendiente")}
                      disabled={abriendo}
                      className="px-8 py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
                    >
                      {abriendo ? "Abriendo..." : "Abrir sobre"}
                    </button>
                  </div>
                )}

                {/* Info probabilidades */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {Object.entries(RAREZA_CONFIG).map(([rareza, cfg]) => (
                    <div key={rareza} className={`${cfg.bg} border ${cfg.color} rounded-xl p-3 text-center`}>
                      <p className={`text-sm font-black ${cfg.texto}`}>{cfg.label}</p>
                      <p className="text-xs text-foreground/50 mt-1">
                        {rareza === "comun" ? "60%" : rareza === "raro" ? "25%" : rareza === "epico" ? "12%" : "3%"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB INVENTARIO ── */}
            {activeTab === "inventario" && (
              <div className="space-y-8">
                {inventario.length === 0 ? (
                  <div className="text-center py-16">
                    <p className="text-5xl mb-4">🎒</p>
                    <p className="text-foreground/40 text-sm">Tu inventario está vacío. ¡Abre sobres para conseguir items!</p>
                  </div>
                ) : (
                  <>
                    {avatares.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-foreground/50 tracking-widest uppercase mb-4">Avatares ({avatares.length})</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {avatares.map((item) => (
                            <ItemCard
                              key={item.id_item}
                              item={item}
                              equipado={avatarActivo === item.id_item}
                              onEquipar={equiparItem}
                              compacto
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {bordes.length > 0 && (
                      <div>
                        <h3 className="text-sm font-black text-foreground/50 tracking-widest uppercase mb-4">Bordes ({bordes.length})</h3>
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                          {bordes.map((item) => (
                            <ItemCard
                              key={item.id_item}
                              item={item}
                              equipado={bordeActivo === item.id_item}
                              onEquipar={equiparItem}
                              compacto
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── TAB TIENDA ── */}
            {activeTab === "tienda" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-foreground/50">Compra items directamente con monedas</p>
                  <span className="text-sm font-bold text-yellow-400">🪙 {estadoSobre?.monedas || 0}</span>
                </div>

                {tienda.length === 0 ? (
                  <p className="text-center text-foreground/40 py-10">No hay items disponibles en la tienda.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {tienda.map((item) => {
                      const loPosee = inventario.some(i => i.id_item === item.id_item);
                      const cfg     = RAREZA_CONFIG[item.rareza];
                      return (
                        <div key={item.id_item} className={`border-2 ${cfg.color} ${cfg.bg} rounded-2xl p-4 flex flex-col items-center gap-3`}>
                          <span className={`text-[10px] font-black uppercase ${cfg.texto}`}>{cfg.label}</span>
                          <div className="relative w-14 h-14 rounded-xl bg-background/50 flex items-center justify-center">
                            <Image src={item.imagen_url} alt={item.nombre} fill sizes="56px" className="object-contain p-1" onError={(e) => { e.target.style.display = "none"; }} />
                            <span className="text-2xl">{item.tipo === "avatar" ? "🎮" : "⭕"}</span>
                          </div>
                          <p className="text-xs font-bold text-foreground text-center">{item.nombre}</p>
                          <p className="text-xs text-yellow-400 font-black">🪙 {item.precio_monedas}</p>
                          {loPosee ? (
                            <span className="text-[10px] text-foreground/40 font-semibold">Ya lo tienes</span>
                          ) : (
                            <button
                              onClick={() => comprarItem(item.id_item)}
                              disabled={(estadoSobre?.monedas || 0) < item.precio_monedas}
                              className="w-full py-1.5 rounded-lg text-xs font-bold text-background bg-foreground hover:brightness-90 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              Comprar
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Animación apertura sobre */}
      {itemsObtenidos && (
        <AnimacionSobre
          items={itemsObtenidos}
          onCerrar={() => { setItemsObtenidos(null); cargarEstado(); }}
        />
      )}
    </div>
  );
}