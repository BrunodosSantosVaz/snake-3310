export const texts = {
  loading: 'Carregando…',
  empty: 'Ninguém ainda. Seja o primeiro!',
  connectionError: 'Sem conexão. OK tenta de novo',
  playing: 'Em jogo',
  paused: 'Em pausa. 5 ou espaço continua',
  ended: 'Fim de jogo',
  points: (value: number) => `Pontos: ${new Intl.NumberFormat('pt-BR').format(value)}`,
  finalPoints: (value: number) => `${new Intl.NumberFormat('pt-BR').format(value)} pontos`,
} as const;
