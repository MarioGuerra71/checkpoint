"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function BuscarPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const inputRef = useRef(null);

  const queryInicial = searchParams.get("q") || "";

  const [query, setQuery] = useState(queryInicial);
  const [juegos, setJuegos] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [buscado, setBuscado] = useState(false);

  // Si hay query en la URL al cargar, buscar automáticamente
  useEffect(() => {
    if (queryInicial) buscar(queryInicial);
    inputRef.current?.focus();
  }, []);

  const buscar = async (q = query) => {
    const termino = q.trim();
    if (termino.length < 2) {
      setError("Escribe al menos 2 caracteres");
      return;
    }

    setLoading(true);
    setError("");
    setBuscado(true);

    // Actualiza la URL sin recargar
    router.replace(`/buscar?q=${encodeURIComponent(termino)}`, {
      scroll: false,
    });

    try {
      const res = await fetch(`/api/buscar?q=${encodeURIComponent(termino)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al buscar");
      setJuegos(data.juegos || []);
      setUsuarios(data.usuarios || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === "Enter") buscar();
  };

  const totalResultados = juegos.length + usuarios.length;

  return (
    <div className="min-h-screen bg-background text-foreground">
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
        <Link
          href="/homeRegistrado"
          className="text-sm text-foreground/50 hover:text-foreground transition-colors"
        >
          ← Volver
        </Link>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12 space-y-10">
        {/* ── BARRA DE BÚSQUEDA ── */}
        <div className="space-y-3">
          <h1 className="text-3xl font-black text-foreground tracking-widest uppercase">
            Buscar
          </h1>
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Busca un juego o usuario..."
              className="flex-1 px-5 py-3 rounded-xl border border-foreground/20 bg-foreground/5 text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-foreground/40 text-sm"
            />
            <button
              onClick={() => buscar()}
              disabled={loading}
              className="px-6 py-3 rounded-xl font-bold text-background bg-foreground hover:brightness-90 active:scale-95 transition-all duration-200 disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin inline-block" />
              ) : (
                "Buscar"
              )}
            </button>
          </div>

          {/* Error */}
          {error && <p className="text-sm text-red-400">{error}</p>}

          {/* Resumen resultados */}
          {buscado && !loading && (
            <p className="text-xs text-foreground/40">
              {totalResultados === 0
                ? `Sin resultados para "${query}"`
                : `${totalResultados} resultado${totalResultados !== 1 ? "s" : ""} para "${query}"`}
            </p>
          )}
        </div>

        {/* ── RESULTADOS USUARIOS ── */}
        {usuarios.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-lg font-black text-foreground tracking-widest uppercase">
                Usuarios
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
              <span className="text-xs text-foreground/40">
                {usuarios.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {usuarios.map((u) => (
                <Link
                  key={u.id_usuario}
                  href={`/usuario/${u.nombre_usuario}`}
                  className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-sm font-black text-foreground uppercase shrink-0">
                    {u.nombre_usuario?.[0] || "U"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-foreground">
                      {u.nombre_usuario}
                    </p>
                    <p className="text-xs text-foreground/40">
                      Usuario de CHECKPOINT
                    </p>
                  </div>
                  <span className="text-foreground/30 text-sm">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── RESULTADOS JUEGOS ── */}
        {juegos.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-5">
              <h2 className="text-lg font-black text-foreground tracking-widest uppercase">
                Juegos
              </h2>
              <div className="flex-1 h-px bg-linear-to-r from-foreground/20 to-transparent" />
              <span className="text-xs text-foreground/40">
                {juegos.length}
              </span>
            </div>
            <div className="flex flex-col gap-3">
              {juegos.map((g) => (
                <Link
                  key={g.id}
                  href={`/juego/${g.id}`}
                  className="flex items-center gap-4 bg-foreground/5 border border-foreground/10 rounded-2xl px-4 py-3 hover:bg-foreground/10 hover:border-foreground/20 transition-all duration-200 group"
                >
                  {/* Cover */}
                  <div className="relative w-14 h-16 rounded-xl overflow-hidden shrink-0 bg-foreground/10">
                    {g.cover && (
                      <Image
                        src={g.cover}
                        alt={g.title}
                        fill
                        sizes="56px"
                        className="object-cover group-hover:brightness-75 transition-all duration-200"
                      />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground truncate">
                      {g.title}
                    </p>
                    <p className="text-xs text-foreground/50 mt-0.5">
                      {g.genre}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {g.rating > 0 && (
                        <span className="text-xs text-foreground/60">
                          ★ {g.rating}
                        </span>
                      )}
                      {g.metacritic && (
                        <span className="text-xs font-black text-green-400">
                          MC {g.metacritic}
                        </span>
                      )}
                      {g.released && (
                        <span className="text-xs text-foreground/30">
                          {g.released}
                        </span>
                      )}
                    </div>
                  </div>

                  <span className="text-foreground/30 text-sm shrink-0">→</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── ESTADO VACÍO INICIAL ── */}
        {!buscado && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">🔍</p>
            <p className="text-foreground/40 text-sm">
              Busca juegos por nombre o encuentra otros usuarios
            </p>
          </div>
        )}

        {/* ── SIN RESULTADOS ── */}
        {buscado && !loading && totalResultados === 0 && (
          <div className="text-center py-16">
            <p className="text-5xl mb-4">😕</p>
            <p className="text-foreground/50 text-sm">
              No encontramos nada para <strong>&quot;{query}&quot;</strong>
            </p>
            <p className="text-foreground/30 text-xs mt-2">
              Prueba con otro término
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
