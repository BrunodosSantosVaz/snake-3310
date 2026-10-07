import { AssertionError, strict as assert } from 'node:assert';
import { execFileSync, spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import nativeTest from 'node:test';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const config = JSON.parse(execFileSync('python3', ['-c', `
import json, sys
sys.path.insert(0, '.bigbang')
from bb.config import load, get
config = load('.')
keys = ['projeto.modo', 'entrega.perfil', 'entrega.alvo', 'entrega.caminhos_artefato',
        'deploy.artefato', 'deploy.imagem', 'deploy.plataformas', 'deploy.servicos',
        'deploy.caminho_saude', 'deploy.url_staging', 'deploy.url_producao']
print(json.dumps({key: get(config, key) for key in keys}))
`], { cwd: root, encoding: 'utf8' }));

// Strict pending marks reject unexpected success; malformed setup fails before registration.
const test = Object.assign(nativeTest, {
  fails(title, scenario) {
    nativeTest(title, () => {
      if (process.env.BB_BOOTSTRAP_ENFORCE === '1') return scenario();
      assert.throws(scenario, AssertionError, 'Pending criterion unexpectedly passed');
    });
  },
});

const originalArtifactPaths = [
  'src/', 'migrations/', 'Dockerfile', 'package.json', 'package-lock.json',
  'vite.config.ts', 'tsconfig.json',
];

test('CA-1 RN-0002 RN-0003 Fundação seleciona Flash/Tsuru sem antecipar artefato #57', () => {
  assert.equal(config['projeto.modo'], 'flash');
  assert.equal(config['entrega.perfil'], 'deploy');
  assert.equal(config['entrega.alvo'], 'tsuru');
  assert.equal(config['deploy.artefato'], 'imagem');
  assert.equal(config['deploy.imagem'], 'ghcr.io/brunodossantosvaz/snake-3310');
  assert.deepEqual(config['deploy.plataformas'], ['linux/arm64']);
  assert.deepEqual(config['deploy.servicos'], ['app=Dockerfile']);
  assert.equal(config['deploy.caminho_saude'], '/api/ready');
  assert.equal(config['deploy.url_staging'], 'https://tsuru.frontzap.com.br/snake-3310-hom');
  assert.equal(config['deploy.url_producao'], 'https://tsuru.frontzap.com.br/snake-3310');
  assert.deepEqual(config['entrega.caminhos_artefato'], originalArtifactPaths);
  assert.equal(execFileSync('git', ['ls-files', '--', ...originalArtifactPaths], {
    cwd: root, encoding: 'utf8',
  }), '', 'Foundation must not contain the game artifact');
  assert.equal(readFileSync(new URL('../../../.bigbang/VERSION', import.meta.url), 'utf8').trim(), '1.5.2');
  const verification = spawnSync('python3', ['.bigbang/bin/bb.py', 'verificar'], {
    cwd: root, encoding: 'utf8',
  });
  assert.equal(verification.status, 0, verification.stderr + verification.stdout);
});
