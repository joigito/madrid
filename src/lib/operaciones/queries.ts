import { obtenerBase } from "@/lib/db";
import type {
  CatalogoEtapa,
  Contacto,
  DetalleOperacion,
  EtapaOperacion,
  EstadoOperacion,
  Operacion,
  OperacionResumen,
  TipoOperacion,
} from "@/lib/domain/types";

import { mapearContacto } from "@/lib/contactos/queries";

type Fila = Record<string, unknown>;

const OPERACIONES_POR_USUARIO = `
  SELECT o.*,
         p.nombre AS proveedor_nombre,
         c.nombre AS cliente_nombre
    FROM operaciones o
    LEFT JOIN contactos p ON p.id = o.proveedor_contacto_id AND p.user_id = o.user_id
    LEFT JOIN contactos c ON c.id = o.cliente_contacto_id AND c.user_id = o.user_id
   WHERE o.user_id = ?
   ORDER BY datetime(o.created_at) DESC, o.id ASC`;

const ETAPAS_POR_USUARIO = `
  SELECT * FROM etapas_operacion
   WHERE user_id = ?
   ORDER BY orden ASC`;

export function obtenerOperacionesDelUsuario(
  userId: string,
): OperacionResumen[] {
  const base = obtenerBase();

  const operaciones = base
    .prepare(OPERACIONES_POR_USUARIO)
    .all(userId) as Fila[];

  const etapas = base.prepare(ETAPAS_POR_USUARIO).all(userId) as Fila[];
  const etapasPorOperacion = new Map<string, EtapaOperacion[]>();
  for (const fila of etapas) {
    const etapa = mapearEtapa(fila);
    const lista = etapasPorOperacion.get(etapa.operacion_id) ?? [];
    lista.push(etapa);
    etapasPorOperacion.set(etapa.operacion_id, lista);
  }

  return operaciones.map((fila) => {
    const operacion = mapearOperacion(fila);
    return {
      ...operacion,
      etapas_operacion: etapasPorOperacion.get(operacion.id) ?? [],
      proveedor_nombre: (fila.proveedor_nombre as string) ?? null,
      cliente_nombre: (fila.cliente_nombre as string) ?? null,
    };
  });
}

export function obtenerOperacionPorId(
  userId: string,
  operacionId: string,
): DetalleOperacion | null {
  const base = obtenerBase();

  const filaOperacion = base
    .prepare("SELECT * FROM operaciones WHERE id = ? AND user_id = ?")
    .get(operacionId, userId) as Fila | undefined;
  if (!filaOperacion) return null;

  const operacion = mapearOperacion(filaOperacion);

  const etapas = (
    base
      .prepare(
        "SELECT * FROM etapas_operacion WHERE operacion_id = ? AND user_id = ? ORDER BY orden ASC",
      )
      .all(operacionId, userId) as Fila[]
  ).map(mapearEtapa);

  return {
    operacion,
    etapas,
    proveedor: buscarContacto(userId, operacion.proveedor_contacto_id),
    cliente: buscarContacto(userId, operacion.cliente_contacto_id),
  };
}

function buscarContacto(userId: string, contactoId: string | null): Contacto | null {
  if (!contactoId) return null;

  const fila = obtenerBase()
    .prepare("SELECT * FROM contactos WHERE id = ? AND user_id = ?")
    .get(contactoId, userId) as Fila | undefined;

  return fila ? mapearContacto(fila) : null;
}

export function obtenerCatalogo(): CatalogoEtapa[] {
  const filas = obtenerBase()
    .prepare(
      "SELECT * FROM catalogo_etapas WHERE tipo_operacion = 'importacion' ORDER BY orden ASC",
    )
    .all() as Fila[];
  return filas.map(mapearCatalogo);
}

function mapearOperacion(fila: Fila): Operacion {
  return {
    id: fila.id as string,
    user_id: fila.user_id as string,
    referencia: (fila.referencia as string) ?? null,
    descripcion: fila.descripcion as string,
    proveedor_contacto_id: (fila.proveedor_contacto_id as string) ?? null,
    cliente_contacto_id: (fila.cliente_contacto_id as string) ?? null,
    pais_origen: (fila.pais_origen as string) ?? null,
    incoterm: (fila.incoterm as string) ?? null,
    estado: fila.estado as EstadoOperacion,
    fecha_inicio: fila.fecha_inicio as string,
    created_at: fila.created_at as string,
    updated_at: fila.updated_at as string,
  };
}

function mapearEtapa(fila: Fila): EtapaOperacion {
  return {
    id: fila.id as string,
    operacion_id: fila.operacion_id as string,
    user_id: fila.user_id as string,
    orden: fila.orden as number,
    nombre: fila.nombre as string,
    organismo: (fila.organismo as string) ?? null,
    url: (fila.url as string) ?? null,
    fecha_limite: (fila.fecha_limite as string) ?? null,
    completada: Number(fila.completada) === 1,
    completada_at: (fila.completada_at as string) ?? null,
    notas: (fila.notas as string) ?? null,
  };
}

function mapearCatalogo(fila: Fila): CatalogoEtapa {
  return {
    id: fila.id as number,
    tipo_operacion: fila.tipo_operacion as TipoOperacion,
    orden: fila.orden as number,
    nombre: fila.nombre as string,
    organismo: (fila.organismo as string) ?? null,
    url: (fila.url as string) ?? null,
    plazo_dias: fila.plazo_dias as number,
    descripcion: (fila.descripcion as string) ?? null,
  };
}
