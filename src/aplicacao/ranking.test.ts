import { describe, expect, test } from 'vitest';
import { ListRanking } from './ranking.js';

describe('ListRanking', () => {
  test('asks the repository for the top 10 and exposes only nickname and points', async () => {
    let asked = 0;
    const repo = {
      top: async (limit: number) => {
        asked = limit;
        return [
          { nickname: 'B', points: 1, createdAt: new Date(0) },
          { nickname: 'A', points: 2, createdAt: new Date(0) },
        ];
      },
    };
    await expect(new ListRanking(repo).execute()).resolves.toEqual([
      { nickname: 'A', points: 2 },
      { nickname: 'B', points: 1 },
    ]);
    expect(asked).toBe(10);
  });

  test('returns an empty ranking when there are no scores', async () => {
    await expect(new ListRanking({ top: async () => [] }).execute()).resolves.toEqual([]);
  });
});
