import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import { normalizeBasePath } from '../../infra/config.js';
import type { Db } from '../../infra/database/db.js';
import { problemFor, sendProblem } from './problem.js';

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

  // Set before the routes so every plugin inherits them (Fastify encapsulation).
  app.setErrorHandler(async (error: { statusCode?: number }, request, reply) => {
    request.log.error(error);
    return sendProblem(reply, problemFor(error.statusCode));
  });
  app.setNotFoundHandler(async (_request, reply) => sendProblem(reply, problemFor(404)));

  await app.register(
    async (api) => {
      // RN-0003: alive does not depend on the database.
      api.get('/health', async () => ({ status: 'ok' }));
    },
    { prefix: `${basePath}/api` },
  );

  if (options.webDir) {
    // dotfiles ignored: a stray .env in the build output is never served (SEG-13).
    await app.register(fastifyStatic, { root: options.webDir, prefix: `${basePath}/`, index: 'index.html', dotfiles: 'ignore' });
    if (basePath) app.get(basePath, async (_request, reply) => reply.redirect(`${basePath}/`, 301));
  }

  return app;
}
