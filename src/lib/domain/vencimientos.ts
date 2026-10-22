import type { EtapaOperacion, Semaforo } from "./types";

export const DIAS_POR_VENCER = 3;

/** Días restantes hasta la fecha (negativo si ya venció). Sin zona horaria. */
export function diasHasta(fechaLimite: string, hoy = new Date()): number {
  const objetivo = new Date(`${fechaLimite}T00:00:00`);
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((objetivo.getTime() - base.getTime()) / 86_400_000);
}

export function calcularSemaforo(
  etapa: Pick<EtapaOperacion, "completada" | "fecha_limite">,
  hoy = new Date(),
): Semaforo {
  if (etapa.completada) return "completada";
  if (!etapa.fecha_limite) return "sin_fecha";

  const dias = diasHasta(etapa.fecha_limite, hoy);
  if (dias < 0) return "vencida";
  if (dias <= DIAS_POR_VENCER) return "por_vencer";
  return "ok";
}

const ORDEN_SEVERIDAD: Record<Semaforo, number> = {
  vencida: 0,
  por_vencer: 1,
  sin_fecha: 2,
  ok: 3,
  completada: 4,
};

/** Semaforo más urgente entre todas las etapas (la operación hereda el peor). */
export function semaforoOperacion(
  etapas: Pick<EtapaOperacion, "completada" | "fecha_limite">[],
  hoy = new Date(),
): Semaforo {
  const pendientes = etapas.filter((etapa) => !etapa.completada);
  if (pendientes.length === 0) return "completada";

  return pendientes
    .map((etapa) => calcularSemaforo(etapa, hoy))
    .sort((a, b) => ORDEN_SEVERIDAD[a] - ORDEN_SEVERIDAD[b])[0];
}

export const ETIQUETA_SEMAFORO: Record<Semaforo, string> = {
  vencida: "Vencida",
  por_vencer: "Por vencer",
  ok: "Al día",
  sin_fecha: "Sin fecha",
  completada: "Completada",
};

export const CLASES_SEMAFORO: Record<Semaforo, string> = {
  vencida:
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-900",
  por_vencer:
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-900",
  ok: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-900",
  sin_fecha:
    "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700",
  completada:
    "bg-sky-100 text-sky-800 border-sky-200 dark:bg-sky-950 dark:text-sky-300 dark:border-sky-900",
};
