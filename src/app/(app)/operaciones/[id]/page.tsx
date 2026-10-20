import Link from "next/link";
import { notFound } from "next/navigation";

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
  const data = await obtenerOperacionPorId(id);

  if (!data) notFound();

  const { operacion, etapas } = data;
  const completadas = etapas.filter((etapa) => etapa.completada).length;
  const progreso = etapas.length
    ? Math.round((completadas / etapas.length) * 100)
    : 0;

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      <Link
        href="/tablero"
        className="text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        ← Volver al tablero
      </Link>

      <header className="mt-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {operacion.descripcion}
            </h1>
            <dl className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-4">
              <Info etiqueta="Referencia" valor={operacion.referencia ?? "—"} />
              <Info etiqueta="Proveedor" valor={operacion.proveedor ?? "—"} />
              <Info etiqueta="Origen" valor={operacion.pais_origen ?? "—"} />
              <Info etiqueta="Incoterm" valor={operacion.incoterm ?? "—"} />
            </dl>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold text-slate-900">{progreso}%</p>
            <p className="text-xs text-slate-500">
              {completadas} de {etapas.length} etapas
            </p>
          </div>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-900 transition-all"
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
              className={`rounded-xl border bg-white p-4 shadow-sm ${
                etapa.completada ? "border-slate-200 opacity-70" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-4">
                <span
                  className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                    etapa.completada
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {etapa.completada ? "✓" : indice + 1}
                </span>

                <div className="flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2
                      className={`text-sm font-semibold ${
                        etapa.completada
                          ? "text-slate-500 line-through"
                          : "text-slate-900"
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

                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Organismo:{" "}
                      {etapa.organismo ? (
                        etapa.url ? (
                          <a
                            href={etapa.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-slate-700 underline decoration-slate-300 hover:decoration-slate-500"
                          >
                            {etapa.organismo}
                          </a>
                        ) : (
                          <span className="font-medium text-slate-700">
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
                            ? "font-medium text-red-600"
                            : dias <= 3
                              ? "font-medium text-amber-600"
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
                        className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                      >
                        {etapa.completada ? "Reabrir etapa" : "Marcar completada"}
                      </button>
                    </form>

                    <details className="group">
                      <summary className="cursor-pointer list-none text-xs font-medium text-slate-500 transition hover:text-slate-900">
                        Editar etapa
                      </summary>
                      <form
                        action={actualizarEtapa}
                        className="mt-3 grid gap-3 sm:grid-cols-3"
                      >
                        <input type="hidden" name="etapaId" value={etapa.id} />
                        <label className="text-xs font-medium text-slate-600">
                          Fecha límite
                          <input
                            type="date"
                            name="fecha_limite"
                            defaultValue={etapa.fecha_limite ?? ""}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                          />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Organismo
                          <input
                            name="organismo"
                            defaultValue={etapa.organismo ?? ""}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                          />
                        </label>
                        <label className="text-xs font-medium text-slate-600">
                          Link
                          <input
                            name="url"
                            defaultValue={etapa.url ?? ""}
                            className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-sm outline-none focus:border-slate-500"
                          />
                        </label>
                        <div className="sm:col-span-3">
                          <button
                            type="submit"
                            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800"
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
      <dt className="text-xs uppercase tracking-wide text-slate-400">
        {etiqueta}
      </dt>
      <dd className="text-slate-700">{valor}</dd>
    </div>
  );
}

function textoDias(dias: number): string {
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} día(s)`;
  if (dias === 0) return "Vence hoy";
  return `Vence en ${dias} día(s)`;
}
