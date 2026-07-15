# AI Prompts — Testing

## Prompt 1: State machine unit tests

**Context:** Task 3 — prove state machine logic before writing HTTP layer.

**Prompt:** (Part of task execution — AI wrote tests alongside the state machine implementation)

**AI Response:** 48 test cases in `tests/unit/stateMachine.test.ts`:
- 5 valid transitions return true
- 20 invalid transitions return false
- 5 valid transitions don't throw
- 11 invalid transitions throw with correct code/statusCode/message
- 5 getValidTransitions tests
- 2 map shape tests

**What I accepted:** All test cases — comprehensive coverage of the state machine.
**What I changed:** Nothing — all 48 passed on first run.

---

## Prompt 2: Integration tests

**Context:** Task 7 — prove the API enforces state machine via HTTP.

**AI Response:** 17 integration tests using supertest against the Express app:
- 5 valid transitions (expect 200)
- 9 invalid transitions (expect 422 + INVALID_TRANSITION)
- 3 edge cases (unknown ticket, missing field, invalid value)

**What I accepted:** Test structure and all assertions.
**What I changed:** Nothing — all 17 passed on first run.

---

## Prompt 3: Frontend tests

**Prompt:** Write the test cases of Frontend

**AI Response:** Set up Jest + React Testing Library, wrote 8 test suites (51 tests):
- StatusBadge, PriorityBadge — render correct labels/classes
- SearchBar — debounce behavior, accessibility
- StatusControl — only valid buttons rendered
- TicketForm — validation, field rendering, API integration
- CommentList — empty state, rendering
- fetchClient — success/error/abort handling
- statusTransitions — map logic

**What I accepted:** All test files and the setup configuration.
**What I changed:**
- `next/jest` needed `.js` extension
- `setupFilesAfterFramework` → corrected to `setupFilesAfterEnv`
- `userEvent` incompatible with fake timers → switched to `fireEvent`
