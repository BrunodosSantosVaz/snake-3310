import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import type { ClosableDb } from './db.js';
import { SqlScoreRepository } from './score-repository.js';
import { createTestDatabase } from '../../../tests/apoio/banco.js';

describe('SqlScoreRepository (integration, SQLite)', () => {
  let db: ClosableDb;

  beforeEach(async () => {
    ({ db } = await createTestDatabase());
  });
  afterEach(async () => db.close());

  test('returns the highest scores first, ties by the earlier one, up to the limit', async () => {
    for (const [nickname, points, at] of [
      ['A', 10, '2026-10-01T10:00:00Z'],
      ['B', 30, '2026-10-01T10:01:00Z'],
      ['C', 30, '2026-10-01T09:00:00Z'],
    ] as const) {
      await db.query('insert into scores (nickname, points, created_at) values ($1, $2, $3)', [nickname, points, at]);
    }
    const top = await new SqlScoreRepository(db).top(2);
    expect(top.map((s) => s.nickname)).toEqual(['C', 'B']);
    expect(top[0]?.createdAt.toISOString()).toBe('2026-10-01T09:00:00.000Z');
  });

  test('orders UTC instants with mixed fractional precision and enforces integer bounds', async () => {
    await db.query('insert into scores (nickname, points, created_at) values ($1, $2, $3)', ['later', 21, '2026-10-01T09:00:00.001Z']);
    await db.query('insert into scores (nickname, points, created_at) values ($1, $2, $3)', ['earlier', 21, '2026-10-01T09:00:00Z']);
    expect((await new SqlScoreRepository(db).top(10)).map((s) => s.nickname)).toEqual(['earlier', 'later']);
    for (const points of [-1, 1.5, 2147483648]) {
      await expect(db.query('insert into scores (nickname, points) values ($1, $2)', ['invalid', points])).rejects.toThrow();
    }
    const inserted = (await db.query<{ created_at: string }>('insert into scores (nickname, points) values ($1, $2) returning created_at', ['default', 7])).rows[0];
    expect(inserted?.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
  });
});
