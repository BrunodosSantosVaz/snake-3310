import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

// Shared port: production and integration tests use the same native SQLite adapter.
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}
// Trusted migration batches are explicit; query prepares exactly one statement with bound values.
export interface BatchDb extends Db {
  exec(sql: string): Promise<void>;
}
export interface TransactionalDb extends BatchDb {
  transaction<T>(work: (tx: BatchDb) => Promise<T>): Promise<T>;
}
export interface ClosableDb extends TransactionalDb {
  close(): Promise<void>;
}

// Never include connection objects or query parameters in logs (SEG-IA-04).
export function describeError(error: unknown): { code?: string; message: string } {
  const { code, message } = (error ?? {}) as { code?: unknown; message?: unknown };
  return {
    ...(typeof code === 'string' ? { code } : {}),
    message: typeof message === 'string' ? message : 'erro desconhecido',
  };
}

function sqlValue(value: unknown): SQLInputValue {
  if (value instanceof Date) return value.toISOString();
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint' || ArrayBuffer.isView(value)) {
    return value as SQLInputValue;
  }
  throw new TypeError('unsupported SQL parameter');
}

export function createSqliteDatabase(path: string): ClosableDb {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
  const database = new DatabaseSync(path, { timeout: 5000, defensive: true, allowExtension: false });
  try {
    database.exec('PRAGMA journal_mode = WAL; PRAGMA synchronous = FULL;');
  } catch (error) {
    database.close();
    throw error;
  }
  // Queue all operations, including close, so an async transaction owns this connection until commit/rollback.
  // Other processes coordinate via BEGIN IMMEDIATE and SQLite busy_timeout, including transient rollout overlap.
  let queue: Promise<unknown> = Promise.resolve();
  function serialize<T>(work: () => T | Promise<T>): Promise<T> {
    const pending = queue.then(work);
    queue = pending.catch(() => undefined);
    return pending;
  }
  const tx: BatchDb = {
    exec: async (sql: string) => { database.exec(sql); },
    query: async <T>(sql: string, params?: unknown[]) => {
      const statement = database.prepare(sql);
      const tail = sql.slice(statement.sourceSQL.length).replace(/--[^\r\n]*(?:\r?\n|$)|\/\*[\s\S]*?\*\//g, '').trim();
      if (tail) throw new Error('query requires a single SQL statement; use exec for trusted batches');
      statement.setAllowBareNamedParameters(false);
      const bindings = Object.fromEntries((params ?? []).map((value, index) => [`$${index + 1}`, sqlValue(value)]));
      return { rows: statement.all(bindings) as T[] };
    },
  };
  return {
    exec: (sql: string) => serialize(() => tx.exec(sql)),
    query: <T>(sql: string, params?: unknown[]) => serialize(() => tx.query<T>(sql, params)),
    transaction: <T>(work: (tx: BatchDb) => Promise<T>) => serialize(async () => {
      database.exec('BEGIN IMMEDIATE');
      try {
        const result = await work(tx);
        database.exec('COMMIT');
        return result;
      } catch (error) {
        database.exec('ROLLBACK');
        throw error;
      }
    }),
    close: () => serialize(() => { if (database.isOpen) database.close(); }),
  };
}
