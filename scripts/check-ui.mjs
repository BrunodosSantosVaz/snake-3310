import assert from 'node:assert/strict';
import { mkdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import { createServer } from 'vite';

const require = createRequire(import.meta.url);
const server = await createServer({ server: { host: '127.0.0.1', port: 5174, strictPort: true } });
let browser;
try {
  await server.listen();
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await page.route('**/api/placares', (route) => route.fulfill({
    json: { scores: Array.from({ length: 10 }, (_, i) => ({ nickname: `PLAYER${i}`, points: 1234 - i })) },
  }));
  await page.goto('http://127.0.0.1:5174/');
  await page.addScriptTag({ content: await readFile(require.resolve('axe-core/axe.min.js'), 'utf8') });
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
  console.log('UI: 360 px, touch targets, five ranking rows, keyboard and axe passed.');
} finally {
  await browser?.close();
  await server.close();
}
