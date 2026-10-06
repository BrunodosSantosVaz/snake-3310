import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { buildApp } from './app.js';

const down = { query: async () => Promise.reject(new Error('down')) };
const problemType = 'application/problem+json';
let cleanup: Array<() => unknown> = [];

afterEach(async () => {
  for (const step of cleanup.reverse()) await step();
  cleanup = [];
});

async function app(options: Partial<Parameters<typeof buildApp>[0]> = {}) {
  const instance = await buildApp({ basePath: '', db: down, ...options });
  cleanup.push(() => instance.close());
  return instance;
}

describe('buildApp', () => {
  test('serves the API at the root when basePath is empty', async () => {
    expect((await (await app()).inject({ method: 'GET', url: '/api/health' })).statusCode).toBe(200);
  });

  test('does not answer outside basePath, with a Problem Details 404', async () => {
    const instance = await app({ basePath: '/snake-3310' });
    for (const url of ['/api/health', '/snake-3310x/api/health']) {
      const response = await instance.inject({ method: 'GET', url });
      expect(response.statusCode).toBe(404);
      expect(response.headers['content-type']).toContain(problemType);
      expect(response.json()).toEqual({ type: 'about:blank', title: 'Não encontrado', status: 404 });
    }
  });

  test.each([
    [undefined, 500],
    [302, 500],
    [400, 400],
    [503, 500],
  ])('hides the message of an error with status %s (answers %s)', async (statusCode, expected) => {
    const instance = await app();
    instance.get('/boom', async () => {
      throw Object.assign(new Error('pg: password authentication failed for user snake'), { statusCode });
    });
    const response = await instance.inject({ method: 'GET', url: '/boom' });
    expect(response.statusCode).toBe(expected);
    expect(response.headers['content-type']).toContain(problemType);
    expect(response.body).not.toContain('password');
    expect(response.json().status).toBe(expected);
  });

  test('never serves dotfiles from the web folder', async () => {
    const webDir = mkdtempSync(join(tmpdir(), 'snake-web-'));
    cleanup.push(() => rmSync(webDir, { recursive: true, force: true }));
    writeFileSync(join(webDir, 'index.html'), '<title>Snake 3310</title>');
    writeFileSync(join(webDir, '.env'), 'SECRET=1');
    const instance = await app({ basePath: '/snake-3310', webDir });
    const response = await instance.inject({ method: 'GET', url: '/snake-3310/.env' });
    expect(response.statusCode).toBe(404);
    expect(response.body).not.toContain('SECRET');
    expect((await instance.inject({ method: 'GET', url: '/snake-3310' })).statusCode).toBe(301);
  });
});

describe('problem titles', () => {
  test('every 4xx keeps a Portuguese title and 503 stays explicit', async () => {
    const { problemFor, UNAVAILABLE } = await import('./problem.js');
    expect(problemFor(403)).toEqual({ type: 'about:blank', title: 'Proibido', status: 403 });
    expect(problemFor(418).title).toBe('Erro na requisição');
    expect(UNAVAILABLE.status).toBe(503);
  });
});
