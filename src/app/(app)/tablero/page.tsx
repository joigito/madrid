import Link from "next/link";

import { semaforoOperacion, CLASES_SEMAFORO, ETIQUETA_SEMAFORO } from "@/lib/domain/vencimientos";
import { formatearFecha } from "@/lib/fechas";
import { crearOperacion } from "@/lib/operaciones/actions";
import { obtenerOperacionesDelUsuario } from "@/lib/operaciones/queries";

export default async function TableroPage() {
  const operaciones = await obtenerOperacionesDelUsuario();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Mi tablero</h1>
          <p className="mt-1 text-sm text-slate-600">
            Seguimiento de operaciones, etapas, organismos y vencimientos.
          </p>
        </div>
        <Link
          href="#nueva-operacion"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          Nueva operación
        </Link>
      </header>

      <section className="mt-8">
        {operaciones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-600">
              No tenés operaciones aún. Creá la primera para empezar a seguir
              vencimientos y organismos.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {operaciones.map((op) => {
              const sem = semaforoOperacion(op.etapas_operacion);
              return (
                <Link
                  key={op.id}
                  href={`/operaciones/${op.id}`}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {op.descripcion}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Ref.: {op.referencia ?? "—"} • Inicio: {formatearFecha(op.fecha_inicio)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASES_SEMAFORO[sem]}`}
                    >
                      {ETIQUETA_SEMAFORO[sem]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{op.etapas_operacion.length} etapas</span>
                    <span>
                      {op.etapas_operacion.filter((e) => e.completada).length} completadas
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section id="nueva-operacion" className="mt-10">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <header className="mb-4">
            <h2 className="text-base font-semibold">Crear nueva operación (Importación)</h2>
            <p className="mt-1 text-sm text-slate-600">
              Se copian automáticamente las 7 etapas con sus organismos, links y
              fechas límite sugeridas (editables después).
            </p>
          </header>
          <form action={crearOperacion} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-slate-700">
                Descripción *
              </label>
              <input
                name="descripcion"
                required
                placeholder="Ej. Importación de insumos industriales"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Referencia
              </label>
              <input
                name="referencia"
                placeholder="IMP-2026-001"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Fecha de inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Proveedor
              </label>
              <input
                name="proveedor"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                País de origen
              </label>
              <input
                name="pais_origen"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Incoterm
              </label>
              <input
                name="incoterm"
                placeholder="FOB / CIF / DDP"
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                Crear operación y cargar etapas
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
