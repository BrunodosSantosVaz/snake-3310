import { describe, expect, test, vi } from 'vitest';
import { newGame, stepGame, turnGame, type GameState } from './game.js';

describe('snake engine', () => {
  test('starts at the prototype position and chooses a free cell with one random call', () => {
    const random = vi.fn(() => 0);
    const game = newGame(random);
    expect(game.snake).toEqual([{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }]);
    expect(game.food).toEqual({ x: 0, y: 0 });
    expect(random).toHaveBeenCalledTimes(1);
    expect(newGame(() => 0.999999).food).toEqual({ x: 20, y: 12 });
  });
  test('moves without mutating the original and grows only when eating', () => {
    const game = { ...newGame(() => 0), food: { x: 7, y: 6 } };
    const grown = stepGame(game, () => 0);
    expect(grown.snake).toHaveLength(4);
    expect(grown.points).toBe(7);
    expect(grown.food).toEqual({ x: 0, y: 0 });
    expect(game.snake).toHaveLength(3);
    expect(stepGame(grown, () => { throw new Error('movement must not choose food'); }).snake).toHaveLength(4);
  });
  test('rapid turns cannot reverse the actual movement before its next step', () => {
    const game = newGame(() => 0);
    expect(turnGame(game, 'left')).toBe(game);
    const queued = turnGame(game, 'up');
    expect(turnGame(queued, 'left')).toBe(queued);
    const moved = stepGame(queued, () => 0);
    expect(moved.snake[0]).toEqual({ x: 6, y: 5 });
    expect(turnGame(moved, 'left').direction).toBe('left');
    expect(turnGame(moved, 'down')).toBe(moved);
  });
  test.each(['paused', 'ended'] as const)('%s games never advance or turn', (status) => {
    const game = { ...newGame(() => 0), status };
    expect(stepGame(game, () => { throw new Error('inactive game'); })).toBe(game);
    expect(turnGame(game, 'up')).toBe(game);
  });
  test.each([
    ['right', { x: 20, y: 6 }], ['left', { x: 0, y: 6 }],
    ['up', { x: 6, y: 0 }], ['down', { x: 6, y: 12 }],
  ] as const)('ends at the %s edge without moving out of the board', (direction, head) => {
    const game: GameState = { ...newGame(() => 0), direction, snake: [head] };
    const ended = stepGame(game, () => 0);
    expect(ended.status).toBe('ended');
    expect(ended.snake).toEqual(game.snake);
  });
  test('allows entering a vacating tail but ends on an occupied body segment', () => {
    const game: GameState = { ...newGame(() => 0), snake: [
      { x: 6, y: 6 }, { x: 6, y: 7 }, { x: 7, y: 7 }, { x: 7, y: 6 },
    ] };
    expect(stepGame(game, () => 0).status).toBe('playing');
    expect(stepGame({ ...game, snake: [...game.snake, { x: 8, y: 6 }] }, () => 0).status).toBe('ended');
  });
  test('a full board finishes without calling random or entering a retry loop', () => {
    const snake = Array.from({ length: 273 }, (_, index) => ({ x: index % 21, y: Math.floor(index / 21) }))
      .filter(({ x, y }) => !(y === 12 && (x === 19 || x === 20)));
    const game: GameState = { ...newGame(() => 0), snake: [{ x: 19, y: 12 }, ...snake], food: { x: 20, y: 12 }, points: 1883 };
    const random = vi.fn(() => { throw new Error('board is full'); });
    const won = stepGame(game, random);
    expect(won).toMatchObject({ status: 'ended', points: 1890, food: null });
    expect(won.snake).toHaveLength(273);
    expect(random).not.toHaveBeenCalled();
  });
});
