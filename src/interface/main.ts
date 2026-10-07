import { readConfig } from '../infra/config.js';
import { describeError } from '../infra/database/db.js';
import { startServer } from './startup.js';

// Composition root (ARQ-05): configuration, database and HTTP server.
process.umask(0o077);
const config = readConfig(process.env);
const server = await startServer(config, process.env.MIGRATIONS_DIR ?? 'migrations');
const { app } = server;

let stopping = false;
async function shutdown(reason: string, code: number): Promise<void> {
  if (stopping) return;
  stopping = true;
  app.log.info({ reason }, 'encerrando');
  const deadline = setTimeout(() => process.exit(code || 1), 10_000);
  deadline.unref();
  try {
    await server.close();
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
