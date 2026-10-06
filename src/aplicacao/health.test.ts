import { describe, expect, test } from 'vitest';
import { CheckReadiness } from './health.js';

describe('CheckReadiness', () => {
  test('is ready when the database answers', async () => {
    await expect(new CheckReadiness({ ping: async () => undefined }).execute()).resolves.toBe(true);
  });

  test('is not ready when the database fails', async () => {
    const probe = { ping: async () => Promise.reject(new Error('down')) };
    await expect(new CheckReadiness(probe).execute()).resolves.toBe(false);
  });
});
