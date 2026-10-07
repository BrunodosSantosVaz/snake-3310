import { readFileSync } from 'node:fs';
import axe from 'axe-core';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, test } from 'vitest';
import { mountUi, type RankingFetcher } from './ui.js';

let cleanup: Array<() => void> = [];
afterEach(() => { for (const step of cleanup.reverse()) step(); cleanup = []; });

function page(fetcher: RankingFetcher = async () => ({ ok: true, json: async () => ({ scores: [] }) })) {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const dom = new JSDOM(html, { url: 'https://example.test/snake-3310-hom/', runScripts: 'outside-only' });
  dom.window.HTMLCanvasElement.prototype.getContext = () => null;
  const ui = mountUi(dom.window.document, fetcher);
  cleanup.push(() => dom.window.close(), ui.destroy);
  return { dom, doc: dom.window.document };
}

function press(doc: Document, key: string) {
  doc.dispatchEvent(new doc.defaultView!.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
}
function click(doc: Document, selector: string) { doc.querySelector<HTMLButtonElement>(selector)!.click(); }
async function settle() { await new Promise((resolve) => setTimeout(resolve, 0)); }

describe('3310 menu and ranking', () => {
  test('keyboard navigation moves focus, opens instructions and returns to the selected menu item', () => {
    const { doc } = page();
    press(doc, 'ArrowUp');
    expect(doc.activeElement?.textContent).toBe('Instruções');
    press(doc, 'Enter');
    expect(doc.querySelector<HTMLElement>('#instructions')!.hidden).toBe(false);
    press(doc, 'Escape');
    expect(doc.querySelector<HTMLElement>('#menu')!.hidden).toBe(false);
    expect(doc.activeElement?.textContent).toBe('Instruções');
  });
  test('numeric and WASD keys navigate and native menu buttons work with clicks', async () => {
    const { doc } = page();
    press(doc, '8'); press(doc, 's'); press(doc, 'w'); press(doc, '5');
    await settle();
    expect(doc.querySelector<HTMLElement>('#ranking')!.hidden).toBe(false);
    click(doc, '[data-key="c"]');
    click(doc, '[data-screen="play"]');
    expect(doc.querySelector<HTMLElement>('#play')!.hidden).toBe(false);
    expect(doc.querySelector('#game-score')!.textContent).toBe('Pontos: 0');
    expect(doc.querySelector('#play canvas[role="img"][aria-label]')).not.toBeNull();
  });
  test('shows loading, then at most five scores as text without interpreting HTML', async () => {
    let finish!: (value: Awaited<ReturnType<RankingFetcher>>) => void;
    const { doc } = page(() => new Promise((resolve) => { finish = resolve; }));
    click(doc, '[data-screen="ranking"]');
    expect(doc.querySelector('#ranking-status')!.textContent).toBe('Carregando…');
    finish({ ok: true, json: async () => ({ scores: Array.from({ length: 10 }, () => ({ nickname: '<img src=x onerror=alert(1)>', points: 1234 })) }) });
    await settle();
    expect(doc.querySelectorAll('#ranking-list li')).toHaveLength(5);
    expect(doc.querySelector('#ranking-list')!.textContent).toContain('1. <img src=x onerror=alert(1)>');
    expect(doc.querySelector('#ranking-list img')).toBeNull();
    expect(doc.querySelector('#ranking-list')!.textContent).toContain('1.234');
  });
  test('empty ranking has the design message and requests the API under BASE_PATH', async () => {
    let requested = '';
    const { doc } = page(async (url) => { requested = url; return { ok: true, json: async () => ({ scores: [] }) }; });
    click(doc, '[data-screen="ranking"]'); await settle();
    expect(requested).toBe('https://example.test/snake-3310-hom/api/placares');
    expect(doc.querySelector('#ranking-status')!.textContent).toBe('Ninguém ainda. Seja o primeiro!');
  });
  test.each(['network', 'http', 'shape'])('failure %s shows error and OK retries successfully', async (failure) => {
    let attempt = 0;
    const { doc } = page(async () => {
      attempt++;
      if (attempt > 1) return { ok: true, json: async () => ({ scores: [{ nickname: 'ANA', points: 50 }] }) };
      if (failure === 'network') throw new Error('offline');
      return { ok: failure !== 'http', json: async () => ({ secret: 'internal' }) };
    });
    click(doc, '[data-screen="ranking"]'); await settle();
    expect(doc.querySelector('#ranking-status')!.textContent).toBe('Sem conexão. OK tenta de novo');
    click(doc, '[data-key="ok"]'); await settle();
    expect(attempt).toBe(2);
    expect(doc.querySelector('#ranking-list')!.textContent).toContain('ANA');
  });
  test('an old request cannot overwrite a new ranking after leaving and reopening it', async () => {
    const pending: Array<(value: Awaited<ReturnType<RankingFetcher>>) => void> = [];
    const { doc } = page(() => new Promise((resolve) => pending.push(resolve)));
    click(doc, '[data-screen="ranking"]'); click(doc, '[data-key="c"]'); click(doc, '[data-screen="ranking"]');
    pending[1]!({ ok: true, json: async () => ({ scores: [{ nickname: 'NEW', points: 10 }] }) }); await settle();
    pending[0]!({ ok: true, json: async () => ({ scores: [{ nickname: 'OLD', points: 1 }] }) }); await settle();
    expect(doc.querySelector('#ranking-list')!.textContent).toContain('NEW');
    expect(doc.querySelector('#ranking-list')!.textContent).not.toContain('OLD');
  });
  test('menu semantics pass automatic accessibility checks in CI', async () => {
    const { dom } = page();
    dom.window.eval(axe.source);
    const result = await (dom.window as unknown as { axe: typeof axe }).axe.run(dom.window.document);
    expect(result.violations.map(({ id }) => id)).toEqual([]);
  });
});
