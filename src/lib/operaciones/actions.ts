"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { sumarDias } from "@/lib/fechas";
import { createClient } from "@/lib/supabase/server";

export async function crearOperacion(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const descripcion = String(formData.get("descripcion") ?? "").trim();
  if (!descripcion) throw new Error("La descripción es obligatoria.");

  const referencia = String(formData.get("referencia") ?? "").trim() || null;
  const proveedor = String(formData.get("proveedor") ?? "").trim() || null;
  const pais_origen = String(formData.get("pais_origen") ?? "").trim() || null;
  const incoterm = String(formData.get("incoterm") ?? "").trim() || null;
  const fecha_inicio =
    String(formData.get("fecha_inicio") ?? "") ||
    new Date().toISOString().slice(0, 10);

  const { data: operacion, error: errorOperacion } = await supabase
    .from("operaciones")
    .insert({
      user_id: user.id,
      descripcion,
      referencia,
      proveedor,
      pais_origen,
      incoterm,
      fecha_inicio,
    })
    .select("id")
    .single();

  if (errorOperacion) throw errorOperacion;

  const { data: catalogo, error: errorCatalogo } = await supabase
    .from("catalogo_etapas")
    .select("*")
    .eq("tipo_operacion", "importacion")
    .order("orden", { ascending: true });

  if (errorCatalogo) throw errorCatalogo;

  if (catalogo && catalogo.length > 0) {
    const etapas = catalogo.map((item) => ({
      operacion_id: operacion.id,
      user_id: user.id,
      orden: item.orden,
      nombre: item.nombre,
      organismo: item.organismo,
      url: item.url,
      fecha_limite: sumarDias(fecha_inicio, item.plazo_dias),
    }));

    const { error: errorEtapas } = await supabase
      .from("etapas_operacion")
      .insert(etapas);
    if (errorEtapas) throw errorEtapas;
  }

  revalidatePath("/tablero");
  redirect(`/operaciones/${operacion.id}`);
}

export async function toggleEtapa(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const etapaId = String(formData.get("etapaId"));
  const completada = formData.get("completada") === "true";

  const { data: etapa, error: errorFetch } = await supabase
    .from("etapas_operacion")
    .select("operacion_id")
    .eq("id", etapaId)
    .eq("user_id", user.id)
    .single();

  if (errorFetch) throw errorFetch;

  const { error } = await supabase
    .from("etapas_operacion")
    .update({
      completada,
      completada_at: completada ? new Date().toISOString() : null,
    })
    .eq("id", etapaId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath(`/operaciones/${etapa.operacion_id}`);
  revalidatePath("/tablero");
}

export async function actualizarEtapa(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const etapaId = String(formData.get("etapaId"));
  const fechaLimite = String(formData.get("fecha_limite") ?? "").trim() || null;
  const organismo = String(formData.get("organismo") ?? "").trim() || null;
  const url = String(formData.get("url") ?? "").trim() || null;

  const { data: etapa, error: errorFetch } = await supabase
    .from("etapas_operacion")
    .select("operacion_id")
    .eq("id", etapaId)
    .eq("user_id", user.id)
    .single();

  if (errorFetch) throw errorFetch;

  const { error } = await supabase
    .from("etapas_operacion")
    .update({ fecha_limite: fechaLimite, organismo, url })
    .eq("id", etapaId)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath(`/operaciones/${etapa.operacion_id}`);
  revalidatePath("/tablero");
}
