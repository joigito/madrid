import Link from "next/link";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";

const ORGANISMOS = [
  { nombre: "ARCA (ex AFIP)", descripcion: "Padrón de importadores, SIRA/SIE, obligaciones fiscales.", url: "https://www.arca.gob.ar" },
  { nombre: "BCRA", descripcion: "Operaciones de cambio, transferencias y documentación bancaria.", url: "https://www.bcra.gob.ar" },
  { nombre: "VUCE", descripcion: "Ventanilla Única de Comercio Exterior (organismos sectoriales).", url: "https://www.argentina.gob.ar/servicio/ventanilla-unica-comercio-exterior" },
  { nombre: "Aduana Argentina", descripcion: "Despacho aduanero, liberación de mercadería y regímenes.", url: "https://www.aduana.gob.ar" },
  { nombre: "Ministerio de Economía", descripcion: "Comercio exterior, aranceles y política comercial.", url: "https://www.argentina.gob.ar/economia" },
  { nombre: "Cámara de Comercio", descripcion: "Información sectorial y normativa para operadores.", url: "https://www.cac.com.ar" },
];

export default async function RecursosPage() {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) {
    // middleware/proxy already guards, but keep safe
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 sm:py-8">
      <header>
        <h1 className="text-xl font-semibold">Recursos y código de ética</h1>
        <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
          Material de referencia para el operador de comercio internacional.
        </p>
      </header>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Código de ética</h2>
        <div className="mt-3 rounded-xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-700 dark:bg-brand-900">
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed text-brand-700 dark:text-brand-300">
            <li>
              <span className="font-semibold">Honestidad y transparencia:</span>{" "}
              Informar con veracidad sobre productos y servicios, sin inducir a error.
            </li>
            <li>
              <span className="font-semibold">Cumplimiento legal:</span> Respetar
              las leyes y normas del comercio internacional. Nada de documentación
              falsa.
            </li>
            <li>
              <span className="font-semibold">Integridad comercial:</span>{" "}
              Tolerancia cero al soborno y a los pagos indebidos. Relaciones
              basadas en el mérito.
            </li>
            <li>
              <span className="font-semibold">Responsabilidad y seguridad:</span>{" "}
              Cuidar el ambiente, las personas y la información de clientes y
              socios.
            </li>
            <li>
              <span className="font-semibold">Respeto a las personas:</span>{" "}
              Trato digno e igualitario, generando valor para la comunidad.
            </li>
          </ol>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-semibold">Organismos y entidades de referencia</h2>
        <p className="mt-1 text-sm text-brand-600 dark:text-brand-400">
          Accesos directos a los organismos con los que se opera en el comercio
          exterior argentino.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ORGANISMOS.map((o) => (
            <li key={o.url}>
              <a
                href={o.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl border border-brand-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-brand-700 dark:bg-brand-900"
              >
                <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">
                  {o.nombre}
                </p>
                <p className="mt-1 text-xs text-brand-500 dark:text-brand-400">
                  {o.descripcion}
                </p>
                <p className="mt-2 truncate text-xs text-brand-400 dark:text-brand-500">
                  {o.url}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </section>

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
