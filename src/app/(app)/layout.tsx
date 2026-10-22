import Link from "next/link";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/lib/auth/actions";
import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import { leerTema } from "@/lib/tema/config";
import { NavPrincipal } from "@/components/nav-principal";
import { TemaToggle } from "@/components/tema-toggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obtenerUsuarioDeSesion();

  if (!usuario) {
    redirect("/login");
  }

  const tema = await leerTema();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Link
              href="/tablero"
              className="mr-1 shrink-0 text-sm font-semibold tracking-tight sm:mr-3"
            >
              <span className="sm:hidden">Madrid</span>
              <span className="hidden sm:inline">
                Madrid Gestión de Comercio Internacional
              </span>
            </Link>
            <NavPrincipal />
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <TemaToggle temaInicial={tema} />
            <span
              title={usuario.email}
              className="hidden max-w-[14rem] truncate text-sm text-slate-500 sm:inline dark:text-slate-400"
            >
              {usuario.email}
            </span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg px-2 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100"
              >
                <span className="hidden sm:inline">Cerrar sesión</span>
                <span className="sm:hidden">Salir</span>
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
