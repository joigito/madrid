import { cookies } from "next/headers";

import { COOKIE_TEMA, type Tema, COOKIE_TAMANO, type Tamano } from "./constantes";

export async function leerTema(): Promise<Tema> {
  const store = await cookies();
  return store.get(COOKIE_TEMA)?.value === "oscuro" ? "oscuro" : "claro";
}

export async function leerTamano(): Promise<Tamano> {
  const store = await cookies();
  const v = store.get(COOKIE_TAMANO)?.value;
  if (v === "grande" || v === "muy-grande") return v;
  return "normal";
}

