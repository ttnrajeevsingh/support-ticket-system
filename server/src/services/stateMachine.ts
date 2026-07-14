import { Status } from '../types/ticket';
import { InvalidTransitionError } from '../errors/InvalidTransitionError';

/**
 * Defines every valid status transition.
 * Any (from → to) pair NOT in this map is rejected.
 *
 * State diagram:
 *   open        → in_progress | cancelled
 *   in_progress → resolved    | cancelled
 *   resolved    → closed
 *   closed      → (terminal)
 *   cancelled   → (terminal)
 */
export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  open:        ['in_progress', 'cancelled'],
  in_progress: ['resolved',    'cancelled'],
  resolved:    ['closed'],
  closed:      [],
  cancelled:   [],
};

/**
 * Returns true if transitioning from `from` to `to` is allowed.
 *
 * @param from  Current ticket status
 * @param to    Requested new status
 */
export function canTransition(from: Status, to: Status): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Asserts that the transition is valid. Throws InvalidTransitionError if not.
 * Call this in the ticket service before any database write.
 *
 * @param from  Current ticket status
 * @param to    Requested new status
 * @throws {InvalidTransitionError} if the transition is not allowed
 */
export function assertTransition(from: Status, to: Status): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}

/**
 * Returns the list of valid next statuses from a given status.
 * Used by the frontend to render only the allowed transition buttons.
 */
export function getValidTransitions(from: Status): Status[] {
  return VALID_TRANSITIONS[from] ?? [];
}
