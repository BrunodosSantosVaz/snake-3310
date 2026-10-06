import { createSqliteDatabase, describeError } from '../infra/database/db.js';
import { readConfig } from '../infra/config.js';
import { migrate } from '../infra/database/migrations.js';

// Standalone CLI; it must mount the same durable file as the app. Deployment startup is packaged in #19.
const db = createSqliteDatabase(readConfig(process.env).sqlitePath);
try {
  const applied = await migrate(db, process.env.MIGRATIONS_DIR ?? 'migrations');
  console.warn(applied.length ? `migrações aplicadas: ${applied.join(', ')}` : 'nenhuma migração pendente');
} catch (error) {
  console.error('migração falhou', describeError(error), describeError((error as { cause?: unknown }).cause));
  process.exitCode = 1;
} finally {
  await db.close();
}
