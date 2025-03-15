import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client/http';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('Running migrations...');

  if (!process.env.TURSO_DB_URL) {
    throw new Error('TURSO_DB_URL environment variable is required');
  }

  if (!process.env.TURSO_AUTH_TOKEN) {
    throw new Error('TURSO_AUTH_TOKEN environment variable is required');
  }

  const client = createClient({
    url: process.env.TURSO_DB_URL,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client);

  try {
    await migrate(db, { migrationsFolder: './src/db/migrations' });
    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);