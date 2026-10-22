export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS sessions_user_idx ON sessions(user_id);

CREATE TABLE IF NOT EXISTS catalogo_etapas (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo_operacion TEXT NOT NULL DEFAULT 'importacion',
  orden          INTEGER NOT NULL,
  nombre         TEXT NOT NULL,
  organismo      TEXT,
  url            TEXT,
  plazo_dias     INTEGER NOT NULL DEFAULT 7,
  descripcion    TEXT,
  UNIQUE (tipo_operacion, orden)
);

CREATE TABLE IF NOT EXISTS contactos (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  nombre        TEXT NOT NULL,
  tipo          TEXT NOT NULL DEFAULT 'empresa' CHECK (tipo IN ('empresa', 'persona')),
  pais          TEXT,
  email         TEXT,
  telefono      TEXT,
  cuit          TEXT,
  notas         TEXT,
  es_proveedor  INTEGER NOT NULL DEFAULT 0,
  es_cliente    INTEGER NOT NULL DEFAULT 0,
  archivado     INTEGER NOT NULL DEFAULT 0,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS contactos_user_idx ON contactos(user_id);

CREATE TABLE IF NOT EXISTS operaciones (
  id            TEXT PRIMARY KEY,
  user_id       TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  referencia    TEXT,
  descripcion   TEXT NOT NULL,
  proveedor_contacto_id TEXT REFERENCES contactos(id) ON DELETE SET NULL,
  cliente_contacto_id   TEXT REFERENCES contactos(id) ON DELETE SET NULL,
  pais_origen   TEXT,
  incoterm      TEXT,
  estado        TEXT NOT NULL DEFAULT 'en_curso',
  fecha_inicio  TEXT NOT NULL,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS operaciones_user_idx ON operaciones(user_id);

CREATE TABLE IF NOT EXISTS etapas_operacion (
  id             TEXT PRIMARY KEY,
  operacion_id   TEXT NOT NULL REFERENCES operaciones(id) ON DELETE CASCADE,
  user_id        TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  orden          INTEGER NOT NULL,
  nombre         TEXT NOT NULL,
  organismo      TEXT,
  url            TEXT,
  fecha_limite   TEXT,
  completada     INTEGER NOT NULL DEFAULT 0,
  completada_at  TEXT,
  notas          TEXT,
  UNIQUE (operacion_id, orden)
);
CREATE INDEX IF NOT EXISTS etapas_user_idx ON etapas_operacion(user_id);
CREATE INDEX IF NOT EXISTS etapas_operacion_idx ON etapas_operacion(operacion_id);
`;

export const SEED_CATALOGO_SQL = `
INSERT OR IGNORE INTO catalogo_etapas (tipo_operacion, orden, nombre, organismo, url, plazo_dias, descripcion)
VALUES
  ('importacion', 1, 'Contrato de compra y orden de importación', null, null, 7,
   'Definir con el proveedor las condiciones de la operación y dejar la orden de compra documentada.'),
  ('importacion', 2, 'Transferencia y documentación bancaria', 'BCRA', 'https://www.bcra.gob.ar', 14,
   'Registrar la operación de cambio y reunir la documentación exigida por el Banco Central.'),
  ('importacion', 3, 'Padrón de importadores y habilitación', 'ARCA', 'https://www.arca.gob.ar', 15,
   'Verificar que el CUIT figure en el padrón de importadores y que los permisos estén vigentes.'),
  ('importacion', 4, 'Solicitud de SIRA / SIE', 'ARCA', 'https://www.arca.gob.ar', 20,
   'Presentar la Solicitud de Importación y seguirla hasta su autorización.'),
  ('importacion', 5, 'Despacho aduanero y liberación de mercadería', 'ARCA', 'https://www.arca.gob.ar', 45,
   'Preparar el despacho, acreditar el pago de tributos y retirar la mercadería.'),
  ('importacion', 6, 'Registro y verificación ante el organismo sectorial', 'VUCE', 'https://www.argentina.gob.ar/servicio/ventanilla-unica-comercio-exterior', 55,
   'Completar la presentación en la Ventanilla Única de Comercio Exterior.'),
  ('importacion', 7, 'Cierre contable y control de vencimientos', null, null, 60,
   'Documentar el costo final de la operación y cerrar los controles de la importación.');
`;
