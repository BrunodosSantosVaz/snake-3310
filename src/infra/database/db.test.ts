import { EventEmitter } from 'node:events';
import { describe, expect, test } from 'vitest';
import { createPool, describeError, listenForErrors } from './db.js';

describe('describeError', () => {
  test('keeps only code and message', () => {
    expect(describeError(Object.assign(new Error('boom'), { code: '57P01', client: { secret: 'x' } }))).toEqual({
      code: '57P01',
      message: 'boom',
    });
    expect(describeError(undefined)).toEqual({ message: 'erro desconhecido' });
  });
});

describe('listenForErrors', () => {
  test('an idle connection error is reported instead of crashing the process', () => {
    const pool = new EventEmitter();
    const reports: unknown[] = [];
    listenForErrors(pool, (error) => reports.push(error));
    expect(() => pool.emit('error', Object.assign(new Error('terminating connection'), { code: '57P01' }))).not.toThrow();
    expect(reports).toEqual([{ code: '57P01', message: 'terminating connection' }]);
  });
});

describe('createPool', () => {
  test('fails fast when the database is unreachable and closes only once', async () => {
    const db = createPool('postgres://snake:secret@127.0.0.1:1/snake', () => undefined);
    await expect(db.query('select 1')).rejects.toBeDefined();
    await expect(db.transaction(async () => 1)).rejects.toBeDefined();
    await db.close();
    await expect(db.close()).resolves.toBeUndefined();
  });
});
