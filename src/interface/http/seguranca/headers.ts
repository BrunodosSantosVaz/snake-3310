import type { FastifyInstance } from 'fastify';

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'", "script-src 'self'", "style-src 'self'", "img-src 'self'", "font-src 'self'",
  "connect-src 'self'", "object-src 'none'", "base-uri 'self'", "form-action 'self'", "frame-ancestors 'none'",
].join('; ');
const HSTS_MAX_AGE_SECONDS = 31_536_000;

export function registerSecurityHeaders(app: FastifyInstance, production: boolean): void {
  app.addHook('onSend', async (_request, reply, payload) => {
    reply.header('Content-Security-Policy', CONTENT_SECURITY_POLICY);
    reply.header('X-Content-Type-Options', 'nosniff');
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin');
    reply.header('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    reply.header('X-Frame-Options', 'DENY');
    // Do not extend the shared host's HSTS policy to its subdomains.
    if (production) reply.header('Strict-Transport-Security', `max-age=${HSTS_MAX_AGE_SECONDS}`);
    return payload;
  });
}
