export type EstadoOperacion = "en_curso" | "cerrada" | "cancelada";

export type TipoOperacion = "importacion" | "exportacion";

export type TipoContacto = "empresa" | "persona";

export type RolContacto = "proveedor" | "cliente";

export interface Contacto {
  id: string;
  user_id: string;
  nombre: string;
  tipo: TipoContacto;
  pais: string | null;
  email: string | null;
  telefono: string | null;
  cuit: string | null;
  notas: string | null;
  es_proveedor: boolean;
  es_cliente: boolean;
  archivado: boolean;
  created_at: string;
  updated_at: string;
}

export interface Operacion {
  id: string;
  user_id: string;
  referencia: string | null;
  descripcion: string;
  proveedor_contacto_id: string | null;
  cliente_contacto_id: string | null;
  pais_origen: string | null;
  incoterm: string | null;
  estado: EstadoOperacion;
  fecha_inicio: string;
  created_at: string;
  updated_at: string;
}

export interface EtapaOperacion {
  id: string;
  operacion_id: string;
  user_id: string;
  orden: number;
  nombre: string;
  organismo: string | null;
  url: string | null;
  fecha_limite: string | null;
  completada: boolean;
  completada_at: string | null;
  notas: string | null;
}

export interface OperacionConEtapas extends Operacion {
  etapas_operacion: EtapaOperacion[];
}

export interface OperacionResumen extends OperacionConEtapas {
  proveedor_nombre: string | null;
  cliente_nombre: string | null;
}

export interface DetalleOperacion {
  operacion: Operacion;
  etapas: EtapaOperacion[];
  proveedor: Contacto | null;
  cliente: Contacto | null;
}

export interface CatalogoEtapa {
  id: number;
  tipo_operacion: TipoOperacion;
  orden: number;
  nombre: string;
  organismo: string | null;
  url: string | null;
  plazo_dias: number;
  descripcion: string | null;
}

export type Semaforo = "completada" | "vencida" | "por_vencer" | "ok" | "sin_fecha";
