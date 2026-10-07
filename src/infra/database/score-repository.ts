import type { ScoreRepository } from '../../aplicacao/ranking.js';
import type { ScoreWriter } from '../../aplicacao/submit-score.js';
import type { Score } from '../../dominio/ranking.js';
import type { Db } from './db.js';

export class SqlScoreRepository implements ScoreRepository, ScoreWriter {
  constructor(private readonly db: Db) {}

  async save(score: Score): Promise<void> {
    await this.db.query('insert into scores (nickname, points, created_at) values ($1, $2, $3)',
      [score.nickname, score.points, score.createdAt.toISOString()]);
  }

  async top(limit: number): Promise<Score[]> {
    const { rows } = await this.db.query<{ nickname: string; points: number; created_at: Date | string }>(
      'select nickname, points, created_at from scores order by points desc, julianday(created_at) asc, id asc limit $1',
      [limit],
    );
    return rows.map((row) => ({ nickname: row.nickname, points: row.points, createdAt: new Date(row.created_at) }));
  }
}
