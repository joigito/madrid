import { createHash, randomBytes } from "node:crypto";

import { cookies } from "next/headers";

import { obtenerBase } from "@/lib/db";

export const COOKIE_SESION = "madrid_session";
const DURACION_DIAS = 30;
const DURACION_SEGUNDOS = DURACION_DIAS * 24 * 60 * 60;

export type UsuarioSesion = { id: string; email: string };

/** La cookie lleva el token crudo; en la base guardamos su hash SHA-256. */
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function opcionesCookie(secure: boolean) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure,
    path: "/",
    maxAge: DURACION_SEGUNDOS,
  };
}

/**
 * Crea la sesión y setea la cookie. Llamar solo desde Server Actions o Route
 * Handlers: en Server Components no se puede escribir en el cookie store.
 */
export async function crearSesion(userId: string): Promise<void> {
  const base = obtenerBase();
  const token = randomBytes(32).toString("base64url");

  base.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();
  base
    .prepare(
      "INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, datetime('now', ?))",
    )
    .run(hashToken(token), userId, `${DURACION_DIAS} days`);

  const store = await cookies();
  store.set(COOKIE_SESION, token, opcionesCookie(esSegura()));
}

/** Lectura de sesión desde el proxy o desde un Server Component. */
export async function obtenerUsuarioDeSesion(): Promise<UsuarioSesion | null> {
  const store = await cookies();
  const token = store.get(COOKIE_SESION)?.value;
  if (!token) return null;
  return buscarUsuarioPorToken(token);
}

export function buscarUsuarioPorToken(token: string): UsuarioSesion | null {
  const base = obtenerBase();
  const fila = base
    .prepare(
      `SELECT u.id AS id, u.email AS email
         FROM sessions s
         JOIN users u ON u.id = s.user_id
        WHERE s.id = ? AND s.expires_at > datetime('now')`,
    )
    .get(hashToken(token)) as { id: string; email: string } | undefined;

  return fila ?? null;
}

export async function destruirSesion(): Promise<void> {
  const store = await cookies();
  const token = store.get(COOKIE_SESION)?.value;
  if (token) {
    obtenerBase().prepare("DELETE FROM sessions WHERE id = ?").run(hashToken(token));
  }
  store.delete(COOKIE_SESION);
}

function esSegura(): boolean {
  return process.env.NODE_ENV === "production";
}
