"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ENLACES = [
  { href: "/tablero", texto: "Tablero" },
  { href: "/contactos", texto: "Contactos" },
  { href: "/recursos", texto: "Recursos" },
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
                ? "bg-brand-900 text-white dark:bg-brand-100 dark:text-brand-900"
                : "text-brand-600 hover:bg-brand-100 hover:text-brand-900 dark:text-brand-400 dark:hover:bg-brand-800 dark:hover:text-brand-100"
            }`}
          >
            {texto}
          </Link>
        );
      })}
    </nav>
  );
}
