import { NextResponse, type NextRequest } from "next/server";

import { COOKIE_SESION, buscarUsuarioPorToken } from "@/lib/auth/session";

const RUTAS_PUBLICAS = ["/login"];

function esRutaPublica(pathname: string) {
  return RUTAS_PUBLICAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`),
  );
}

export async function proxy(request: NextRequest) {
  const token = request.cookies.get(COOKIE_SESION)?.value;
  const usuario = token ? buscarUsuarioPorToken(token) : null;

  const { pathname } = request.nextUrl;

  if (!usuario && !esRutaPublica(pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    return NextResponse.redirect(redirectUrl);
  }

  if (usuario && pathname === "/login") {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/tablero";
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
