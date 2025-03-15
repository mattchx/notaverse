import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client/http';
import * as dotenv from 'dotenv';
import * as fs from 'fs/promises';
import * as path from 'path';

dotenv.config();

async function dropTables(client: any) {
  const tables = ['markers', 'sections', 'media_items', 'users'];
  for (const table of tables.reverse()) {
    try {
      await client.execute(`DROP TABLE IF EXISTS ${table}`);
      console.log(`Dropped table: ${table}`);
    } catch (error) {
      console.error(`Error dropping table ${table}:`, error);
    }
  }
}

async function main() {
  const shouldReset = process.argv.includes('--reset');
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
    if (shouldReset) {
      console.log('Dropping existing tables...');
      await dropTables(client);
    }

    // Read all migration files
    const migrationFiles = await fs.readdir('./src/db/migrations');
    
    // Sort files to ensure correct order
    migrationFiles.sort();

    // Apply each migration
    for (const file of migrationFiles) {
      if (!file.endsWith('.sql')) continue;
      
      console.log(`Applying migration: ${file}`);
      const migration = await fs.readFile(
        path.join('./src/db/migrations', file),
        'utf-8'
      );

      // Split migration into statements
      const statements = migration
        .split('-->')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt && !stmt.startsWith('statement-breakpoint'));

      try {
        // Execute each statement
        for (const statement of statements) {
          await client.execute(statement);
        }
      } catch (error) {
        if (!shouldReset) {
          console.error('Error applying migration. Try running with --reset to drop existing tables.');
          throw error;
        }
        throw error;
      }
    }

    console.log('All migrations applied successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    process.exit(1);
  } finally {
    await client.close();
  }
}

main().catch(console.error);