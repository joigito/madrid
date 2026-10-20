import { createClient } from "@/lib/supabase/server";
import type { EtapaOperacion, Operacion, TipoOperacion } from "@/lib/domain/types";

export async function obtenerOperacionesDelUsuario() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("operaciones")
    .select("*, etapas_operacion(*, operacion_id)")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Array<
    Operacion & { etapas_operacion: EtapaOperacion[] }
  >;
}

export async function obtenerOperacionPorId(operacionId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: operacion, error: errorOperacion } = await supabase
    .from("operaciones")
    .select("*")
    .eq("id", operacionId)
    .eq("user_id", user.id)
    .single();

  if (errorOperacion) throw errorOperacion;
  if (!operacion) return null;

  const { data: etapas, error: errorEtapas } = await supabase
    .from("etapas_operacion")
    .select("*")
    .eq("operacion_id", operacionId)
    .eq("user_id", user.id)
    .order("orden", { ascending: true });

  if (errorEtapas) throw errorEtapas;

  return {
    operacion: operacion as Operacion,
    etapas: (etapas ?? []) as EtapaOperacion[],
  };
}

export async function obtenerCatalogo(
  tipo: TipoOperacion = "importacion",
) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("catalogo_etapas")
    .select("*")
    .eq("tipo_operacion", tipo)
    .order("orden", { ascending: true });

  if (error) throw error;
  return data ?? [];
}
