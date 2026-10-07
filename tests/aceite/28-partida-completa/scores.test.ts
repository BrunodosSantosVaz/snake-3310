import { describe, expect, test } from 'vitest';

const BASE_PATH = '/snake-3310-hom';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function load(path: string): Promise<any> { return import(path); }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function scenario(work: (app: any, db: any) => Promise<void>): Promise<void> {
  const { createTestDatabase } = await load('../../apoio/banco');
  const { buildApp } = await load('../../../src/interface/http/app');
  const { db, close } = await createTestDatabase();
  try {
    const app = await buildApp({ basePath: BASE_PATH, db });
    try { await work(app, db); } finally { await app.close(); }
  } finally { await close(); }
}

describe('Envio público de placares (#28)', () => {
  test.fails('CA-4 RN-0001 RN-0005: placar válido é gravado uma vez em UTC e aparece no ranking #32', () => scenario(async (app, db) => {
    const result = await app.inject({ method: 'POST', url: `${BASE_PATH}/api/placares`, payload: { nickname: 'BRUNO', points: 70 } });
    expect(result.statusCode).toBe(201);
    expect((await app.inject({ method: 'GET', url: `${BASE_PATH}/api/placares` })).json()).toEqual({ scores: [{ nickname: 'BRUNO', points: 70 }] });
    const { rows } = await db.query('select nickname, points, created_at from scores');
    expect(rows).toHaveLength(1);
    const date = rows[0].created_at instanceof Date ? rows[0].created_at.toISOString() : rows[0].created_at;
    expect(date).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{3})?Z$/);
    expect((await app.inject({ method: 'POST', url: `${BASE_PATH}-x/api/placares`, payload: { nickname: 'BRUNO', points: 70 } })).statusCode).toBe(404);
  }));

  test.fails('CA-5 RN-0005: apelido, pontos e campos inválidos recebem 400 e nunca gravam #32', () => scenario(async (app, db) => {
    const invalid = [
      { nickname: 'AB', points: 7 }, { nickname: 'ABCDEFGHIJKLM', points: 7 },
      { nickname: 'A<script>', points: 7 }, { nickname: 'pUtÁ', points: 7 },
      { nickname: 'VALIDO', points: -7 }, { nickname: 'VALIDO', points: 7.5 },
      { nickname: 'VALIDO', points: 1897 }, { nickname: 'VALIDO', points: 1 },
      { nickname: 'VALIDO', points: '7' }, { nickname: 'VALIDO', points: 7, admin: true },
    ];
    for (const [index, payload] of invalid.entries()) {
      const result = await app.inject({ method: 'POST', url: `${BASE_PATH}/api/placares`, remoteAddress: `203.0.113.${index + 1}`, payload });
      expect(result.statusCode, JSON.stringify(payload)).toBe(400);
      expect(result.headers['content-type']).toContain('application/problem+json');
      expect((await db.query('select count(*) as count from scores')).rows[0].count).toBe(0);
    }
  }));

  test.fails('CA-6 RN-0006: limite por IP recebe 429 sem gravação e cabeçalho forjado não muda a chave #32', () => scenario(async (app, db) => {
    const request = { method: 'POST', url: `${BASE_PATH}/api/placares`, remoteAddress: '203.0.113.20', payload: { nickname: 'BRUNO', points: 7 } };
    for (let index = 0; index < 5; index++) expect((await app.inject(request)).statusCode).toBe(201);
    const blocked = await app.inject({ ...request, headers: { 'x-forwarded-for': '203.0.113.99', 'x-snake-client-ip': '203.0.113.99' } });
    expect(blocked.statusCode).toBe(429);
    expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
    expect(Number(blocked.headers['retry-after'])).toBeLessThanOrEqual(60);
    expect((await db.query('select count(*) as count from scores')).rows[0].count).toBe(5);
    expect((await app.inject({ ...request, remoteAddress: '203.0.113.21' })).statusCode).toBe(201);
  }));
});
