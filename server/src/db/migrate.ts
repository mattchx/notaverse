import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/http';
import { schema } from './schema.js';
import * as dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

async function main() {
  console.log('Pushing schema changes...');

  if (!process.env.TURSO_DB_URL) {
    throw new Error('TURSO_DB_URL environment variable is required');
  }

  const client = createClient({
    url: process.env.TURSO_DB_URL,
  });

  const db = drizzle(client, { schema });

  try {
    // Disable foreign keys temporarily
    await db.run(sql`PRAGMA foreign_keys = OFF`);

    // Drop existing sessions table if it exists
    await db.run(sql`DROP TABLE IF EXISTS sessions`);

    // Create tables based on schema
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY NOT NULL,
        expires INTEGER,
        data TEXT NOT NULL
      )
    `);

    // Re-enable foreign keys
    await db.run(sql`PRAGMA foreign_keys = ON`);
    
    console.log('Schema changes applied successfully');
  } catch (error) {
    console.error('Error applying schema changes:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);