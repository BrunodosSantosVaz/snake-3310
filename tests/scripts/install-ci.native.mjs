import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const script = resolve('scripts/install-ci.sh');

function shellFixture(t, options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'snake-install-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const bin = join(root, 'bin');
  mkdirSync(bin);
  const commands = {
    node: `echo '${options.version ?? 'v22.0.0'}'`,
    npm: 'echo npm >> "$TRACE"',
    uname: 'if [ "$1" = -m ]; then echo "${TEST_ARCH:-x86_64}"; else echo Linux; fi',
    curl: 'echo curl >> "$TRACE"; while [ "$1" != --output ]; do shift; done; printf archive > "$2"',
    sha256sum: `cat > "$CHECKSUM_INPUT"; echo verify >> "$TRACE"; exit ${options.corrupt ? 1 : 0}`,
    tar: 'echo extract >> "$TRACE"; while [ "$1" != --directory ]; do shift; done; mkdir -p "$2/bin"; printf "#!/bin/bash\\necho v24.18.1\\n" > "$2/bin/node"; chmod +x "$2/bin/node"; cp "$FAKE_BIN/npm" "$2/bin/npm"',
  };
  for (const [name, body] of Object.entries(commands)) {
    writeFileSync(join(bin, name), `#!/bin/bash\n${body}\n`, { mode: 0o755 });
  }
  const trace = join(root, 'trace');
  const githubPath = join(root, 'github-path');
  const checksums = join(root, 'checksums');
  const result = spawnSync('bash', [script], {
    encoding: 'utf8', env: { ...process.env, PATH: `${bin}:/usr/bin:/bin`,
      CI: options.ci === false ? '' : 'true', RUNNER_TEMP: root, GITHUB_PATH: githubPath,
      TRACE: trace, CHECKSUM_INPUT: checksums, FAKE_BIN: bin, TEST_ARCH: options.arch ?? 'x86_64' },
  });
  return { result, trace, githubPath, checksums };
}

test('local installation rejects a different runtime before npm ci', (t) => {
  const run = shellFixture(t, { ci: false });
  assert.notEqual(run.result.status, 0);
  assert.match(run.result.stderr, /24\.18\.1/);
});

test('CI verifies the pinned x64 download before extraction and npm ci', (t) => {
  const run = shellFixture(t);
  assert.equal(run.result.status, 0, run.result.stderr);
  assert.equal(readFileSync(run.trace, 'utf8'), 'curl\nverify\nextract\nnpm\n');
  assert.match(readFileSync(run.checksums, 'utf8'), /d6c664df3f3f61458e8c277585571328522d705166723a7c7823a9253a4d15a0/);
  assert.match(readFileSync(run.githubPath, 'utf8'), /node-24\.18\.1\/bin/);
});

test('CI pins the arm64 checksum and rejects a corrupted download', (t) => {
  const arm = shellFixture(t, { arch: 'aarch64' });
  assert.equal(arm.result.status, 0, arm.result.stderr);
  assert.match(readFileSync(arm.checksums, 'utf8'), /7201e3a09dc825bac57867c81913e2b8f0ef87d04cb9082af4cda82f6ff3d88c/);
  const corrupt = shellFixture(t, { corrupt: true });
  assert.notEqual(corrupt.result.status, 0);
  assert.equal(readFileSync(corrupt.trace, 'utf8'), 'curl\nverify\n');
});

test('an unsupported architecture fails before downloading', (t) => {
  assert.notEqual(shellFixture(t, { arch: 'riscv64' }).result.status, 0);
});
