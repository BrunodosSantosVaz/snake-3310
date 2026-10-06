import { PGlite, type Transaction } from '@electric-sql/pglite';
import type { ClosableDb, Db } from '../../src/infra/database/db.js';
import { migrate } from '../../src/infra/database/migrations.js';

// Test-only: an in-process Postgres (PGlite, ADR-0002), fresh and isolated per call, with every migration applied.
// Lives outside src/ so it never ships in the image.
function wrap(target: PGlite | Transaction): Db {
  return {
    query: async <T>(sql: string, params?: unknown[]) => {
      if (params && params.length > 0) return { rows: (await target.query<T>(sql, params)).rows };
      return { rows: ((await target.exec(sql)).at(-1)?.rows ?? []) as T[] };
    },
  };
}

export async function createPgliteDatabase(): Promise<ClosableDb> {
  const pglite = new PGlite();
  return {
    ...wrap(pglite),
    transaction: (work) => pglite.transaction((tx) => work(wrap(tx))),
    close: () => pglite.close(),
  };
}

export async function createTestDatabase(): Promise<{ db: ClosableDb; close: () => Promise<void> }> {
  const db = await createPgliteDatabase();
  await migrate(db);
  return { db, close: db.close };
}
