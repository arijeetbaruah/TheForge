import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import apiRouter from './routes/index';

// Load environment variables from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));

// Request parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount all API routes
app.use('/api', apiRouter);

// Serve compiled React bundle in production mode
if (process.env.NODE_ENV === 'production') {
  const clientDistPath = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDistPath));

  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
  console.log(`Production client assets served from: ${clientDistPath}`);
} else {
  // Simple welcome landing for dev API sanity check
  app.get('/', (_req, res) => {
    res.json({ message: 'The Forge API (Development Mode)' });
  });
}

// Start listener
app.listen(PORT, () => {
  console.log(`The Forge Server is burning hot on port ${PORT} [Mode: ${process.env.NODE_ENV || 'development'}]`);
});
