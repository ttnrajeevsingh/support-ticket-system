import { AppError } from './AppError';

/**
 * Thrown when a requested resource does not exist.
 * Maps to HTTP 404 Not Found.
 *
 * @param resource  Human-readable resource name, e.g. 'Ticket', 'User'
 */
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(
      `${resource} not found`,
      `${resource.toUpperCase()}_NOT_FOUND`,
      404,
    );
  }
}
