import type { Score } from '../dominio/ranking.js';
import { validSubmission } from '../dominio/score-submission.js';

export interface ScoreWriter {
  save(score: Score): Promise<void>;
}

export class SubmitScore {
  constructor(private readonly scores: ScoreWriter, private readonly now: () => Date = () => new Date()) {}

  async execute(input: unknown): Promise<boolean> {
    if (!validSubmission(input)) return false;
    await this.scores.save({ nickname: input.nickname, points: input.points, createdAt: this.now() });
    return true;
  }
}
