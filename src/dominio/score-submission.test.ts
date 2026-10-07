import { expect, test } from 'vitest';
import { validSubmission } from './score-submission.js';

test.each([
  { nickname: 'ÁNA', points: 0 }, { nickname: 'ABCDEFGHIJKL', points: 1890 },
  { nickname: '猫咪猫', points: 7 }, { nickname: '𐐀𐐁𐐂', points: 14 }, { nickname: 'ANA123', points: 70 },
])('accepts Unicode letters/numbers and plausible integer points: %j', (payload) => {
  expect(validSubmission(payload)).toBe(true);
});

test.each([
  null, [], 'ANA', {}, { nickname: 'AB', points: 7 }, { nickname: 'ABCDEFGHIJKLM', points: 7 },
  { nickname: ' ANA', points: 7 }, { nickname: 'A_NA', points: 7 }, { nickname: '<ANA>', points: 7 },
  { nickname: '😀ANA', points: 7 }, { nickname: 'pUtÁ', points: 7 }, { nickname: 'PORRA123', points: 7 },
  { nickname: 'cu1', points: 7 }, { nickname: 'FdP', points: 7 },
  { nickname: 'ÁNA', points: '7' }, { nickname: 'ÁNA', points: true }, { nickname: 123, points: 7 },
  { nickname: 'ÁNA', points: -7 }, { nickname: 'ÁNA', points: 7.5 }, { nickname: 'ÁNA', points: 1897 },
  { nickname: 'ÁNA', points: 1 }, { nickname: 'ÁNA', points: NaN }, { nickname: 'ÁNA', points: Infinity },
  { nickname: 'ÁNA', points: 7, admin: true }, { nickname: 'ÁNA', points: 7, createdAt: '2020-01-01' },
])('rejects invalid or offensive submission: %j', (payload) => {
  expect(validSubmission(payload)).toBe(false);
});
