import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

import Database from "better-sqlite3";

import { SCHEMA_SQL, SEED_CATALOGO_SQL } from "./schema";

const RUTA_BASE = join(process.cwd(), "data", "madrid.db");

type GlobalConBase = typeof globalThis & {
  __baseMadrid?: Database.Database;
};

function abrirBase(): Database.Database {
  mkdirSync(dirname(RUTA_BASE), { recursive: true });

  const base = new Database(RUTA_BASE);
  base.pragma("journal_mode = WAL");
  base.pragma("foreign_keys = ON");

  base.exec(SCHEMA_SQL);

  const { total } = base
    .prepare("SELECT COUNT(*) AS total FROM catalogo_etapas")
    .get() as { total: number };
  if (total === 0) {
    base.exec(SEED_CATALOGO_SQL);
  }

  return base;
}

export function obtenerBase(): Database.Database {
  const g = globalThis as GlobalConBase;
  if (!g.__baseMadrid) {
    g.__baseMadrid = abrirBase();
  }
  return g.__baseMadrid;
}
