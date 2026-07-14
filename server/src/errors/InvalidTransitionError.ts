import { AppError } from './AppError';

/**
 * Thrown when a ticket status transition violates the state machine rules.
 * Maps to HTTP 422 Unprocessable Entity.
 */
export class InvalidTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(
      `Cannot transition from '${from}' to '${to}'`,
      'INVALID_TRANSITION',
      422,
    );
  }
}
