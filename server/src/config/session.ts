import session from 'express-session';
import { env } from './env.js';

export const sessionConfig = session({
  secret: env.SESSION_SECRET,
  name: '__Host-sess', // Cookie name
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
  },
  resave: false,
  saveUninitialized: false
});