import cors from 'cors';
import { env } from './env.js';

// For development, be more permissive with origins
const corsOrigins = process.env.NODE_ENV === 'production' 
  ? env.CORS_ORIGIN 
  : [env.CORS_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'];

console.log('🌐 CORS configuration:', {
  origin: corsOrigins,
  credentials: true
});

export const corsConfig = cors({
  origin: corsOrigins,
  credentials: true, // Important for cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
});