import { apiUrl, parseRanking, rankingLines } from './ranking.js';
import { texts } from './texts.js';
import { newGame, stepGame, turnGame, tickMilliseconds, type Direction, type GameState } from './game.js';
import { drawGame } from './canvas.js';

export type RankingFetcher = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;
type Screen = 'menu' | 'play' | 'ranking' | 'instructions';
const screens: Screen[] = ['menu', 'play', 'ranking', 'instructions'];
const menuTargets: Screen[] = ['play', 'ranking', 'instructions'];
const keys: Record<string, string> = { ArrowUp: '2', ArrowDown: '8', ArrowLeft: '4', ArrowRight: '6', w: '2', s: '8', a: '4', d: '6', Enter: 'ok', Escape: 'c', Backspace: 'c', ' ': '5' };
const directions: Record<string, Direction> = { '2': 'up', '4': 'left', '6': 'right', '8': 'down' };

export function mountUi(doc: Document, fetcher: RankingFetcher): { destroy(): void } {
  const ui = new MenuUi(doc, fetcher);
  ui.start();
  return { destroy: () => ui.destroy() };
}

class MenuUi {
  private readonly menu: HTMLButtonElement[];
  private current: Screen = 'menu';
  private selected = 0;
  private requestId = 0;
  private game: GameState | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly doc: Document, private readonly fetcher: RankingFetcher) {
    this.menu = [...doc.querySelectorAll<HTMLButtonElement>('[data-screen]')];
  }
  start(): void {
    this.doc.addEventListener('click', this.onClick);
    this.doc.addEventListener('keydown', this.onKey);
    this.doc.defaultView!.addEventListener('blur', this.onBlur);
    this.dialog.addEventListener('cancel', this.onCancel);
    this.show('menu');
  }
  destroy(): void {
    this.requestId++;
    this.doc.removeEventListener('click', this.onClick);
    this.doc.removeEventListener('keydown', this.onKey);
    this.doc.defaultView!.removeEventListener('blur', this.onBlur);
    this.dialog.removeEventListener('cancel', this.onCancel);
    this.stopTimer();
    if (this.dialog.open) this.dialog.close();
  }
  private get dialog(): HTMLDialogElement { return this.element('game-end') as HTMLDialogElement; }
  private stopTimer(): void {
    if (this.timer !== null) clearInterval(this.timer);
    this.timer = null;
  }
  private startTimer(): void {
    this.stopTimer();
    this.timer = setInterval(this.tick, tickMilliseconds);
  }
  private startGame(): void {
    if (this.dialog.open) this.dialog.close();
    this.game = newGame(Math.random);
    this.renderGame();
    this.startTimer();
  }
  private renderGame(): void {
    if (!this.game) return;
    this.element('game-score').textContent = texts.points(this.game.points);
    this.element('game-status').textContent = texts[this.game.status];
    drawGame(this.element('game-canvas') as HTMLCanvasElement, this.game);
  }
  private pauseGame(): void {
    if (this.game?.status !== 'playing') return;
    this.game = { ...this.game, status: 'paused' };
    this.stopTimer();
    this.renderGame();
  }
  private togglePause(): void {
    if (this.game?.status === 'playing') this.pauseGame();
    else if (this.game?.status === 'paused') {
      this.game = { ...this.game, status: 'playing' };
      this.renderGame();
      this.startTimer();
    }
  }
  private tick = (): void => {
    if (this.current !== 'play' || this.game?.status !== 'playing') return;
    this.game = stepGame(this.game, Math.random);
    this.renderGame();
    if (this.game.status === 'ended') {
      this.stopTimer();
      this.element('end-score').textContent = texts.finalPoints(this.game.points);
      this.dialog.showModal();
      this.element('game-restart').focus();
    }
  };
  private onBlur = (): void => { if (this.current === 'play') this.pauseGame(); };
  private onCancel = (event: Event): void => { event.preventDefault(); this.dialog.close(); this.show('menu'); };
  private element(id: string): HTMLElement {
    const found = this.doc.getElementById(id);
    if (!found) throw new Error(`Missing #${id}`);
    return found;
  }
  private markMenu(focus = true): void {
    this.menu.forEach((button, index) => {
      button.dataset.selected = String(index === this.selected);
      button.tabIndex = index === this.selected ? 0 : -1;
      if (index === this.selected) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
    if (focus) this.menu[this.selected]?.focus();
  }
  private show(screen: Screen): void {
    this.stopTimer();
    if (this.dialog.open) this.dialog.close();
    this.current = screen;
    this.requestId++;
    for (const id of screens) this.element(id).hidden = id !== screen;
    if (screen === 'menu') this.markMenu();
    else this.element(`${screen}-heading`).focus();
    if (screen === 'ranking') void this.loadRanking();
    if (screen === 'play') this.startGame();
  }
  private setStatus(message: string): void {
    this.element('ranking-status').textContent = message;
    this.element('ranking-list').replaceChildren();
  }
  private fillRanking(entries: ReturnType<typeof parseRanking>): void {
    this.setStatus(entries.length ? '' : texts.empty);
    for (const [name, points] of rankingLines(entries)) {
      const row = this.doc.createElement('li');
      for (const text of [name, points]) {
        const cell = this.doc.createElement('span');
        cell.textContent = text;
        row.append(cell);
      }
      this.element('ranking-list').append(row);
    }
  }
  private async loadRanking(): Promise<void> {
    const ownRequest = ++this.requestId;
    this.setStatus(texts.loading);
    this.element('ranking').setAttribute('aria-busy', 'true');
    try {
      const response = await this.fetcher(apiUrl('placares', this.doc.baseURI));
      if (!response.ok) throw new Error('Ranking request failed');
      const entries = parseRanking(await response.json());
      if (ownRequest === this.requestId) this.fillRanking(entries);
    } catch {
      if (ownRequest === this.requestId) this.setStatus(texts.connectionError);
    } finally {
      if (ownRequest === this.requestId) this.element('ranking').setAttribute('aria-busy', 'false');
    }
  }
  private press(key: string): void {
    if (this.current === 'menu') {
      if (key === '2' || key === '8') {
        this.selected = (this.selected + (key === '8' ? 1 : menuTargets.length - 1)) % menuTargets.length;
        this.markMenu();
      }
      if (key === 'ok' || key === '5') this.show(menuTargets[this.selected] ?? 'menu');
    } else if (key === 'c') this.show('menu');
    else if (this.current === 'play' && !this.dialog.open) {
      if (key === '5' || key === 'ok') this.togglePause();
      else if (directions[key] && this.game) this.game = turnGame(this.game, directions[key]);
    } else if (this.current === 'ranking' && key === 'ok') void this.loadRanking();
  }
  private onClick = (event: MouseEvent): void => {
    const button = (event.target as Element | null)?.closest?.<HTMLButtonElement>('button');
    if (button?.id === 'game-restart') this.show('play');
    else if (button?.id === 'game-menu') this.show('menu');
    else if (button?.dataset.screen) {
      this.selected = this.menu.indexOf(button);
      this.show(menuTargets[this.selected] ?? 'menu');
    } else if (button?.dataset.key) this.press(button.dataset.key);
  }
  private onKey = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || ['INPUT', 'TEXTAREA'].includes(target?.tagName ?? '')) return;
    const key = keys[event.key] ?? keys[event.key.toLowerCase()] ?? (/^[1-9]$/.test(event.key) ? event.key : undefined);
    // Native buttons already activate on Enter/Space; handling twice would also refresh the ranking twice.
    if (key && !(target?.tagName === 'BUTTON' && ['Enter', ' '].includes(event.key))) {
      event.preventDefault();
      this.press(key);
    }
  }
}
