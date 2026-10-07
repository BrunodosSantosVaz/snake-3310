import { expect, test } from 'vitest';
import { ScoreLimit } from './score-limit.js';

test('five attempts are allowed per fixed minute and blocked retries do not extend the window', () => {
  let now = 0;
  const limit = new ScoreLimit(() => now);
  for (let index = 0; index < 5; index++) expect(limit.take('203.0.113.1')).toBeNull();
  expect(limit.take('203.0.113.1')).toBe(60);
  expect(limit.take('203.0.113.2')).toBeNull();
  now = 59001;
  expect(limit.take('203.0.113.1')).toBe(1);
  now = 60000;
  expect(limit.take('203.0.113.1')).toBeNull();
});

test('the counter stays bounded without evicting a restricted IP and recovers after expiration', () => {
  let now = 0;
  const limit = new ScoreLimit(() => now, 2);
  for (let index = 0; index < 5; index++) expect(limit.take('a')).toBeNull();
  now = 1000;
  expect(limit.take('b')).toBeNull();
  expect(limit.take('c')).toBe(59);
  expect(limit.activeClients).toBe(2);
  expect(limit.take('a')).toBe(59);
  now = 60000;
  expect(limit.take('c')).toBeNull();
  expect(limit.activeClients).toBe(2);
  now = 121000;
  expect(limit.take('d')).toBeNull();
  expect(limit.activeClients).toBe(1);
});

test('a new process starts with fresh counters', () => {
  const limit = new ScoreLimit(() => 0);
  for (let index = 0; index < 5; index++) limit.take('a');
  expect(limit.take('a')).toBe(60);
  expect(new ScoreLimit(() => 0).take('a')).toBeNull();
});
