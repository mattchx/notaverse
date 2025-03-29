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
    secure: process.env.NODE_ENV === 'production', // HTTPS required in production
    sameSite: process.env.NODE_ENV === 'production' ? 'lax' : 'none',
    path: '/'
  },
  resave: false,
  saveUninitialized: false
});