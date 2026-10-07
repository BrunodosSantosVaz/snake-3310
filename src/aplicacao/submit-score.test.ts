import { expect, test, vi } from 'vitest';
import { SubmitScore } from './submit-score.js';

test('saves exactly once with the server clock and propagates storage failure', async () => {
  const save = vi.fn(async () => {});
  const now = vi.fn(() => new Date('2026-10-07T12:34:56.789Z'));
  const submit = new SubmitScore({ save }, now);
  await expect(submit.execute({ nickname: 'ÁNA', points: 7 })).resolves.toBe(true);
  expect(save).toHaveBeenCalledExactlyOnceWith({ nickname: 'ÁNA', points: 7, createdAt: new Date('2026-10-07T12:34:56.789Z') });
  expect(now).toHaveBeenCalledTimes(1);
  save.mockRejectedValueOnce(new Error('storage unavailable'));
  await expect(submit.execute({ nickname: 'ÁNA', points: 7 })).rejects.toThrow('storage unavailable');
});

test('invalid data never asks for a timestamp or calls storage', async () => {
  const save = vi.fn(async () => {});
  const now = vi.fn(() => new Date());
  const submit = new SubmitScore({ save }, now);
  for (const input of [{ nickname: 'pUtÁ', points: 7 }, { nickname: 'ÁNA', points: '7' }, { nickname: 'ÁNA', points: 7, admin: true }]) {
    await expect(submit.execute(input)).resolves.toBe(false);
  }
  expect(save).not.toHaveBeenCalled();
  expect(now).not.toHaveBeenCalled();
});
