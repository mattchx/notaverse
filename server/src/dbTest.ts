import * as dotenv from 'dotenv';
import { createClient } from '@libsql/client/http';

// Load environment variables
dotenv.config();

const url = process.env.TURSO_DB_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

console.log('Attempting connection with:', {
  url,
  authTokenLength: authToken?.length
});

const client = createClient({
  url: url!,
  authToken: authToken!
});

async function testConnection() {
  try {
    const result = await client.execute('SELECT 1 as test');
    console.log('Connection successful:', result);
  } catch (error) {
    console.error('Connection failed. Full error:', error);
  }
}

testConnection();