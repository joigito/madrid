import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import type { Contacto } from "@/lib/domain/types";
import { formatearFecha } from "@/lib/fechas";
import {
  calcularSemaforo,
  CLASES_SEMAFORO,
  ETIQUETA_SEMAFORO,
  diasHasta,
} from "@/lib/domain/vencimientos";
import { actualizarEtapa, toggleEtapa } from "@/lib/operaciones/actions";
import { obtenerOperacionPorId } from "@/lib/operaciones/queries";

export default async function OperacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const data = obtenerOperacionPorId(usuario.id, id);

  if (!data) notFound();

  const { operacion, etapas, proveedor, cliente } = data;
  const completadas = etapas.filter((etapa) => etapa.completada).length;
  const progreso = etapas.length
    ? Math.round((completadas / etapas.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <Link
        href="/tablero"
        className="text-sm font-medium text-brand-500 transition hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-100"
      >
        ← Volver al tablero
      </Link>

      <header className="mt-4 rounded-xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-700 dark:bg-brand-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-brand-900 dark:text-brand-100">
              {operacion.descripcion}
            </h1>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-brand-600 sm:grid-cols-4 dark:text-brand-400">
              <Info etiqueta="Referencia" valor={operacion.referencia ?? "—"} />
              <Info etiqueta="Proveedor" valor={proveedor?.nombre ?? "—"} />
              <Info etiqueta="Cliente" valor={cliente?.nombre ?? "—"} />
              <Info etiqueta="Origen" valor={operacion.pais_origen ?? "—"} />
              <Info etiqueta="Incoterm" valor={operacion.incoterm ?? "—"} />
            </dl>
            {(proveedor || cliente) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <FichaContacto etiqueta="Proveedor" contacto={proveedor} />
                <FichaContacto etiqueta="Cliente" contacto={cliente} />
              </div>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-brand-900 dark:text-brand-100">{progreso}%</p>
            <p className="text-xs text-brand-500 dark:text-brand-400">
              {completadas} de {etapas.length} etapas
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-brand-100 dark:bg-brand-800">
          <div
            className="h-full rounded-full bg-brand-900 transition-all dark:bg-brand-100"
            style={{ width: `${progreso}%` }}
          />
        </div>
      </header>

      <ol className="mt-8 space-y-3">
        {etapas.map((etapa, indice) => {
          const sem = calcularSemaforo(etapa);
          const dias = etapa.fecha_limite ? diasHasta(etapa.fecha_limite) : null;

          return (
            <li
              key={etapa.id}
              className={`rounded-xl border bg-white p-4 shadow-sm dark:border-brand-700 dark:bg-brand-900 ${
                etapa.completada ? "border-brand-200 opacity-70" : "border-brand-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    etapa.completada
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                      : "bg-brand-100 text-brand-600 dark:bg-brand-800 dark:text-brand-400"
                  }`}
                >
                  {etapa.completada ? "✓" : indice + 1}
                </span>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2
                      className={`text-sm font-semibold ${
                        etapa.completada
                          ? "text-brand-500 line-through dark:text-brand-500"
                          : "text-brand-900 dark:text-brand-100"
                      }`}
                    >
                      {etapa.nombre}
                    </h2>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASES_SEMAFORO[sem]}`}
                    >
                      {ETIQUETA_SEMAFORO[sem]}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-500 dark:text-brand-400 dark:text-brand-400">
                    <span>
                      Organismo:{" "}
                      {etapa.organismo ? (
                        etapa.url ? (
                          <a
                            href={etapa.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-brand-700 underline decoration-brand-300 hover:decoration-brand-500 dark:text-brand-300 dark:decoration-brand-600 dark:hover:decoration-brand-400"
                          >
                            {etapa.organismo}
                          </a>
                        ) : (
                          <span className="font-medium text-brand-700 dark:text-brand-300">
                            {etapa.organismo}
                          </span>
                        )
                      ) : (
                        "—"
                      )}
                    </span>
                    <span>Límite: {formatearFecha(etapa.fecha_limite)}</span>
                    {dias !== null && !etapa.completada ? (
                      <span
                        className={
                          dias < 0
                            ? "font-medium text-red-600 dark:text-red-400"
                            : dias <= 3
                              ? "font-medium text-amber-600 dark:text-amber-400"
                              : ""
                        }
                      >
                        {textoDias(dias)}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-3">
                    <form action={toggleEtapa}>
                      <input type="hidden" name="etapaId" value={etapa.id} />
                      <input
                        type="hidden"
                        name="completada"
                        value={(!etapa.completada).toString()}
                      />
                      <button
                        type="submit"
                        className="rounded-lg border border-brand-300 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:bg-brand-50 dark:border-brand-600 dark:text-brand-300 dark:hover:bg-brand-800"
                      >
                        {etapa.completada ? "Reabrir etapa" : "Marcar completada"}
                      </button>
                    </form>

                    <details className="group">
                      <summary className="cursor-pointer list-none text-xs font-medium text-brand-500 transition hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-100">
                        Editar etapa
                      </summary>
                      <form
                        action={actualizarEtapa}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <input type="hidden" name="etapaId" value={etapa.id} />
                        <label className="text-xs font-medium text-brand-600 dark:text-brand-400">
                          Fecha límite
                          <input
                            type="date"
                            name="fecha_limite"
                            defaultValue={etapa.fecha_limite ?? ""}
                            className="mt-1 w-full rounded-lg border border-brand-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-100 dark:focus:border-brand-400"
                          />
                        </label>
                        <label className="text-xs font-medium text-brand-600 dark:text-brand-400">
                          Organismo
                          <input
                            name="organismo"
                            defaultValue={etapa.organismo ?? ""}
                            className="mt-1 w-full rounded-lg border border-brand-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-100 dark:focus:border-brand-400"
                          />
                        </label>
                        <label className="text-xs font-medium text-brand-600 dark:text-brand-400">
                          Link
                          <input
                            name="url"
                            defaultValue={etapa.url ?? ""}
                            className="mt-1 w-full rounded-lg border border-brand-300 px-2 py-1.5 text-sm outline-none focus:border-brand-500 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-100 dark:focus:border-brand-400"
                          />
                        </label>
                        <div className="sm:col-span-3">
                          <button
                            type="submit"
                            className="rounded-lg bg-brand-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-brand-800 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-white"
                          >
                            Guardar cambios
                          </button>
                        </div>
                      </form>
                    </details>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function Info({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-brand-400 dark:text-brand-500">
        {etiqueta}
      </dt>
      <dd className="text-brand-700 dark:text-brand-300">{valor}</dd>
    </div>
  );
}

function FichaContacto({
  etiqueta,
  contacto,
}: {
  etiqueta: string;
  contacto: Contacto | null;
}) {
  if (!contacto) return null;

  const datos = [
    contacto.pais,
    contacto.email,
    contacto.telefono,
    contacto.cuit ? `CUIT ${contacto.cuit}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="rounded-lg border border-brand-200 bg-brand-50 p-3 dark:border-brand-700 dark:bg-brand-800/50">
      <p className="text-xs uppercase tracking-wide text-brand-400 dark:text-brand-500">
        {etiqueta}
      </p>
      <p className="mt-0.5 text-sm font-medium text-brand-900 dark:text-brand-100">
        {contacto.nombre}
      </p>
      {datos && (
        <p className="mt-0.5 text-xs text-brand-500 dark:text-brand-400">
          {datos}
        </p>
      )}
    </div>
  );
}

function textoDias(dias: number): string {
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} día(s)`;
  if (dias === 0) return "Vence hoy";
  return `Vence en ${dias} día(s)`;
}
