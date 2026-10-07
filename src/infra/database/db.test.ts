import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { createSqliteDatabase, describeError } from './db.js';

const cleanup: Array<() => unknown> = [];
afterEach(async () => { while (cleanup.length) await cleanup.pop()?.(); });

function open(path = ':memory:') {
  const db = createSqliteDatabase(path);
  cleanup.push(() => db.close());
  return db;
}

describe('describeError', () => {
  test('keeps only code and message', () => {
    expect(describeError(Object.assign(new Error('boom'), { code: 'SQLITE_BUSY', client: { secret: 'x' } }))).toEqual({ code: 'SQLITE_BUSY', message: 'boom' });
    expect(describeError(undefined)).toEqual({ message: 'erro desconhecido' });
  });
});

describe('SQLite adapter', () => {
  test('binds $n natively and does not interpret values as SQL', async () => {
    const db = open();
    await db.query('create table samples (value text, n integer) strict');
    const attack = "'); drop table samples; --";
    await db.query('insert into samples values ($1, $2)', [attack, 7]);
    expect((await db.query('select value, n from samples where n = $1', [7])).rows).toEqual([{ value: attack, n: 7 }]);
    expect((await db.query('select $2 as second, $1 as first', ['a', 'b'])).rows).toEqual([{ second: 'b', first: 'a' }]);
  });

  test('rejects SQL batches in query without partially executing them, with or without bindings', async () => {
    const db = open();
    await expect(db.query('select 1; create table skipped (n integer);')).rejects.toThrow('single');
    await expect(db.query('select $1; create table skipped (n integer);', [7])).rejects.toThrow('single');
    await expect(db.query('create table skipped (n integer); select 1;')).rejects.toThrow('single');
    expect((await db.query("select name from sqlite_schema where name = 'skipped'")).rows).toEqual([]);
    expect((await db.query("select 'value; -- text' as value; /* trailing comment */ -- end")).rows).toEqual([{ value: 'value; -- text' }]);
  });

  test('rolls back failures and serializes transactions with unrelated queries', async () => {
    const db = open();
    await db.query('create table samples (n integer) strict');
    let release!: () => void;
    const gate = new Promise<void>((resolve) => { release = resolve; });
    const transaction = db.transaction(async (tx) => {
      await tx.query('insert into samples values ($1)', [1]);
      await gate;
      throw new Error('rollback');
    });
    const outside = db.query('insert into samples values ($1)', [2]);
    release();
    await expect(transaction).rejects.toThrow('rollback');
    await outside;
    await db.transaction(async (tx) => { await tx.query('insert into samples values ($1)', [3]); });
    expect((await db.query('select n from samples order by n')).rows).toEqual([{ n: 2 }, { n: 3 }]);
  });

  test('creates parent folders, persists outside dist, enables WAL and busy timeout', async () => {
    const dir = mkdtempSync(join(tmpdir(), 'snake-db-'));
    cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    const path = join(dir, 'data', 'scores.sqlite');
    const db = open(path);
    await db.exec('create table samples (n integer) strict; insert into samples values (7);');
    expect((await db.query('pragma journal_mode')).rows).toEqual([{ journal_mode: 'wal' }]);
    expect((await db.query('pragma busy_timeout')).rows).toEqual([{ timeout: 5000 }]);
    await db.close();
    const reopened = open(path);
    expect((await reopened.query('select n from samples')).rows).toEqual([{ n: 7 }]);
  });

  test('closes once and rejects operations after close without crashing', async () => {
    const db = open();
    await db.close();
    await expect(db.close()).resolves.toBeUndefined();
    await expect(db.query('select 1')).rejects.toThrow();
    await expect(db.transaction(async () => 1)).rejects.toThrow();
  });
});
