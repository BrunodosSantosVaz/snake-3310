import { createServer } from 'node:http';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { expect, test } from 'vitest';
const exec = promisify(execFile);

test('native smoke works without npm dependencies, honors SMOKE_URL, checks CSP and score contract', async () => {
  let broken = false;
  const requested: string[] = [];
  const server = createServer((request, response) => {
    requested.push(request.url ?? '');
    response.setHeader('Content-Security-Policy', "default-src 'self'; frame-ancestors 'none'; object-src 'none'");
    response.setHeader('X-Content-Type-Options', 'nosniff');
    const path = request.url?.replace('/snake-3310-hom', '');
    response.setHeader('Content-Type', path === '/' ? 'text/html' : 'application/json');
    response.end(path === '/' ? '<!doctype html><title>Snake 3310</title>' : path === '/api/placares' ? JSON.stringify({ scores: broken ? [{ nickname: 'Ficticio', points: '7' }] : [{ nickname: 'Ficticio', points: 7 }] }) : JSON.stringify({ status: 'ok' }));
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('missing port');
    const SMOKE_URL = `http://127.0.0.1:${address.port}/snake-3310-hom`;
    const result = await exec(process.execPath, ['scripts/smoke.mjs'], { env: { ...process.env, BB_URL: '', SMOKE_URL } });
    expect(result.stdout).toContain('/api/ready');
    expect(new Set(requested)).toEqual(new Set(['/snake-3310-hom/api/health', '/snake-3310-hom/api/ready', '/snake-3310-hom/api/placares', '/snake-3310-hom/']));
    broken = true;
    await expect(exec(process.execPath, ['scripts/smoke.mjs'], { env: { ...process.env, BB_URL: SMOKE_URL, SMOKE_URL: '' } })).rejects.toMatchObject({ code: 1 });
    await expect(exec(process.execPath, ['scripts/smoke.mjs'], { env: { ...process.env, BB_URL: '', SMOKE_URL: '' } })).rejects.toMatchObject({ code: 2 });
  } finally {
    await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  }
});
