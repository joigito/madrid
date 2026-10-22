import { existsSync, mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const Database = require("better-sqlite3");

const DIR_BASE = join(process.cwd(), "data");
const DIR_BACKUPS = join(process.cwd(), "backups");
const ORIGEN = join(DIR_BASE, "madrid.db");
const RETENCION_DIAS = 14;

if (!existsSync(ORIGEN)) {
  console.log("todavia no hay base, nada que respaldar");
  process.exit(0);
}

mkdirSync(DIR_BACKUPS, { recursive: true });

const fecha = new Date().toISOString().slice(0, 10);
const destino = join(DIR_BACKUPS, `madrid-${fecha}.db`);

const base = new Database(ORIGEN, { readonly: true });
await base.backup(destino);
base.close();

const limite = Date.now() - RETENCION_DIAS * 24 * 60 * 60 * 1000;
for (const archivo of readdirSync(DIR_BACKUPS)) {
  if (!archivo.startsWith("madrid-") || !archivo.endsWith(".db")) continue;
  const ruta = join(DIR_BACKUPS, archivo);
  if (statSync(ruta).mtimeMs < limite) unlinkSync(ruta);
}

console.log(`backup ok -> ${destino}`);
