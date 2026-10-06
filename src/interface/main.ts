import { readConfig } from '../infra/config.js';
import { createPool } from '../infra/database/db.js';
import { buildApp } from './http/app.js';

// Composition root (ARQ-05): configuration, database pool and HTTP server.
const config = readConfig(process.env);
const db = createPool(config.databaseUrl);
const app = await buildApp({ basePath: config.basePath, db, webDir: config.webDir, logger: true });

async function shutdown(signal: string): Promise<void> {
  app.log.info({ signal }, 'encerrando');
  await app.close();
  await db.close();
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));

await app.listen({ host: '0.0.0.0', port: config.port });
