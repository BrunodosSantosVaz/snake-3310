import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, test } from 'vitest';
import { buildApp } from './app.js';

const down = { query: async () => { throw new Error('private database error'); } };
const basePath = '/snake-3310';
let cleanup: Array<() => unknown> = [];
afterEach(async () => { for (const step of cleanup.reverse()) await step(); cleanup = []; });

async function app(production = false) {
  const webDir = mkdtempSync(join(tmpdir(), 'snake-headers-'));
  cleanup.push(() => rmSync(webDir, { recursive: true, force: true }));
  writeFileSync(join(webDir, 'index.html'), '<!doctype html><title>Snake</title>');
  const instance = await buildApp({ basePath, db: down, webDir, production });
  cleanup.push(() => instance.close());
  return instance;
}

describe('SEG-10 security headers', () => {
  test('the game, API, redirect and errors inherit a strict self-only policy', async () => {
    const instance = await app();
    for (const path of ['/', '/api/health', '/api/placares', '/api/missing', '']) {
      const response = await instance.inject({ method: 'GET', url: `${basePath}${path}` });
      expect(response.headers['content-security-policy']).toBe(
        "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'",
      );
      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
      expect(response.headers['permissions-policy']).toBe('camera=(), microphone=(), geolocation=()');
      expect(response.headers['x-frame-options']).toBe('DENY');
      expect(response.headers['strict-transport-security']).toBeUndefined();
    }
  });
  test('production adds HSTS while the local server does not', async () => {
    const response = await (await app(true)).inject({ method: 'GET', url: `${basePath}/` });
    expect(response.headers['strict-transport-security']).toBe('max-age=31536000');
  });
});
