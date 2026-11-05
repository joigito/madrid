// Seed demo data for "Madrid" (com-ext-app).
// Usage: node scripts/seed-demo.mjs
// Creates a demo user + 2 contacts + 3 operations with varied semaphore states.
// Idempotent: skips if the demo user already exists.

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

const email = "demo@madridext.local";
const existing = db.prepare("SELECT id FROM users WHERE email = ?").get(email);
if (existing) {
  console.log("Demo user already exists, skipping.");
  db.close();
  process.exit(0);
}

const userId = uuid();
const passwordHash = await hashearPassword("demo1234");
db.prepare("INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)").run(userId, email, passwordHash);

// Contacts
const provId = uuid();
const cliId = uuid();
db.prepare(`INSERT INTO contactos (id, user_id, nombre, tipo, pais, es_proveedor, es_cliente) VALUES (?,?,?,?,?,?,?)`)
  .run(provId, userId, "Shanghai Parts Co.", "empresa", "China", 1, 0);
db.prepare(`INSERT INTO contactos (id, user_id, nombre, tipo, pais, es_proveedor, es_cliente) VALUES (?,?,?,?,?,?,?)`)
  .run(cliId, userId, "Distribuidora Sur S.A.", "empresa", "Argentina", 0, 1);

const catalogo = db.prepare("SELECT orden, nombre, organismo, url, plazo_dias FROM catalogo_etapas ORDER BY orden").all();

function crearOperacion(descripcion, ref, proveedorId, clienteId, pais, incoterm, fechaInicio, completadas = 0) {
  const opId = uuid();
  db.prepare(`INSERT INTO operaciones (id, user_id, referencia, descripcion, proveedor_contacto_id, cliente_contacto_id, pais_origen, incoterm, fecha_inicio)
              VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(opId, userId, ref, descripcion, proveedorId, clienteId, pais, incoterm, fechaInicio);
  const ins = db.prepare(`INSERT INTO etapas_operacion (id, operacion_id, user_id, orden, nombre, organismo, url, fecha_limite, completada, completada_at)
                          VALUES (?,?,?,?,?,?,?,?,?,?)`);
  catalogo.forEach((e, i) => {
    const completada = i < completadas ? 1 : 0;
    ins.run(uuid(), opId, userId, e.orden, e.nombre, e.organismo, e.url, sumarDias(fechaInicio, e.plazo_dias),
            completada, completada ? new Date().toISOString() : null);
  });
  return opId;
}

// 1) Recién iniciada (todo pendiente)
crearOperacion("Importación de repuestos electrónicos", "REF-2026-001", provId, cliId, "China", "FOB", hoy, 0);
// 2) A mitad de camino (3 etapas completas)
crearOperacion("Máquinas industriales para planta", "REF-2026-002", provId, cliId, "Alemania", "CIF", sumarDias(hoy, -20), 3);
// 3) Casi terminada (6 etapas completas)
crearOperacion("Insumos médicos hospitalarios", "REF-2026-003", provId, cliId, "EE.UU.", "EXW", sumarDias(hoy, -45), 6);

console.log("Demo data seeded. Login: demo@madridext.local / demo1234");
db.close();
process.exit(0);
