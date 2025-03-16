import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';

// Validate required environment variables
if (!process.env.TURSO_DB_URL) {
  throw new Error('TURSO_DB_URL environment variable is required');
}

// Extract URL and auth token from TURSO_DB_URL
const dbUrl = new URL(process.env.TURSO_DB_URL);
const authToken = dbUrl.searchParams.get('authToken');

// Create Turso client
const client = createClient({
  url: `${dbUrl.protocol}//${dbUrl.host}`,
  authToken: authToken || undefined,
});

// Create Drizzle database instance
export const db = drizzle(client);

// Export the client for direct use if needed
export const tursoClient = client;