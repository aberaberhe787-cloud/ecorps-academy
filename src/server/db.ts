import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pool: Pool | null = null;

const noOp = {
  findMany: async () => [],
  findFirst: async () => null,
  findUnique: async () => null,
  create: async (d: any) => d?.data ?? {},
  update: async (d: any) => d?.data ?? {},
  delete: async () => ({}),
};

function createMockDb(): any {
  const handler: ProxyHandler<any> = {
    get: (_target, prop) => {
      if (prop === 'query') {
        return new Proxy({}, {
          get: () => new Proxy({}, {
            get: (_t, method) => (noOp as any)[method] || (async () => [])
          })
        });
      }
      if (prop === 'then') {
        return (resolve: any) => resolve([]);
      }
      return (..._args: any[]) => new Proxy({}, handler);
    },
    apply: () => new Proxy({}, handler),
  };
  return new Proxy({}, handler);
}

export function getDatabase() {
  if (!process.env.DATABASE_URL) return null;
  if (!client) {
    try {
      pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
      client = drizzle(pool, { schema });
    } catch (err) {
      console.warn('[AI Studio] Database connection failed:', err);
      return null;
    }
  }
  return client;
}

export function requireDatabase() {
  const database = getDatabase();
  if (!database) {
    console.warn('[AI Studio] DATABASE_URL is not configured — using mock');
    return createMockDb();
  }
  return database;
}
