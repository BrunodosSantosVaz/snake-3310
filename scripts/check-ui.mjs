import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import { buildApp } from '../dist/server/interface/http/app.js';

const require = createRequire(import.meta.url);
const scores = Array.from({ length: 10 }, () => ({ nickname: 'ABCDEFGHIJKL', points: 2147483647, created_at: new Date(0) }));
const server = await buildApp({
  basePath: '/snake-3310-hom', production: true, webDir: resolve('dist/web'),
  db: { query: async () => ({ rows: scores }) },
});
let browser;
try {
  await server.listen({ host: '127.0.0.1', port: 5174 });
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await page.addInitScript(() => {
    globalThis.cspViolations = [];
    globalThis.document.addEventListener('securitypolicyviolation', (event) => globalThis.cspViolations.push(event.violatedDirective));
  });
  const response = await page.goto('http://127.0.0.1:5174/snake-3310-hom/');
  assert.ok(response.headers()['content-security-policy'].includes("frame-ancestors 'none'"));
  // The test harness evaluates axe through DevTools; the app retains its strict CSP without bypassCSP.
  await page.evaluate(await readFile(require.resolve('axe-core/axe.min.js'), 'utf8'));
  const accessibility = async () => {
    const violations = await page.evaluate(async () => (await globalThis.axe.run()).violations.map(({ id, nodes }) => ({
      id, elements: nodes.map(({ target, failureSummary }) => ({ target, failureSummary })),
    })));
    assert.deepEqual(violations, []);
  };
  await accessibility();
  const layout = await page.evaluate(() => ({
    overflow: globalThis.document.documentElement.scrollWidth > globalThis.innerWidth,
    keys: [...globalThis.document.querySelectorAll('.key, .menu button')].map((key) => {
      const { width, height } = key.getBoundingClientRect();
      return { width, height };
    }),
  }));
  assert.equal(layout.overflow, false);
  assert.ok(layout.keys.every(({ width, height }) => width >= 44 && height >= 44));
  const focus = await page.locator('[data-screen="play"]').evaluate((button) => ({
    shadow: getComputedStyle(button).boxShadow,
    background: getComputedStyle(globalThis.document.querySelector('.screen')).backgroundColor,
  }));
  assert.ok(contrast(focus.shadow, focus.background) >= 3, 'focus edge must contrast with the green screen');
  await mkdir('docs/imagens', { recursive: true });
  await page.screenshot({ path: 'docs/imagens/menu-3310.png', fullPage: true });
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.waitForSelector('#ranking-list li');
  assert.equal(await page.locator('#ranking-list li').count(), 5);
  const visible = await page.locator('#ranking-list li').evaluateAll((items) => items.every((item) => {
    const row = item.getBoundingClientRect();
    const screen = globalThis.document.querySelector('.screen').getBoundingClientRect();
    return row.bottom <= screen.bottom && row.right <= screen.right;
  }));
  assert.equal(visible, true);
  await accessibility();
  await page.evaluate(() => { globalThis.document.documentElement.style.fontSize = '32px'; });
  const enlarged = await page.locator('#ranking-list span').evaluateAll((cells) => cells.every((cell) => {
    const rect = cell.getBoundingClientRect();
    const screen = globalThis.document.querySelector('.screen').getBoundingClientRect();
    return rect.bottom <= screen.bottom && cell.scrollWidth <= cell.clientWidth && getComputedStyle(cell).textOverflow !== 'ellipsis';
  }));
  assert.equal(enlarged, true, 'all names and points must remain readable at 200% text size');
  await page.keyboard.press('Escape');
  const menuFits = await page.locator('.menu button').evaluateAll((buttons) => buttons.every((button) =>
    button.getBoundingClientRect().bottom <= globalThis.document.querySelector('.screen').getBoundingClientRect().bottom,
  ));
  assert.equal(menuFits, true);
  await accessibility();
  assert.equal(await page.evaluate(() => globalThis.document.documentElement.scrollWidth > globalThis.innerWidth), false);
  assert.deepEqual(await page.evaluate(() => globalThis.cspViolations), []);
  console.log('UI: build/CSP, 360 px, 200% text, focus contrast, touch targets, ranking, keyboard and axe passed.');
} finally {
  await browser?.close();
  await server.close();
}

function contrast(first, second) {
  const luminance = (value) => {
    const rgb = value.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    assert.ok(rgb, `missing rendered color: ${value}`);
    const channels = rgb.slice(1).map((channel) => {
      const color = Number(channel) / 255;
      return color <= 0.04045 ? color / 12.92 : ((color + 0.055) / 1.055) ** 2.4;
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const colors = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (colors[0] + 0.05) / (colors[1] + 0.05);
}
