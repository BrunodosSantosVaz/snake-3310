import { describe, expect, test } from 'vitest';

// The browser engine is pure and remains in web (ARQ: web never imports server layers).
// Public contract: newGame(random), stepGame(state, random), turnGame(state, direction).
// State: snake [{x,y}], food {x,y}|null, direction, points, status ('playing'|'paused'|'ended').
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function engine(): Promise<any> { const path = '../../../src/web/game'; return import(path); }

describe('Partida completa (#28)', () => {
  test('CA-1 RN-0004: mover e comer cresce a cobra, soma sete e sorteia comida livre #31', async () => {
    const { newGame, stepGame } = await engine();
    const initial = newGame(() => 0);
    expect(initial.snake).toHaveLength(3);
    expect(initial.points).toBe(0);
    expect(initial.status).toBe('playing');
    const head = initial.snake[0];
    const next = stepGame({ ...initial, direction: 'right', food: { x: head.x + 1, y: head.y } }, () => 0);
    expect(next.snake[0]).toEqual({ x: head.x + 1, y: head.y });
    expect(next.snake).toHaveLength(4);
    expect(next.points).toBe(7);
    expect(next.snake).not.toContainEqual(next.food);
    const moved = stepGame({ ...next, food: { x: 0, y: 12 } }, () => 0);
    expect(moved.snake).toHaveLength(4);
    expect(moved.points).toBe(7);
    expect(initial.snake).toHaveLength(3);
  });

  test('CA-2 RN-0004: ignora reversão, termina colisão e vitória sem sortear em grade cheia #31', async () => {
    const { newGame, stepGame, turnGame } = await engine();
    const initial = newGame(() => 0);
    expect(turnGame({ ...initial, direction: 'right' }, 'left').direction).toBe('right');
    const wall = stepGame({ ...initial, snake: [{ x: 20, y: 6 }, { x: 19, y: 6 }, { x: 18, y: 6 }], direction: 'right' }, () => 0);
    expect(wall.status).toBe('ended');
    expect(stepGame(wall, () => 0)).toEqual(wall);
    const body = stepGame({ ...initial, direction: 'right', food: { x: 0, y: 0 }, snake: [
      { x: 10, y: 6 }, { x: 10, y: 7 }, { x: 11, y: 7 }, { x: 11, y: 6 }, { x: 12, y: 6 },
    ] }, () => 0);
    expect(body.status).toBe('ended');
    const food = { x: 20, y: 12 };
    const head = { x: 19, y: 12 };
    const cells = Array.from({ length: 273 }, (_, index) => ({ x: index % 21, y: Math.floor(index / 21) }))
      .filter((cell) => !(cell.x === food.x && cell.y === food.y) && !(cell.x === head.x && cell.y === head.y));
    const won = stepGame({ ...initial, snake: [head, ...cells], direction: 'right', food, points: 1883 },
      () => { throw new Error('Não pode sortear comida numa grade cheia'); });
    expect(won.status).toBe('ended');
    expect(won.snake).toHaveLength(273);
    expect(won.points).toBe(1890);
    expect(won.food).toBeNull();
  });
});
