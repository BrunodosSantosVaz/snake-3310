import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { normalizeBasePath, readConfig } from './config.js';

describe('normalizeBasePath', () => {
  test('accepts empty and simple paths, dropping the trailing slash', () => {
    expect(normalizeBasePath(undefined)).toBe('');
    expect(normalizeBasePath('/snake-3310/')).toBe('/snake-3310');
    expect(normalizeBasePath('/snake-3310-hom')).toBe('/snake-3310-hom');
  });

  test('rejects paths that could break routing', () => {
    expect(() => normalizeBasePath('snake')).toThrow();
    expect(() => normalizeBasePath('/../x')).toThrow();
    expect(() => normalizeBasePath('/a b')).toThrow();
  });
});

describe('readConfig', () => {
  test('reads the environment with defaults', () => {
    expect(readConfig({ DATABASE_URL: 'postgres://x', BASE_PATH: '/snake-3310' })).toEqual({
      port: 8080,
      basePath: '/snake-3310',
      databaseUrl: 'postgres://x',
      webDir: resolve('dist/web'),
      production: false,
    });
  });

  test('enables production transport policy only for NODE_ENV=production', () => {
    expect(readConfig({ DATABASE_URL: 'postgres://x', NODE_ENV: 'production' }).production).toBe(true);
    expect(readConfig({ DATABASE_URL: 'postgres://x', NODE_ENV: 'development' }).production).toBe(false);
  });

  test('requires DATABASE_URL and a valid port', () => {
    expect(() => readConfig({})).toThrow('DATABASE_URL');
    expect(() => readConfig({ DATABASE_URL: 'postgres://x', PORT: 'abc' })).toThrow('PORT');
  });
});
