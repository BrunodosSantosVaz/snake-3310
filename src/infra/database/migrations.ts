import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { Db } from './db.js';

// Plain SQL migrations (migrations/NNNN_name.sql), applied once and in order (DAD-02: expand and contract, never
// undone by "Voltar versão").
export const MIGRATIONS_DIR = process.env.MIGRATIONS_DIR ?? 'migrations';

export async function migrate(db: Db, dir: string = MIGRATIONS_DIR): Promise<string[]> {
  await db.query(
    'create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())',
  );
  const done = new Set((await db.query<{ name: string }>('select name from schema_migrations')).rows.map((r) => r.name));
  const files = (await readdir(dir)).filter((name) => /^\d{4}_[a-z0-9_]+\.sql$/.test(name)).sort();
  const applied: string[] = [];
  for (const name of files) {
    if (done.has(name)) continue;
    const sql = await readFile(join(dir, name), 'utf8');
    await db.query('begin');
    try {
      await db.query(sql);
      await db.query('insert into schema_migrations (name) values ($1)', [name]);
      await db.query('commit');
    } catch (error) {
      await db.query('rollback');
      throw new Error(`migração ${name} falhou`, { cause: error });
    }
    applied.push(name);
  }
  return applied;
}
