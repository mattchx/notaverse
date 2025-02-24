import cors from 'cors';
import { env } from './env.js';

export const corsConfig = cors({
  origin: env.CORS_ORIGIN,
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type']
});