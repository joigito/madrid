"use server";

import { redirect } from "next/navigation";

import { obtenerBase } from "@/lib/db";
import { hashearPassword, verificarPassword } from "./passwords";
import { crearSesion, destruirSesion } from "./session";

export type EstadoAuth = { error?: string; aviso?: string } | null;

type FilaUsuario = { id: string; email: string; password_hash: string };

export async function iniciarSesion(
  _estado: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const validacion = validarCredenciales(email, password);
  if (validacion) return { error: validacion };

  const usuario = obtenerBase()
    .prepare("SELECT id, email, password_hash FROM users WHERE email = ?")
    .get(email) as FilaUsuario | undefined;

  if (!usuario || !(await verificarPassword(password, usuario.password_hash))) {
    return { error: "Correo o contraseña incorrectos." };
  }

  await crearSesion(usuario.id);
  redirect("/tablero");
}

export async function crearCuenta(
  _estado: EstadoAuth,
  formData: FormData,
): Promise<EstadoAuth> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const validacion = validarCredenciales(email, password);
  if (validacion) return { error: validacion };

  const base = obtenerBase();
  const existente = base
    .prepare("SELECT id FROM users WHERE email = ?")
    .get(email) as { id: string } | undefined;

  if (existente) {
    return { error: "Ese correo ya tiene una cuenta." };
  }

  const id = crypto.randomUUID();
  base
    .prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)")
    .run(id, email, await hashearPassword(password));

  await crearSesion(id);
  redirect("/tablero");
}

export async function cerrarSesion(): Promise<void> {
  await destruirSesion();
  redirect("/login");
}

function validarCredenciales(email: string, password: string): string | null {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return "El correo no es válido.";
  }
  if (password.length < 6) {
    return "La contraseña debe tener al menos 6 caracteres.";
  }
  return null;
}
