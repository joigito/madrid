import { cookies } from "next/headers";

import { COOKIE_TEMA, type Tema } from "./constantes";

export async function leerTema(): Promise<Tema> {
  const store = await cookies();
  return store.get(COOKIE_TEMA)?.value === "oscuro" ? "oscuro" : "claro";
}
