import type { DatabaseProbe } from '../../aplicacao/health.js';
import type { Db } from './db.js';

export class SqlDatabaseProbe implements DatabaseProbe {
  constructor(private readonly db: Db) {}

  async ping(): Promise<void> {
    await this.db.query('select 1');
  }
}
