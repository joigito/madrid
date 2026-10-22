import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center gap-8 px-6 py-16">
      <header className="text-center">
        <h1 className="text-2xl font-semibold text-slate-900">
          Madrid Gestión de Comercio Internacional
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Tu espacio de trabajo privado para seguir operaciones, organismos y
          vencimientos.
        </p>
      </header>

      <LoginForm />
    </main>
  );
}
