import { columns, rows, type GameState } from './game.js';

const cellSize = 4;
const topBorder = 2;

export function drawGame(canvas: HTMLCanvasElement, game: GameState): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const style = canvas.ownerDocument.defaultView!.getComputedStyle(canvas.ownerDocument.documentElement);
  context.imageSmoothingEnabled = false;
  context.fillStyle = style.getPropertyValue('--cor-tela').trim();
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = style.getPropertyValue('--cor-pixel').trim();
  context.fillRect(0, 0, columns * cellSize, 1);
  context.fillRect(0, rows * cellSize + topBorder + 1, columns * cellSize, 1);
  for (const { x, y } of game.snake) context.fillRect(x * cellSize, y * cellSize + topBorder, cellSize - 1, cellSize - 1);
  if (game.food) {
    const x = game.food.x * cellSize;
    const y = game.food.y * cellSize + topBorder;
    context.fillRect(x + 1, y, 1, 1);
    context.fillRect(x, y + 1, 3, 1);
    context.fillRect(x + 1, y + 2, 1, 1);
  }
}
