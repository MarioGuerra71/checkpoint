"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { notify } from "@/lib/notify";
import NavbarApp from "@/components/NavbarApp";

// ============= HELPERS =============

function formatFecha(fechaISO) {
  if (!fechaISO) return "";
  return new Date(fechaISO).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function renderMinerales(puntuacion, size = "text-base") {
  return Array.from({ length: 5 }, (_, i) => (
    <span
      key={i}
      className={`${size} ${i < puntuacion ? "opacity-100" : "opacity-20"}`}
    >
      💎
    </span>
  ));
}

// ============= MODAL RESEÑA/SESIÓN =============

function ModalAccion({ game, onClose, onSuccess }) {
  const [plataforma, setPlataforma] = useState("");
  const [activeTab, setActiveTab] = useState("resena");
  const [puntuacion, setPuntuacion] = useState(0);
  const [comentario, setComentario] = useState("");
  const [duracion, setDuracion] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().split("T")[0]);
  const [sesionComentario, setSesionComentario] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [usuarioActualId, setUsuarioActualId] = useState(null);

  const PLATAFORMAS = [
    { id: "PC", icon: "🖥️", label: "PC" },
    { id: "PS5", icon: "🎮", label: "PS5" },
    { id: "PS4", icon: "🎮", label: "PS4" },
    { id: "Xbox", icon: "🟢", label: "Xbox" },
    { id: "Switch", icon: "🕹️", label: "Switch" },
    { id: "Móvil", icon: "📱", label: "Móvil" },
  ];

  const [modo, setModo] = useState("solitario");
  const [idCompanero, setIdCompanero] = useState(null);
  const [amigos, setAmigos] = useState([]);

  useEffect(() => {
    fetch("/api/amigos")
      .then((r) => r.json())
      .then((data) => setAmigos(data.amigos || []))
      .catch(console.error);
  }, []);

  // Cerrar con Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleReseña = async () => {
    if (!puntuacion) {
      setError("Selecciona una puntuación");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/resenas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawg_game_id: game.id,
          puntuacion,
          comentario: comentario.trim() || null,
          plataforma: plataforma || null,
          modo,
          id_companero: idCompanero || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Si es 409 significa que ya existe — mensaje específico
        if (res.status === 409) {
          setError(
            "Ya tienes una reseña para este juego. Puedes editarla desde tu perfil.",
          );
        } else {
          throw new Error(data.error || "Error al guardar");
        }
        return;
      }
      onSuccess("reseña");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSesion = async () => {
    if (!duracion || !fecha) {
      setError("Rellena todos los campos");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/sesiones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawg_game_id: game.id,
          duracion_minutos: parseInt(duracion),
          fecha_sesion: fecha,
          comentario: sesionComentario,
          plataforma: plataforma || null,
          modo,
          id_companero: idCompanero || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar");
      onSuccess("sesión");
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-200 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        className="relative z-10 bg-background border border-foreground/20 rounded-2xl w-full max-w-md shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-foreground/10">
          <div className="flex items-center gap-3">
            {game.cover && (
              <div className="relative w-10 h-12 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={game.cover}
                  alt={game.title}
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </div>
            )}
            <div>
              <h3 className="text-sm font-black text-foreground leading-tight">
                {game.title}
              </h3>
              <p className="text-xs text-foreground/40">{game.genre}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground cursor-pointer text-xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-foreground/10">
          {["resena", "sesion"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setError("");
              }}
              className={`flex-1 py-2.5 text-sm font-semibold transition-all border-b-2 -mb-px cursor-pointer ${
                activeTab === tab
                  ? "text-foreground border-foreground"
                  : "text-foreground/40 border-transparent hover:text-foreground/70"
              }`}
            >
              {tab === "resena" ? "💎 Reseñar" : "⏱ Sesión"}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {/* ── TAB RESEÑA ── */}
          {activeTab === "resena" && (
            <>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
                  Puntuación
                </p>
                <div className="flex gap-2 justify-center">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      onClick={() => setPuntuacion(n)}
                      className={`text-2xl transition-all cursor-pointer hover:scale-110 ${n <= puntuacion ? "opacity-100" : "opacity-25"}`}
                    >
                      💎
                    </button>
                  ))}
                </div>
                {puntuacion > 0 && (
                  <p className="text-xs text-center text-foreground/40 mt-1">
                    {
                      [
                        "",
                        "Muy malo",
                        "Malo",
                        "Regular",
                        "Bueno",
                        "Obra maestra",
                      ][puntuacion]
                    }
                  </p>
                )}
              </div>

              <div>
                {/* Modo de juego */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    Modo de juego
                  </p>
                  <div className="flex gap-2 mb-3">
                    {["solitario", "cooperativo"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setModo(m);
                          if (m === "solitario") setIdCompanero(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                          modo === m
                            ? "bg-foreground text-background border-foreground"
                            : "bg-foreground/5 border-foreground/20 text-foreground/60 hover:border-foreground/40"
                        }`}
                      >
                        {m === "solitario" ? "🎮 Solitario" : "👥 Cooperativo"}
                      </button>
                    ))}
                  </div>

                  {/* Selector de compañero */}
                  {modo === "cooperativo" && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                        ¿Con quién jugaste?
                      </p>
                      {amigos.length === 0 ? (
                        <p className="text-xs text-foreground/40 italic">
                          No sigues a nadie aún.{" "}
                          <a
                            href="/mis-amigos"
                            className="underline hover:text-foreground"
                          >
                            Buscar amigos →
                          </a>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {amigos.map((a) => (
                            <button
                              key={a.id_usuario}
                              type="button"
                              onClick={() =>
                                setIdCompanero((prev) =>
                                  prev === a.id_usuario ? null : a.id_usuario,
                                )
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                idCompanero === a.id_usuario
                                  ? "bg-foreground text-background border-foreground"
                                  : "bg-foreground/5 border-foreground/20 text-foreground/60 hover:border-foreground/40"
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[9px] uppercase font-black">
                                {a.nombre_usuario?.[0]}
                              </div>
                              {a.nombre_usuario}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    ¿Dónde lo juegas?{" "}
                    <span className="text-foreground/30 font-normal normal-case">
                      (opcional)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PLATAFORMAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setPlataforma((prev) => (prev === p.id ? "" : p.id))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          plataforma === p.id
                            ? "bg-foreground text-background border-foreground"
                            : "bg-foreground/5 border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2 pt-3">
                  Comentario (opcional)
                </p>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="¿Qué te pareció el juego?"
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40 resize-none"
                />
              </div>
            </>
          )}

          {/* ── TAB SESIÓN ── */}
          {activeTab === "sesion" && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    Duración (min)
                  </p>
                  <input
                    type="number"
                    value={duracion}
                    onChange={(e) => setDuracion(e.target.value)}
                    placeholder="ej: 90"
                    min="1"
                    max="1440"
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40"
                  />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    Fecha
                  </p>
                  <input
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm focus:outline-none focus:border-foreground/40"
                  />
                </div>
              </div>

              <div>
                
                {/* Modo de juego */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    Modo de juego
                  </p>
                  <div className="flex gap-2 mb-3">
                    {["solitario", "cooperativo"].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          setModo(m);
                          if (m === "solitario") setIdCompanero(null);
                        }}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer capitalize ${
                          modo === m
                            ? "bg-foreground text-background border-foreground"
                            : "bg-foreground/5 border-foreground/20 text-foreground/60 hover:border-foreground/40"
                        }`}
                      >
                        {m === "solitario" ? "🎮 Solitario" : "👥 Cooperativo"}
                      </button>
                    ))}
                  </div>

                  {/* Selector de compañero */}
                  {modo === "cooperativo" && (
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                        ¿Con quién jugaste?
                      </p>
                      {amigos.length === 0 ? (
                        <p className="text-xs text-foreground/40 italic">
                          No sigues a nadie aún.{" "}
                          <a
                            href="/mis-amigos"
                            className="underline hover:text-foreground"
                          >
                            Buscar amigos →
                          </a>
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                          {amigos.map((a) => (
                            <button
                              key={a.id_usuario}
                              type="button"
                              onClick={() =>
                                setIdCompanero((prev) =>
                                  prev === a.id_usuario ? null : a.id_usuario,
                                )
                              }
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                                idCompanero === a.id_usuario
                                  ? "bg-foreground text-background border-foreground"
                                  : "bg-foreground/5 border-foreground/20 text-foreground/60 hover:border-foreground/40"
                              }`}
                            >
                              <div className="w-4 h-4 rounded-full bg-current/20 flex items-center justify-center text-[9px] uppercase font-black">
                                {a.nombre_usuario?.[0]}
                              </div>
                              {a.nombre_usuario}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                    ¿Dónde lo juegas?{" "}
                    <span className="text-foreground/30 font-normal normal-case">
                      (opcional)
                    </span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {PLATAFORMAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setPlataforma((prev) => (prev === p.id ? "" : p.id))
                        }
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                          plataforma === p.id
                            ? "bg-foreground text-background border-foreground"
                            : "bg-foreground/5 border-foreground/20 text-foreground/60 hover:border-foreground/40 hover:text-foreground"
                        }`}
                      >
                        <span>{p.icon}</span>
                        <span>{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2 pt-3">
                  Comentario (opcional)
                </p>
                <textarea
                  value={sesionComentario}
                  onChange={(e) => setSesionComentario(e.target.value)}
                  placeholder="¿Cómo fue la sesión?"
                  rows={2}
                  className="w-full px-4 py-2.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-sm placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40 resize-none"
                />
              </div>
            </>
          )}

          {/* Error */}
          {error && (
            <div className="px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Botón */}
          <button
            onClick={activeTab === "resena" ? handleReseña : handleSesion}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
                Guardando...
              </span>
            ) : activeTab === "resena" ? (
              "Guardar reseña"
            ) : (
              "Registrar sesión"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= PÁGINA PRINCIPAL =============
function BotonAnadirLista({ gameId, autenticado }) {
  const [listas, setListas] = useState([]);
  const [abierto, setAbierto] = useState(false);
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    if (!autenticado || !abierto) return;
    fetch("/api/listas")
      .then((r) => r.json())
      .then((data) => setListas(data.listas || []))
      .catch(console.error);
  }, [autenticado, abierto]);

  const añadirALista = async (id_lista) => {
    try {
      const res = await fetch("/api/listas/juegos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_lista, rawg_game_id: gameId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setFeedback("¡Añadido!");
      setTimeout(() => {
        setFeedback("");
        setAbierto(false);
      }, 1500);
    } catch (err) {
      setFeedback(err.message);
      setTimeout(() => setFeedback(""), 2000);
    }
  };

  if (!autenticado) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold bg-foreground/5 border border-foreground/15 text-foreground/70 hover:bg-foreground/10 hover:text-foreground hover:border-foreground/30 transition-all cursor-pointer group"
      >
        <span className="text-lg">📋</span>
        <div className="text-left flex-1">
          <p className="text-sm font-black leading-tight">Añadir a lista</p>
          <p className="text-[10px] opacity-60 font-normal">
            Guarda en una colección
          </p>
        </div>
        <span
          className={`text-foreground/40 transition-transform duration-200 ${abierto ? "rotate-180" : ""}`}
        >
          ▼
        </span>
      </button>

      {abierto && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-foreground/20 rounded-xl shadow-2xl z-50 overflow-hidden">
          {feedback ? (
            <p className="text-xs text-center py-3 text-green-400 font-bold">
              {feedback}
            </p>
          ) : listas.length === 0 ? (
            <div className="px-4 py-3 text-center">
              <p className="text-xs text-foreground/40">No tienes listas.</p>
              <Link
                href="/mis-listas"
                className="text-xs font-bold text-foreground/60 hover:text-foreground mt-1 block"
              >
                Crear una lista →
              </Link>
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto">
              {listas.map((lista) => (
                <button
                  key={lista.id_lista}
                  onClick={() => añadirALista(lista.id_lista)}
                  className="w-full text-left px-4 py-2.5 text-sm text-foreground hover:bg-foreground/10 transition-colors cursor-pointer border-b border-foreground/5 last:border-0 flex items-center justify-between"
                >
                  <span className="font-semibold">{lista.nombre_lista}</span>
                  <span className="text-foreground/30 text-xs">
                    {lista.total_juegos} juegos
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
function BotonFavorito({ gameId, autenticado }) {
  const [esFavorito, setEsFavorito] = useState(false);
  const [loading, setLoading] = useState(false);

  // Comprobar si ya es favorito al cargar
  useEffect(() => {
    if (!autenticado) return;
    fetch("/api/favoritos")
      .then((r) => r.json())
      .then((data) => {
        const ids = data.favoritos || [];
        setEsFavorito(ids.includes(gameId));
      })
      .catch(console.error);
  }, [autenticado, gameId]);

  const toggleFavorito = async () => {
    if (!autenticado || loading) return;
    setLoading(true);
    try {
      if (esFavorito) {
        await fetch(`/api/favoritos?gameId=${gameId}`, { method: "DELETE" });
        setEsFavorito(false);
      } else {
        await fetch("/api/favoritos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rawg_game_id: gameId }),
        });
        setEsFavorito(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!autenticado) return null;

  return (
    <button
      onClick={toggleFavorito}
      disabled={loading}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer border group ${
        esFavorito
          ? "bg-yellow-400/10 border-yellow-400/30 text-yellow-400 hover:bg-yellow-400/20"
          : "bg-foreground/5 border-foreground/15 text-foreground/70 hover:bg-foreground/10 hover:text-foreground hover:border-foreground/30"
      } disabled:opacity-60`}
    >
      <span className="text-lg">{esFavorito ? "⭐" : "☆"}</span>
      <div className="text-left flex-1">
        <p className="text-sm font-black leading-tight">
          {esFavorito ? "En favoritos" : "Añadir a favoritos"}
        </p>
        <p className="text-[10px] opacity-60 font-normal">
          {esFavorito ? "Pulsa para quitar" : "Guarda este juego"}
        </p>
      </div>
      {loading && (
        <span className="w-3 h-3 border border-current/30 border-t-current rounded-full animate-spin shrink-0" />
      )}
    </button>
  );
}

function SeccionComentarios({ resena, autenticado, usuarioActualId }) {
  const [comentarios, setComentarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  const cargarComentarios = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/comentarios?resenaId=${resena.id_resena}`);
      const data = await res.json();
      setComentarios(data.comentarios || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAbrir = () => {
    if (!abierto) cargarComentarios();
    setAbierto(!abierto);
  };

  const handleEnviar = async () => {
    if (!nuevoComentario.trim()) {
      setError("Escribe algo");
      return;
    }
    setEnviando(true);
    setError("");
    try {
      const res = await fetch("/api/comentarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_resena: resena.id_resena,
          contenido: nuevoComentario.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al enviar");
      setComentarios((prev) => [...prev, data.comentario]);
      setNuevoComentario("");
    } catch (err) {
      setError(err.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleEliminar = async (id_comentario) => {
    try {
      await fetch(`/api/comentarios?id=${id_comentario}`, { method: "DELETE" });
      setComentarios((prev) =>
        prev.filter((c) => c.id_comentario !== id_comentario),
      );
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="mt-3">
      {/* Botón mostrar/ocultar comentarios */}
      <button
        onClick={handleAbrir}
        className="text-xs text-foreground/40 hover:text-foreground/70 transition-colors cursor-pointer flex items-center gap-1"
      >
        <span>{abierto ? "▲" : "▼"}</span>
        <span>
          {abierto
            ? "Ocultar comentarios"
            : `Comentar${resena.total_comentarios > 0 ? ` (${resena.total_comentarios})` : ""}`}
        </span>
      </button>

      {abierto && (
        <div className="mt-3 space-y-3 pl-3 border-l-2 border-foreground/10">
          {/* Lista de comentarios */}
          {loading ? (
            <div className="h-8 rounded bg-foreground/5 animate-pulse" />
          ) : comentarios.length === 0 ? (
            <p className="text-xs text-foreground/30 italic">
              Aún no hay comentarios.
            </p>
          ) : (
            comentarios.map((c) => (
              <div
                key={c.id_comentario}
                className="flex items-start gap-2 group"
              >
                <Link
                  href={`/usuario/${c.nombre_usuario}`}
                  className="w-6 h-6 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-[10px] font-black text-foreground uppercase shrink-0 hover:border-foreground/40 transition-all"
                >
                  {c.nombre_usuario?.[0]}
                </Link>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <Link
                      href={`/usuario/${c.nombre_usuario}`}
                      className="text-xs font-bold text-foreground hover:text-foreground/70 transition-colors"
                    >
                      {c.nombre_usuario}
                    </Link>
                    <span className="text-[10px] text-foreground/30">
                      {new Date(c.fecha_comentario).toLocaleDateString(
                        "es-ES",
                        {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        },
                      )}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/70 mt-0.5 leading-relaxed">
                    {c.contenido}
                  </p>
                </div>
                {/* Botón eliminar solo si es el autor */}
                {autenticado && c.id_usuario === usuarioActualId && (
                  <button
                    onClick={() => handleEliminar(c.id_comentario)}
                    className="text-[10px] text-foreground/20 hover:text-red-400 transition-colors cursor-pointer opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    🗑️
                  </button>
                )}
              </div>
            ))
          )}

          {/* Input nuevo comentario */}
          {autenticado && (
            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={nuevoComentario}
                onChange={(e) => setNuevoComentario(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
                placeholder="Escribe un comentario..."
                maxLength={500}
                className="flex-1 px-3 py-1.5 rounded-lg border border-foreground/20 bg-foreground/5 text-foreground text-xs placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40"
              />
              <button
                onClick={handleEnviar}
                disabled={enviando}
                className="px-3 py-1.5 rounded-lg bg-foreground text-background text-xs font-bold hover:brightness-90 disabled:opacity-60 cursor-pointer transition-all"
              >
                {enviando ? "..." : "Enviar"}
              </button>
            </div>
          )}

          {error && <p className="text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  );
}

export default function JuegoPage({ params }) {
  const { id } = use(params);

  const [game, setGame] = useState(null);
  const [resenas, setResenas] = useState([]);
  const [loadingGame, setLoadingGame] = useState(true);
  const [loadingResenas, setLoadingResenas] = useState(true);
  const [autenticado, setAutenticado] = useState(false);
  const [usuarioActualId, setUsuarioActualId] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [exito, setExito] = useState("");

  const [usuarioNav, setUsuarioNav] = useState(null);

  // Comprobar si está logueado
  useEffect(() => {
    fetch("/api/usuario")
      .then((r) => r.json())
      .then((data) => {
        if (data.usuario) {
          setAutenticado(true);
          setUsuarioActualId(data.usuario.id);
          setUsuarioNav(data.usuario);
        }
      })
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    window.location.href = "/home";
  };
  
  // Cargar info del juego desde RAWG
  useEffect(() => {
    if (!id) return;
    let cancelled = false;

    async function fetchGame() {
      try {
        const res = await fetch(`/api/rawg?id=${id}`);
        const data = await res.json();
        if (!cancelled) setGame(data);
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setLoadingGame(false);
      }
    }

    fetchGame();
    return () => {
      cancelled = true;
    };
  }, [id]);

  // Cargar reseñas de la BD
  const cargarResenas = async () => {
    setLoadingResenas(true);
    try {
      const res = await fetch(`/api/resenas?gameId=${id}`);
      const data = await res.json();
      setResenas(data.resenas || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResenas(false);
    }
  };

  useEffect(() => {
    if (!id) return;
    cargarResenas();
  }, [id]);

  const handleSuccess = (tipo) => {
    notify.success(
      tipo === "reseña" ? "¡Reseña guardada!" : "¡Sesión registrada!",
      tipo === "reseña"
        ? "Tu reseña ha sido publicada correctamente."
        : "La sesión se ha añadido a tu diario.",
    );
    if (tipo === "reseña") cargarResenas();
  };

  if (loadingGame)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="w-10 h-10 border-2 border-foreground/30 border-t-foreground rounded-full animate-spin" />
      </div>
    );

  if (!game)
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-foreground/50">
        Juego no encontrado.
      </div>
    );

  return (
    <div className="min-h-screen pt-16 text-foreground">
      {/* ── NAVBAR ── */}
      <NavbarApp usuario={usuarioNav} onLogout={handleLogout}/>

      {/* ── HERO DEL JUEGO ── */}
      <section className="relative h-96 overflow-hidden">
        {game.cover && (
          <>
            <Image
              src={game.cover}
              alt={game.title}
              fill
              sizes="100vw"
              className="object-cover brightness-40"
            />
            <div className="absolute inset-0 bg-linear-to-t from-background via-background/60 to-transparent" />
          </>
        )}
        <div className="absolute bottom-0 left-0 right-0 px-8 pb-6 flex items-end gap-6">
          {/* Portada pequeña */}
          {game.cover && (
            <div className="relative w-48 h-28 rounded-xl overflow-hidden border-2 border-foreground/20 shadow-2xl shrink-0 hidden sm:block bg-background/50">
              <Image
                src={game.cover}
                alt={game.title}
                fill
                sizes="192px"
                className="object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-foreground/50 uppercase tracking-widest mb-1">
              {game.genre}
            </p>
            <h1 className="text-3xl font-black text-foreground leading-tight">
              {game.title}
            </h1>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {game.rating > 0 && (
                <span className="text-sm font-bold text-foreground">
                  ★ {game.rating}
                </span>
              )}
              {game.metacritic && (
                <span className="text-xs font-black text-green-400 bg-green-400/10 border border-green-400/30 px-2 py-0.5 rounded">
                  MC {game.metacritic}
                </span>
              )}
              {game.released && (
                <span className="text-xs text-foreground/40">
                  {game.released}
                </span>
              )}
              {game.playtime > 0 && (
                <span className="text-xs text-foreground/40">
                  ⏱ ~{game.playtime}h promedio
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENIDO ── */}
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        {/* Mensaje éxito */}
        {exito && (
          <div className="px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/30">
            <p className="text-green-400 text-sm font-medium text-center">
              {exito}
            </p>
          </div>
        )}

        {/* ── INFO + BOTONES ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Descripción */}
          <div className="lg:col-span-2 space-y-6">
            {game.description && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-3">
                  Descripción
                </h2>
                <p className="text-sm text-foreground/70 leading-relaxed">
                  {game.description}
                </p>
              </div>
            )}

            {game.genres?.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  Géneros
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.genres.map((g) => (
                    <span
                      key={g}
                      className="text-xs px-3 py-1 rounded-full bg-foreground/10 border border-foreground/20 text-foreground/70"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {game.platforms?.length > 0 && (
              <div>
                <h2 className="text-xs font-bold uppercase tracking-widest text-foreground/50 mb-2">
                  Plataformas
                </h2>
                <div className="flex flex-wrap gap-2">
                  {game.platforms.map((p) => (
                    <span
                      key={p}
                      className="text-xs px-3 py-1 rounded-full bg-foreground/5 border border-foreground/10 text-foreground/60"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Panel lateral */}
          <div className="space-y-3">
            {/* Desarrolladores */}
            {game.developers?.length > 0 && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">
                  Desarrollador
                </p>
                <p className="text-sm text-foreground/80">
                  {game.developers.join(", ")}
                </p>
              </div>
            )}

            {game.publishers?.length > 0 && (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-1">
                  Publisher
                </p>
                <p className="text-sm text-foreground/80">
                  {game.publishers.join(", ")}
                </p>
              </div>
            )}

            {/* ── BOTONES DE ACCIÓN ── */}
            {autenticado ? (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-widest text-foreground/40 mb-3">
                  Mis acciones
                </p>

                {/* Reseñar / Sesión */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all duration-200 cursor-pointer group"
                >
                  <span className="text-lg">💎</span>
                  <div className="text-left flex-1">
                    <p className="text-sm font-black leading-tight">
                      Reseñar / Sesión
                    </p>
                    <p className="text-[10px] opacity-60 font-normal">
                      Puntúa o registra tiempo jugado
                    </p>
                  </div>
                  <span className="text-foreground/60 group-hover:translate-x-0.5 transition-transform">
                    →
                  </span>
                </button>

                {/* Favorito */}
                <BotonFavorito
                  gameId={parseInt(id)}
                  autenticado={autenticado}
                />

                {/* Añadir a lista */}
                <BotonAnadirLista
                  gameId={parseInt(id)}
                  autenticado={autenticado}
                />
              </div>
            ) : (
              <div className="bg-foreground/5 border border-foreground/10 rounded-2xl p-5 text-center space-y-3">
                <p className="text-2xl">🎮</p>
                <p className="text-sm font-bold text-foreground/70">
                  ¿Ya juegas esto?
                </p>
                <p className="text-xs text-foreground/40">
                  Inicia sesión para reseñarlo, guardarlo en favoritos o
                  añadirlo a una lista.
                </p>
                <Link
                  href="/login"
                  className="block w-full py-2.5 rounded-xl font-bold text-background bg-foreground text-sm hover:brightness-90 transition-all"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/registro"
                  className="block w-full py-2 rounded-xl font-semibold text-foreground/60 bg-foreground/5 border border-foreground/15 text-sm hover:bg-foreground/10 transition-all"
                >
                  Crear cuenta gratis
                </Link>
              </div>
            )}

            {game.website && (
              <a
                href={game.website}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-semibold text-foreground/60 bg-foreground/5 border border-foreground/15 text-sm hover:bg-foreground/10 hover:text-foreground transition-all"
              >
                Web oficial ↗
              </a>
            )}
          </div>
        </div>
        {/* ── TRAILER ── */}
        <section>
          <div className="flex items-center gap-4 mb-5">
            <h2 className="text-xl font-black text-foreground tracking-widest uppercase">
              🎬 Trailer
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
          </div>

          {game.trailerUrl ? (
            <div
              className="relative w-full rounded-2xl overflow-hidden bg-black"
              style={{ paddingTop: "56.25%" }}
            >
              <video
                src={game.trailerUrl}
                controls
                poster={game.cover}
                className="absolute inset-0 w-full h-full object-contain"
              />
            </div>
          ) : (
            <a
              href={`https://www.youtube.com/results?search_query=${encodeURIComponent(`${game.title} official trailer`)}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-5 bg-foreground/5 border border-foreground/10 rounded-2xl p-5 hover:border-foreground/25 hover:bg-foreground/10 transition-all duration-200 group"
            >
              {/* Thumbnail del juego como preview */}
              {game.cover && (
                <div className="relative w-32 h-20 rounded-xl overflow-hidden shrink-0">
                  <Image
                    src={game.cover}
                    alt={game.title}
                    fill
                    sizes="128px"
                    className="object-cover brightness-75 group-hover:brightness-90 transition-all"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center shadow-lg">
                      <span className="text-white text-lg ml-0.5">▶</span>
                    </div>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-black text-foreground">
                  Ver trailer en YouTube
                </p>
                <p className="text-xs text-foreground/50 mt-1">
                  Buscar: &quot;{game.title} official trailer&quot;
                </p>
                <p className="text-xs text-foreground/30 mt-2 group-hover:text-foreground/50 transition-colors">
                  Abrir en YouTube ↗
                </p>
              </div>
            </a>
          )}
        </section>
        {/* ── RESEÑAS DE LA COMUNIDAD ── */}
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xl font-black text-foreground tracking-widest uppercase">
              Reseñas de la comunidad
            </h2>
            <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
            <span className="text-xs text-foreground/40">
              {resenas.length} reseñas
            </span>
          </div>

          {loadingResenas ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-2xl bg-foreground/5 border border-foreground/10 animate-pulse"
                />
              ))}
            </div>
          ) : resenas.length === 0 ? (
            <div className="text-center py-12 bg-foreground/5 border border-foreground/10 rounded-2xl">
              <p className="text-foreground/40 text-sm">
                Aún no hay reseñas para este juego.
              </p>
              {autenticado && (
                <button
                  onClick={() => setModalOpen(true)}
                  className="mt-3 text-sm font-bold text-foreground/60 hover:text-foreground transition-colors cursor-pointer"
                >
                  ¡Sé el primero en reseñarlo!
                </button>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {resenas.map((r) => (
                <div
                  key={r.id_resena}
                  className="bg-foreground/5 border border-foreground/10 rounded-2xl px-5 py-4 hover:border-foreground/20 transition-all duration-200"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/usuario/${r.nombre_usuario}`}
                        className="w-8 h-8 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-black text-foreground uppercase shrink-0 hover:border-foreground/40 transition-all"
                      >
                        {r.nombre_usuario?.[0] || "U"}
                      </Link>
                      <div>
                        <Link
                          href={`/usuario/${r.nombre_usuario}`}
                          className="text-sm font-bold text-foreground hover:text-foreground/70 transition-colors"
                        >
                          {r.nombre_usuario}
                        </Link>
                        <div className="flex gap-0.5 mt-0.5">
                          {renderMinerales(r.puntuacion, "text-sm")}
                        </div>
                        {r.companero_nombre && (
                          <p className="text-[10px] text-foreground/50 mt-1">
                            👥 Jugado con{" "}
                            <Link
                              href={`/usuario/${r.companero_nombre}`}
                              className="font-bold hover:text-foreground transition-colors"
                            >
                              {r.companero_nombre}
                            </Link>
                          </p>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-foreground/30 shrink-0">
                      {formatFecha(r.fecha_resena)}
                    </p>
                  </div>
                  {r.comentario && (
                    <p className="text-sm text-foreground/70 mt-3 leading-relaxed italic">
                      &quot;{r.comentario}&quot;
                    </p>
                  )}
                  <SeccionComentarios
                    resena={r}
                    autenticado={autenticado}
                    usuarioActualId={usuarioActualId}
                  />
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* ── MODAL ── */}
      {modalOpen && game && (
        <ModalAccion
          game={game}
          onClose={() => setModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
