import { createClient } from '@libsql/client';
import { env } from './config/env.js';

const client = createClient({
  url: env.TURSO_DB_URL
});

export default client;