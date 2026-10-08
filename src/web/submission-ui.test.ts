import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { afterEach, expect, test, vi } from 'vitest';
import { mountUi, type RankingFetcher } from './ui.js';

const cleanup: Array<() => void> = [];
afterEach(() => { for (const action of cleanup.splice(0).reverse()) action(); vi.restoreAllMocks(); vi.useRealTimers(); });
function page(fetcher: RankingFetcher) {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
  const dom = new JSDOM(readFileSync(new URL('./index.html', import.meta.url), 'utf8'), { url: 'https://example.test/snake-3310-hom/' });
  dom.window.HTMLCanvasElement.prototype.getContext = () => null;
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  const doc = dom.window.document;
  const ui = mountUi(doc, fetcher);
  cleanup.push(() => dom.window.close(), ui.destroy);
  const click = (selector: string) => doc.querySelector<HTMLButtonElement>(selector)!.click();
  const end = () => { click('[data-screen="play"]'); vi.advanceTimersByTime(180 * 30); };
  const send = (nickname = 'ÁNA') => {
    doc.querySelector<HTMLInputElement>('dialog input')!.value = nickname;
    doc.querySelector('dialog form')!.dispatchEvent(new dom.window.Event('submit', { bubbles: true, cancelable: true }));
  };
  return { doc, dom, ui, click, end, send };
}
async function settle() { for (let count = 0; count < 8; count++) await Promise.resolve(); }

test('the nickname field has a label and focus; invalid Unicode names never call the API', () => {
  const fetcher = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({}) }));
  const { doc, end, send } = page(fetcher);
  end();
  const input = doc.querySelector<HTMLInputElement>('dialog input')!;
  expect(input.labels?.[0]?.textContent).toBe('Apelido');
  expect(doc.activeElement).toBe(input);
  for (const nickname of ['AB', 'ABCDEFGHIJKLM', ' ANA', 'A_NA', '😀ANA']) {
    send(nickname);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(doc.querySelector('dialog [role="status"]')!.textContent).toContain('3 a 12');
  }
  expect(fetcher).not.toHaveBeenCalled();
  send('𐐀𐐁𐐂');
  expect(fetcher).toHaveBeenCalledTimes(1);
});

test.each(['restart', 'menu', 'cancel', 'destroy'] as const)('%s aborts the request and ignores its later response', async (action) => {
  let finish!: (value: Awaited<ReturnType<RankingFetcher>>) => void;
  const fetcher = vi.fn<RankingFetcher>(() => new Promise((resolve) => { finish = resolve; }));
  const { doc, dom, ui, click, end, send } = page(fetcher);
  end(); send(); send();
  expect(fetcher).toHaveBeenCalledTimes(1);
  const options = fetcher.mock.calls[0]![1]!;
  expect(options.signal?.aborted).toBe(false);
  expect(options.headers).toEqual({ 'Content-Type': 'application/json' });
  expect(JSON.parse(options.body!)).toEqual({ nickname: 'ÁNA', points: 0 });
  if (action === 'restart') click('#game-restart');
  if (action === 'menu') click('#game-menu');
  if (action === 'cancel') doc.querySelector('dialog')!.dispatchEvent(new dom.window.Event('cancel', { cancelable: true }));
  if (action === 'destroy') ui.destroy();
  expect(options.signal?.aborted).toBe(true);
  if (action !== 'destroy') end();
  finish({ ok: true, status: 201, json: async () => ({ private: 'MUST_NOT_RENDER' }) });
  await settle();
  expect(doc.querySelector('dialog [role="status"]')!.textContent).toBe('');
  expect(doc.querySelector<HTMLButtonElement>('dialog button[type="submit"]')!.disabled).toBe(false);
  expect(doc.body.textContent).not.toContain('MUST_NOT_RENDER');
});

test('a successful game can submit only once; restarting resets the form and refreshes ranking by GET', async () => {
  const fetcher = vi.fn<RankingFetcher>(async (_url, options) => ({ ok: true, status: options?.method === 'POST' ? 201 : 200,
    json: async () => ({ scores: [{ nickname: 'ÁNA', points: 0 }] }) }));
  const { doc, dom, click, end, send } = page(fetcher);
  end(); send(); await settle(); send();
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(doc.querySelector('dialog [role="status"]')!.textContent).toMatch(/enviado/i);
  expect(doc.querySelector<HTMLButtonElement>('dialog button[type="submit"]')!.disabled).toBe(true);
  click('#game-restart');
  expect(doc.activeElement?.id).toBe('play-heading');
  doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }));
  click('[data-screen="ranking"]'); await settle();
  expect(fetcher.mock.calls[1]![0]).toBe('https://example.test/snake-3310-hom/api/placares');
  expect(fetcher.mock.calls[1]![1]?.method).not.toBe('POST');
  expect(doc.querySelector('#ranking-list')!.textContent).toContain('ÁNA');
  end(); send('BRUNO'); await settle();
  expect(fetcher).toHaveBeenCalledTimes(3);
  expect(JSON.parse(fetcher.mock.calls[2]![1]!.body!)).toEqual({ nickname: 'BRUNO', points: 0 });
});

test.each([400, 429, 500, 200, 0])('failure %s allows retry and exposes only controlled messages', async (status) => {
  const fetcher = vi.fn<RankingFetcher>(async () => {
    if (status === 0) throw new Error('PRIVATE_NETWORK_ERROR');
    return { ok: status === 200, status, json: async () => { throw new Error('PRIVATE_RESPONSE'); } };
  });
  const { doc, end, send } = page(fetcher);
  end(); send();
  expect(doc.querySelector('dialog form')!.getAttribute('aria-busy')).toBe('true');
  expect(doc.querySelector('dialog [role="status"]')!.textContent).toBe('Enviando…');
  await settle();
  expect(doc.querySelector('dialog form')!.getAttribute('aria-busy')).toBe('false');
  expect(doc.querySelector<HTMLButtonElement>('dialog button[type="submit"]')!.disabled).toBe(false);
  expect(doc.body.textContent).not.toMatch(/PRIVATE_/);
  expect(doc.querySelector('dialog [role="status"]')!.textContent).toContain(status === 400 ? 'Esse apelido não pode' : status === 429 ? 'Muitos envios seguidos' : 'Não deu para enviar');
  send(); await settle();
  expect(fetcher).toHaveBeenCalledTimes(2);
});
