import { createClient } from '@libsql/client';
import { env } from '../config/env.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const client = createClient({
    url: env.TURSO_DB_URL
  });

  try {
    const migrationSQL = await fs.readFile(
      path.join(__dirname, 'migrations', '002_add_source_url.sql'),
      'utf-8'
    );

    console.log('Running migration to add source_url column...');
    await client.execute(migrationSQL);
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrate();