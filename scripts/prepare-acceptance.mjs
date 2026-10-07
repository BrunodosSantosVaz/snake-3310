import { accessSync, constants } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';

function run(command, args) {
  const result = spawnSync(command, args, { stdio: 'inherit', shell: false });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}
// Prepare outside test.fails: missing tooling/bundle must fail the command, never masquerade as pending product.
if (process.env.CI === 'true') run(process.execPath, ['node_modules/playwright/cli.js', 'install', '--with-deps', 'chromium']);
try { accessSync(chromium.executablePath(), constants.X_OK); }
catch { throw new Error('Install the acceptance browser first: npx playwright install chromium'); }
run('npm', ['run', 'build']);
