import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { COOKIE_TAMANO, type Tamano } from "@/lib/tema/constantes";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const tamano: Tamano =
    body?.tamano === "grande" || body?.tamano === "muy-grande" ? body.tamano : "normal";

  const store = await cookies();
  store.set(COOKIE_TAMANO, tamano, {
    httpOnly: false,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return NextResponse.json({ ok: true });
}
