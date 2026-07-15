# Test Results

## Server Tests — 65/65 PASSING

```
PASS tests/integration/tickets.test.ts (7.9s)
  PATCH /api/v1/tickets/:id/status — valid transitions
    ✓ open → in_progress returns 200
    ✓ open → cancelled returns 200
    ✓ in_progress → resolved returns 200
    ✓ in_progress → cancelled returns 200
    ✓ resolved → closed returns 200
  PATCH /api/v1/tickets/:id/status — invalid transitions
    ✓ open → resolved returns 422 INVALID_TRANSITION
    ✓ open → closed returns 422 INVALID_TRANSITION
    ✓ in_progress → open returns 422 INVALID_TRANSITION
    ✓ in_progress → closed returns 422 INVALID_TRANSITION
    ✓ resolved → open returns 422 INVALID_TRANSITION
    ✓ resolved → in_progress returns 422 INVALID_TRANSITION
    ✓ resolved → cancelled returns 422 INVALID_TRANSITION
    ✓ closed → open returns 422 INVALID_TRANSITION
    ✓ cancelled → open returns 422 INVALID_TRANSITION
  PATCH /api/v1/tickets/:id/status — edge cases
    ✓ unknown ticket returns 404
    ✓ missing status field returns 400
    ✓ invalid status value returns 400

PASS tests/unit/stateMachine.test.ts
  canTransition — valid transitions: 5 passing
  canTransition — invalid transitions: 20 passing
  assertTransition — valid: 5 passing
  assertTransition — invalid: 11 passing
  getValidTransitions: 5 passing
  VALID_TRANSITIONS map: 2 passing

Test Suites: 2 passed, 2 total
Tests:       65 passed, 65 total
Time:        8.0s
```

## Client Tests — 51/51 PASSING

```
PASS tests/components/SearchBar.test.tsx
PASS tests/components/TicketForm.test.tsx
PASS tests/components/CommentList.test.tsx
PASS tests/components/StatusControl.test.tsx
PASS tests/components/PriorityBadge.test.tsx
PASS tests/components/StatusBadge.test.tsx
PASS tests/unit/statusTransitions.test.ts
PASS tests/unit/fetchClient.test.ts

Test Suites: 8 passed, 8 total
Tests:       51 passed, 51 total
Time:        0.93s
```

## Combined Total: 116/116 PASSING

## Pre-commit Hook Output (on successful commit)

```
🔍 Running pre-commit checks...

📦 [Server] Type checking... ✅
🧪 [Server] Running tests... ✅ (48 unit tests)
📦 [Client] Type checking... ✅
🧪 [Client] Running tests... ✅ (51 tests)
🏗️  [Client] Building...    ✅ (next build)

🎉 All pre-commit checks passed!
```
