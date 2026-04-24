"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 h-16 transition-all duration-300 ${
      scrolled ? "bg-background/70 backdrop-blur-xl border-b border-foreground/10" : "bg-background/50 backdrop-blur-sm border-b border-foreground/10"
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

        {/* Derecha — perfil + logout */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/perfil"
            className="flex items-center gap-2 bg-foreground/10 border border-foreground/20 rounded-xl px-3 py-1.5 hover:bg-foreground/20 hover:border-foreground/40 transition-all group"
          >
            <AvatarUsuario usuario={usuario} size={28} />
            <span className="text-xs font-bold text-foreground/70 group-hover:text-foreground hidden sm:block">
              Mi perfil
            </span>
          </Link>
          {onLogout && (
            <button
              onClick={onLogout}
              className="text-sm font-medium text-foreground/50 border border-foreground/20 px-4 py-1.5 rounded-lg hover:text-foreground hover:border-foreground/50 transition-all cursor-pointer"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </div>
  );
}