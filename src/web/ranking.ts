export interface RankingEntry { nickname: string; points: number }
const VISIBLE_RANKING_SIZE = 5;
const numbers = new Intl.NumberFormat('pt-BR');

export function rankingLines(entries: readonly RankingEntry[]): Array<[string, string]> {
  return entries.slice(0, VISIBLE_RANKING_SIZE).map((entry, index) => [`${index + 1}. ${entry.nickname}`, numbers.format(entry.points)]);
}

export function apiUrl(path: string, base: string): string {
  return new URL(`api/${path}`, base).href;
}

export function parseRanking(value: unknown): RankingEntry[] {
  const scores = (value as { scores?: unknown } | null)?.scores;
  if (!Array.isArray(scores) || !scores.every(isEntry)) throw new Error('Invalid ranking response');
  return scores;
}

function isEntry(value: unknown): value is RankingEntry {
  const entry = value as Partial<RankingEntry> | null;
  return typeof entry?.nickname === 'string' && typeof entry.points === 'number' && Number.isSafeInteger(entry.points) && entry.points >= 0;
}
