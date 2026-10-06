import { resolve } from 'node:path';

// Runtime configuration read from the environment (ARQ-07): the same image runs in staging and production.
export interface Config {
  port: number;
  basePath: string;
  databaseUrl: string;
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
  const databaseUrl = env.DATABASE_URL;
  if (!databaseUrl) throw new Error('DATABASE_URL não definida');
  const port = Number(env.PORT ?? 8080);
  if (!Number.isInteger(port) || port <= 0) throw new Error(`PORT inválida: ${env.PORT}`);
  return {
    port,
    basePath: normalizeBasePath(env.BASE_PATH),
    databaseUrl,
    webDir: resolve(env.WEB_DIR ?? 'dist/web'), // @fastify/static needs an absolute path
    production: env.NODE_ENV === 'production',
  };
}
