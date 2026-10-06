import { apiUrl, parseRanking, rankingLines } from './ranking.js';
import { texts } from './texts.js';

export type RankingFetcher = (url: string) => Promise<{ ok: boolean; json(): Promise<unknown> }>;
type Screen = 'menu' | 'play' | 'ranking' | 'instructions';
const screens: Screen[] = ['menu', 'play', 'ranking', 'instructions'];
const menuTargets: Screen[] = ['play', 'ranking', 'instructions'];
const keys: Record<string, string> = { ArrowUp: '2', ArrowDown: '8', w: '2', s: '8', Enter: 'ok', Escape: 'c', Backspace: 'c', ' ': '5' };

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

  constructor(private readonly doc: Document, private readonly fetcher: RankingFetcher) {
    this.menu = [...doc.querySelectorAll<HTMLButtonElement>('[data-screen]')];
  }
  start(): void {
    this.doc.addEventListener('click', this.onClick);
    this.doc.addEventListener('keydown', this.onKey);
    this.show('menu');
  }
  destroy(): void {
    this.requestId++;
    this.doc.removeEventListener('click', this.onClick);
    this.doc.removeEventListener('keydown', this.onKey);
  }
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
    this.current = screen;
    this.requestId++;
    for (const id of screens) this.element(id).hidden = id !== screen;
    if (screen === 'menu') this.markMenu();
    else this.element(`${screen}-heading`).focus();
    if (screen === 'ranking') void this.loadRanking();
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
    else if (this.current === 'ranking' && key === 'ok') void this.loadRanking();
  }
  private onClick = (event: MouseEvent): void => {
    const button = (event.target as Element | null)?.closest?.<HTMLButtonElement>('button');
    if (button?.dataset.screen) {
      this.selected = this.menu.indexOf(button);
      this.show(menuTargets[this.selected] ?? 'menu');
    } else if (button?.dataset.key) this.press(button.dataset.key);
  }
  private onKey = (event: KeyboardEvent): void => {
    const target = event.target as HTMLElement | null;
    if (event.defaultPrevented || event.ctrlKey || event.altKey || event.metaKey || ['INPUT', 'TEXTAREA'].includes(target?.tagName ?? '')) return;
    const key = keys[event.key] ?? (/^[1-9]$/.test(event.key) ? event.key : undefined);
    // Native buttons already activate on Enter/Space; handling twice would also refresh the ranking twice.
    if (key && !(target?.tagName === 'BUTTON' && ['Enter', ' '].includes(event.key))) {
      event.preventDefault();
      this.press(key);
    }
  }
}
