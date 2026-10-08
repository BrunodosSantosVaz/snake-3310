import { isIP } from 'node:net';

export function normalizeIp(value: string): string | null {
  if (isIP(value) === 4) return value;
  if (isIP(value) !== 6 || value.includes('%')) return null;
  const canonical = new URL(`http://[${value}]/`).hostname.slice(1, -1);
  const mapped = /^::ffff:([a-f\d]+):([a-f\d]+)$/.exec(canonical);
  if (!mapped) return canonical;
  const high = parseInt(mapped[1]!, 16);
  const low = parseInt(mapped[2]!, 16);
  return [high >> 8, high & 255, low >> 8, low & 255].join('.');
}

export function parseTrustedProxyIps(value: string | undefined): string[] {
  if (!value?.trim()) return [];
  const entries = value.split(',').map((entry) => normalizeIp(entry.trim()));
  if (entries.length > 64 || entries.some((entry) => entry === null)) throw new Error('TRUSTED_PROXY_IPS deve conter somente IPs individuais separados por vírgula');
  return [...new Set(entries as string[])];
}
