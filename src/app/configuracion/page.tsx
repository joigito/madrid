export default function ConfiguracionPage() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <div>
        <h1 className="text-2xl font-semibold">
          Falta conectar la base de datos
        </h1>
        <p className="mt-2 text-slate-600">
          La app necesita las credenciales de Supabase para funcionar. Definí
          estas variables de entorno y volvé a iniciar el servidor.
        </p>
      </div>

      <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-white p-4 text-sm">
        {`NEXT_PUBLIC_SUPABASE_URL=...\nNEXT_PUBLIC_SUPABASE_ANON_KEY=...`}
      </pre>

      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
        <p className="font-medium text-slate-900">Con Supabase local</p>
        <p className="mt-1">
          Corré <code className="rounded bg-slate-100 px-1">supabase start</code>{" "}
          y copiá la URL y la anon key que imprime{" "}
          <code className="rounded bg-slate-100 px-1">supabase status</code> en
          tu archivo <code className="rounded bg-slate-100 px-1">.env.local</code>
          .
        </p>
      </div>
    </main>
  );
}
