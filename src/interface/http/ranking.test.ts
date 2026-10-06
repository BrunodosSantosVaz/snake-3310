import { afterEach, describe, expect, test } from 'vitest';
import { buildApp } from './app.js';

const basePath = '/snake-3310';
let cleanup: Array<() => Promise<unknown>> = [];

afterEach(async () => {
  for (const step of cleanup.reverse()) await step();
  cleanup = [];
});

async function app(db: Parameters<typeof buildApp>[0]['db'], path = basePath) {
  const instance = await buildApp({ basePath: path, db });
  cleanup.push(() => instance.close());
  return instance;
}

describe('GET /api/placares', () => {
  test.each(['', basePath])('exposes only public score fields under basePath %s', async (path) => {
    const db = { query: async <T>() => ({ rows: [{ nickname: 'ANA', points: 10, created_at: new Date(0) }] as T[] }) };
    const response = await (await app(db, path)).inject({ method: 'GET', url: `${path}/api/placares` });
    expect(response.statusCode).toBe(200);
    expect(response.headers['content-type']).toContain('application/json');
    expect(response.json()).toEqual({ scores: [{ nickname: 'ANA', points: 10 }] });
  });

  test('does not expose the ranking outside the exact basePath', async () => {
    const instance = await app({ query: async () => ({ rows: [] }) });
    for (const url of ['/api/placares', `${basePath}-x/api/placares`]) {
      expect((await instance.inject({ method: 'GET', url })).statusCode).toBe(404);
    }
  });

  test('rejects unknown query fields before consulting the database', async () => {
    let queried = false;
    const instance = await app({ query: async () => { queried = true; return { rows: [] }; } });
    const response = await instance.inject({ method: 'GET', url: `${basePath}/api/placares?limit=100` });
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(queried).toBe(false);
  });

  test('hides database error details behind a generic Problem Details response', async () => {
    const instance = await app({ query: async () => { throw new Error('private database failure'); } });
    const response = await instance.inject({ method: 'GET', url: `${basePath}/api/placares` });
    expect(response.statusCode).toBe(500);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toEqual({ type: 'about:blank', title: 'Erro interno', status: 500 });
    expect(response.body).not.toContain('private');
  });
});
