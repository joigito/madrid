import Link from "next/link";

type Persona = {
  nombre: string;
  detalle?: string;
};

/**
 * Listado de créditos. `detalle` es opcional (curso, comisión o rol).
 */
const ALUMNOS: Persona[] = [
  { nombre: "Ari Sanchez Ortelli" },
  { nombre: "Yamila Dulce" },
  { nombre: "Emanuel Bernal" },
  { nombre: "Roberto Quinteros" },
];

const DOCENTES: Persona[] = [
  { nombre: "Claudia Seleme", detalle: "Licenciada · Profesora de la cátedra" },
  { nombre: "Jorge Rubén Díaz", detalle: "Profesor · Desarrollador" },
];

const CATEDRA = {
  materia: "Ética y deontología profesional",
  carrera: "Técnico Superior en Comercio Internacional",
};

const INSTITUCION = {
  nombre: "Instituto Superior «General San Martín»",
  detalle: "Proyecto de Comercio Internacional · Ciclo 2026",
};

function ListaPersonas({
  titulo,
  descripcion,
  personas,
}: {
  titulo: string;
  descripcion: string;
  personas: Persona[];
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">{titulo}</h2>
      <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">{descripcion}</p>

      {personas.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-brand-300 bg-white p-6 text-center text-sm text-brand-500 dark:border-brand-700 dark:bg-brand-900 dark:text-brand-400">
          A confirmar.
        </div>
      ) : (
        <ul className="mt-3 grid gap-3 sm:grid-cols-2">
          {personas.map((persona) => (
            <li
              key={persona.nombre}
              className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm dark:border-brand-700 dark:bg-brand-900"
            >
              <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                {persona.nombre}
              </p>
              {persona.detalle ? (
                <p className="mt-0.5 text-xs text-brand-500 dark:text-brand-400">
                  {persona.detalle}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default function CreditosPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-xl font-semibold">Créditos</h1>
        <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
          Las personas y la institución que hicieron posible este proyecto.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Institución</h2>
        <div className="mt-3 flex items-center gap-4 rounded-xl border border-brand-200 bg-white p-5 shadow-sm dark:border-brand-700 dark:bg-brand-900">
          <img
            src="/branding/instituto.png"
            alt="Instituto Superior General San Martín"
            className="h-14 w-14 shrink-0 rounded-full object-cover shadow-md"
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
              {INSTITUCION.nombre}
            </p>
            <p className="mt-0.5 text-xs text-brand-500 dark:text-brand-400">
              {INSTITUCION.detalle}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Cátedra</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm dark:border-brand-700 dark:bg-brand-900">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-400 dark:text-brand-500">
              Materia
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-900 dark:text-brand-100">
              {CATEDRA.materia}
            </p>
          </div>
          <div className="rounded-xl border border-brand-200 bg-white p-4 shadow-sm dark:border-brand-700 dark:bg-brand-900">
            <p className="text-xs font-medium uppercase tracking-wide text-brand-400 dark:text-brand-500">
              Carrera
            </p>
            <p className="mt-1 text-sm font-semibold text-brand-900 dark:text-brand-100">
              {CATEDRA.carrera}
            </p>
          </div>
        </div>
      </section>

      <ListaPersonas
        titulo="Alumnos"
        descripcion="Estudiantes que desarrollaron y presentaron el proyecto."
        personas={ALUMNOS}
      />

      <ListaPersonas
        titulo="Docentes"
        descripcion="Docentes que acompañaron el proyecto."
        personas={DOCENTES}
      />

      <div className="mt-8">
        <Link
          href="/tablero"
          className="text-sm font-medium text-brand-500 transition hover:text-brand-900 dark:text-brand-400 dark:hover:text-brand-100"
        >
          ← Volver al tablero
        </Link>
      </div>
    </div>
  );
}
