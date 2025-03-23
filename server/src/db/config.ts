import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';
import * as schema from './schema.js';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Validate required environment variables
if (!process.env.TURSO_DB_URL) {
  throw new Error('TURSO_DB_URL environment variable is required');
}
if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN environment variable is required');
}

// Create Turso client with direct configuration
console.log('Initializing Turso client with:', {
  url: process.env.TURSO_DB_URL,
  hasAuthToken: !!process.env.TURSO_AUTH_TOKEN
});

const client = createClient({
  url: process.env.TURSO_DB_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
});

// Test connection
(async () => {
  try {
    const result = await client.execute('SELECT 1');
    console.log('Successfully connected to Turso:', result);
  } catch (error: any) {
    console.error('Failed to connect to Turso. Full error:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      cause: error?.cause
    });
  }
})();

// Test connection immediately
(async () => {
  try {
    await client.execute('SELECT 1');
    console.log('Successfully connected to Turso database');
  } catch (error) {
    console.error('Failed to connect to Turso:', error);
  }
})();

// Create Drizzle database instance with our schema
export const db = drizzle(client, { schema });

// Export client and schema for use in queries
export { client, schema };