import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, expect, test } from 'vitest';
import { readConfig } from '../infra/config.js';
import { createSqliteDatabase } from '../infra/database/db.js';
import { startServer } from './startup.js';

const cleanup: Array<() => unknown> = [];
afterEach(async () => { while (cleanup.length) await cleanup.pop()?.(); });
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), 'snake-startup-'));
  cleanup.push(() => rmSync(directory, { recursive: true, force: true }));
  writeFileSync(join(directory, 'index.html'), '<!doctype html><title>Snake 3310</title><h1>Snake 3310</h1>');
  return { directory, config: { ...readConfig({ SQLITE_PATH: join(directory, 'data', 'scores.sqlite'), WEB_DIR: directory, BASE_PATH: '/snake-3310-hom', NODE_ENV: 'production' }), port: 0 } };
}
function origin(server: Awaited<ReturnType<typeof startServer>>) {
  const address = server.app.server.address();
  if (!address || typeof address === 'string') throw new Error('missing TCP address');
  return `http://127.0.0.1:${address.port}/snake-3310-hom`;
}

test('startup migrates a new durable file before listening and serves ready, ranking and protected HTML', async () => {
  const { config } = fixture();
  const server = await startServer(config);
  cleanup.push(() => server.close());
  expect((await server.db.query('select name from schema_migrations')).rows).toEqual([{ name: '0001_create_scores.sql' }]);
  const ready = await fetch(`${origin(server)}/api/ready`);
  expect(ready.status).toBe(200);
  expect(await ready.json()).toEqual({ status: 'ok' });
  expect(await (await fetch(`${origin(server)}/api/placares`)).json()).toEqual({ scores: [] });
  const page = await fetch(`${origin(server)}/`);
  expect(await page.text()).toContain('Snake 3310');
  expect(page.headers.get('content-security-policy')).toContain("frame-ancestors 'none'");
  expect(page.headers.get('strict-transport-security')).toContain('max-age=31536000');
});

test('a second startup is idempotent and preserves scores after close and reopen', async () => {
  const { config } = fixture();
  const first = await startServer(config);
  cleanup.push(() => first.close());
  await first.db.query('insert into scores (nickname, points) values ($1, $2)', ['Ficticio', 21]);
  await first.close();
  const second = await startServer(config);
  cleanup.push(() => second.close());
  expect(await (await fetch(`${origin(second)}/api/placares`)).json()).toEqual({ scores: [{ nickname: 'Ficticio', points: 21 }] });
  expect((await second.db.query('select count(*) as total from schema_migrations')).rows).toEqual([{ total: 1 }]);
});

test('startup passes the configured proxy allowlist to the API limiter', async () => {
  const { config } = fixture();
  const server = await startServer({ ...config, trustedProxyIps: ['127.0.0.1'] });
  cleanup.push(() => server.close());
  const send = (client: string) => fetch(`${origin(server)}/api/placares`, {
    method: 'POST', headers: { 'content-type': 'application/json', 'x-snake-client-ip': client },
    body: JSON.stringify({ nickname: 'ANA', points: 7 }),
  });
  for (let index = 0; index < 5; index++) expect((await send('203.0.113.1')).status).toBe(201);
  expect((await send('203.0.113.1')).status).toBe(429);
  expect((await send('203.0.113.2')).status).toBe(201);
});

test('migration failure rolls back the file, closes storage and never opens the HTTP port', async () => {
  const { config, directory } = fixture();
  const reservation = createServer();
  await new Promise<void>((resolve) => reservation.listen(0, '127.0.0.1', resolve));
  const address = reservation.address();
  if (!address || typeof address === 'string') throw new Error('missing port reservation');
  await new Promise<void>((resolve, reject) => reservation.close((error) => error ? reject(error) : resolve()));
  writeFileSync(join(directory, '0001_broken.sql'), 'select 1; create table partial (n integer); select * from missing_table;');
  await expect(startServer({ ...config, port: address.port }, directory)).rejects.toThrow('0001_broken.sql');
  await expect(fetch(`http://127.0.0.1:${address.port}/snake-3310-hom/api/health`)).rejects.toThrow();
  const db = createSqliteDatabase(config.sqlitePath);
  cleanup.push(() => db.close());
  expect((await db.query('select name from schema_migrations')).rows).toEqual([]);
  expect((await db.query("select name from sqlite_schema where name = 'partial'")).rows).toEqual([]);
  await db.transaction(async (tx) => { await tx.query('create table recovered (n integer)'); });
});
