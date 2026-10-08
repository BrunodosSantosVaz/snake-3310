import type { FastifyRequest } from 'fastify';
import { normalizeIp } from '../../../infra/ip.js';

export function scoreClientIp(request: FastifyRequest, trustedPeers: ReadonlySet<string>): string {
  const peer = normalizeIp(request.raw.socket.remoteAddress ?? '') ?? 'unknown';
  const forwarded = request.headers['x-snake-client-ip'];
  // Only the immediate, explicit peer may supply the dedicated single-IP header. Never use XFF.
  if (trustedPeers.has(peer) && typeof forwarded === 'string') return normalizeIp(forwarded) ?? peer;
  return peer;
}
