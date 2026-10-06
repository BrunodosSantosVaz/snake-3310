import { isAbsolute, relative, resolve } from 'node:path';

// Runtime configuration read from the environment (ARQ-07): the same image runs in staging and production.
export interface Config {
  port: number;
  basePath: string;
  sqlitePath: string;
  webDir: string;
  production: boolean;
}

const BASE_PATH = /^(\/[a-z0-9][a-z0-9-]*)*$/;

export function normalizeBasePath(value: string | undefined): string {
  const path = (value ?? '').trim().replace(/\/+$/, '');
  if (!BASE_PATH.test(path)) {
    throw new Error(`BASE_PATH inválido: "${value}" (use "" ou algo como "/snake-3310")`);
  }
  return path;
}

export function readConfig(env: NodeJS.ProcessEnv): Config {
  const rawPath = env.SQLITE_PATH ?? 'data/snake-3310.sqlite';
  const sqlitePath = resolve(rawPath);
  const fromDist = relative(resolve('dist'), sqlitePath);
  if (!rawPath.trim() || rawPath === ':memory:' || rawPath.startsWith('file:') ||
      (!fromDist.startsWith('..') && !isAbsolute(fromDist))) {
    throw new Error('SQLITE_PATH deve apontar para arquivo durável fora de dist');
  }
  const port = Number(env.PORT ?? 8080);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`PORT inválida: ${env.PORT}`);
  return {
    port,
    basePath: normalizeBasePath(env.BASE_PATH),
    sqlitePath,
    webDir: resolve(env.WEB_DIR ?? 'dist/web'), // @fastify/static needs an absolute path
    production: env.NODE_ENV === 'production',
  };
}
