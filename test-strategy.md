# Test Strategy

## Test Scope

Total: **116 tests** across server and client.

| Layer | Framework | Count | What it proves |
|-------|-----------|-------|----------------|
| Server unit | Jest | 48 | State machine logic correct in isolation |
| Server integration | Jest + Supertest | 17 | API enforces state machine end-to-end |
| Client unit | Jest | 16 | API client, status transitions, utilities |
| Client component | Jest + React Testing Library | 35 | UI components render and behave correctly |

## Unit Tests

### Server — State Machine (`tests/unit/stateMachine.test.ts`)
- `canTransition` — all 5 valid transitions return true
- `canTransition` — 20 invalid transitions return false
- `assertTransition` — does not throw for valid transitions
- `assertTransition` — throws `InvalidTransitionError` with correct code/message
- `getValidTransitions` — returns correct next states for each status
- `VALID_TRANSITIONS` map — covers all 5 statuses, total count is 5

### Client — Status Transitions (`tests/unit/statusTransitions.test.ts`)
- VALID_TRANSITIONS map mirrors server (same logic, same shape)
- STATUS_LABELS maps all statuses to readable text
- PRIORITY_LABELS maps all priorities to readable text

### Client — Fetch Client (`tests/unit/fetchClient.test.ts`)
- Success: parses JSON response
- Headers: sends Content-Type application/json
- Errors: 400, 404, 422, 500 all throw ApiException with correct fields
- Non-JSON errors: handled gracefully
- AbortSignal: passed through to fetch

## Component Tests

### StatusBadge, PriorityBadge
- Renders correct label for each status/priority value
- Applies correct CSS class for styling

### SearchBar
- Renders with placeholder and aria-label
- Debounces: doesn't call onSearch immediately
- Fires after 300ms delay
- Rapid typing: only final value fires
- Clear: fires empty string

### StatusControl
- Renders only valid transition buttons for each status
- Does NOT render invalid transitions
- Terminal states show "no further transitions" message
- Shows current status badge

### TicketForm
- Renders all required form fields
- Validates: shows error for empty title, short description
- Populates priority dropdown (4 options)
- Populates assignee dropdown from users store
- Calls createTicket with correct data on valid submit

### CommentList
- Empty state: shows "No comments yet"
- Renders all comments with author names
- Maintains chronological order

## API / Integration Tests

### Status Change (`tests/integration/tickets.test.ts`)

**Valid transitions (expect 200):**
- open → in_progress
- open → cancelled
- in_progress → resolved
- in_progress → cancelled
- resolved → closed

**Invalid transitions (expect 422 + INVALID_TRANSITION):**
- open → resolved, open → closed
- in_progress → open, in_progress → closed
- resolved → open, resolved → in_progress, resolved → cancelled
- closed → open (terminal)
- cancelled → open (terminal)

**Edge cases:**
- Unknown ticket → 404 TICKET_NOT_FOUND
- Missing status field → 400 VALIDATION_ERROR
- Invalid status value → 400 VALIDATION_ERROR

## Edge Case Tests

- Single-character search ("t") — ILIKE fallback works
- Terminal state transitions — always rejected
- Missing required fields — returns all validation errors combined
- Non-existent UUID references — 404 returned

## Tests Not Covered (and why)

- **E2E browser tests (Playwright/Cypress):** Would add significant setup complexity and CI time. The component tests + integration tests cover the same flows at a faster execution speed for this project scope.
- **Load/performance tests:** Not needed for a development exercise with <100 tickets.
- **Authentication tests:** No auth implemented in Core (per assignment spec).
