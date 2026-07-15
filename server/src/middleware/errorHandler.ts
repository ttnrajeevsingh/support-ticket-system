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
      case 'P2025':
        res.status(404).json({
          error: 'The requested resource was not found',
          code: 'NOT_FOUND',
        });
        return;
      case 'P2002': {
        const target = (err.meta?.target as string[])?.join(', ') || 'field';
        res.status(409).json({
          error: `A record with this ${target} already exists`,
          code: 'CONFLICT',
        });
        return;
      }
      case 'P2003': {
        const field = (err.meta?.field_name as string) || 'reference';
        res.status(400).json({
          error: `The referenced ${field} does not exist`,
          code: 'INVALID_REFERENCE',
        });
        return;
      }
      default: {
        const detail = process.env.NODE_ENV === 'development'
          ? ` (Prisma ${err.code}: ${err.message.split('\n').pop()?.trim()})`
          : '';
        console.error('[Prisma Error]', err.code, err.message);
        res.status(400).json({
          error: `Unable to process the request${detail}`,
          code: 'BAD_REQUEST',
        });
        return;
      }
    }
  }

  // ── Prisma validation errors ─────────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    const detail = process.env.NODE_ENV === 'development'
      ? `: ${err.message.split('\n').pop()?.trim()}`
      : '';
    res.status(400).json({
      error: `Invalid data provided${detail}`,
      code: 'VALIDATION_ERROR',
    });
    return;
  }

  // ── Fallthrough — unexpected errors ──────────────────────────────────────────
  const message =
    process.env.NODE_ENV === 'development' && err instanceof Error
      ? err.message
      : 'An unexpected error occurred. Please try again later.';

  console.error('[Unhandled Error]', err);

  res.status(500).json({ error: message, code: 'INTERNAL_ERROR' });
}
