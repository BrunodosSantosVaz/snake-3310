import { describe, expect, test } from 'vitest';
import { problemFor, UNAVAILABLE } from './problem.js';

describe('problemFor', () => {
  test('keeps 4xx with a Portuguese title', () => {
    expect(problemFor(403)).toEqual({ type: 'about:blank', title: 'Proibido', status: 403 });
    expect(problemFor(418).title).toBe('Erro na requisição');
  });

  test('turns anything else into 500', () => {
    expect(problemFor(undefined)).toEqual({ type: 'about:blank', title: 'Erro interno', status: 500 });
    expect(problemFor(503).status).toBe(500);
  });

  test('not ready is an explicit 503', () => {
    expect(UNAVAILABLE).toEqual({ type: 'about:blank', title: 'Indisponível', status: 503 });
  });
});
