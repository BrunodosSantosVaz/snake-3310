import { describe, expect, test } from 'vitest';
import { CheckReadiness } from './health.js';

describe('CheckReadiness', () => {
  test('is ready when the database answers', async () => {
    await expect(new CheckReadiness({ ping: async () => undefined }).execute()).resolves.toBe(true);
  });

  test('is not ready when the database fails, and reports why', async () => {
    const reports: unknown[] = [];
    const failure = new Error('down');
    const probe = { ping: async () => Promise.reject(failure) };
    await expect(new CheckReadiness(probe, (error) => reports.push(error)).execute()).resolves.toBe(false);
    expect(reports).toEqual([failure]);
  });

  test('works without a reporter', async () => {
    const probe = { ping: async () => Promise.reject(new Error('down')) };
    await expect(new CheckReadiness(probe).execute()).resolves.toBe(false);
  });
});
