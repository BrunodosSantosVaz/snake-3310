// Checklist de produção: as migrações rodam do zero, de novo sem efeito, e uma migração com erro não deixa rastro.
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { migrate } from '../../src/infra/database/migrations.js';
import { createSqliteDatabase } from '../../src/infra/database/db.js';

const cleanup: Array<() => unknown> = [];
afterEach(async () => {
  while (cleanup.length) await cleanup.pop()?.();
});

describe('migrações', () => {
  test('rodam do zero, em ordem, e uma segunda vez não fazem nada', async () => {
    const db = createSqliteDatabase(':memory:');
    cleanup.push(() => db.close());
    const files = readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort();
    expect(await migrate(db)).toEqual(files);
    expect(await migrate(db)).toEqual([]);
  });

  test('migrações concorrentes no mesmo adaptador são aplicadas só uma vez', async () => {
    const db = createSqliteDatabase(':memory:');
    cleanup.push(() => db.close());
    const results = await Promise.all([migrate(db), migrate(db)]);
    expect(results.flat().sort()).toEqual(readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort());
  });

  test('uma migração que falha no meio desfaz o que já tinha feito e não fica marcada', async () => {
    const db = createSqliteDatabase(':memory:');
    cleanup.push(() => db.close());
    const dir = mkdtempSync(join(tmpdir(), 'mig-'));
    cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    writeFileSync(join(dir, '0001_half.sql'), 'create table y (id int); select * from missing_table;');
    await expect(migrate(db, dir)).rejects.toThrow('0001_half.sql');
    expect((await db.query('select name from schema_migrations')).rows).toEqual([]);
    expect((await db.query("select name from sqlite_schema where name = 'y'")).rows).toEqual([]);
  });
});

// Simulate the previous app process holding the file during a rolling deployment.
test('a migração espera o escritor de outro processo sem aplicar parcialmente', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'mig-rollout-'));
  const db = createSqliteDatabase(join(dir, 'scores.sqlite'));
  const child = spawn(process.execPath, ['--input-type=module', '-e', `
    import { DatabaseSync } from 'node:sqlite';
    const db = new DatabaseSync(process.argv[1], { timeout: 5000 });
    db.exec('BEGIN IMMEDIATE; create table previous_version (n integer) strict;');
    process.stdout.write('locked');
    setTimeout(() => { db.exec('insert into previous_version values (7); COMMIT;'); db.close(); }, 300);
  `, join(dir, 'scores.sqlite')], { stdio: ['ignore', 'pipe', 'pipe'] });
  try {
    const exited = once(child, 'exit');
    await once(child.stdout!, 'data');
    expect(await migrate(db)).toEqual(['0001_create_scores.sql']);
    expect((await db.query('select n from previous_version')).rows).toEqual([{ n: 7 }]);
    expect((await exited)[0]).toBe(0);
    expect(await migrate(db)).toEqual([]);
  } finally {
    child.kill();
    await db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
