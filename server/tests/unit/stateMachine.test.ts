import {
  canTransition,
  assertTransition,
  getValidTransitions,
  VALID_TRANSITIONS,
} from '../../src/services/stateMachine';
import { InvalidTransitionError } from '../../src/errors/InvalidTransitionError';
import { Status } from '../../src/types/ticket';

// ─── canTransition ────────────────────────────────────────────────────────────

describe('canTransition — valid transitions (must return true)', () => {
  const validCases: [Status, Status][] = [
    ['open',        'in_progress'],
    ['open',        'cancelled'],
    ['in_progress', 'resolved'],
    ['in_progress', 'cancelled'],
    ['resolved',    'closed'],
  ];

  test.each(validCases)('%s → %s returns true', (from, to) => {
    expect(canTransition(from, to)).toBe(true);
  });
});

describe('canTransition — invalid transitions (must return false)', () => {
  const invalidCases: [Status, Status][] = [
    ['open',        'resolved'],
    ['open',        'closed'],
    ['open',        'open'],
    ['in_progress', 'open'],
    ['in_progress', 'closed'],
    ['in_progress', 'in_progress'],
    ['resolved',    'open'],
    ['resolved',    'in_progress'],
    ['resolved',    'cancelled'],
    ['resolved',    'resolved'],
    ['closed',      'open'],
    ['closed',      'in_progress'],
    ['closed',      'resolved'],
    ['closed',      'cancelled'],
    ['closed',      'closed'],
    ['cancelled',   'open'],
    ['cancelled',   'in_progress'],
    ['cancelled',   'resolved'],
    ['cancelled',   'closed'],
    ['cancelled',   'cancelled'],
  ];

  test.each(invalidCases)('%s → %s returns false', (from, to) => {
    expect(canTransition(from, to)).toBe(false);
  });
});

// ─── assertTransition ─────────────────────────────────────────────────────────

describe('assertTransition — valid transitions (must not throw)', () => {
  const validCases: [Status, Status][] = [
    ['open',        'in_progress'],
    ['open',        'cancelled'],
    ['in_progress', 'resolved'],
    ['in_progress', 'cancelled'],
    ['resolved',    'closed'],
  ];

  test.each(validCases)('%s → %s does not throw', (from, to) => {
    expect(() => assertTransition(from, to)).not.toThrow();
  });
});

describe('assertTransition — invalid transitions (must throw InvalidTransitionError)', () => {
  const invalidCases: [Status, Status][] = [
    ['open',      'resolved'],
    ['open',      'closed'],
    ['in_progress', 'open'],
    ['in_progress', 'closed'],
    ['resolved',  'open'],
    ['resolved',  'cancelled'],
    ['closed',    'open'],
    ['cancelled', 'open'],
  ];

  test.each(invalidCases)('%s → %s throws InvalidTransitionError', (from, to) => {
    expect(() => assertTransition(from, to)).toThrow(InvalidTransitionError);
  });

  test('thrown error has code INVALID_TRANSITION', () => {
    expect(() => assertTransition('open', 'closed')).toThrow(
      expect.objectContaining({ code: 'INVALID_TRANSITION' }),
    );
  });

  test('thrown error has statusCode 422', () => {
    expect(() => assertTransition('resolved', 'cancelled')).toThrow(
      expect.objectContaining({ statusCode: 422 }),
    );
  });

  test('thrown error message describes the transition', () => {
    expect(() => assertTransition('closed', 'open')).toThrow(
      expect.objectContaining({ message: "Cannot transition from 'closed' to 'open'" }),
    );
  });
});

// ─── getValidTransitions ──────────────────────────────────────────────────────

describe('getValidTransitions', () => {
  test('open has 2 valid transitions', () => {
    expect(getValidTransitions('open')).toEqual(['in_progress', 'cancelled']);
  });

  test('in_progress has 2 valid transitions', () => {
    expect(getValidTransitions('in_progress')).toEqual(['resolved', 'cancelled']);
  });

  test('resolved has 1 valid transition', () => {
    expect(getValidTransitions('resolved')).toEqual(['closed']);
  });

  test('closed is terminal — returns empty array', () => {
    expect(getValidTransitions('closed')).toEqual([]);
  });

  test('cancelled is terminal — returns empty array', () => {
    expect(getValidTransitions('cancelled')).toEqual([]);
  });
});

// ─── VALID_TRANSITIONS shape ──────────────────────────────────────────────────

describe('VALID_TRANSITIONS map', () => {
  test('covers all 5 statuses', () => {
    const statuses: Status[] = ['open', 'in_progress', 'resolved', 'closed', 'cancelled'];
    statuses.forEach((s) => {
      expect(VALID_TRANSITIONS).toHaveProperty(s);
    });
  });

  test('total valid transition count is 5', () => {
    const total = Object.values(VALID_TRANSITIONS).reduce(
      (sum, arr) => sum + arr.length,
      0,
    );
    expect(total).toBe(5);
  });
});
