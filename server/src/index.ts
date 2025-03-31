import express from 'express';
import { corsConfig } from './config/cors.js';
import { sessionConfig } from './config/session.js';
import { authRouter } from './routes/auth.js';
import resourceRouter from './routes/resources.js';
import { markerRouter } from './routes/markers.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './config/env.js';

const app = express();

// Middleware
app.use(corsConfig);
app.use(express.json());
app.use(sessionConfig);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/resources', resourceRouter);
app.use('/api/markers', markerRouter);

// Error handling
app.use(errorHandler);

// Initialize database and start server
async function start() {
  try {
    console.log('Database initialized successfully');

    app.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
}

start().catch(console.error);