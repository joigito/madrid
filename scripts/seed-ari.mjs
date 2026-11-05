import { randomBytes, scrypt } from "node:crypto";
import Database from "better-sqlite3";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const DB_PATH = join(__dirname, "..", "data", "madrid.db");

function derivar(password, salt, largo, N, r, p) {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, largo, { N, r, p, maxmem: 64 * 1024 * 1024 }, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
  });
}

async function hashearPassword(password) {
  const N = 16384, r = 8, p = 1, largo = 64;
  const salt = randomBytes(16);
  const hash = await derivar(password, salt, largo, N, r, p);
  return ["scrypt", N, r, p, salt.toString("base64"), hash.toString("base64")].join("$");
}

function uuid() { return crypto.randomUUID(); }

function sumarDias(fecha, dias) {
  const d = new Date(fecha + "T00:00:00");
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const hoy = new Date().toISOString().slice(0, 10);

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

const email = "ari@sm.com";
const password = "123456";

const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
let userId;
if (existing) {
  userId = existing.id;
  console.log("User already exists, reusing.");
} else {
  userId = uuid();
  const passwordHash = await hashearPassword(password);
  db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(userId, email, passwordHash);
  console.log("User created.");
}

// Contacts (only if none exist for this user)
const provCount = db.prepare("SELECT COUNT(*) c FROM contactos WHERE user_id = ?").get(userId).c;
let provId, cliId;
if (provCount === 0) {
  provId = uuid();
  cliId = uuid();
  db.prepare(`INSERT INTO contactos (id, user_id, nombre, tipo, pais, es_proveedor, es_cliente) VALUES (?,?,?,?,?,?,?)`)
    .run(provId, userId, "Shanghai Parts Co.", "empresa", "China", 1, 0);
  db.prepare(`INSERT INTO contactos (id, user_id, nombre, tipo, pais, es_proveedor, es_cliente) VALUES (?,?,?,?,?,?,?)`)
    .run(cliId, userId, "Distribuidora Sur S.A.", "empresa", "Argentina", 0, 1);
} else {
  const rows = db.prepare("SELECT id, es_proveedor FROM contactos WHERE user_id = ?").all(userId);
  provId = (rows.find(r => r.es_proveedor) || rows[0]).id;
  cliId = (rows.find(r => !r.es_proveedor) || rows[0]).id;
}

// Operations (only if none exist)
const opCount = db.prepare("SELECT COUNT(*) c FROM operaciones WHERE user_id = ?").get(userId).c;
if (opCount === 0) {
  const catalogo = db.prepare("SELECT orden, nombre, organismo, url, plazo_dias FROM catalogo_etapas ORDER BY orden").all();
  function crearOperacion(descripcion, ref, pais, incoterm, fechaInicio, completadas = 0) {
    const opId = uuid();
    db.prepare(`INSERT INTO operaciones (id, user_id, referencia, descripcion, proveedor_contacto_id, cliente_contacto_id, pais_origen, incoterm, fecha_inicio)
                VALUES (?,?,?,?,?,?,?,?,?)`)
      .run(opId, userId, ref, descripcion, provId, cliId, pais, incoterm, fechaInicio);
    const ins = db.prepare(`INSERT INTO etapas_operacion (id, operacion_id, user_id, orden, nombre, organismo, url, fecha_limite, completada, completada_at)
                            VALUES (?,?,?,?,?,?,?,?,?,?)`);
    catalogo.forEach((e, i) => {
      const completada = i < completadas ? 1 : 0;
      ins.run(uuid(), opId, userId, e.orden, e.nombre, e.organismo, e.url, sumarDias(fechaInicio, e.plazo_dias),
              completada, completada ? new Date().toISOString() : null);
    });
    return opId;
  }
  crearOperacion("Importación de repuestos electrónicos", "REF-2026-001", "China", "FOB", hoy, 0);
  crearOperacion("Máquinas industriales para planta", "REF-2026-002", "Alemania", "CIF", sumarDias(hoy, -20), 3);
  crearOperacion("Insumos médicos hospitalarios", "REF-2026-003", "EE.UU.", "EXW", sumarDias(hoy, -45), 6);
  console.log("Operations seeded.");
} else {
  console.log("Operations already exist, skipping.");
}

console.log("Done. Login: ari@sm.com / 123456");
db.close();
process.exit(0);
