import { createClient } from '@libsql/client';
import { env } from './config/env.js';
import { User } from './types/auth.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const client = createClient({
  url: env.TURSO_DB_URL,
});


// User-related database functions
export async function createUser(user: Omit<User, 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  await client.execute({
    sql: 'INSERT INTO users (id, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
    args: [user.id, user.email, user.password, now, now]
  });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await client.execute({
    sql: 'SELECT id, email, password, created_at as createdAt, updated_at as updatedAt FROM users WHERE email = ?',
    args: [email]
  });

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    id: user.id as string,
    email: user.email as string,
    password: user.password as string,
    createdAt: new Date(user.createdAt as number),
    updatedAt: new Date(user.updatedAt as number)
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await client.execute({
    sql: 'SELECT id, email, password, created_at as createdAt, updated_at as updatedAt FROM users WHERE id = ?',
    args: [id]
  });

  if (result.rows.length === 0) {
    return null;
  }

  const user = result.rows[0];
  return {
    id: user.id as string,
    email: user.email as string,
    password: user.password as string,
    createdAt: new Date(user.createdAt as number),
    updatedAt: new Date(user.updatedAt as number)
  };
}

export default client;