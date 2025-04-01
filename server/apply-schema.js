import { createClient } from '@libsql/client/http';
import fs from 'fs';
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

// Read SQL file
const sql = fs.readFileSync('./fix-tables.sql', 'utf8');

// Split by statement breakpoints
const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);

async function main() {
  console.log(`Found ${statements.length} SQL statements to execute`);
  
  try {
    for (const stmt of statements) {
      console.log(`Executing: ${stmt.trim().substring(0, 50)}...`);
      try {
        await client.execute(stmt);
        console.log('Success');
      } catch (error) {
        console.error(`Error executing statement: ${error.message}`);
      }
    }
    
    console.log('Schema update completed');
  } catch (err) {
    console.error('Failed to update schema:', err);
  }
}

main(); 