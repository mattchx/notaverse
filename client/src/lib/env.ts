/**
 * Client-side environment configuration
 * Validates and provides type-safe access to environment variables
 */

// Define the shape of our environment variables
interface Env {
  MODE: 'development' | 'production' | 'test';
  DEV: boolean;
  PROD: boolean;
  API_BASE_URL: string;
  DEBUG: boolean;
}

// Create and validate our environment configuration
export const env: Env = {
  MODE: import.meta.env.MODE as Env['MODE'],
  DEV: import.meta.env.DEV,
  PROD: import.meta.env.PROD,
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002',
  DEBUG: import.meta.env.DEV || false,
};

// Validate API base URL is set
if (!env.API_BASE_URL) {
  console.warn('VITE_API_BASE_URL is not set, using default: http://localhost:3002');
}

export default env; 