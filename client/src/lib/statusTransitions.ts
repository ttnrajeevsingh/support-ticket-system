import { Status } from '@/types/ticket';

/**
 * Client-side mirror of VALID_TRANSITIONS from the server.
 * Used ONLY for rendering — the server remains the authoritative enforcement point.
 */
export const VALID_TRANSITIONS: Record<Status, Status[]> = {
  open:        ['in_progress', 'cancelled'],
  in_progress: ['resolved',    'cancelled'],
  resolved:    ['closed'],
  closed:      [],
  cancelled:   [],
};

export const STATUS_LABELS: Record<Status, string> = {
  open:        'Open',
  in_progress: 'In Progress',
  resolved:    'Resolved',
  closed:      'Closed',
  cancelled:   'Cancelled',
};

export const PRIORITY_LABELS: Record<string, string> = {
  low:      'Low',
  medium:   'Medium',
  high:     'High',
  critical: 'Critical',
};
