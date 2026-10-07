import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { selectTests, readManifest } from '../../scripts/affected-selection.mjs';

function fixture(t) {
  const root = mkdtempSync(join(tmpdir(), 'snake-affected-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const file of ['src/dominio/ranking.ts', 'src/web/ui.ts', 'src/web/styles.css',
    'src/dominio/ranking.test.ts', 'tests/aceite/13-esqueleto-andante/esqueleto.test.ts',
    'tests/aceite/28-partida-completa/browser.test.ts']) {
    mkdirSync(join(root, file, '..'), { recursive: true });
    writeFileSync(join(root, file), '');
  }
  return root;
}

test('reads a JSON manifest file, never JSON directly from the environment', (t) => {
  const root = fixture(t);
  const file = join(root, 'changed.json');
  writeFileSync(file, JSON.stringify(['src/web/ui.ts']));
  assert.deepEqual(readManifest(file), ['src/web/ui.ts']);
  assert.throws(() => readManifest('["src/web/ui.ts"]'));
  writeFileSync(file, '{}');
  assert.throws(() => readManifest(file));
});

test('uses related tests and includes dynamic acceptance plus layer tests for coverage', async (t) => {
  const root = fixture(t);
  const selected = await selectTests(['src/dominio/ranking.ts'], {
    root, related: async (files) => {
      assert.deepEqual(files, ['src/dominio/ranking.ts']);
      return ['src/dominio/ranking.test.ts'];
    },
  });
  assert.equal(selected.full, false);
  assert.ok(selected.files.includes('src/dominio/ranking.test.ts'));
  assert.ok(selected.files.includes('tests/aceite/13-esqueleto-andante/esqueleto.test.ts'));
  assert.ok(selected.files.includes('tests/aceite/28-partida-completa/browser.test.ts'));
  assert.deepEqual(selected.coverage, ['src/dominio/**', 'src/aplicacao/**']);
});

test('path assets include acceptance despite being invisible to the import graph', async (t) => {
  const root = fixture(t);
  const selected = await selectTests(['src/web/styles.css'], { root, related: async () => [] });
  assert.equal(selected.full, false);
  assert.ok(selected.files.includes('tests/aceite/28-partida-completa/browser.test.ts'));
});

test('unknown, deleted, empty and unsafe paths require the full suite', async (t) => {
  const root = fixture(t);
  for (const paths of [[], ['unknown.txt'], ['src/web/deleted.ts'], ['../src/web/ui.ts'], ['package.json']]) {
    assert.equal((await selectTests(paths, { root, related: async () => [] })).full, true);
  }
});

test('graph failure and empty selection require the full suite', async (t) => {
  const root = fixture(t);
  const file = 'src/web/ui.test.ts';
  writeFileSync(join(root, file), '');
  assert.equal((await selectTests([file], { root, related: async () => [] })).full, true);
  assert.equal((await selectTests(['src/web/ui.ts'], {
    root, related: async () => { throw new Error('graph unavailable'); },
  })).full, true);
});
