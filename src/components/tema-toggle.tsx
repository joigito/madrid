"use client";

import { useState } from "react";

import { COOKIE_TEMA, type Tema } from "@/lib/tema/constantes";

const UN_ANIO = 60 * 60 * 24 * 365;

export function TemaToggle({ temaInicial }: { temaInicial: Tema }) {
  const [tema, setTema] = useState<Tema>(temaInicial);
  const destino: Tema = tema === "oscuro" ? "claro" : "oscuro";

  function alternar() {
    setTema(destino);
    document.documentElement.classList.toggle("dark", destino === "oscuro");

    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${COOKIE_TEMA}=${destino}; path=/; max-age=${UN_ANIO}; samesite=lax${secure}`;
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-label={`Cambiar a modo ${destino}`}
      title={`Cambiar a modo ${destino}`}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100 hover:text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
    >
      {tema === "oscuro" ? <IconoSol /> : <IconoLuna />}
    </button>
  );
}

function IconoLuna() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </svg>
  );
}

function IconoSol() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
    </svg>
  );
}
