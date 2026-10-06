import { PGlite } from '@electric-sql/pglite';
import type { ClosableDb } from '../../src/infra/database/db.js';
import { migrate } from '../../src/infra/database/migrations.js';

// Test-only: an in-process Postgres (PGlite) with every migration applied. Lives outside src/ so it never ships in the image.
export async function createTestDatabase(): Promise<{ db: ClosableDb; close: () => Promise<void> }> {
  const pglite = new PGlite();
  const db: ClosableDb = {
    query: async <T>(sql: string, params?: unknown[]) => {
      if (params && params.length > 0) {
        const result = await pglite.query<T>(sql, params);
        return { rows: result.rows };
      }
      const results = await pglite.exec(sql);
      return { rows: (results.at(-1)?.rows ?? []) as T[] };
    },
    close: () => pglite.close(),
  };
  await migrate(db);
  return { db, close: db.close };
}
