import { afterEach, expect, test, vi } from 'vitest';

vi.mock('./ui.js', () => ({ mountUi: vi.fn() }));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); vi.clearAllMocks(); });

test('the browser entry forwards POST options and cancellation to native fetch', async () => {
  const fetcher = vi.fn(async () => new Response(null, { status: 201 }));
  const doc = {};
  vi.stubGlobal('document', doc);
  vi.stubGlobal('fetch', fetcher);
  const { mountUi } = await import('./ui.js');
  await import('./main.js');
  const options = { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: '{"nickname":"ANA","points":7}', signal: new AbortController().signal };
  expect(vi.mocked(mountUi).mock.calls[0]![0]).toBe(doc);
  await vi.mocked(mountUi).mock.calls[0]![1]('/snake-3310/api/placares', options);
  expect(fetcher).toHaveBeenCalledWith('/snake-3310/api/placares', options);
});
