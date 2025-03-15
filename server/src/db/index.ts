import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
if (!process.env.TURSO_DB_URL) {
  throw new Error('TURSO_DB_URL environment variable is required');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is required');
}

// Create Turso client
export const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Create Drizzle database instance with our schema
export const db = drizzle(client, { schema });

// Export schema for use in queries
export { schema };