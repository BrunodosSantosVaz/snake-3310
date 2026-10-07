import type { FastifyInstance } from 'fastify';
import type { Config } from '../infra/config.js';
import { createSqliteDatabase, type ClosableDb } from '../infra/database/db.js';
import { migrate } from '../infra/database/migrations.js';
import { buildApp } from './http/app.js';

export interface RunningServer {
  app: FastifyInstance;
  db: ClosableDb;
  close(): Promise<void>;
}

// DAD-03 exception (ADR-0003): migrate the app's own mounted file before opening any HTTP socket.
export async function startServer(config: Config, migrationsDir = 'migrations'): Promise<RunningServer> {
  const db = createSqliteDatabase(config.sqlitePath);
  let app: FastifyInstance | undefined;
  try {
    const applied = await migrate(db, migrationsDir);
    app = await buildApp({ basePath: config.basePath, db, webDir: config.webDir, logger: true, production: config.production, trustedProxyIps: config.trustedProxyIps });
    await app.listen({ host: '0.0.0.0', port: config.port });
    app.log.info({ migrations: applied }, 'banco pronto');
  } catch (error) {
    try { await app?.close(); } finally { await db.close(); }
    throw error;
  }
  const runningApp = app;
  let closing: Promise<void> | undefined;
  return {
    app: runningApp,
    db,
    close: () => closing ??= (async () => {
      try { await runningApp.close(); } finally { await db.close(); }
    })(),
  };
}
