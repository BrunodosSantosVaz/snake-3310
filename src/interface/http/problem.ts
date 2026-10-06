import type { FastifyReply } from 'fastify';

// Every error answer uses Problem Details (RFC 9457, API-03) with a controlled title: internal messages never reach
// the client (SEG-13). Only 4xx keep their status; anything else becomes 500.
export interface Problem {
  type: string;
  title: string;
  status: number;
}

const TITLES: Record<number, string> = {
  400: 'Requisição inválida',
  401: 'Não autenticado',
  403: 'Proibido',
  404: 'Não encontrado',
  405: 'Método não permitido',
  406: 'Formato não aceito',
  408: 'Tempo esgotado',
  409: 'Conflito',
  413: 'Requisição grande demais',
  415: 'Tipo de conteúdo não suportado',
  422: 'Dados inválidos',
  429: 'Muitas requisições',
  500: 'Erro interno',
};

export function problemFor(statusCode: number | undefined): Problem {
  const status = statusCode !== undefined && statusCode >= 400 && statusCode < 500 ? statusCode : 500;
  return { type: 'about:blank', title: TITLES[status] ?? (status < 500 ? 'Erro na requisição' : 'Erro interno'), status };
}

export function sendProblem(reply: FastifyReply, problem: Problem): FastifyReply {
  return reply.code(problem.status).type('application/problem+json').send(problem);
}

// RN-0003: "not ready" is a deliberate 503, never mapped to 500.
export const UNAVAILABLE: Problem = { type: 'about:blank', title: 'Indisponível', status: 503 };
