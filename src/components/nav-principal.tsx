"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/tablero", texto: "Tablero" },
  { href: "/contactos", texto: "Contactos" },
];

export function NavPrincipal() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-1">
      {ENLACES.map(({ href, texto }) => {
        const activo = pathname === href || pathname.startsWith(`${href}/`);

        return (
          <Link
            key={href}
            href={href}
            aria-current={activo ? "page" : undefined}
            className={`rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
              activo
                ? "bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
            }`}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
