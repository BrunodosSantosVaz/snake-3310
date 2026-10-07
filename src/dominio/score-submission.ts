export interface ScoreSubmission {
  nickname: string;
  points: number;
}

// RN-0005: local vocabulary, compared without case/diacritics; the filter is not a moderation service.
const blockedFragments = ['puta', 'puto', 'porra', 'caralho', 'merda', 'buceta', 'cacete', 'foder', 'fodase'];
const blockedNames = new Set(['cu', 'fdp']);

export function validSubmission(input: unknown): input is ScoreSubmission {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) return false;
  const fields = Object.keys(input);
  if (fields.length !== 2 || !fields.includes('nickname') || !fields.includes('points')) return false;
  const { nickname, points } = input as Record<string, unknown>;
  if (typeof nickname !== 'string' || !/^[\p{L}\p{N}]{3,12}$/u.test(nickname)) return false;
  const comparable = nickname.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (blockedFragments.some((word) => comparable.includes(word)) || blockedNames.has(comparable.replace(/\p{N}/gu, ''))) return false;
  return typeof points === 'number' && Number.isInteger(points) && points >= 0 && points <= 1890 && points % 7 === 0;
}
