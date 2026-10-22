import { obtenerBase } from "@/lib/db";
import type { Contacto, RolContacto, TipoContacto } from "@/lib/domain/types";

type Fila = Record<string, unknown>;

export function listarContactos(userId: string): Contacto[] {
  return (
    obtenerBase()
      .prepare(
        `SELECT * FROM contactos
          WHERE user_id = ?
          ORDER BY archivado ASC, nombre COLLATE NOCASE ASC`,
      )
      .all(userId) as Fila[]
  ).map(mapearContacto);
}

export function contactosParaSelector(
  userId: string,
  rol: RolContacto,
): Contacto[] {
  const columna = rol === "proveedor" ? "es_proveedor" : "es_cliente";

  return (
    obtenerBase()
      .prepare(
        `SELECT * FROM contactos
          WHERE user_id = ? AND ${columna} = 1 AND archivado = 0
          ORDER BY nombre COLLATE NOCASE ASC`,
      )
      .all(userId) as Fila[]
  ).map(mapearContacto);
}

export function mapearContacto(fila: Fila): Contacto {
  return {
    id: fila.id as string,
    user_id: fila.user_id as string,
    nombre: fila.nombre as string,
    tipo: fila.tipo as TipoContacto,
    pais: (fila.pais as string) ?? null,
    email: (fila.email as string) ?? null,
    telefono: (fila.telefono as string) ?? null,
    cuit: (fila.cuit as string) ?? null,
    notas: (fila.notas as string) ?? null,
    es_proveedor: Number(fila.es_proveedor) === 1,
    es_cliente: Number(fila.es_cliente) === 1,
    archivado: Number(fila.archivado) === 1,
    created_at: fila.created_at as string,
    updated_at: fila.updated_at as string,
  };
}
