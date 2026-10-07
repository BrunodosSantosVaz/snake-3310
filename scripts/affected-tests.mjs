import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { readManifest, selectTests } from './affected-selection.mjs';
import { affectedGraph } from './affected-graph.mjs';

const root = process.cwd();
const vitest = join(root, 'node_modules/vitest/vitest.mjs');

function run(command, args, options = {}) {
  const result = spawnSync(command, args, { cwd: root, stdio: 'inherit', ...options });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})`);
  return result;
}

async function main() {
  if (process.version !== 'v24.18.1') throw new Error('Use Node 24.18.1 for affected tests');
  let selection;
  try {
    selection = await selectTests(readManifest(process.env.BB_ARQUIVOS_ALTERADOS), {
      root, related: (files) => affectedGraph(files, root),
    });
  } catch {
    selection = { full: true };
  }
  if (selection.full) {
    console.log('Selection uncertain: running full unit, integration, acceptance and coverage suites.');
    for (const script of ['test', 'test:acceptance', 'test:coverage']) run('npm', ['run', script]);
    return;
  }
  console.log(`Affected tests: ${selection.files.join(', ')}`);
  if (selection.files.some((file) => file.endsWith('/browser.test.ts'))) {
    // npm's acceptance prehook builds the app and installs the browser before real browser scenarios.
    run('npm', ['run', 'pretest:acceptance']);
  }
  const coverage = selection.coverage.length ? ['--coverage',
    ...selection.coverage.map((pattern) => `--coverage.include=${pattern}`)] : [];
  run(process.execPath, [vitest, 'run', ...selection.files, ...coverage]);
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
