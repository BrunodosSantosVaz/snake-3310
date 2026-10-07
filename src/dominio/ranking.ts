// RN-0001: the ranking shows at most the 10 highest scores, highest first; ties go to the earlier score.
export const RANKING_SIZE = 10;

export interface Score {
  nickname: string;
  points: number;
  createdAt: Date;
}

export function rankScores(scores: readonly Score[]): Score[] {
  return [...scores]
    .sort((a, b) => b.points - a.points || a.createdAt.getTime() - b.createdAt.getTime())
    .slice(0, RANKING_SIZE);
}
