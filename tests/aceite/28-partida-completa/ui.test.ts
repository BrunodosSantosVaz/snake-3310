import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, test, vi } from 'vitest';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function load(path: string): Promise<any> { return import(path); }
const cleanup: Array<() => void> = [];
afterEach(() => { for (const step of cleanup.splice(0).reverse()) step(); vi.restoreAllMocks(); vi.useRealTimers(); });
type Fetcher = (url: string, options?: unknown) => Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>;
async function page(fetcher: Fetcher = vi.fn(async () => ({ ok: true, status: 201, json: async () => ({ scores: [] }) }))) {
  vi.useFakeTimers();
  vi.spyOn(Math, 'random').mockReturnValue(0.99);
  const dom = new JSDOM(readFileSync(new URL('../../../src/web/index.html', import.meta.url), 'utf8'), { url: 'https://example.test/snake-3310-hom/' });
  cleanup.push(() => dom.window.close());
  const draw = vi.fn();
  const context = new Proxy({ fillRect: draw, clearRect: draw }, { get: (target, key) => Reflect.get(target, key) ?? vi.fn() });
  vi.spyOn(dom.window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  const { mountUi } = await load('../../../src/web/ui');
  const ui = mountUi(dom.window.document, fetcher);
  cleanup.push(ui.destroy);
  return { doc: dom.window.document, dom, draw, fetcher };
}
function press(doc: Document, key: string) { doc.dispatchEvent(new doc.defaultView!.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true })); }
function click(doc: Document, selector: string) { doc.querySelector<HTMLButtonElement>(selector)!.click(); }
async function settle() { for (let index = 0; index < 8; index++) await Promise.resolve(); }
function ended(doc: Document) {
  click(doc, '[data-screen="play"]');
  vi.advanceTimersByTime(180 * 30);
  expect(doc.querySelector('dialog[open]')).not.toBeNull();
}
function send(doc: Document) {
  const input = doc.querySelector<HTMLInputElement>('dialog input')!;
  expect(input.labels?.length).toBeGreaterThan(0);
  input.value = 'ÁNA';
  doc.querySelector('dialog form')!.dispatchEvent(new doc.defaultView!.Event('submit', { bubbles: true, cancelable: true }));
}

describe('Partida e envio no aparelho (#28)', () => {
  test.fails('CA-3 RN-0004: teclado e toque jogam, pausa congela, blur pausa e reinício cria partida nova #31', async () => {
    const { doc, dom, draw } = await page();
    click(doc, '[data-screen="play"]');
    expect(doc.querySelector('#play canvas[role="img"][aria-label]')).not.toBeNull();
    const before = draw.mock.calls.length;
    press(doc, 'ArrowDown'); vi.advanceTimersByTime(180);
    expect(draw.mock.calls.length).toBeGreaterThan(before);
    press(doc, ' ');
    expect(doc.querySelector('#game-status')!.textContent).toMatch(/pausa/i);
    const paused = draw.mock.calls.length;
    vi.advanceTimersByTime(180 * 3);
    expect(draw.mock.calls.length).toBe(paused);
    click(doc, '[data-key="5"]');
    click(doc, '[data-key="4"]'); vi.advanceTimersByTime(180);
    expect(draw.mock.calls.length).toBeGreaterThan(paused);
    dom.window.dispatchEvent(new dom.window.Event('blur'));
    expect(doc.querySelector('#game-status')!.textContent).toMatch(/pausa/i);
    const blurred = draw.mock.calls.length;
    vi.advanceTimersByTime(180 * 3);
    expect(draw.mock.calls.length).toBe(blurred);
    press(doc, 'Escape'); ended(doc);
    const restart = [...doc.querySelectorAll<HTMLButtonElement>('dialog button')].find((button) => button.textContent?.includes('Jogar de novo'))!;
    restart.click();
    expect(doc.querySelector('dialog[open]')).toBeNull();
    expect(doc.querySelector('#game-score')!.textContent).toContain('0');
    expect(doc.querySelector('#game-status')!.textContent).not.toMatch(/fim|pausa/i);
  });

  test.fails('CA-7 RN-0005 RN-0006: modal envia uma vez, trata sucesso, erro e 429 e ignora resposta de partida antiga #33', async () => {
    for (const status of [201, 400, 429, 500, 0]) {
      let finish!: (value: { ok: boolean; status: number; json(): Promise<unknown> }) => void;
      let fail!: (error: Error) => void;
      const fetcher = vi.fn(() => new Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>((resolve, reject) => { finish = resolve; fail = reject; }));
      const { doc } = await page(fetcher);
      ended(doc); send(doc);
      const submit = doc.querySelector<HTMLButtonElement>('dialog button[type="submit"]')!;
      expect(submit.disabled).toBe(true);
      send(doc);
      expect(fetcher).toHaveBeenCalledTimes(1);
      const [url, options] = fetcher.mock.calls[0] as unknown as [string, { method: string; body: string }];
      expect(url).toBe('https://example.test/snake-3310-hom/api/placares');
      expect(options.method).toBe('POST');
      expect(JSON.parse(options.body)).toEqual({ nickname: 'ÁNA', points: 0 });
      if (status === 0) fail(new Error('offline'));
      else finish({ ok: status === 201, status, json: async () => ({ title: 'INTERNAL_DETAIL_MUST_NOT_RENDER' }) });
      await settle();
      const message = doc.querySelector('dialog [role="status"]')!.textContent;
      expect(message).not.toContain('INTERNAL_DETAIL');
      if (status === 201) { expect(message).toMatch(/enviado/i); expect(submit.disabled).toBe(true); }
      else { expect(submit.disabled).toBe(false); expect(message).toContain(status === 400 ? 'Esse apelido não pode' : status === 429 ? 'Muitos envios seguidos' : 'Não deu para enviar'); }
      cleanup.pop()!(); cleanup.pop()!(); vi.restoreAllMocks();
    }
    let finish!: (value: { ok: boolean; status: number; json(): Promise<unknown> }) => void;
    const { doc } = await page(vi.fn(() => new Promise<{ ok: boolean; status: number; json(): Promise<unknown> }>((resolve) => { finish = resolve; })));
    ended(doc); send(doc);
    [...doc.querySelectorAll<HTMLButtonElement>('dialog button')].find((button) => button.textContent?.includes('Jogar de novo'))!.click();
    finish({ ok: true, status: 201, json: async () => ({}) }); await settle();
    expect(doc.querySelector('dialog[open]')).toBeNull();
    expect(doc.querySelector('#game-status')!.textContent).not.toMatch(/enviado|fim/i);
  });
});
