import { eq } from 'drizzle-orm';
import { db } from './config.js';
import { users } from './schema.js';
import type { User } from '../types/auth.js';

export async function createUser(user: Omit<User, 'createdAt' | 'updatedAt'>) {
  const now = Date.now();
  await db.insert(users).values({
    id: user.id,
    email: user.email,
    password: user.password,
    createdAt: new Date(now),
    updatedAt: new Date(now)
  });
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  
  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}

export async function findUserById(id: string): Promise<User | null> {
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  
  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  return {
    id: user.id,
    email: user.email,
    password: user.password,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  };
}