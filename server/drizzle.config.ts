import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();

export default {
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dialect: 'sqlite',
  dbCredentials: {
    url: process.env.TURSO_DB_URL || 'file:./src/data/dev.db'
  },
  verbose: true,
  strict: true
} satisfies Config;