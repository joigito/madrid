"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  function saltar() {
    router.replace("/tablero");
  }

  return (
    <main
      onClick={saltar}
      className="flex min-h-screen cursor-pointer flex-col items-center justify-center gap-6 bg-brand-50 px-6 text-center dark:bg-brand-950"
    >
      <img
        src="/branding/logo.png"
        alt="Madrid"
        className="h-36 w-36 rounded-full object-cover shadow-2xl ring-4 ring-brand-200 dark:ring-brand-700"
      />
      <div>
        <h1 className="text-3xl font-bold text-brand-900 dark:text-brand-100">
          Madrid
        </h1>
        <p className="mt-1 text-base text-brand-600 dark:text-brand-400">
          Gestión de Comercio Internacional
        </p>
      </div>
      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-xs uppercase tracking-wide text-brand-400 dark:text-brand-500">
          Presentado en
        </p>
        <img
          src="/branding/instituto.png"
          alt="Instituto Superior General San Martín"
          className="h-16 w-16 rounded-full object-cover shadow-md"
        />
        <p className="text-sm font-medium text-brand-700 dark:text-brand-300">
          Instituto Superior &quot;General San Martín&quot;
        </p>
      </div>
      <p className="mt-8 text-xs text-brand-400 dark:text-brand-500">
        Tocá para continuar
      </p>
    </main>
  );
}
