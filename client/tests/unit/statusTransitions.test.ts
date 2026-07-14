import { VALID_TRANSITIONS, STATUS_LABELS, PRIORITY_LABELS } from '@/lib/statusTransitions';
import { Status } from '@/types/ticket';

describe('VALID_TRANSITIONS', () => {
  test('open has 2 valid next states', () => {
    expect(VALID_TRANSITIONS.open).toEqual(['in_progress', 'cancelled']);
  });

  test('in_progress has 2 valid next states', () => {
    expect(VALID_TRANSITIONS.in_progress).toEqual(['resolved', 'cancelled']);
  });

  test('resolved has 1 valid next state', () => {
    expect(VALID_TRANSITIONS.resolved).toEqual(['closed']);
  });

  test('closed is terminal — empty array', () => {
    expect(VALID_TRANSITIONS.closed).toEqual([]);
  });

  test('cancelled is terminal — empty array', () => {
    expect(VALID_TRANSITIONS.cancelled).toEqual([]);
  });

  test('covers all 5 statuses', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
    statuses.forEach((s) => {
      expect(VALID_TRANSITIONS).toHaveProperty(s);
    });
  });

  test('total valid transitions is 5', () => {
    const total = Object.values(VALID_TRANSITIONS).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    expect(total).toBe(5);
  });
});

describe('STATUS_LABELS', () => {
  test('maps all statuses to human-readable labels', () => {
    expect(STATUS_LABELS.open).toBe('Open');
    expect(STATUS_LABELS.in_progress).toBe('In Progress');
    expect(STATUS_LABELS.resolved).toBe('Resolved');
    expect(STATUS_LABELS.closed).toBe('Closed');
    expect(STATUS_LABELS.cancelled).toBe('Cancelled');
  });
});

describe('PRIORITY_LABELS', () => {
  test('maps all priorities to human-readable labels', () => {
    expect(PRIORITY_LABELS.low).toBe('Low');
    expect(PRIORITY_LABELS.medium).toBe('Medium');
    expect(PRIORITY_LABELS.high).toBe('High');
    expect(PRIORITY_LABELS.critical).toBe('Critical');
  });
});
