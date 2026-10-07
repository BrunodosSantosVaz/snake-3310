import { describe, expect, test } from 'vitest';
import { apiUrl, rankingLines, parseRanking } from './ranking.js';

describe('ranking screen helpers', () => {
  test('shows only the first five, numbered with pt-BR points', () => {
    const entries = Array.from({ length: 10 }, (_, index) => ({ nickname: `P${index}`, points: 1234 - index }));
    expect(rankingLines(entries)).toEqual([
      ['1. P0', '1.234'], ['2. P1', '1.233'], ['3. P2', '1.232'], ['4. P3', '1.231'], ['5. P4', '1.230'],
    ]);
  });
  test.each(['https://example.test/', 'https://example.test/snake-3310-hom/', 'https://example.test/snake-3310-hom/index.html'])('resolves the API relative to page %s', (base) => {
    expect(apiUrl('placares', base)).toBe(new URL('./api/placares', base).href);
  });
  test('accepts only the public score shape', () => {
    expect(parseRanking({ scores: [{ nickname: 'ANA', points: 0 }] })).toEqual([{ nickname: 'ANA', points: 0 }]);
    for (const value of [null, {}, { scores: 'bad' }, { scores: [{ nickname: 1, points: 10 }] }, { scores: [{ nickname: 'ANA', points: -1 }] }, { scores: [{ nickname: 'ANA', points: 1.5 }] }]) {
      expect(() => parseRanking(value)).toThrow();
    }
  });
});
