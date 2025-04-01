import session from 'express-session';
import { env } from './env.js';
import { TursoSessionStore } from './sessionStore.js';

// Determine if we're in production or development
const isProduction = process.env.NODE_ENV === 'production';

// In development, secure:false allows cookies to work over HTTP on localhost
// In production, we always use secure:true
const cookieConfig = {
  maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
  httpOnly: true,
  secure: isProduction, // Only true in production
  sameSite: isProduction ? 'lax' as const : 'lax' as const, // Using 'lax' for both
  path: '/'
};

export const sessionConfig = session({
  store: new TursoSessionStore(),
  secret: env.SESSION_SECRET,
  name: 'sess', // Cookie name
  cookie: cookieConfig,
  resave: false,
  saveUninitialized: false
});

console.log('🍪 Session configuration:', {
  cookieName: 'sess',
  secure: cookieConfig.secure,
  sameSite: cookieConfig.sameSite,
  httpOnly: cookieConfig.httpOnly,
  maxAge: '7 days',
  env: process.env.NODE_ENV || 'development'
});