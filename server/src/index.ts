import express from 'express';
import { corsConfig } from './config/cors.js';
import { sessionConfig } from './config/session.js';
import { authRouter } from './routes/auth.js';
import { router as resourceRouter } from './routes/resources.js';
import { router as clipRouter } from './routes/clips.js';
import { router as noteRouter } from './routes/notes.js';
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
app.use('/api/clips', clipRouter);
app.use('/api/notes', noteRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(env.PORT, () => {
  console.log(`Server running at http://localhost:${env.PORT}`);
});