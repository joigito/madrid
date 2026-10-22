import { LoginForm } from "@/components/login-form";
import { TemaToggle } from "@/components/tema-toggle";
import { leerTema } from "@/lib/tema/config";

export default async function LoginPage() {
  const tema = await leerTema();

  return (
    <main className="relative mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <div className="absolute right-6 top-6">
        <TemaToggle temaInicial={tema} />
      </div>

      <header className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          Madrid Gestión de Comercio Internacional
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Tu espacio de trabajo privado para seguir operaciones, organismos y
          vencimientos.
        </p>
      </header>

      <LoginForm />
    </main>
  );
}
