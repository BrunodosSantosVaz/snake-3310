import { afterEach, expect, test, vi } from 'vitest';
import { buildApp, type AppOptions } from './app.js';
import { createTestDatabase } from '../../../tests/apoio/banco.js';

const cleanup: Array<() => Promise<unknown>> = [];
afterEach(async () => { for (const close of cleanup.splice(0).reverse()) await close(); vi.useRealTimers(); });
const url = '/snake-3310-hom/api/placares';
async function scenario(options: Partial<Omit<AppOptions, 'db'>> = {}) {
  const { db, close } = await createTestDatabase();
  const app = await buildApp({ basePath: '/snake-3310-hom', db, ...options });
  cleanup.push(close, () => app.close());
  return { app, db };
}
const payload = { nickname: 'ÁNA', points: 70 };

test('201 stores once in SQLite, uses UTC from the server and exposes only public fields', async () => {
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(new Date('2026-10-07T12:34:56.789Z'));
  const { app, db } = await scenario();
  const response = await app.inject({ method: 'POST', url, payload });
  expect(response.statusCode).toBe(201);
  expect(response.json()).toEqual(payload);
  expect((await db.query('select nickname, points, created_at from scores')).rows).toEqual([
    { nickname: 'ÁNA', points: 70, created_at: '2026-10-07T12:34:56.789Z' },
  ]);
  expect((await app.inject({ url })).json()).toEqual({ scores: [payload] });
});

test('strict JSON validation rejects wrong types, unknown fields, malformed JSON and oversized bodies without writing', async () => {
  const { app, db } = await scenario();
  const bad = [null, [], {}, { ...payload, points: '70' }, { ...payload, nickname: 123 }, { ...payload, admin: true }, { ...payload, created_at: '2000-01-01T00:00:00Z' }];
  for (const [index, input] of bad.entries()) {
    const response = await app.inject({ method: 'POST', url, remoteAddress: `203.0.113.${index}`, payload: JSON.stringify(input), headers: { 'content-type': 'application/json' } });
    expect(response.statusCode).toBe(400);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.json()).toEqual({ type: 'about:blank', title: 'Requisição inválida', status: 400 });
  }
  const malformed = await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.100', payload: '{', headers: { 'content-type': 'application/json' } });
  expect(malformed.statusCode).toBe(400);
  const oversized = await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.101', payload: { nickname: 'A'.repeat(2048), points: 7 } });
  expect(oversized.statusCode).toBe(413);
  expect((await db.query('select count(*) as total from scores')).rows).toEqual([{ total: 0 }]);
});

test('the same proxy grants independent client limits only for its dedicated sanitized header', async () => {
  const { app, db } = await scenario({ trustedProxyIps: ['10.42.0.1'] });
  const request = { method: 'POST' as const, url, remoteAddress: '::ffff:10.42.0.1', payload };
  for (let index = 0; index < 5; index++) expect((await app.inject({ ...request, headers: { 'x-snake-client-ip': '203.0.113.1' } })).statusCode).toBe(201);
  expect((await app.inject({ ...request, headers: { 'x-snake-client-ip': '203.0.113.1', 'x-forwarded-for': '203.0.113.3' } })).statusCode).toBe(429);
  expect((await app.inject({ ...request, headers: { 'x-snake-client-ip': '203.0.113.2' } })).statusCode).toBe(201);
  expect((await db.query('select count(*) as total from scores')).rows).toEqual([{ total: 6 }]);
});

test('untrusted headers, XFF, malformed values and client lists never create new quota identities', async () => {
  const { app } = await scenario({ trustedProxyIps: ['10.42.0.1'] });
  for (const remoteAddress of ['203.0.113.1', '10.42.0.2', '10.42.0.1']) {
    for (let index = 0; index < 5; index++) {
      const response = await app.inject({ method: 'POST', url, remoteAddress, payload, headers: {
        'x-forwarded-for': `203.0.113.${index + 10}`, 'x-snake-client-ip': remoteAddress === '10.42.0.1' ? `203.0.113.${index}, evil` : `203.0.113.${index + 20}`,
      } });
      expect(response.statusCode).toBe(201);
    }
    for (const value of ['garbage', '203.0.113.99:123', '203.0.113.4,203.0.113.5', 'unknown']) {
      const blocked = await app.inject({ method: 'POST', url, remoteAddress, payload, headers: { 'x-snake-client-ip': value } });
      expect(blocked.statusCode).toBe(429);
      expect(Number(blocked.headers['retry-after'])).toBeGreaterThan(0);
      expect(Number(blocked.headers['retry-after'])).toBeLessThanOrEqual(60);
    }
  }
});

test('IPv4 and its mapped IPv6 representation share a quota; fixed-window expiration resumes admission', async () => {
  vi.useFakeTimers({ toFake: ['Date'] }); vi.setSystemTime(0);
  const { app } = await scenario();
  const request = { method: 'POST' as const, url, remoteAddress: '203.0.113.1', payload };
  for (let index = 0; index < 5; index++) expect((await app.inject(request)).statusCode).toBe(201);
  expect((await app.inject({ ...request, remoteAddress: '::ffff:cb00:7101' })).statusCode).toBe(429);
  vi.setSystemTime(59001);
  expect((await app.inject(request)).headers['retry-after']).toBe('1');
  vi.setSystemTime(60000);
  expect((await app.inject(request)).statusCode).toBe(201);
});

test('concurrent submissions admit at most five and invalid attempts also consume quota', async () => {
  const { app, db } = await scenario();
  const responses = await Promise.all(Array.from({ length: 6 }, () => app.inject({ method: 'POST', url, payload })));
  expect(responses.map(({ statusCode }) => statusCode).sort()).toEqual([201, 201, 201, 201, 201, 429]);
  expect((await db.query('select count(*) as total from scores')).rows).toEqual([{ total: 5 }]);
  for (let index = 0; index < 5; index++) expect((await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.100', payload: { ...payload, points: '7' } })).statusCode).toBe(400);
  expect((await app.inject({ method: 'POST', url, remoteAddress: '203.0.113.100', payload })).statusCode).toBe(429);
});

test('storage failure responds with controlled 500 Problem Details', async () => {
  const app = await buildApp({ basePath: '/snake-3310-hom', db: { query: async () => { throw new Error('PRIVATE_DATABASE_FAILURE'); } } });
  cleanup.push(() => app.close());
  const result = await app.inject({ method: 'POST', url, payload });
  expect(result.statusCode).toBe(500);
  expect(result.json()).toEqual({ type: 'about:blank', title: 'Erro interno', status: 500 });
  expect(result.body).not.toContain('PRIVATE_DATABASE_FAILURE');
});
