// Acceptance tests for epic #13 (walking skeleton). One test per acceptance criterion (CA-n), locked after merge.
// Contract the tasks implement:
//   src/interface/http/app.ts      buildApp({ basePath, db, webDir? }) -> Fastify instance (tested with inject)
//   src/infra/database/testing.ts  createTestDatabase() -> { db, close } with every migration applied
//   db.query(sql, params?)         -> { rows }; table scores(nickname text, points integer, created_at timestamptz)
//   GET <basePath>/api/placares    -> { scores: [{ nickname, points }] }
// Modules are loaded at run time, so a test whose task is not done yet fails instead of breaking the whole file.
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const BASE_PATH = '/snake-3310-hom';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function load(path: string): Promise<any> {
  return import(path);
}

const databaseDown = {
  query: async () => {
    throw new Error('banco fora do ar');
  },
};

function fakeWebDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'snake-web-'));
  writeFileSync(join(dir, 'index.html'), '<!doctype html><title>Snake 3310</title><h1>Snake 3310</h1>');
  return dir;
}

describe('Esqueleto andante (#13)', () => {
  test.fails('CA-1: health responde 200 com status ok sob o BASE_PATH, mesmo com o banco fora', async () => { // #15
    const { buildApp } = await load('../../../src/interface/http/app');
    const app = await buildApp({ basePath: BASE_PATH, db: databaseDown });
    const response = await app.inject({ method: 'GET', url: `${BASE_PATH}/api/health` });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok' });
    await app.close();
  });

  test.fails('CA-2: ready responde 200 com o banco no ar e 503 com o banco fora', async () => { // #16
    const { buildApp } = await load('../../../src/interface/http/app');
    const { createTestDatabase } = await load('../../../src/infra/database/testing');
    const { db, close } = await createTestDatabase();
    const up = await buildApp({ basePath: BASE_PATH, db });
    expect((await up.inject({ method: 'GET', url: `${BASE_PATH}/api/ready` })).statusCode).toBe(200);
    await up.close();
    await close();

    const down = await buildApp({ basePath: BASE_PATH, db: databaseDown });
    const response = await down.inject({ method: 'GET', url: `${BASE_PATH}/api/ready` });
    expect(response.statusCode).toBe(503);
    expect(response.body).not.toContain('banco fora do ar');
    await down.close();
  });

  test.fails('CA-3 RN-0001: ranking mostra os 10 maiores, do maior para o menor, empate pelo mais antigo', async () => { // #17
    const { buildApp } = await load('../../../src/interface/http/app');
    const { createTestDatabase } = await load('../../../src/infra/database/testing');
    const { db, close } = await createTestDatabase();
    const rows: Array<[string, number, string]> = [
      ['ANA', 50, '2026-10-01T10:00:00Z'],
      ['BIA', 90, '2026-10-01T10:01:00Z'],
      ['CAIO', 70, '2026-10-01T10:02:00Z'],
      ['DUDA', 70, '2026-10-01T09:00:00Z'],
      ['EVA', 10, '2026-10-01T10:04:00Z'],
      ['FABIO', 80, '2026-10-01T10:05:00Z'],
      ['GUI', 20, '2026-10-01T10:06:00Z'],
      ['HUGO', 60, '2026-10-01T10:07:00Z'],
      ['IVO', 40, '2026-10-01T10:08:00Z'],
      ['JOAO', 30, '2026-10-01T10:09:00Z'],
      ['KAI', 5, '2026-10-01T10:10:00Z'],
      ['LIA', 100, '2026-10-01T10:11:00Z'],
    ];
    for (const [nickname, points, createdAt] of rows) {
      await db.query('insert into scores (nickname, points, created_at) values ($1, $2, $3)', [nickname, points, createdAt]);
    }
    const app = await buildApp({ basePath: BASE_PATH, db });
    const response = await app.inject({ method: 'GET', url: `${BASE_PATH}/api/placares` });
    expect(response.statusCode).toBe(200);
    expect(response.json().scores).toEqual([
      { nickname: 'LIA', points: 100 },
      { nickname: 'BIA', points: 90 },
      { nickname: 'FABIO', points: 80 },
      { nickname: 'DUDA', points: 70 },
      { nickname: 'CAIO', points: 70 },
      { nickname: 'HUGO', points: 60 },
      { nickname: 'ANA', points: 50 },
      { nickname: 'IVO', points: 40 },
      { nickname: 'JOAO', points: 30 },
      { nickname: 'GUI', points: 20 },
    ]);
    await app.close();
    await close();
  });

  test.fails('CA-4 RN-0001: ranking vazio devolve lista vazia', async () => { // #17
    const { buildApp } = await load('../../../src/interface/http/app');
    const { createTestDatabase } = await load('../../../src/infra/database/testing');
    const { db, close } = await createTestDatabase();
    const app = await buildApp({ basePath: BASE_PATH, db });
    const response = await app.inject({ method: 'GET', url: `${BASE_PATH}/api/placares` });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ scores: [] });
    await app.close();
    await close();
  });

  test.fails('CA-5: a página do jogo abre no BASE_PATH e um caminho só parecido recebe 404', async () => { // #15
    const { buildApp } = await load('../../../src/interface/http/app');
    const app = await buildApp({ basePath: BASE_PATH, db: databaseDown, webDir: fakeWebDir() });
    const page = await app.inject({ method: 'GET', url: `${BASE_PATH}/` });
    expect(page.statusCode).toBe(200);
    expect(page.headers['content-type']).toContain('text/html');
    expect(page.body).toContain('Snake 3310');
    const similar = await app.inject({ method: 'GET', url: `${BASE_PATH}-x/` });
    expect(similar.statusCode).toBe(404);
    await app.close();
  });
});
