import { describe, expect, test } from 'vitest';
import { buildApp } from './app.js';

const down = { query: async () => Promise.reject(new Error('down')) };

describe('buildApp', () => {
  test('serves the API at the root when basePath is empty', async () => {
    const app = await buildApp({ basePath: '', db: down });
    expect((await app.inject({ method: 'GET', url: '/api/health' })).statusCode).toBe(200);
    await app.close();
  });

  test('does not answer outside basePath', async () => {
    const app = await buildApp({ basePath: '/snake-3310', db: down });
    expect((await app.inject({ method: 'GET', url: '/api/health' })).statusCode).toBe(404);
    expect((await app.inject({ method: 'GET', url: '/snake-3310x/api/health' })).statusCode).toBe(404);
    await app.close();
  });

  test('hides internal errors', async () => {
    const app = await buildApp({ basePath: '', db: down });
    app.get('/boom', async () => {
      throw new Error('segredo interno');
    });
    const response = await app.inject({ method: 'GET', url: '/boom' });
    expect(response.statusCode).toBe(500);
    expect(response.json()).toEqual({ erro: 'erro interno' });
    await app.close();
  });
});
