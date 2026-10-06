import type { ScoreRepository } from '../../aplicacao/ranking.js';
import type { Score } from '../../dominio/ranking.js';
import type { Db } from './db.js';

export class SqlScoreRepository implements ScoreRepository {
  constructor(private readonly db: Db) {}

  async top(limit: number): Promise<Score[]> {
    const { rows } = await this.db.query<{ nickname: string; points: number; created_at: Date | string }>(
      'select nickname, points, created_at from scores order by points desc, julianday(created_at) asc, id asc limit $1',
      [limit],
    );
    return rows.map((row) => ({ nickname: row.nickname, points: row.points, createdAt: new Date(row.created_at) }));
  }
}
