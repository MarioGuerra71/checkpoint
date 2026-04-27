"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import PillNav from "@/components/PillNav";
import AvatarUsuario from "@/components/AvatarUsuario";

const NAV_ITEMS = [
  { href: "/homeRegistrado", label: "Inicio"    },
  { href: "/mis-listas",     label: "Listas"    },
  { href: "/mis-favoritos",  label: "Favoritos" },
  { href: "/mis-amigos",     label: "Amigos"    },
  { href: "/sobres",         label: "Sobres"    },
];

export default function NavbarApp({ usuario, onLogout, scrolled = false }) {
  const pathname    = usePathname();
  const router      = useRouter();
  const searchRef   = useRef(null);

  const [searchQuery, setSearchQuery]     = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchInput = async (value) => {
    setSearchQuery(value);
    if (value.trim().length < 2) { setSearchResults(null); return; }
    setSearchLoading(true);
    try {
      const res  = await fetch(`/api/buscar?q=${encodeURIComponent(value.trim())}`);
      const data = await res.json();
      setSearchResults(data);
    } catch (e) { console.error(e); }
    finally { setSearchLoading(false); }
  };

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled
        ? "bg-background/70 backdrop-blur-xl border-b border-foreground/10"
        : "bg-background/50 backdrop-blur-sm border-b border-foreground/10"
    }`}>
      <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between gap-4">

        {/* PillNav */}
        <div className="flex items-center shrink-0">
          <PillNav
            logo="/logotipo.png"
            logoAlt="CHECKPOINT"
            activeHref={pathname}
            baseColor="#22434C"
            pillColor="#00E3F6"
            hoveredPillTextColor="#ffffff"
            pillTextColor="#22434C"
            initialLoadAnimation={false}
            items={NAV_ITEMS}
          />
        </div>

        {/* Buscador central */}
        <div ref={searchRef} className="hidden lg:flex items-center flex-1 max-w-sm relative">
          <div className={`w-full flex items-center gap-2 bg-foreground/5 border rounded-xl px-4 py-2 transition-all ${
            searchFocused ? "border-foreground/40" : "border-foreground/15"
          }`}>
            <span className="text-foreground/30 text-sm">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchInput(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && searchQuery.trim().length >= 2) {
                  setSearchFocused(false);
                  router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`);
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
            <div className="absolute top-full left-0 right-0 mt-2 bg-background/95 backdrop-blur-xl border border-foreground/20 rounded-2xl shadow-2xl z-[100] overflow-hidden max-h-56 overflow-y-auto">
              {searchResults.usuarios?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 px-4 pt-3 pb-1">Usuarios</p>
                  {searchResults.usuarios.slice(0, 3).map((u) => (
                    <Link key={u.id_usuario} href={`/usuario/${u.nombre_usuario}`}
                      onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/10 transition-colors">
                      <div className="w-7 h-7 rounded-full bg-foreground/10 border border-foreground/20 flex items-center justify-center text-xs font-black text-foreground uppercase shrink-0">
                        {u.nombre_usuario?.[0]}
                      </div>
                      <span className="text-sm font-semibold text-foreground">{u.nombre_usuario}</span>
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.juegos?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-foreground/30 px-4 pt-3 pb-1">Juegos</p>
                  {searchResults.juegos.slice(0, 4).map((g) => (
                    <Link key={g.id} href={`/juego/${g.id}`}
                      onClick={() => { setSearchFocused(false); setSearchQuery(""); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-foreground/10 transition-colors">
                      <div className="relative w-8 h-10 rounded-lg overflow-hidden shrink-0 bg-foreground/10">
                        {g.cover && <Image src={g.cover} alt={g.title} fill sizes="32px" className="object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-foreground truncate">{g.title}</p>
                        <p className="text-xs text-foreground/40">{g.genre}</p>
                      </div>
                      {g.rating > 0 && <span className="text-xs text-foreground/40 shrink-0">★ {g.rating}</span>}
                    </Link>
                  ))}
                </div>
              )}
              {searchResults.usuarios?.length === 0 && searchResults.juegos?.length === 0 && (
                <p className="text-sm text-foreground/40 text-center py-6">Sin resultados</p>
              )}
              <div className="border-t border-foreground/10 px-4 py-2.5">
                <button onClick={() => { setSearchFocused(false); router.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`); }}
                  className="text-xs font-bold text-foreground/50 hover:text-foreground cursor-pointer w-full text-center">
                  Ver todos los resultados →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Perfil + logout */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/perfil"
            className="flex items-center gap-2 bg-foreground/10 border border-foreground/20 rounded-xl px-3 py-1.5 hover:bg-foreground/20 hover:border-foreground/40 transition-all group">
            <AvatarUsuario usuario={usuario} size={28} />
            <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground hidden sm:block">Mi perfil</span>
          </Link>
          {onLogout && (
            <button onClick={onLogout}
              className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all cursor-pointer">
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}