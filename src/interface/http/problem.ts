import { STATUS_CODES } from 'node:http';
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
  404: 'Não encontrado',
  405: 'Método não permitido',
  413: 'Requisição grande demais',
  415: 'Tipo de conteúdo não suportado',
  429: 'Muitas requisições',
  500: 'Erro interno',
  503: 'Indisponível',
};

export function problemFor(statusCode: number | undefined): Problem {
  const status = statusCode !== undefined && statusCode >= 400 && statusCode < 500 ? statusCode : 500;
  return { type: 'about:blank', title: TITLES[status] ?? STATUS_CODES[status] ?? 'Erro', status };
}

export function sendProblem(reply: FastifyReply, problem: Problem): FastifyReply {
  return reply.code(problem.status).type('application/problem+json').send(problem);
}
