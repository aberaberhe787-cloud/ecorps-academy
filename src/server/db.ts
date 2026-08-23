import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../db/schema';

let client: ReturnType<typeof drizzle<typeof schema>> | null = null;
let pool: Pool | null = null;

export function getDatabase() {
  if (!process.env.DATABASE_URL) return null;
  if (!client) {
    pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
    client = drizzle(pool, { schema });
  }
  return client;
}

export function requireDatabase() {
  const database = getDatabase();
  if (!database) throw new Error('DATABASE_URL is not configured');
  return database;
}
