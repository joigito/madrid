import Link from "next/link";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/lib/auth/actions";
import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import { leerTema } from "@/lib/tema/config";
import { leerTamano } from "@/lib/tema/config";
import { NavPrincipal } from "@/components/nav-principal";
import { TemaToggle } from "@/components/tema-toggle";
import { TamanoToggle } from "@/components/tamano-toggle";

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
  const tamano = await leerTamano();

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-brand-200 bg-white/95 backdrop-blur dark:border-brand-800 dark:bg-brand-900/95">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 sm:px-6">
          <Link
            href="/tablero"
            className="mr-1 flex shrink-0 items-center gap-2 text-sm font-semibold tracking-tight sm:mr-3"
          >
            <img
              src="/branding/logo.png"
              alt="Madrid"
              className="h-7 w-7 rounded-full object-cover"
            />
            <span className="sm:hidden">Madrid</span>
            <span className="hidden sm:inline">
              Madrid Gestión de Comercio Internacional
            </span>
          </Link>

          {/* En pantallas chicas la navegación baja a su propia línea. */}
          <div className="order-3 w-full min-w-0 sm:order-none sm:w-auto">
            <NavPrincipal />
          </div>

          <div className="ml-auto flex items-center gap-1 sm:gap-2">
            <TemaToggle temaInicial={tema} />
            <TamanoToggle tamanoInicial={tamano} />
            <span
              title={usuario.email}
              className="hidden max-w-[14rem] truncate text-sm text-brand-500 sm:inline dark:text-brand-400"
            >
              {usuario.email}
            </span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="rounded-lg px-2 py-3 text-sm font-medium text-brand-600 transition hover:bg-brand-100 hover:text-brand-900 dark:text-brand-400 dark:hover:bg-brand-800 dark:hover:text-brand-100"
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
