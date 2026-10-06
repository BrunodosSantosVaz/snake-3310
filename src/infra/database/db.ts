// The smallest database surface the app needs. Implemented by node-postgres in production and by PGlite in tests.
export interface Db {
  query<T = Record<string, unknown>>(sql: string, params?: unknown[]): Promise<{ rows: T[] }>;
}
