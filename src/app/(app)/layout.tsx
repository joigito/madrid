import Link from "next/link";
import { redirect } from "next/navigation";

import { cerrarSesion } from "@/lib/auth/actions";
import { obtenerUsuarioDeSesion } from "@/lib/auth/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const usuario = await obtenerUsuarioDeSesion();

  if (!usuario) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-3">
          <Link href="/tablero" className="text-sm font-semibold tracking-tight">
            Madrid Gestión de Comercio Internacional
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-500">{usuario.email}</span>
            <form action={cerrarSesion}>
              <button
                type="submit"
                className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
    </div>
  );
}
