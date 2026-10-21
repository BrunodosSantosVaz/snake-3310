import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const readme = readFileSync('README.md', 'utf8');

test('README documenta o SQLITE_PATH da imagem', () => {
  const dockerfile = readFileSync('Dockerfile', 'utf8');
  const caminho = /SQLITE_PATH=(\S+)/.exec(dockerfile)?.[1];
  assert.ok(caminho, 'Dockerfile sem SQLITE_PATH');
  assert.match(readme, /`SQLITE_PATH`/, 'README não documenta SQLITE_PATH');
  assert.ok(readme.includes(caminho), `README não cita ${caminho}, o caminho da imagem`);
});

test('README cita a versão do Big Bang em uso', () => {
  const versao = readFileSync('.bigbang/VERSION', 'utf8').trim();
  assert.match(readme, new RegExp(`Big Bang\\]?(\\([^)]*\\))? ${versao.replaceAll('.', '\\.')}`));
});
