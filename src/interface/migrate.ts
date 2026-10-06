import { createPool, describeError } from '../infra/database/db.js';
import { migrate } from '../infra/database/migrations.js';

// "npm run migrar": the deploy runs it as a one-off service before switching versions (DAD-02, DAD-03).
// MIGRATIONS_DIR: folder of the .sql files (the image sets /app/migrations).
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}
const db = createPool(databaseUrl, (error) => console.error('erro numa conexão parada do banco', error));
try {
  const applied = await migrate(db, process.env.MIGRATIONS_DIR ?? 'migrations');
  console.warn(applied.length ? `migrações aplicadas: ${applied.join(', ')}` : 'nenhuma migração pendente');
} catch (error) {
  console.error('migração falhou', describeError(error), describeError((error as { cause?: unknown }).cause));
  process.exitCode = 1;
} finally {
  await db.close();
}
