import { RANKING_SIZE, rankScores, type Score } from '../dominio/ranking.js';

// Port implemented by the infrastructure (ARQ-04).
export interface ScoreRepository {
  top(limit: number): Promise<Score[]>;
}

export interface RankingEntry {
  nickname: string;
  points: number;
}

export class ListRanking {
  constructor(private readonly scores: ScoreRepository) {}

  async execute(): Promise<RankingEntry[]> {
    const top = rankScores(await this.scores.top(RANKING_SIZE));
    return top.map(({ nickname, points }) => ({ nickname, points }));
  }
}
