// Deployment smoke uses only Node's built-ins; npm dependencies and a browser are unnecessary.
const raw = process.env.BB_URL || process.env.SMOKE_URL || '';
let base;
try {
  const url = new URL(raw);
  if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error();
  base = url.href.replace(/\/+$/, '');
} catch {
  console.error('BB_URL ou SMOKE_URL deve conter a URL HTTP(S) do ambiente sem credenciais/query/fragmento');
  process.exit(2);
}

function validateHeaders(response) {
  const csp = response.headers.get('content-security-policy') ?? '';
  if (!csp.includes("default-src 'self'") || !csp.includes("frame-ancestors 'none'") || !csp.includes("object-src 'none'") || /unsafe-inline|unsafe-eval/.test(csp)) throw new Error('CSP ausente ou permissiva');
  if (response.headers.get('x-content-type-options') !== 'nosniff') throw new Error('nosniff ausente');
}
function validateScores(body) {
  if (!body || Object.keys(body).join() !== 'scores' || !Array.isArray(body.scores) || body.scores.length > 10) throw new Error('contrato do ranking inválido');
  let previous = Infinity;
  for (const score of body.scores) {
    if (!score || Object.keys(score).sort().join() !== 'nickname,points' || typeof score.nickname !== 'string' || !Number.isInteger(score.points) || score.points < 0 || score.points > 2147483647 || score.points > previous) throw new Error('placar ou ordem do ranking inválido');
    previous = score.points;
  }
}
async function check(path, validate) {
  try {
    const response = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(10_000) });
    if (response.status !== 200) throw new Error(`HTTP ${response.status}`);
    validateHeaders(response);
    await validate(response);
    console.log(`ok ${path}`);
    return true;
  } catch (error) {
    console.error(`FALHOU ${path}: ${error.message}`);
    return false;
  }
}
const results = await Promise.all([
  ...['/api/health', '/api/ready'].map((path) => check(path, async (response) => {
    if (!response.headers.get('content-type')?.includes('application/json') || (await response.json()).status !== 'ok') throw new Error('status inválido');
  })),
  check('/api/placares', async (response) => {
    if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('JSON ausente');
    validateScores(await response.json());
  }),
  check('/', async (response) => {
    if (!response.headers.get('content-type')?.includes('text/html') || !(await response.text()).includes('Snake 3310')) throw new Error('página ausente');
  }),
]);
process.exit(results.every(Boolean) ? 0 : 1);
