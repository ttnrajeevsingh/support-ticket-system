import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../errors/AppError';

/**
 * Global error handler — must be registered LAST in app.ts.
 * Maps every error type to a consistent { error, code } JSON response.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // ── Known application errors (AppError subclasses) ──────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, code: err.code });
    return;
  }

  // ── Prisma known request errors ──────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025': // Record not found
        res.status(404).json({ error: 'Resource not found', code: 'NOT_FOUND' });
        return;
      case 'P2002': // Unique constraint violation
        res.status(409).json({ error: 'Resource already exists', code: 'CONFLICT' });
        return;
      case 'P2003': // Foreign key constraint
        res.status(400).json({ error: 'Referenced resource does not exist', code: 'INVALID_REFERENCE' });
        return;
      default:
        res.status(400).json({ error: 'Database error', code: 'DATABASE_ERROR' });
        return;
    }
  }

  // ── Prisma validation errors ─────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: 'Invalid data provided', code: 'VALIDATION_ERROR' });
    return;
  }

  // ── Fallthrough — unexpected errors ──────────────────────────────────────────
  const message =
    process.env.NODE_ENV === 'development' && err instanceof Error
      ? err.message
      : 'An unexpected error occurred';

  if (process.env.NODE_ENV === 'development') {
    console.error('[ErrorHandler]', err);
  }

  res.status(500).json({ error: message, code: 'INTERNAL_ERROR' });
}
