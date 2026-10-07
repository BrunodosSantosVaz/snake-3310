import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test, expect } from 'vitest';
import { createSqliteDatabase } from './db.js';
import { migrate } from './migrations.js';
import { buildApp } from '../../interface/http/app.js';

test('real file preserves ranking after reopen and closed storage returns generic readiness failure', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'snake-persistence-'));
  const path = join(dir, 'scores.sqlite');
  let db = createSqliteDatabase(path);
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;
  try {
    await migrate(db);
    await db.query('insert into scores (nickname, points) values ($1, $2)', ['Ficticio', 21]);
    await db.close();
    db = createSqliteDatabase(path);
    expect(await migrate(db)).toEqual([]);
    app = await buildApp({ basePath: '/snake-3310', db });
    expect((await app.inject('/snake-3310/api/placares')).json()).toEqual({ scores: [{ nickname: 'Ficticio', points: 21 }] });
    expect((await app.inject('/snake-3310/api/ready')).statusCode).toBe(200);
    await db.close();
    const ready = await app.inject('/snake-3310/api/ready');
    expect(ready.statusCode).toBe(503);
    expect(ready.body).not.toContain(path);
    expect((await app.inject('/snake-3310/api/health')).statusCode).toBe(200);
    const ranking = await app.inject('/snake-3310/api/placares');
    expect(ranking.statusCode).toBe(500);
    expect(ranking.body).not.toMatch(/sqlite|SQL|closed|Ficticio/);
  } finally {
    await app?.close();
    await db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
