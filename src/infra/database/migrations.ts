import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import type { TransactionalDb } from './db.js';

const MIGRATION_FILE = /^\d{4}_[a-z0-9_]+\.sql$/;

// BEGIN IMMEDIATE owns SQLite's write lock before the ledger is checked (DAD-01).
export async function migrate(db: TransactionalDb, directory = 'migrations'): Promise<string[]> {
  await db.transaction(async (tx) => {
    await tx.query(`create table if not exists schema_migrations (
      name text primary key not null,
      applied_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    ) strict`);
  });
  const files = (await readdir(directory)).filter((name) => MIGRATION_FILE.test(name)).sort();
  const applied: string[] = [];
  for (const name of files) {
    const sql = await readFile(join(directory, name), 'utf8');
    try {
      const changed = await db.transaction(async (tx) => {
        if ((await tx.query('select 1 from schema_migrations where name = $1', [name])).rows.length) return false;
        await tx.exec(sql);
        await tx.query('insert into schema_migrations (name) values ($1)', [name]);
        return true;
      });
      if (changed) applied.push(name);
    } catch (error) {
      throw new Error(`migration failed: ${name}`, { cause: error });
    }
  }
  return applied;
}
