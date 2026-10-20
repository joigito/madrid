"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Modo = "login" | "registro";

export function LoginForm() {
  const router = useRouter();
  const [modo, setModo] = useState<Modo>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setAviso(null);
    setCargando(true);

    try {
      const supabase = createClient();

      if (modo === "login") {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/tablero");
        router.refresh();
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;

      if (data.session) {
        router.push("/tablero");
        router.refresh();
      } else {
        setModo("login");
        setAviso("Cuenta creada. Revisá tu correo para confirmarla y luego ingresá.");
      }
    } catch (err) {
      setError(traducirError(err));
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => {
            setModo("login");
            setError(null);
            setAviso(null);
          }}
          className={`rounded-md px-3 py-2 transition ${
            modo === "login"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => {
            setModo("registro");
            setError(null);
            setAviso(null);
          }}
          className={`rounded-md px-3 py-2 transition ${
            modo === "registro"
              ? "bg-white text-slate-900 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-slate-700"
          >
            Correo electrónico
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-slate-700"
          >
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={modo === "login" ? "current-password" : "new-password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {error ? (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {aviso ? (
          <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {aviso}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-60"
        >
          {cargando
            ? "Procesando..."
            : modo === "login"
              ? "Ingresar"
              : "Crear cuenta"}
        </button>
      </form>
    </div>
  );
}

function traducirError(err: unknown): string {
  const mensaje =
    err && typeof err === "object" && "message" in err
      ? String((err as { message: unknown }).message)
      : "";

  if (/invalid login credentials/i.test(mensaje)) {
    return "Correo o contraseña incorrectos.";
  }
  if (/already registered|already exists/i.test(mensaje)) {
    return "Ese correo ya tiene una cuenta.";
  }
  if (/at least 6/i.test(mensaje)) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  if (/unable to validate email|invalid email/i.test(mensaje)) {
    return "El correo no es válido.";
  }
  return mensaje || "No se pudo completar la operación. Intentá de nuevo.";
}
