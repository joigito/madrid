"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import { obtenerBase } from "@/lib/db";
import { sumarDias } from "@/lib/fechas";

import { obtenerCatalogo } from "./queries";

export async function crearOperacion(formData: FormData) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const descripcion = String(formData.get("descripcion") ?? "").trim();
  if (!descripcion) redirect("/tablero");

  const base = obtenerBase();
  const operacionId = crypto.randomUUID();
  const fechaInicio =
    String(formData.get("fecha_inicio") ?? "").trim() ||
    new Date().toISOString().slice(0, 10);

  base
    .transaction(() => {
      base
        .prepare(
          `INSERT INTO operaciones
             (id, user_id, referencia, descripcion, proveedor_contacto_id, cliente_contacto_id, pais_origen, incoterm, fecha_inicio)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        )
        .run(
          operacionId,
          usuario.id,
          vacioANulo(formData.get("referencia")),
          descripcion,
          contactoDelUsuario(formData.get("proveedor_contacto_id"), usuario.id),
          contactoDelUsuario(formData.get("cliente_contacto_id"), usuario.id),
          vacioANulo(formData.get("pais_origen")),
          vacioANulo(formData.get("incoterm")),
          fechaInicio,
        );

      const insertarEtapa = base.prepare(
        `INSERT INTO etapas_operacion
           (id, operacion_id, user_id, orden, nombre, organismo, url, fecha_limite)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      );

      for (const etapa of obtenerCatalogo()) {
        insertarEtapa.run(
          crypto.randomUUID(),
          operacionId,
          usuario.id,
          etapa.orden,
          etapa.nombre,
          etapa.organismo,
          etapa.url,
          sumarDias(fechaInicio, etapa.plazo_dias),
        );
      }
    })();

  revalidatePath("/tablero");
  redirect(`/operaciones/${operacionId}`);
}

export async function toggleEtapa(formData: FormData) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const etapaId = String(formData.get("etapaId") ?? "");
  const completada = String(formData.get("completada") ?? "") === "true";
  if (!etapaId) return;

  const base = obtenerBase();
  const etapa = base
    .prepare("SELECT id, operacion_id FROM etapas_operacion WHERE id = ? AND user_id = ?")
    .get(etapaId, usuario.id) as { id: string; operacion_id: string } | undefined;
  if (!etapa) return;

  base
    .prepare(
      `UPDATE etapas_operacion
          SET completada = ?, completada_at = CASE WHEN ? = 1 THEN datetime('now') ELSE NULL END
        WHERE id = ? AND user_id = ?`,
    )
    .run(completada ? 1 : 0, completada ? 1 : 0, etapaId, usuario.id);

  revalidatePath(`/operaciones/${etapa.operacion_id}`);
  revalidatePath("/tablero");
}

export async function actualizarEtapa(formData: FormData) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const etapaId = String(formData.get("etapaId") ?? "");
  if (!etapaId) return;

  const base = obtenerBase();
  const etapa = base
    .prepare("SELECT id, operacion_id FROM etapas_operacion WHERE id = ? AND user_id = ?")
    .get(etapaId, usuario.id) as { id: string; operacion_id: string } | undefined;
  if (!etapa) return;

  base
    .prepare(
      `UPDATE etapas_operacion
          SET fecha_limite = ?, organismo = ?, url = ?
        WHERE id = ? AND user_id = ?`,
    )
    .run(
      vacioANulo(formData.get("fecha_limite")),
      vacioANulo(formData.get("organismo")),
      vacioANulo(formData.get("url")),
      etapaId,
      usuario.id,
    );

  revalidatePath(`/operaciones/${etapa.operacion_id}`);
  revalidatePath("/tablero");
}

function vacioANulo(valor: FormDataEntryValue | null): string | null {
  const texto = String(valor ?? "").trim();
  return texto === "" ? null : texto;
}

function contactoDelUsuario(
  valor: FormDataEntryValue | null,
  userId: string,
): string | null {
  const id = vacioANulo(valor);
  if (!id) return null;

  const fila = obtenerBase()
    .prepare("SELECT id FROM contactos WHERE id = ? AND user_id = ?")
    .get(id, userId) as { id: string } | undefined;

  return fila ? fila.id : null;
}
