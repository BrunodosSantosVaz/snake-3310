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
    expect(readConfig({ BASE_PATH: '/snake-3310' })).toEqual({
      port: 8080,
      basePath: '/snake-3310',
      sqlitePath: resolve('data/snake-3310.sqlite'),
      webDir: resolve('dist/web'),
      production: false,
    });
  });

  test('enables production transport policy only for NODE_ENV=production', () => {
    expect(readConfig({ NODE_ENV: 'production' }).production).toBe(true);
    expect(readConfig({ NODE_ENV: 'development' }).production).toBe(false);
  });

  test('uses an explicit durable path and rejects memory, empty, URI or dist storage', () => {
    expect(readConfig({ SQLITE_PATH: '/var/lib/snake/scores.sqlite', PORT: '8888' }).sqlitePath).toBe('/var/lib/snake/scores.sqlite');
    for (const SQLITE_PATH of [':memory:', '', 'file:temporary?mode=memory', 'dist/scores.sqlite', 'dist/server/data.sqlite']) {
      expect(() => readConfig({ SQLITE_PATH })).toThrow('SQLITE_PATH');
    }
    expect(() => readConfig({ PORT: 'abc' })).toThrow('PORT');
  });
});
