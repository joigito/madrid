import { redirect } from "next/navigation";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";

export default async function Home() {
  const usuario = await obtenerUsuarioDeSesion();
  redirect(usuario ? "/tablero" : "/login");
}
