import pg from 'pg';

// The smallest database surface the app needs. Implemented by node-postgres in production and by PGlite in tests.
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}

// A database that can run several statements on one connection, all or nothing (migrations, DAD-01).
export interface TransactionalDb extends Db {
  transaction<T>(work: (tx: Db) => Promise<T>): Promise<T>;
}

export interface ClosableDb extends TransactionalDb {
  close(): Promise<void>;
}

// Only the code and message are ever logged: the pool object carries the connection string (SEG-IA-04).
export type DbErrorReporter = (error: { code?: string; message: string }) => void;

export function describeError(error: unknown): { code?: string; message: string } {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  return {
    ...(typeof code === 'string' ? { code } : {}),
    message: typeof message === 'string' ? message : 'erro desconhecido',
  };
}

// An idle connection that drops (database restart, network) is emitted as 'error' by pg-pool; without a listener the
// process dies instead of answering 503 on /api/ready (RN-0003).
export function listenForErrors(pool: { on(event: 'error', listener: (error: Error) => void): unknown }, report: DbErrorReporter): void {
  pool.on('error', (error) => report(describeError(error)));
}

export function createPool(databaseUrl: string, report: DbErrorReporter): ClosableDb {
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    max: 5,
    connectionTimeoutMillis: 3000,
    query_timeout: 5000,
  });
  listenForErrors(pool, report);
  let closed = false;
  return {
    query: async <T>(sql: string, params?: unknown[]) => {
      const result = await pool.query(sql, params);
      return { rows: result.rows as T[] };
    },
    transaction: async <T>(work: (tx: Db) => Promise<T>) => {
      const client = await pool.connect();
      const tx: Db = {
        query: async <R>(sql: string, params?: unknown[]) => ({ rows: (await client.query(sql, params)).rows as R[] }),
      };
      try {
        await client.query('begin');
        const result = await work(tx);
        await client.query('commit');
        return result;
      } catch (error) {
        await client.query('rollback').catch(() => undefined);
        throw error;
      } finally {
        client.release();
      }
    },
    close: async () => {
      if (closed) return;
      closed = true;
      await pool.end();
    },
  };
}
