import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';
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
const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
} as const); // Type assertion to handle libsql client options

// Create Drizzle database instance
export const db = drizzle(client);

// Export the client for direct use if needed
export const tursoClient = client;