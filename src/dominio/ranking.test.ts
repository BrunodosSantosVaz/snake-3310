import { describe, expect, test } from 'vitest';
import { RANKING_SIZE, rankScores, type Score } from './ranking.js';

const score = (nickname: string, points: number, minute: number): Score => ({
  nickname,
  points,
  createdAt: new Date(Date.UTC(2026, 9, 1, 10, minute)),
});

describe('rankScores (RN-0001)', () => {
  test('orders by points, highest first', () => {
    const ranked = rankScores([score('A', 1, 0), score('B', 3, 1), score('C', 2, 2)]);
    expect(ranked.map((s) => s.nickname)).toEqual(['B', 'C', 'A']);
  });

  test('breaks ties by the earlier score', () => {
    const ranked = rankScores([score('LATE', 5, 9), score('EARLY', 5, 1)]);
    expect(ranked.map((s) => s.nickname)).toEqual(['EARLY', 'LATE']);
  });

  test('keeps at most the top 10', () => {
    const many = Array.from({ length: 15 }, (_, i) => score(`P${i}`, i, i));
    expect(rankScores(many)).toHaveLength(RANKING_SIZE);
    expect(rankScores(many)[0]?.points).toBe(14);
  });

  test('does not change the input', () => {
    const input = [score('A', 1, 0), score('B', 2, 1)];
    rankScores(input);
    expect(input.map((s) => s.nickname)).toEqual(['A', 'B']);
  });
});
