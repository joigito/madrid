import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import { semaforoOperacion, CLASES_SEMAFORO, ETIQUETA_SEMAFORO } from "@/lib/domain/vencimientos";
import { formatearFecha } from "@/lib/fechas";
import { contactosParaSelector } from "@/lib/contactos/queries";
import { crearOperacion } from "@/lib/operaciones/actions";
import { obtenerOperacionesDelUsuario } from "@/lib/operaciones/queries";

const CLASE_LABEL = "block text-sm font-medium text-brand-700 dark:text-brand-300";
const CLASE_INPUT =
  "mt-1 w-full rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-100 dark:focus:border-brand-400 dark:focus:ring-brand-700";

export default async function TableroPage() {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const operaciones = obtenerOperacionesDelUsuario(usuario.id);
  const proveedores = contactosParaSelector(usuario.id, "proveedor");
  const clientes = contactosParaSelector(usuario.id, "cliente");

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Mi tablero</h1>
          <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
            Seguimiento de operaciones, etapas, organismos y vencimientos.
          </p>
        </div>
        <Link
          href="#nueva-operacion"
          className="rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-brand-800 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-white"
        >
          Nueva operación
        </Link>
      </header>

      <section className="mt-8">
        {operaciones.length === 0 ? (
          <div className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center dark:border-brand-700 dark:bg-brand-900">
            <p className="text-brand-600 dark:text-brand-400">
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
                  className="flex flex-col gap-3 rounded-xl border border-brand-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-brand-700 dark:bg-brand-900"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                        {op.descripcion}
                      </p>
                      <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
                        Ref.: {op.referencia ?? "—"} • Inicio: {formatearFecha(op.fecha_inicio)}
                      </p>
                      {(op.proveedor_nombre || op.cliente_nombre) && (
                        <p className="mt-1 truncate text-xs text-brand-500 dark:text-brand-400">
                          {op.proveedor_nombre ?? "Sin proveedor"}
                          {op.cliente_nombre ? ` → ${op.cliente_nombre}` : ""}
                        </p>
                      )}
                    </div>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${CLASES_SEMAFORO[sem]}`}
                    >
                      {ETIQUETA_SEMAFORO[sem]}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-brand-500 dark:text-brand-400">
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
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-700 dark:bg-brand-900">
          <header className="mb-4">
            <h2 className="text-base font-semibold">Crear nueva operación (Importación)</h2>
            <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
              Se copian automáticamente las 7 etapas con sus organismos, links y
              fechas límite sugeridas (editables después).
            </p>
          </header>
          <form action={crearOperacion} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={CLASE_LABEL}>
                Descripción *
              </label>
              <input
                name="descripcion"
                required
                placeholder="Ej. Importación de insumos industriales"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>
                Referencia
              </label>
              <input
                name="referencia"
                placeholder="IMP-2026-001"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>
                Fecha de inicio
              </label>
              <input
                type="date"
                name="fecha_inicio"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>Proveedor</label>
              <select name="proveedor_contacto_id" className={CLASE_INPUT}>
                <option value="">Sin asignar</option>
                {proveedores.map((contacto) => (
                  <option key={contacto.id} value={contacto.id}>
                    {contacto.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={CLASE_LABEL}>Cliente</label>
              <select name="cliente_contacto_id" className={CLASE_INPUT}>
                <option value="">Sin asignar</option>
                {clientes.map((contacto) => (
                  <option key={contacto.id} value={contacto.id}>
                    {contacto.nombre}
                  </option>
                ))}
              </select>
            </div>
            {proveedores.length === 0 && clientes.length === 0 && (
              <p className="text-xs text-brand-500 sm:col-span-2 dark:text-brand-400">
                Todavía no cargaste contactos.{" "}
                <Link href="/contactos" className="font-medium underline">
                  Podés cargarlos acá
                </Link>{" "}
                y después elegirlos en la operación.
              </p>
            )}
            <div>
              <label className={CLASE_LABEL}>
                País de origen
              </label>
              <input
                name="pais_origen"
                className={CLASE_INPUT}
              />
            </div>
            <div>
              <label className={CLASE_LABEL}>
                Incoterm
              </label>
              <input
                name="incoterm"
                placeholder="FOB / CIF / DDP"
                className={CLASE_INPUT}
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-white"
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
