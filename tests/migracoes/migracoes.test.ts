// Checklist de produção: as migrações rodam do zero, de novo sem efeito, e uma migração com erro não deixa rastro.
import { mkdtempSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { migrate } from '../../src/infra/database/migrations.js';
import { createPgliteDatabase } from '../apoio/banco.js';

const cleanup: Array<() => unknown> = [];
afterEach(async () => {
  while (cleanup.length) await cleanup.pop()?.();
});

describe('migrações', () => {
  test('rodam do zero, em ordem, e uma segunda vez não fazem nada', async () => {
    const db = await createPgliteDatabase();
    cleanup.push(() => db.close());
    const files = readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort();
    expect(await migrate(db)).toEqual(files);
    expect(await migrate(db)).toEqual([]);
  });

  test('uma migração que falha no meio desfaz o que já tinha feito e não fica marcada', async () => {
    const db = await createPgliteDatabase();
    cleanup.push(() => db.close());
    const dir = mkdtempSync(join(tmpdir(), 'mig-'));
    cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    writeFileSync(join(dir, '0001_half.sql'), 'create table y (id int); select 1/0;');
    await expect(migrate(db, dir)).rejects.toThrow('0001_half.sql');
    expect((await db.query('select name from schema_migrations')).rows).toEqual([]);
    expect((await db.query("select to_regclass('y') as t")).rows).toEqual([{ t: null }]);
  });
});
