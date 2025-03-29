import session from 'express-session';
import { env } from './env.js';
import { TursoSessionStore } from './sessionStore.js';

export const sessionConfig = session({
  store: new TursoSessionStore(),
  secret: env.SESSION_SECRET,
  name: 'sess', // Cookie name (removed __Host- prefix for dev compatibility)
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    httpOnly: true,
    // In production: Strict security with SameSite=Lax
    // In development: More permissive with SameSite=None (requires HTTPS)
    secure: true, // Required for both SameSite=None and production security
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
    path: '/'
  },
  resave: false,
  saveUninitialized: false
});