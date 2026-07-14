import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { AppError } from './errors/AppError';

dotenv.config();

const app = express();

// ── Global middleware ──────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:3000' }));
app.use(express.json());

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ── API v1 router (routes mounted by each task) ────────────────────────────────
import { router as apiRouter } from './routes';
app.use('/api/v1', apiRouter);

// ── 404 handler (must come after all routes) ───────────────────────────────────
app.use((_req: Request, _res: Response, next: NextFunction) => {
  next(new AppError('Not found', 'NOT_FOUND', 404));
});

// ── Global error handler (must be last) ───────────────────────────────────────
app.use(errorHandler);

export default app;
