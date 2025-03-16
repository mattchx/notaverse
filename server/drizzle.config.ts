import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: process.env.TURSO_DB_URL
    ? (() => {
        const url = new URL(process.env.TURSO_DB_URL);
        const [databaseId] = url.host.split('.');
        return {
          url: url.origin,
          authToken: url.searchParams.get('authToken') || ''
        };
      })()
    : { url: 'file:./src/data/dev.db' },
  verbose: true,
  strict: true
} satisfies Config;