"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { obtenerUsuarioDeSesion } from "@/lib/auth/session";
import { obtenerBase } from "@/lib/db";

export async function crearContacto(formData: FormData) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const datos = leerFormulario(formData);
  if (!datos.nombre || (!datos.es_proveedor && !datos.es_cliente)) {
    redirect("/contactos?error=datos");
  }

  obtenerBase()
    .prepare(
      `INSERT INTO contactos
         (id, user_id, nombre, tipo, pais, email, telefono, cuit, notas, es_proveedor, es_cliente)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      crypto.randomUUID(),
      usuario.id,
      datos.nombre,
      datos.tipo,
      datos.pais,
      datos.email,
      datos.telefono,
      datos.cuit,
      datos.notas,
      datos.es_proveedor ? 1 : 0,
      datos.es_cliente ? 1 : 0,
    );

  revalidar();
  redirect("/contactos");
}

export async function actualizarContacto(formData: FormData) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const contactoId = String(formData.get("contactoId") ?? "");
  if (!contactoId) return;

  const datos = leerFormulario(formData);
  if (!datos.nombre || (!datos.es_proveedor && !datos.es_cliente)) {
    redirect(`/contactos?error=datos&editar=${contactoId}`);
  }

  obtenerBase()
    .prepare(
      `UPDATE contactos
          SET nombre = ?, tipo = ?, pais = ?, email = ?, telefono = ?,
              cuit = ?, notas = ?, es_proveedor = ?, es_cliente = ?,
              updated_at = datetime('now')
        WHERE id = ? AND user_id = ?`,
    )
    .run(
      datos.nombre,
      datos.tipo,
      datos.pais,
      datos.email,
      datos.telefono,
      datos.cuit,
      datos.notas,
      datos.es_proveedor ? 1 : 0,
      datos.es_cliente ? 1 : 0,
      contactoId,
      usuario.id,
    );

  revalidar();
  redirect("/contactos");
}

export async function archivarContacto(formData: FormData) {
  const usuario = await obtenerUsuarioDeSesion();
  if (!usuario) redirect("/login");

  const contactoId = String(formData.get("contactoId") ?? "");
  const archivar = String(formData.get("archivar") ?? "") === "true";
  if (!contactoId) return;

  obtenerBase()
    .prepare(
      `UPDATE contactos
          SET archivado = ?, updated_at = datetime('now')
        WHERE id = ? AND user_id = ?`,
    )
    .run(archivar ? 1 : 0, contactoId, usuario.id);

  revalidar();
}

function leerFormulario(formData: FormData) {
  const tipo = String(formData.get("tipo") ?? "empresa");

  return {
    nombre: vacioANulo(formData.get("nombre")) ?? "",
    tipo: tipo === "persona" ? "persona" : "empresa",
    pais: vacioANulo(formData.get("pais")),
    email: vacioANulo(formData.get("email")),
    telefono: vacioANulo(formData.get("telefono")),
    cuit: vacioANulo(formData.get("cuit")),
    notas: vacioANulo(formData.get("notas")),
    es_proveedor: formData.get("es_proveedor") === "on",
    es_cliente: formData.get("es_cliente") === "on",
  };
}

function revalidar() {
  revalidatePath("/contactos");
  revalidatePath("/tablero");
}

function vacioANulo(valor: FormDataEntryValue | null): string | null {
  const texto = String(valor ?? "").trim();
  return texto === "" ? null : texto;
}
