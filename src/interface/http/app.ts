import fastifyStatic from '@fastify/static';
import Fastify, { type FastifyInstance } from 'fastify';
import { CheckReadiness } from '../../aplicacao/health.js';
import { ListRanking } from '../../aplicacao/ranking.js';
import { normalizeBasePath } from '../../infra/config.js';
import { describeError, type Db } from '../../infra/database/db.js';
import { SqlDatabaseProbe } from '../../infra/database/probe.js';
import { SqlScoreRepository } from '../../infra/database/score-repository.js';
import { problemFor, sendProblem, UNAVAILABLE } from './problem.js';
import { registerSecurityHeaders } from './seguranca/headers.js';

export interface AppOptions {
  basePath: string;
  db: Db;
  webDir?: string;
  logger?: boolean;
  production?: boolean;
}

// Everything lives under basePath (RN-0002): <basePath>/ serves the game, <basePath>/api/* the API.
export async function buildApp(options: AppOptions): Promise<FastifyInstance> {
  const basePath = normalizeBasePath(options.basePath);
  const app = Fastify({ logger: options.logger ?? false, trustProxy: false, ajv: { customOptions: { removeAdditional: false } } });
  registerSecurityHeaders(app, options.production ?? false);
  const readiness = new CheckReadiness(new SqlDatabaseProbe(options.db), (error) =>
    app.log.warn({ banco: describeError(error) }, 'banco indisponível'),
  );
  const ranking = new ListRanking(new SqlScoreRepository(options.db));

  // Set before the routes so every plugin inherits them (Fastify encapsulation).
  app.setErrorHandler(async (error: { statusCode?: number }, request, reply) => {
    request.log.error(error);
    return sendProblem(reply, problemFor(error.statusCode));
  });
  app.setNotFoundHandler(async (_request, reply) => sendProblem(reply, problemFor(404)));

  await app.register(
    async (api) => {
      // RN-0003: alive does not depend on the database; ready does, and never shows the error.
      api.get('/health', async () => ({ status: 'ok' }));
      api.get('/ready', async (_request, reply) =>
        (await readiness.execute()) ? { status: 'ok' } : sendProblem(reply, UNAVAILABLE),
      );
      api.get('/placares', {
        schema: { querystring: { type: 'object', properties: {}, additionalProperties: false } },
      }, async () => ({ scores: await ranking.execute() }));
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
