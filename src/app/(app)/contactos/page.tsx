import Link from "next/link";
import { redirect } from "next/navigation";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import {
  actualizarContacto,
  archivarContacto,
  crearContacto,
} from "@/lib/contactos/actions";
import { listarContactos } from "@/lib/contactos/queries";
import type { Contacto } from "@/lib/domain/types";

const CLASE_LABEL = "block text-sm font-medium text-slate-700 dark:text-slate-300";
const CLASE_INPUT =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-slate-400 dark:focus:ring-slate-700";
const CLASE_CHECK =
  "h-4 w-4 rounded border-slate-300 accent-slate-900 dark:border-slate-600 dark:accent-slate-100";

export default async function ContactosPage({
  searchParams,
}: {
  searchParams: Promise<{ rol?: string; error?: string; editar?: string }>;
}) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const { rol, error, editar } = await searchParams;
  const filtro =
    rol === "proveedores" || rol === "clientes" ? rol : "todos";

  const todos = listarContactos(usuario.id);
  const activos = todos.filter(
    (contacto) =>
      !contacto.archivado &&
      (filtro === "todos" ||
        (filtro === "proveedores"
          ? contacto.es_proveedor
          : contacto.es_cliente)),
  );
  const archivados = todos.filter((contacto) => contacto.archivado);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Contactos</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-400">
            Las empresas o personas con las que operás: las que te venden
            (proveedores) y las que te compran (clientes). Una misma puede ser
            las dos cosas.
          </p>
        </div>
        <Link
          href="#nuevo-contacto"
          className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          Nuevo contacto
        </Link>
      </header>

      {error === "datos" && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          Ingresá un nombre y marcá al menos Proveedor o Cliente.
        </p>
      )}

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        {[
          ["todos", "Todos"],
          ["proveedores", "Proveedores"],
          ["clientes", "Clientes"],
        ].map(([valor, texto]) => (
          <Link
            key={valor}
            href={valor === "todos" ? "/contactos" : `/contactos?rol=${valor}`}
            className={`rounded-lg border px-3 py-1.5 font-medium transition ${
              filtro === valor
                ? "border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900"
                : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-800"
            }`}
          >
            {texto}
          </Link>
        ))}
      </nav>

      <section className="mt-4 grid gap-3">
        {activos.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {filtro === "todos"
                ? "Todavía no tenés contactos cargados."
                : `No tenés ${filtro} cargados.`}
            </p>
          </div>
        ) : (
          activos.map((contacto) => (
            <TarjetaContacto
              key={contacto.id}
              contacto={contacto}
              editarAbierto={editar === contacto.id}
            />
          ))
        )}
      </section>

      {archivados.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer list-none text-sm font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
            Archivados ({archivados.length})
          </summary>
          <div className="mt-3 grid gap-3">
            {archivados.map((contacto) => (
              <TarjetaContacto key={contacto.id} contacto={contacto} />
            ))}
          </div>
        </details>
      )}

      <section id="nuevo-contacto" className="mt-10">
        <div className="mx-auto w-full max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <header className="mb-4">
            <h2 className="text-base font-semibold">Nuevo contacto</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Marcá si te vende, si te compra o las dos cosas.
            </p>
          </header>
          <form action={crearContacto} className="grid gap-4 sm:grid-cols-2">
            <CamposContacto />
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="mt-2 w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
              >
                Guardar contacto
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

function TarjetaContacto({
  contacto,
  editarAbierto = false,
}: {
  contacto: Contacto;
  editarAbierto?: boolean;
}) {
  const datos = [contacto.email, contacto.telefono].filter(Boolean).join(" · ");

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {contacto.nombre}
            </h2>
            {contacto.es_proveedor && (
              <span className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Proveedor
              </span>
            )}
            {contacto.es_cliente && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                Cliente
              </span>
            )}
            {contacto.archivado && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                Archivado
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {contacto.tipo === "persona" ? "Persona" : "Empresa"}
            {contacto.pais ? ` · ${contacto.pais}` : ""}
            {contacto.cuit ? ` · CUIT ${contacto.cuit}` : ""}
          </p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {datos || "Sin datos de contacto"}
          </p>
          {contacto.notas && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {contacto.notas}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        {!contacto.archivado && (
          <details open={editarAbierto} className="w-full">
            <summary className="cursor-pointer list-none text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100">
              Editar datos
            </summary>
            <form
              action={actualizarContacto}
              className="mt-3 grid gap-3 sm:grid-cols-2"
            >
              <input type="hidden" name="contactoId" value={contacto.id} />
              <CamposContacto contacto={contacto} />
              <div className="sm:col-span-2">
                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
                >
                  Guardar cambios
                </button>
              </div>
            </form>
          </details>
        )}
        <form action={archivarContacto}>
          <input type="hidden" name="contactoId" value={contacto.id} />
          <input
            type="hidden"
            name="archivar"
            value={contacto.archivado ? "false" : "true"}
          />
          <button
            type="submit"
            className="text-xs font-medium text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
          >
            {contacto.archivado ? "Restaurar" : "Archivar"}
          </button>
        </form>
      </div>
    </article>
  );
}

function CamposContacto({ contacto }: { contacto?: Contacto }) {
  return (
    <>
      <div className="sm:col-span-2">
        <label className={CLASE_LABEL}>
          {contacto?.tipo === "persona" ? "Nombre *" : "Nombre o razón social *"}
        </label>
        <input
          name="nombre"
          required
          defaultValue={contacto?.nombre}
          placeholder="Ej. Shanghai Metal Trading Co."
          className={CLASE_INPUT}
        />
      </div>
      <div>
        <label className={CLASE_LABEL}>Tipo</label>
        <select
          name="tipo"
          defaultValue={contacto?.tipo ?? "empresa"}
          className={CLASE_INPUT}
        >
          <option value="empresa">Empresa</option>
          <option value="persona">Persona</option>
        </select>
      </div>
      <div>
        <label className={CLASE_LABEL}>País</label>
        <input
          name="pais"
          defaultValue={contacto?.pais ?? ""}
          placeholder="China"
          className={CLASE_INPUT}
        />
      </div>
      <div>
        <label className={CLASE_LABEL}>Email</label>
        <input
          type="email"
          name="email"
          defaultValue={contacto?.email ?? ""}
          className={CLASE_INPUT}
        />
      </div>
      <div>
        <label className={CLASE_LABEL}>Teléfono</label>
        <input
          name="telefono"
          defaultValue={contacto?.telefono ?? ""}
          className={CLASE_INPUT}
        />
      </div>
      <div>
        <label className={CLASE_LABEL}>CUIT / CUIL</label>
        <input
          name="cuit"
          defaultValue={contacto?.cuit ?? ""}
          className={CLASE_INPUT}
        />
      </div>
      <div>
        <label className={CLASE_LABEL}>Notas</label>
        <input
          name="notas"
          defaultValue={contacto?.notas ?? ""}
          className={CLASE_INPUT}
        />
      </div>
      <div className="sm:col-span-2">
        <fieldset className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <legend className={CLASE_LABEL}>Rol</legend>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              name="es_proveedor"
              defaultChecked={contacto?.es_proveedor}
              className={CLASE_CHECK}
            />
            Proveedor (me vende)
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              name="es_cliente"
              defaultChecked={contacto?.es_cliente}
              className={CLASE_CHECK}
            />
            Cliente (me compra)
          </label>
        </fieldset>
      </div>
    </>
  );
}
