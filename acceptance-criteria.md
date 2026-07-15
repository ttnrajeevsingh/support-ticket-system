# Acceptance Criteria

## Core

- [x] A user can create a ticket via the UI
- [x] A user can view all tickets from the database
- [x] A user can open a ticket detail view
- [x] A user can update ticket fields and reassign
- [x] A user can add comments
- [x] Status changes only through valid transitions; invalid ones rejected (422)
- [x] Keyword search and status filter work
- [x] Data remains available after server restart
- [x] Backend validation prevents invalid records (400)
- [x] No secrets committed to the repo
- [x] State-machine integration tests pass

## Validation

- [x] Title: required, 3-200 characters
- [x] Description: required, minimum 10 characters
- [x] Priority: required, one of low/medium/high/critical
- [x] createdBy: required, valid UUID
- [x] assignedTo: optional, valid UUID if provided
- [x] Status change: status field required + valid enum, userId required
- [x] Comment message: required, non-empty after trim
- [x] Query params: status/priority validated against enum, page must be positive int, limit 1-100

## Error Handling

- [x] 400 VALIDATION_ERROR — missing or invalid fields
- [x] 404 TICKET_NOT_FOUND — ticket ID doesn't exist
- [x] 404 NOT_FOUND — unknown routes
- [x] 422 INVALID_TRANSITION — state machine violation
- [x] 429 RATE_LIMITED — too many requests
- [x] 409 CONFLICT — unique constraint violation
- [x] 500 INTERNAL_ERROR — unhandled exceptions (message hidden in production)
- [x] All errors return consistent `{ error, code }` shape

## Testing

- [x] 48 unit tests for state machine (canTransition, assertTransition)
- [x] 17 integration tests for status change API (5 valid + 9 invalid + 3 edge cases)
- [x] 51 frontend tests (components, API client, utilities)
- [x] Total: 116 tests passing
- [x] Pre-commit hooks enforce tests pass before every commit

## Documentation

- [x] README with complete setup instructions (10 steps)
- [x] .env.example with placeholder values
- [x] Prompt history documenting AI interactions
- [x] Tool workflow document (Part A)
- [x] Kiro specs (requirements, design, tasks)
