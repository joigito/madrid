/** Suma días a una fecha ISO (YYYY-MM-DD) sin líos de zona horaria. */
export function sumarDias(fechaISO: string, dias: number): string {
  const [anio, mes, dia] = fechaISO.split("-").map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

export function hoyISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatearFecha(fechaISO: string | null): string {
  if (!fechaISO) return "Sin fecha";
  const [anio, mes, dia] = fechaISO.split("-");
  return `${dia}/${mes}/${anio}`;
}
