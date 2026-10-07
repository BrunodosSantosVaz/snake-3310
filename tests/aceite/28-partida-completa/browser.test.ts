import { resolve } from 'node:path';
import axe from 'axe-core';
import { chromium } from 'playwright';
import { expect, test } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function load(path: string): Promise<any> { return import(path); }
test('CA-8 RN-0004 RN-0005: build real joga por teclado em 360px, texto200%, foco, toque44px e axe #33', async () => {
  const { buildApp } = await load('../../../src/interface/http/app');
  const app = await buildApp({ basePath: '/snake-3310-hom', webDir: resolve('dist/web'), production: true, db: { query: async () => ({ rows: [] }) } });
  let browser;
  try {
    await app.listen({ host: '127.0.0.1', port: 0 });
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(`http://127.0.0.1:${app.server.address().port}/snake-3310-hom/`);
    expect(response!.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
    await page.getByRole('button', { name: 'Jogar', exact: true }).click();
    expect(await page.locator('#play canvas').count()).toBe(1);
    await page.keyboard.press('Space');
    expect(await page.locator('#game-status').textContent()).toMatch(/pausa/i);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    const layout = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth,
      controls: [...document.querySelectorAll<HTMLButtonElement>('button')].filter((button) => button.checkVisibility()).map((button) => ({ width: button.getBoundingClientRect().width, height: button.getBoundingClientRect().height })),
    }));
    expect(layout.overflow).toBe(false);
    expect(layout.controls.every(({ width, height }) => width >= 44 && height >= 44)).toBe(true);
    await page.locator('[data-key="5"]').focus();
    expect(await page.locator('[data-key="5"]').evaluate((button) => getComputedStyle(button).boxShadow !== 'none' || getComputedStyle(button).outlineStyle !== 'none')).toBe(true);
    await page.evaluate(axe.source);
    expect(await page.evaluate(async () => (await (globalThis as unknown as { axe: typeof axe }).axe.run()).violations.map(({ id }) => id))).toEqual([]);
    await page.locator('#play-heading').focus();
    await page.keyboard.press('Space');
    await page.locator('dialog[open]').waitFor({ state: 'visible', timeout: 8_000 });
    expect(await page.locator('dialog input').evaluate((input) => (input as HTMLInputElement).labels!.length)).toBeGreaterThan(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(false);
    expect(await page.evaluate(async () => (await (globalThis as unknown as { axe: typeof axe }).axe.run()).violations.map(({ id }) => id))).toEqual([]);
    await page.getByRole('button', { name: 'Jogar de novo', exact: true }).click();
    expect(await page.locator('dialog[open]').count()).toBe(0);
    expect(await page.evaluate(() => document.activeElement?.closest('#play') !== null)).toBe(true);
    expect(errors).toEqual([]);
  } finally { await browser?.close(); await app.close(); }
});
