import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { afterEach, expect, test, vi } from 'vitest';
import { mountUi } from './ui.js';

const cleanup: Array<() => void> = [];
afterEach(() => { for (const action of cleanup.splice(0).reverse()) action(); vi.restoreAllMocks(); vi.useRealTimers(); });
function page() {
  vi.useFakeTimers();
  const dom = new JSDOM(readFileSync(new URL('./index.html', import.meta.url), 'utf8'));
  const draw = vi.fn();
  vi.spyOn(dom.window.HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ fillRect: draw } as unknown as CanvasRenderingContext2D);
  dom.window.HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
  dom.window.HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); };
  const fetcher = vi.fn(async () => ({ ok: true, json: async () => ({ scores: [] }) }));
  const ui = mountUi(dom.window.document, fetcher);
  cleanup.push(() => dom.window.close(), ui.destroy);
  const doc = dom.window.document;
  const press = (key: string, options = {}) => doc.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...options }));
  const click = (selector: string) => doc.querySelector<HTMLButtonElement>(selector)!.click();
  return { dom, doc, draw, press, click, ui, fetcher };
}

test('leaving the game and destroying the UI stop both timer and event handlers', () => {
  const { doc, draw, press, click, ui, fetcher } = page();
  click('[data-screen="play"]');
  vi.advanceTimersByTime(180);
  press('Escape');
  const calls = draw.mock.calls.length;
  vi.advanceTimersByTime(180 * 30);
  expect(draw).toHaveBeenCalledTimes(calls);
  expect(doc.querySelector('dialog[open]')).toBeNull();
  click('[data-screen="play"]');
  ui.destroy();
  const finalCalls = draw.mock.calls.length;
  press(' '); click('[data-screen="ranking"]');
  vi.advanceTimersByTime(180 * 30);
  expect(draw).toHaveBeenCalledTimes(finalCalls);
  expect(fetcher).not.toHaveBeenCalled();
});

test('blur pauses until an explicit resume; modifiers and native Enter do not change the game', () => {
  const { dom, doc, draw, press, click } = page();
  click('[data-screen="play"]');
  press(' ', { ctrlKey: true });
  expect(doc.querySelector('#game-status')!.textContent).toBe('Em jogo');
  dom.window.dispatchEvent(new dom.window.Event('blur'));
  expect(doc.querySelector('#game-status')!.textContent).toMatch(/pausa/);
  const pausedCalls = draw.mock.calls.length;
  dom.window.dispatchEvent(new dom.window.Event('focus'));
  vi.advanceTimersByTime(180 * 30);
  expect(draw).toHaveBeenCalledTimes(pausedCalls);
  const button = doc.querySelector<HTMLButtonElement>('[data-key="5"]')!;
  button.dispatchEvent(new dom.window.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  expect(doc.querySelector('#game-status')!.textContent).toMatch(/pausa/);
  button.click();
  expect(doc.querySelector('#game-status')!.textContent).toBe('Em jogo');
  vi.advanceTimersByTime(180);
  expect(draw.mock.calls.length).toBeGreaterThan(pausedCalls);
});

test('the end dialog restarts with focus in the game or dismisses back to the menu', () => {
  const { dom, doc, click, draw } = page();
  click('[data-screen="play"]');
  vi.advanceTimersByTime(180 * 30);
  expect(doc.querySelector('dialog[open]')).not.toBeNull();
  expect(doc.activeElement?.id).toBe('game-nickname');
  click('#game-restart');
  expect(doc.activeElement?.id).toBe('play-heading');
  expect(doc.querySelector('#game-score')!.textContent).toBe('Pontos: 0');
  vi.advanceTimersByTime(180 * 30);
  doc.querySelector('dialog')!.dispatchEvent(new dom.window.Event('cancel', { cancelable: true }));
  expect(doc.querySelector('dialog[open]')).toBeNull();
  expect(doc.activeElement?.textContent).toBe('Jogar');
  const calls = draw.mock.calls.length;
  vi.advanceTimersByTime(180 * 30);
  expect(draw).toHaveBeenCalledTimes(calls);
  expect(doc.querySelector('dialog[open]')).toBeNull();
});
