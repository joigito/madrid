"use client";

import { useActionState, useState } from "react";

import { crearCuenta, iniciarSesion, type EstadoAuth } from "@/lib/auth/actions";

type Modo = "login" | "registro";

export function LoginForm() {
  const [modo, setModo] = useState<Modo>("login");
  const [estadoLogin, accionLogin, pendienteLogin] = useActionState(
    iniciarSesion,
    null as EstadoAuth,
  );
  const [estadoRegistro, accionRegistro, pendienteRegistro] = useActionState(
    crearCuenta,
    null as EstadoAuth,
  );

  return (
    <div className="rounded-xl border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-700 dark:bg-brand-900">
      <div className="mb-6 grid grid-cols-2 gap-1 rounded-lg bg-brand-100 p-1 text-sm font-medium dark:bg-brand-800">
        <BotonModo
          activo={modo === "login"}
          onClick={() => setModo("login")}
          etiqueta="Iniciar sesión"
        />
        <BotonModo
          activo={modo === "registro"}
          onClick={() => setModo("registro")}
          etiqueta="Crear cuenta"
        />
      </div>

      <div hidden={modo !== "login"}>
        <FormularioCredenciales
          modo="login"
          accion={accionLogin}
          pendiente={pendienteLogin}
          estado={estadoLogin}
        />
      </div>

      <div hidden={modo !== "registro"}>
        <FormularioCredenciales
          modo="registro"
          accion={accionRegistro}
          pendiente={pendienteRegistro}
          estado={estadoRegistro}
        />
      </div>
    </div>
  );
}

function BotonModo({
  activo,
  onClick,
  etiqueta,
}: {
  activo: boolean;
  onClick: () => void;
  etiqueta: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-2 transition ${
        activo
          ? "bg-white text-brand-900 shadow-sm dark:bg-brand-700 dark:text-brand-50"
          : "text-brand-500 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-200"
      }`}
    >
      {etiqueta}
    </button>
  );
}

function FormularioCredenciales({
  modo,
  accion,
  pendiente,
  estado,
}: {
  modo: Modo;
  accion: (formData: FormData) => void;
  pendiente: boolean;
  estado: EstadoAuth;
}) {
  return (
    <form action={accion} className="space-y-4">
      <div>
        <label
          htmlFor={`email-${modo}`}
          className="block text-sm font-medium text-brand-700 dark:text-brand-300"
        >
          Correo electrónico
        </label>
        <input
          id={`email-${modo}`}
          name="email"
          type="email"
          required
          autoComplete="email"
          className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-100 dark:focus:border-brand-400 dark:focus:ring-brand-700"
        />
      </div>

      <div>
        <label
          htmlFor={`password-${modo}`}
          className="block text-sm font-medium text-brand-700 dark:text-brand-300"
        >
          Contraseña
        </label>
        <input
          id={`password-${modo}`}
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete={modo === "login" ? "current-password" : "new-password"}
          className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-200 dark:border-brand-600 dark:bg-brand-800 dark:text-brand-100 dark:focus:border-brand-400 dark:focus:ring-brand-700"
        />
      </div>

      {estado?.error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {estado.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pendiente}
        className="w-full rounded-lg bg-brand-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-800 disabled:opacity-60 dark:bg-brand-100 dark:text-brand-900 dark:hover:bg-white"
      >
        {pendiente
          ? "Procesando..."
          : modo === "login"
            ? "Ingresar"
            : "Crear cuenta"}
      </button>
    </form>
  );
}
