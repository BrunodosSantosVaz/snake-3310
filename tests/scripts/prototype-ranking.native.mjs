import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { JSDOM } from 'jsdom';

const prototype = readFileSync(new URL('../../docs/prototipos/fundacao/index.html', import.meta.url), 'utf8');

function ranking(t, state = 'ok', nickname = 'BRUNO') {
  const callbacks = [];
  // Substitute fixture data, leaving the actual prototype renderer and events intact.
  const html = prototype.replace("['BRUNO', 412]", `[${JSON.stringify(nickname)}, 412]`);
  if (nickname !== 'BRUNO') assert.notEqual(html, prototype, 'Hostile fixture must reach the renderer');
  const dom = new JSDOM(html, {
    runScripts: 'dangerously',
    beforeParse(window) {
      window.HTMLCanvasElement.prototype.getContext = () => ({ fillRect() {} });
      window.setTimeout = (callback) => { callbacks.push(callback); return 1; };
    },
  });
  t.after(() => dom.window.close());
  const { document, KeyboardEvent } = dom.window;
  document.querySelector(`input[name=r][value=${state}]`).checked = true;
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
  document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
  const list = document.getElementById('lista-ranking');
  assert.equal(list.textContent, 'Carregando…');
  assert.equal(callbacks.length, 1);
  callbacks.shift()();
  return list;
}

test('prototype renders a hostile nickname as literal text, without an HTML element', (t) => {
  const payload = '<img src=x onerror="window.__xss=true">';
  const list = ranking(t, 'ok', payload);
  assert.equal(list.querySelector('img'), null);
  assert.ok(list.firstElementChild.textContent.includes(`1. ${payload}`));
  assert.equal(list.children.length, 5);
  assert.ok(list.firstElementChild.textContent.includes('412'));
});

test('prototype keeps empty ranking messages', (t) => {
  const list = ranking(t, 'vazio');
  assert.deepEqual([...list.children].map((entry) => entry.textContent), ['Ninguém ainda.', 'Seja o primeiro!']);
});

test('prototype keeps retry messages for ranking failure', (t) => {
  const list = ranking(t, 'erro');
  assert.deepEqual([...list.children].map((entry) => entry.textContent), ['Sem conexão.', 'OK tenta de novo']);
});
