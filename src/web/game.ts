export const columns = 21;
export const rows = 13;
export const tickMilliseconds = 180;
export type Direction = 'up' | 'down' | 'left' | 'right';
export type Cell = Readonly<{ x: number; y: number }>;
export type GameState = Readonly<{
  snake: readonly Cell[];
  food: Cell | null;
  direction: Direction;
  points: number;
  status: 'playing' | 'paused' | 'ended';
}>;
type Random = () => number;
const vectors: Record<Direction, Cell> = {
  up: { x: 0, y: -1 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 }, right: { x: 1, y: 0 },
};
function sameCell(left: Cell, right: Cell): boolean { return left.x === right.x && left.y === right.y; }

function chooseFood(snake: readonly Cell[], random: Random): Cell | null {
  const occupied = new Set(snake.map(({ x, y }) => y * columns + x));
  const free = Array.from({ length: columns * rows }, (_, index) => index).filter((index) => !occupied.has(index));
  if (!free.length) return null;
  const index = free[Math.floor(random() * free.length)]!;
  return { x: index % columns, y: Math.floor(index / columns) };
}

export function newGame(random: Random): GameState {
  const snake = [{ x: 6, y: 6 }, { x: 5, y: 6 }, { x: 4, y: 6 }];
  return { snake, food: chooseFood(snake, random), direction: 'right', points: 0, status: 'playing' };
}

export function turnGame(state: GameState, direction: Direction): GameState {
  if (state.status !== 'playing') return state;
  const head = state.snake[0]!;
  const neck = state.snake[1];
  const vector = vectors[direction];
  // The neck records the last movement, even when several inputs arrive before the tick.
  if (neck && sameCell({ x: head.x + vector.x, y: head.y + vector.y }, neck)) return state;
  return { ...state, direction };
}

export function stepGame(state: GameState, random: Random): GameState {
  if (state.status !== 'playing') return state;
  const head = state.snake[0]!;
  const vector = vectors[state.direction];
  const next = { x: head.x + vector.x, y: head.y + vector.y };
  const eating = state.food !== null && sameCell(next, state.food);
  if (next.x < 0 || next.x >= columns || next.y < 0 || next.y >= rows || state.snake.some((cell) => sameCell(cell, next))) {
    return { ...state, status: 'ended' };
  }
  const snake = [next, ...(eating ? state.snake : state.snake.slice(0, -1))];
  const food = eating ? chooseFood(snake, random) : state.food;
  return { ...state, snake, food, points: state.points + (eating ? 7 : 0), status: food === null ? 'ended' : 'playing' };
}
