import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { buildApp } from '../dist/server/interface/http/app.js';
import { createSqliteDatabase } from '../dist/server/infra/database/db.js';
import { migrate } from '../dist/server/infra/database/migrations.js';

const require = createRequire(import.meta.url);
const db = createSqliteDatabase(':memory:');
await migrate(db);
const server = await buildApp({
  basePath: '/snake-3310-hom', production: true, webDir: resolve('dist/web'),
  db,
});
let browser;
try {
  await server.listen({ host: '127.0.0.1', port: 0 });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
  const errors = [];
  const sends = [];
  page.on('request', (request) => {
    if (request.method() === 'POST' && request.url().endsWith('/api/placares')) sends.push(request.postDataJSON());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.clock.install();
  await page.addInitScript(() => { Math.random = () => 0.99; });
  const response = await page.goto(`http://127.0.0.1:${server.server.address().port}/snake-3310-hom/`);
  assert.ok(response.headers()['content-security-policy'].includes("frame-ancestors 'none'"));
  await page.getByRole('button', { name: 'Jogar', exact: true }).click();
  const pixels = () => page.locator('#game-canvas').evaluate((canvas) => {
    const context = canvas.getContext('2d');
    const head = [...context.getImageData(24, 26, 1, 1).data];
    const ahead = [...context.getImageData(28, 26, 1, 1).data];
    return { head, ahead };
  });
  const initial = await pixels();
  assert.notDeepEqual(initial.head, initial.ahead);
  assert.equal(initial.head[3], 255);
  await page.clock.runFor(180);
  assert.deepEqual((await pixels()).ahead, initial.head, 'the snake must move to the next cell');
  await mkdir('docs/imagens', { recursive: true });
  await page.screenshot({ path: 'docs/imagens/partida-3310.png', fullPage: true });
  await page.keyboard.press('Space');
  const paused = await pixels();
  await page.clock.runFor(180 * 30);
  assert.deepEqual(await pixels(), paused);
  assert.match(await page.locator('#game-status').textContent(), /pausa/);
  await page.evaluate(() => { globalThis.document.documentElement.style.fontSize = '200%'; });
  await page.evaluate(await readFile(require.resolve('axe-core/axe.min.js'), 'utf8'));
  const accessible = async () => {
    assert.deepEqual(await page.evaluate(async () => (await globalThis.axe.run()).violations.map(({ id }) => id)), []);
    assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth), false);
    assert.equal(await page.locator('button').evaluateAll((buttons) => buttons.filter((button) => button.checkVisibility()).every((button) => {
      const { width, height } = button.getBoundingClientRect();
      return width >= 44 && height >= 44;
    })), true);
  };
  await accessible();
  await page.locator('[data-key="5"]').focus();
  assert.equal(await page.locator('[data-key="5"]').evaluate((button) => globalThis.getComputedStyle(button).outlineStyle !== 'none'), true);
  await page.locator('#play-heading').focus();
  await page.keyboard.press('Space');
  await page.clock.runFor(180 * 30);
  assert.equal(await page.locator('dialog[open]').count(), 1);
  await accessible();
  assert.equal(await page.evaluate(() => globalThis.document.activeElement.id), 'game-nickname');
  await page.getByLabel('Apelido', { exact: true }).fill('ÁNA');
  const posted = page.waitForResponse((result) => result.request().method() === 'POST' && result.url().endsWith('/api/placares'));
  await page.keyboard.press('Enter');
  assert.equal((await posted).status(), 201);
  await page.getByText('Placar enviado!', { exact: true }).waitFor();
  assert.equal(await page.getByRole('button', { name: 'Enviar placar', exact: true }).isDisabled(), true);
  await page.locator('#score-form').evaluate((form) => form.requestSubmit());
  assert.deepEqual(sends, [{ nickname: 'ÁNA', points: 0 }]);
  await accessible();
  await page.getByRole('button', { name: 'Jogar de novo', exact: true }).click();
  assert.equal(await page.locator('dialog[open]').count(), 0);
  assert.equal(await page.locator('#game-score').textContent(), 'Pontos: 0');
  assert.equal(await page.evaluate(() => globalThis.document.activeElement.id), 'play-heading');
  assert.deepEqual(await pixels(), initial);
  await page.keyboard.press('Escape');
  await page.clock.runFor(180 * 30);
  assert.equal(await page.locator('dialog[open]').count(), 0);
  await page.getByRole('button', { name: 'Ranking', exact: true }).click();
  await page.locator('#ranking-list').getByText('1. ÁNA', { exact: true }).waitFor();
  assert.equal((await db.query('select nickname, points from scores')).rows.length, 1);
  assert.deepEqual(errors, []);
  console.log('Game UI: canvas screenshot, movement, pause, POST201 once, persisted ranking, restart, CSP, 360 px, text200%, touch44px, focus and axe passed.');
} finally {
  await browser?.close();
  await server.close();
  await db.close();
}
