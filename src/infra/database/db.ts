import pg from 'pg';

// The smallest database surface the app needs; implemented by node-postgres in production and by PGlite in tests.
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

export interface ClosableDb extends Db {
  close(): Promise<void>;
}

export function createPool(databaseUrl: string): ClosableDb {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 3000 });
  return {
    query: async <T>(sql: string, params?: unknown[]) => {
      const result = await pool.query(sql, params);
      return { rows: result.rows as T[] };
    },
    close: () => pool.end(),
  };
}
