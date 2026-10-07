import { createSqliteDatabase, type ClosableDb } from '../../src/infra/database/db.js';
import { migrate } from '../../src/infra/database/migrations.js';

// Real SQLite, isolated in memory per test; the production adapter and migrations are exercised unchanged.
export async function createTestDatabase(): Promise<{ db: ClosableDb; close: () => Promise<void> }> {
  const db = createSqliteDatabase(':memory:');
  try {
    await migrate(db);
    return { db, close: db.close };
  } catch (error) {
    await db.close();
    throw error;
  }
}
