import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import { normalizeBasePath } from '../../infra/config.js';
import type { Db } from '../../infra/database/db.js';

export interface AppOptions {
  basePath: string;
  db: Db;
  webDir?: string;
  logger?: boolean;
}

// Everything lives under basePath (RN-0002): <basePath>/ serves the game, <basePath>/api/* the API.
export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const basePath = normalizeBasePath(options.basePath);
  const app = Fastify({ logger: options.logger ?? false, trustProxy: false });

  // Set before the routes so every plugin inherits it: internal errors never reach the client.
  app.setErrorHandler(async (error: { statusCode?: number; message?: string }, request, reply) => {
    request.log.error(error);
    const status = error.statusCode && error.statusCode < 500 ? error.statusCode : 500;
    return reply.code(status).send({ erro: status < 500 ? error.message : 'erro interno' });
  });

  await app.register(
    async (api) => {
      // RN-0003: alive does not depend on the database.
      api.get('/health', async () => ({ status: 'ok' }));
    },
    { prefix: `${basePath}/api` },
  );

  if (options.webDir) {
    await app.register(fastifyStatic, { root: options.webDir, prefix: `${basePath}/`, index: 'index.html' });
    if (basePath) app.get(basePath, async (_request, reply) => reply.redirect(`${basePath}/`, 301));
  }

  return app;
}
