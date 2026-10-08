import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const DYNAMIC_ACCEPTANCE = {
  server: ['tests/aceite/13-esqueleto-andante/esqueleto.test.ts', 'tests/aceite/28-partida-completa/scores.test.ts'],
  web: ['tests/aceite/28-partida-completa/game.test.ts', 'tests/aceite/28-partida-completa/ui.test.ts',
    'tests/aceite/28-partida-completa/browser.test.ts'],
};

export function readManifest(filename) {
  const files = JSON.parse(readFileSync(filename, 'utf8'));
  if (!Array.isArray(files) || !files.every((file) => typeof file === 'string')) {
    throw new Error('BB_ARQUIVOS_ALTERADOS must point to a JSON array file');
  }
  return files;
}

function testFiles(root, directory) {
  const full = join(root, directory);
  if (!existsSync(full)) return [];
  return readdirSync(full, { recursive: true }).filter((file) => /\.test\.(ts|mjs)$/.test(file))
    .map((file) => `${directory}/${file}`);
}

function knownFile(root, file) {
  return !file.startsWith('-') && relative(root, resolve(root, file)) === file
    && existsSync(join(root, file)) && /^(src\/|tests\/)/.test(file)
    && /\.(ts|css|html|svg)$/.test(file);
}

export async function selectTests(changed, { root, related }) {
  const full = { full: true, files: [], coverage: [] };
  if (!changed.length || changed.some((file) => !knownFile(root, file))) return full;
  let graph;
  try { graph = await related(changed); } catch { return full; }
  if (!Array.isArray(graph.files) || !Array.isArray(graph.coverage)
    || [...graph.files, ...graph.coverage].some((file) => !knownFile(root, file))) return full;
  if (!graph.files.length && changed.some((file) => /\.ts$/.test(file))) return full;
  const selected = new Set(graph.files);
  const acceptance = testFiles(root, 'tests/aceite');
  const knownAcceptance = Object.values(DYNAMIC_ACCEPTANCE).flat();
  if (acceptance.some((file) => !knownAcceptance.includes(file)
    && /import\s*\(/.test(readFileSync(join(root, file), 'utf8')))) return full;
  for (const kind of ['server', 'web']) {
    const affected = changed.some((file) => kind === 'web' ? file.startsWith('src/web/')
      : /^(src\/(dominio|aplicacao|infra|interface)\/|tests\/apoio\/)/.test(file));
    if (affected) {
      // Locked acceptance uses variable imports and URL assets outside Vitest's static dependency graph.
      for (const file of DYNAMIC_ACCEPTANCE[kind].filter((file) => existsSync(join(root, file)))) selected.add(file);
    }
  }
  if (!selected.size) return full;
  return { full: false, files: [...selected].sort(), coverage: graph.coverage };
}
