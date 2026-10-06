import { readConfig } from '../infra/config.js';
import { createPool, describeError } from '../infra/database/db.js';
import { buildApp } from './http/app.js';

// Composition root (ARQ-05): configuration, database pool and HTTP server.
const config = readConfig(process.env);
let log: { error(details: object, message: string): void } = {
  error: (details, message) => console.error(message, details),
};
const db = createPool(config.databaseUrl, (error) => log.error({ banco: error }, 'erro numa conexão parada do banco'));
const app = await buildApp({ basePath: config.basePath, db, webDir: config.webDir, logger: true, production: config.production });
log = app.log;

let stopping = false;
async function shutdown(reason: string, code: number): Promise<void> {
  if (stopping) return;
  stopping = true;
  app.log.info({ reason }, 'encerrando');
  const deadline = setTimeout(() => process.exit(code || 1), 10_000);
  deadline.unref();
  try {
    await app.close();
    await db.close();
  } catch (error) {
    app.log.error({ erro: describeError(error) }, 'falha ao encerrar');
    code = code || 1;
  }
  process.exit(code);
}

process.on('SIGTERM', () => void shutdown('SIGTERM', 0));
process.on('SIGINT', () => void shutdown('SIGINT', 0));
process.on('unhandledRejection', (error) => {
  app.log.fatal({ erro: describeError(error) }, 'promessa rejeitada sem tratamento');
  void shutdown('unhandledRejection', 1);
});
process.on('uncaughtException', (error) => {
  app.log.fatal({ erro: describeError(error) }, 'exceção sem tratamento');
  void shutdown('uncaughtException', 1);
});

await app.listen({ host: '0.0.0.0', port: config.port });
