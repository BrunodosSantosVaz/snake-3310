import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { DatabaseSync, type SQLInputValue } from 'node:sqlite';

// Shared port: production and integration tests use the same native SQLite adapter.
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}
export interface TransactionalDb extends Db {
  transaction<T>(work: (tx: Db) => Promise<T>): Promise<T>;
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
  const tx: Db = {
    query: async <T>(sql: string, params?: unknown[]) => {
      const statement = database.prepare(sql);
      statement.setAllowBareNamedParameters(false);
      const bindings = Object.fromEntries((params ?? []).map((value, index) => [`$${index + 1}`, sqlValue(value)]));
      if (!params?.length && statement.columns().length === 0) {
        // Numbered migrations contain a trusted SQL batch; user values always use prepared bindings.
        database.exec(sql);
        return { rows: [] as T[] };
      }
      return { rows: statement.all(bindings) as T[] };
    },
  };
  return {
    query: <T>(sql: string, params?: unknown[]) => serialize(() => tx.query<T>(sql, params)),
    transaction: <T>(work: (tx: Db) => Promise<T>) => serialize(async () => {
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
