import { Session } from 'express-session';

export interface User {
  id: string;
  email: string;
  password: string; // Hashed
  createdAt: Date;
  updatedAt: Date;
}

declare module 'express-session' {
  interface SessionData {
    userId: string;
    email: string;
  }
}