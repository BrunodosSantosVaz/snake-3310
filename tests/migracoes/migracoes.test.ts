// Checklist de produção: as migrações rodam do zero e de novo sem efeito (idempotentes).
import { PGlite } from '@electric-sql/pglite';
import { readdirSync } from 'node:fs';
import { describe, expect, test } from 'vitest';
import { migrate } from '../../src/infra/database/migrations.js';

function wrap(pglite: PGlite) {
  return {
    query: async <T>(sql: string, params?: unknown[]) =>
      params && params.length > 0
        ? { rows: (await pglite.query<T>(sql, params)).rows }
        : { rows: ((await pglite.exec(sql)).at(-1)?.rows ?? []) as T[] },
  };
}

describe('migrações', () => {
  test('rodam do zero, em ordem, e uma segunda vez não fazem nada', async () => {
    const pglite = new PGlite();
    const db = wrap(pglite);
    const files = readdirSync('migrations').filter((f) => f.endsWith('.sql')).sort();
    expect(await migrate(db)).toEqual(files);
    expect(await migrate(db)).toEqual([]);
    await pglite.close();
  });

  test('uma migração com erro não fica marcada como aplicada', async () => {
    const pglite = new PGlite();
    const db = wrap(pglite);
    const { mkdtempSync, writeFileSync } = await import('node:fs');
    const { join } = await import('node:path');
    const { tmpdir } = await import('node:os');
    const dir = mkdtempSync(join(tmpdir(), 'mig-'));
    writeFileSync(join(dir, '0001_bad.sql'), 'create table x (;');
    await expect(migrate(db, dir)).rejects.toThrow('0001_bad.sql');
    expect((await db.query('select name from schema_migrations')).rows).toEqual([]);
    await pglite.close();
  });
});
