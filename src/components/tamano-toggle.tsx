"use client";

import { useTransition } from "react";

import { ETIQUETA_TAMANO, TAMANOS, type Tamano } from "@/lib/tema/constantes";

export function TamanoToggle({ tamanoInicial }: { tamanoInicial: Tamano }) {
  const [pendiente, startTransition] = useTransition();

  function cambiar() {
    const idx = TAMANOS.indexOf(tamanoInicial);
    const siguiente = TAMANOS[(idx + 1) % TAMANOS.length];
    startTransition(async () => {
      await fetch("/api/tamano", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tamano: siguiente }),
      });
      window.location.reload();
    });
  }

  return (
    <button
      type="button"
      onClick={cambiar}
      disabled={pendiente}
      aria-label="Cambiar tamaño de texto"
      className="rounded-lg px-2 py-2 text-sm font-bold text-brand-600 transition hover:bg-brand-100 hover:text-brand-900 disabled:opacity-60 dark:text-brand-400 dark:hover:bg-brand-800 dark:hover:text-brand-100"
    >
      {ETIQUETA_TAMANO[tamanoInicial]}
    </button>
  );
}
