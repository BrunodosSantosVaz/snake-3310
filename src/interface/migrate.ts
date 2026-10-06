import { createPool } from '../infra/database/db.js';
import { migrate } from '../infra/database/migrations.js';

// "npm run migrar": the deploy runs it as a one-off service before switching versions (DAD-02).
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}
const db = createPool(databaseUrl);
try {
  const applied = await migrate(db);
  console.warn(applied.length ? `migrações aplicadas: ${applied.join(', ')}` : 'nenhuma migração pendente');
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await db.close();
}
