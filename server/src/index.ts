import express from 'express';
import cors from 'cors';
import { router as resourceRouter } from './routes/resources.js';
import { router as clipRouter } from './routes/clips.js';
import { router as noteRouter } from './routes/notes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const port = process.env.PORT || 3002; // Changed port to 3002

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/resources', resourceRouter);
app.use('/api/clips', clipRouter);
app.use('/api/notes', noteRouter);

// Error handling
app.use(errorHandler);

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});