import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../errors/AppError';

/**
 * Runs express-validator's validationResult and throws a 400 AppError
 * if any validation rule failed. Place this after your validation chains.
 */
export function validate(req: Request, _res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors
      .array()
      .map((e) => e.msg)
      .join(', ');
    return next(new AppError(messages, 'VALIDATION_ERROR', 400));
  }
  next();
}
