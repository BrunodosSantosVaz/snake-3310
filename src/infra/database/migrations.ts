import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { TransactionalDb } from './db.js';

// Plain SQL migrations (migrations/NNNN_name.sql), each applied once, in order and inside its own transaction
// (DAD-01). A published migration is never edited: a new one is added (DAD-02, expand and contract).
const MIGRATION_FILE = /^\d{4}_[a-z0-9_]+\.sql$/;
const LOCK_ID = 3310; // pg_advisory_xact_lock: two concurrent runs never apply the same migration twice

export async function migrate(db: TransactionalDb, dir = 'migrations'): Promise<string[]> {
  await db.transaction(async (tx) => {
    await tx.query('select pg_advisory_xact_lock($1)', [LOCK_ID]);
    await tx.query(
      'create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())',
    );
  });
  const files = (await readdir(dir)).filter((name) => MIGRATION_FILE.test(name)).sort();
  const applied: string[] = [];
  for (const name of files) {
    const sql = await readFile(join(dir, name), 'utf8');
    try {
      const ran = await db.transaction(async (tx) => {
        await tx.query('select pg_advisory_xact_lock($1)', [LOCK_ID]);
        const done = await tx.query('select 1 from schema_migrations where name = $1', [name]);
        if (done.rows.length > 0) return false;
        await tx.query(sql);
        await tx.query('insert into schema_migrations (name) values ($1)', [name]);
        return true;
      });
      if (ran) applied.push(name);
    } catch (error) {
      throw new Error(`migração ${name} falhou`, { cause: error });
    }
  }
  return applied;
}
