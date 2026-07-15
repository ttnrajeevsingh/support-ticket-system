# Tasks — Support Ticket Management System

> Status: Final — v1.0
> Derived from: `kiro-specs/design.md` and `kiro-specs/requirements.md`
> Approach: Test-driven, incremental. Each task produces working, demoable functionality
> that builds on the previous task. No orphaned code.

---

## Task 1: Repository and project scaffolding

**Objective:** Set up the monorepo structure, tooling, and environment so both server and
client can be started cleanly from the README.

**Implementation guidance:**
- Create the top-level directory with `server/` and `client/` subdirectories
- Initialise `server/` as a Node.js + TypeScript project:
  - `npm init`, install `express`, `cors`, `dotenv`, `express-validator`
  - Install dev deps: `typescript`, `ts-node`, `nodemon`, `@types/express`, `@types/cors`, `@types/node`
  - Create `tsconfig.json` with `strict: true`, `outDir: dist`, `rootDir: src`
  - Add `npm run dev` (nodemon + ts-node) and `npm run build` scripts
- Initialise `client/` as a Next.js 15 project:
  - `npx create-next-app@latest` with TypeScript, App Router, SCSS enabled, no Tailwind
  - Set `NEXT_PUBLIC_API_URL` in `.env.local`
- Create root `.env.example` and `.gitignore` (exclude `.env`, `node_modules`, `dist`)
- Create placeholder `server/src/app.ts` returning `{ status: 'ok' }` on `GET /health`
- Create placeholder `client/app/page.tsx` rendering "Support Ticket System"

**Tests:** Verify `GET /health` returns 200. Verify `npm run dev` starts both processes.

**Demo:** Both server and client start without errors. `GET /health` returns `{ status: 'ok' }`.
Client home page renders the app title.

---

## Task 2: Database setup — Prisma + Supabase

**Objective:** Connect the server to a Supabase PostgreSQL database via Prisma and apply
the full schema with migrations and seed data.

**Implementation guidance:**
- Install Prisma: `npm install prisma @prisma/client` in `server/`
- Run `npx prisma init` — creates `prisma/schema.prisma` and `.env` with `DATABASE_URL`
- Write the full schema from `design.md` section 4.3:
  - Enums: `Role`, `Priority`, `Status`
  - Models: `User`, `Ticket`, `Comment` with all fields, relations, indexes
- Run `npx prisma migrate dev --name init` to push schema to Supabase
- Add a raw SQL migration for the GIN full-text search index:
  ```sql
  CREATE INDEX idx_tickets_fts ON tickets
    USING GIN(to_tsvector('english', title || ' ' || description));
  ```
- Create `prisma/seed.ts`:
  - 3 users: 1 admin (`alice@example.com`), 2 agents (`bob@example.com`, `carol@example.com`)
  - 5 tickets — one per status: `open`, `in_progress`, `resolved`, `closed`, `cancelled`
  - 2 comments on different tickets
- Add `"prisma": { "seed": "ts-node prisma/seed.ts" }` to `package.json`
- Run `npx prisma db seed`
- Create `src/lib/prisma.ts` singleton

**Tests:** Run `npx prisma validate`. Verify seed data appears in Supabase table editor.

**Demo:** `npx prisma studio` shows all three tables populated with seed data. Server connects
to Supabase without errors on startup.

---

## Task 3: State machine module + unit tests

**Objective:** Implement `stateMachine.ts` as a pure TypeScript module and prove it works
with Jest unit tests before writing any Express code.

**Implementation guidance:**
- Install Jest: `npm install --save-dev jest ts-jest @types/jest`
- Create `jest.config.ts` with `preset: 'ts-jest'`, `testEnvironment: 'node'`
- Add `npm test` script pointing to Jest
- Create `src/types/ticket.ts` with `Status`, `Priority`, `Role`, `Ticket`, `Comment`, `User`, `ApiError` types
- Create `src/errors/AppError.ts`, `InvalidTransitionError.ts`, `NotFoundError.ts`
- Implement `src/services/stateMachine.ts`:
  - `VALID_TRANSITIONS: Record<Status, Status[]>`
  - `canTransition(from, to): boolean`
  - `assertTransition(from, to): void` — throws `InvalidTransitionError` if invalid
- Write `tests/unit/stateMachine.test.ts`:
  - `canTransition` — all 5 valid transitions return `true`
  - `canTransition` — at least 5 invalid transitions return `false`
  - `assertTransition` — does not throw for valid transitions
  - `assertTransition` — throws `InvalidTransitionError` with correct `.code` for invalid transitions

**Tests:** `npm test` — all unit tests pass. No DB connection required.

**Demo:** `npm test` output shows green for all `canTransition` and `assertTransition` cases.
The state machine logic is fully verified before any HTTP layer exists.

---

## Task 4: Express app skeleton + error handling middleware

**Objective:** Build the Express application skeleton with the global error handler, 404
handler, and a working `/api/v1` base so all subsequent tasks have a consistent foundation.

**Implementation guidance:**
- Create `src/app.ts`:
  - Register `cors`, `express.json()`, `dotenv`
  - Mount router at `/api/v1`
  - Register 404 handler (after all routes)
  - Register typed global error handler last:
    - Handles `AppError` (uses `.statusCode` and `.code`)
    - Handles `PrismaClientKnownRequestError` P2025 → 404, P2002 → 409
    - Falls through to 500 `INTERNAL_ERROR`
    - Always responds with `{ error: string, code: string }`
- Create `src/server.ts` — calls `app.listen(PORT)`
- Create `src/middleware/errorHandler.ts` with the typed handler
- Create `src/middleware/validate.ts` — runs `validationResult`, throws 400 on failure

**Tests:** Verify unknown routes return `404` with `{ error: ..., code: 'NOT_FOUND' }`.
Verify throwing `new InvalidTransitionError('open','closed')` from a test route returns 422.

**Demo:** `GET /api/v1/nonexistent` returns `{ error: "Not found", code: "NOT_FOUND" }`.
Error shape is consistent across all error types.

---

## Task 5: Users API endpoint

**Objective:** Implement `GET /api/v1/users` so the frontend can populate the assignee
dropdown. This is the simplest endpoint and validates the full route → controller → repository
layer stack.

**Implementation guidance:**
- Create `src/repositories/userRepository.ts`:
  - `findAll(): Promise<User[]>` — `prisma.user.findMany({ orderBy: { name: 'asc' } })`
- Create `src/controllers/userController.ts`:
  - `getUsers` — calls `userRepository.findAll()`, returns 200 with array
- Create `src/routes/userRoutes.ts` — mounts `GET /users` → `getUsers`
- Register `userRoutes` in `app.ts` under `/api/v1/users`

**Tests:** Integration test — `GET /api/v1/users` returns 200 with an array containing
the 3 seeded users; each has `id`, `name`, `email`, `role`.

**Demo:** `GET /api/v1/users` returns the 3 seeded users. The full layer stack
(route → controller → repository → Prisma → Supabase) is end-to-end verified.

---

## Task 6: Tickets CRUD API

**Objective:** Implement the core ticket endpoints: list, get by ID, create, and update.
No status change yet — that comes in Task 7.

**Implementation guidance:**
- Create `src/repositories/ticketRepository.ts`:
  - `findAll({ status?, priority?, assignedTo? })` — `prisma.ticket.findMany` with `include: { creator, assignee }`
  - `findById(id)` — includes creator, assignee, and comments with authors; throws `NotFoundError` if null
  - `create(data)` — `prisma.ticket.create`
  - `update(id, data)` — `prisma.ticket.update`; throws `NotFoundError` if P2025
- Create `src/services/ticketService.ts`:
  - `createTicket(data)` — validates `createdBy` user exists, calls repository
  - `updateTicket(id, data)` — calls repository
- Create `src/controllers/ticketController.ts`:
  - `listTickets` — reads query params, calls repository `findAll`
  - `getTicket` — calls repository `findById`
  - `createTicket` — calls service `createTicket`, returns 201
  - `updateTicket` — calls service `updateTicket`, returns 200
- Create `src/middleware/ticketValidation.ts` — validation chains for POST and PATCH
- Create `src/routes/ticketRoutes.ts` — wire all four endpoints
- Register in `app.ts`

**Tests:**
- `POST /api/v1/tickets` with valid body → 201 + ticket object
- `POST /api/v1/tickets` with missing `title` → 400 `VALIDATION_ERROR`
- `GET /api/v1/tickets` → 200 + array (includes seeded tickets)
- `GET /api/v1/tickets/:id` with valid id → 200 + full ticket
- `GET /api/v1/tickets/:id` with unknown id → 404 `TICKET_NOT_FOUND`
- `PATCH /api/v1/tickets/:id` with valid body → 200 + updated ticket

**Demo:** Create a ticket via the API, retrieve it, update its title. All five acceptance
criteria AC-01 through AC-04 can be manually verified via curl or Postman.

---

## Task 7: Status change API with state machine enforcement

**Objective:** Implement `PATCH /api/v1/tickets/:id/status` with full state machine
enforcement and integration tests that prove the assignment's core requirement.

**Implementation guidance:**
- Add to `src/services/ticketService.ts`:
  - `changeStatus(id, newStatus, userId)`:
    1. Fetch current ticket (throw `NotFoundError` if not found)
    2. Call `assertTransition(current.status, newStatus)` — throws `InvalidTransitionError` if invalid
    3. Call `ticketRepository.updateStatus(id, newStatus)`
    4. Return updated ticket
- Add to `src/repositories/ticketRepository.ts`:
  - `updateStatus(id, status)` — `prisma.ticket.update({ where: { id }, data: { status } })`
- Add to `src/controllers/ticketController.ts`:
  - `changeTicketStatus` — validates body, calls `ticketService.changeStatus`
- Add validation in `ticketValidation.ts` for status change body
- Add `PATCH /:id/status` route

**Tests** (`tests/integration/tickets.test.ts`):

Valid transitions — each must return 200:
- `open → in_progress`
- `open → cancelled`
- `in_progress → resolved`
- `in_progress → cancelled`
- `resolved → closed`

Invalid transitions — each must return 422 with `code: 'INVALID_TRANSITION'`:
- `open → resolved`
- `open → closed`
- `in_progress → open`
- `in_progress → closed`
- `resolved → open`
- `resolved → in_progress`
- `resolved → cancelled`
- `closed → open` (terminal state)
- `cancelled → open` (terminal state)

**Demo:** `npm test` — all state machine integration tests green. AC-06 and AC-11 verified.

---

## Task 8: Comments API

**Objective:** Implement add comment and list comments endpoints, completing the backend API.

**Implementation guidance:**
- Create `src/repositories/commentRepository.ts`:
  - `findByTicketId(ticketId)` — `prisma.comment.findMany` ordered by `createdAt asc`, includes `author`
  - `create(data)` — `prisma.comment.create`; verifies `ticketId` exists (throws `NotFoundError` if P2025)
- Create `src/controllers/commentController.ts`:
  - `addComment` — validates body, calls repository, returns 201
  - `getComments` — calls repository, returns 200
- Create `src/middleware/commentValidation.ts`
- Create `src/routes/commentRoutes.ts` — nested under `/tickets/:id/comments`
- Register in `app.ts`

**Tests:**
- `POST /api/v1/tickets/:id/comments` with valid body → 201 + comment
- `POST /api/v1/tickets/:id/comments` with empty `message` → 400 `VALIDATION_ERROR`
- `POST /api/v1/tickets/:id/comments` with unknown `ticketId` → 404 `TICKET_NOT_FOUND`
- `GET /api/v1/tickets/:id/comments` → 200 + array ordered oldest-first
- Verify `GET /api/v1/tickets/:id` includes comments array

**Demo:** Add two comments to a ticket. `GET /tickets/:id` returns them in chronological
order. AC-05 verified. Backend API is now feature-complete.

---

## Task 9: Keyword search and status filter

**Objective:** Implement full-text keyword search and status filter on `GET /api/v1/tickets`
using PostgreSQL FTS.

**Implementation guidance:**
- Update `src/repositories/ticketRepository.ts` `findAll`:
  - When `search` param present: use `prisma.$queryRaw` with `to_tsvector` / `plainto_tsquery`
  - When no `search`: use typed `prisma.ticket.findMany` with `where` filters
  - Support combining `search` + `status` in the raw query
- Update `src/controllers/ticketController.ts` `listTickets` to extract `search` from query params
- Add validation: reject `status` values outside the valid enum

**Tests:**
- `GET /api/v1/tickets?search=login` → returns only tickets with "login" in title/description
- `GET /api/v1/tickets?status=open` → returns only open tickets
- `GET /api/v1/tickets?search=login&status=open` → intersection
- `GET /api/v1/tickets?search=zzznomatch` → returns empty array (not 404)
- `GET /api/v1/tickets?status=invalid` → 400 `VALIDATION_ERROR`

**Demo:** AC-07 verified. Search and filter return correct subsets from Supabase data.

---

## Task 10: Next.js client — layout, ticket list, and search

**Objective:** Build the client ticket list page with search bar and status filter, wired
to the live Express API via Zustand.

**Implementation guidance:**
- Install client deps: `zustand`, `axios` (or use native fetch), `sass`
- Create `types/ticket.ts` mirroring server types
- Create `lib/api/fetchClient.ts` — wraps fetch with `NEXT_PUBLIC_API_URL` base, JSON headers,
  normalises errors to `ApiError`
- Create `lib/api/ticketsApi.ts` and `lib/api/usersApi.ts`
- Create `store/useTicketStore.ts` with `fetchTickets`, `tickets`, `loading`, `error`
- Create `store/useUserStore.ts` with `fetchUsers`, `users`
- Create `styles/_variables.scss` with status colour tokens
- Create `app/layout.tsx` with `Header` component and global SCSS import
- Create `components/ui/SearchBar.tsx`, `StatusFilter.tsx`, `LoadingSpinner.tsx`, `ErrorBanner.tsx`
  with co-located SCSS modules
- Create `components/tickets/TicketTable.tsx`, `TicketRow.tsx` with status and priority badges
- Create `app/page.tsx` as Server Component; render `TicketListView` as `'use client'` component
- `TicketListView` subscribes to `useTicketStore`, renders search + filter + table

**Tests:** Verify `GET /api/v1/tickets` is called on page load. Verify typing in search
bar filters the displayed tickets. Verify status dropdown filters results.

**Demo:** AC-02 and AC-07 verified in the browser. Ticket list renders seeded data.
Search and filter narrow results in real time.

---

## Task 11: Create ticket page

**Objective:** Build the create ticket form wired to `POST /api/v1/tickets`.

**Implementation guidance:**
- Create `lib/api/ticketsApi.ts` `createTicket` function
- Add `createTicket` action to `useTicketStore`
- Create `components/tickets/TicketForm.tsx` (`'use client'`):
  - Controlled inputs for title, description, priority, assignee
  - `AssigneeSelect` populated from `useUserStore`
  - Field-level inline validation error display
  - On success: redirect to `/` (using `useRouter`)
  - On API error: show `ErrorBanner`
- Create `app/tickets/new/page.tsx` rendering `TicketForm`
- Add "New Ticket" navigation link in `Header`

**Tests:** Submit form with missing title — inline error shown, no API call made.
Submit with valid data — ticket created, redirected to list, new ticket visible.

**Demo:** AC-01 verified. A user creates a ticket via the UI and it appears in the list.

---

## Task 12: Ticket detail page — view and edit

**Objective:** Build the ticket detail page showing all fields, with inline editing for
title, description, priority, and assignee.

**Implementation guidance:**
- Add `fetchTicket` and `updateTicket` to `useTicketStore`
- Create `components/tickets/TicketDetailView.tsx` (`'use client'`):
  - `TicketHeader` — title, created by, created at
  - `TicketFields` — description, priority, assignee displayed with edit toggle
  - On save: calls `updateTicket`, re-fetches ticket
- Create `app/tickets/[id]/page.tsx` — Server Component shell that renders `TicketDetailView`
- Create `app/tickets/[id]/not-found.tsx` for 404 handling
- Make `TicketRow` in the list a link to `/tickets/:id`

**Tests:** Load detail page — all ticket fields displayed correctly. Edit title — changes
persist after page refresh (verify via Supabase or re-fetch).

**Demo:** AC-03 and AC-04 verified. Clicking a ticket opens detail view. Fields are editable
and changes are saved.

---

## Task 13: Status control UI

**Objective:** Build the `StatusControl` component that enforces valid transitions in the UI
and handles API rejection gracefully.

**Implementation guidance:**
- Create `lib/statusTransitions.ts` — mirrors `VALID_TRANSITIONS` from server, typed as
  `Record<Status, Status[]>`
- Add `changeStatus` to `useTicketStore`:
  - Calls `PATCH /tickets/:id/status`
  - On success: updates `activeTicket` in store
  - On 422: sets `error` in store with the API's `error` message
- Create `components/tickets/StatusControl.tsx` (`'use client'`):
  - Shows current status as a `StatusBadge`
  - Renders a button for each entry in `VALID_TRANSITIONS[currentStatus]`
  - On click: calls `changeStatus`, shows loading state on button
  - On error: renders inline `ErrorBanner`, auto-dismisses after 5 seconds
- Create `components/tickets/StatusBadge.tsx` + `StatusBadge.module.scss` with colour variants
- Wire `StatusControl` into `TicketDetailView`

**Tests:** Ticket with status `open` shows only "Start Progress" and "Cancel" buttons.
Clicking "Start Progress" updates status to `in_progress` in the UI without page reload.
Simulating a 422 response shows the error banner.

**Demo:** AC-06 verified in the browser. Invalid state transitions are never offered.
The status updates live without a full page reload.

---

## Task 14: Comments UI

**Objective:** Build the comment section on the ticket detail page — list and add form.

**Implementation guidance:**
- Create `store/useCommentStore.ts` with `fetchComments` and `addComment`
- Create `lib/api/commentsApi.ts`
- Create `components/comments/CommentItem.tsx` + `CommentItem.module.scss`
- Create `components/comments/CommentList.tsx` — renders comments oldest-first
- Create `components/comments/CommentForm.tsx` (`'use client'`):
  - Textarea + user selector (from `useUserStore`) + submit button
  - Clears form on success
  - Shows inline error on empty message or API failure
- Wire `CommentSection` into `TicketDetailView` — loads comments on mount

**Tests:** Add a comment — it appears at the bottom of the list without full page reload.
Submit empty message — inline error shown, no API call.

**Demo:** AC-05 verified. Comments appear in chronological order and new ones append
immediately after submission.

---

## Task 15: Final wiring, error states, and README

**Objective:** Polish error states across the app, verify all acceptance criteria end-to-end,
write the README, and confirm no secrets are in the repository.

**Implementation guidance:**
- Add toast notification for 500 errors (use a lightweight Zustand `useUiStore` + a
  `Toast` component in the root layout)
- Verify `app/tickets/[id]/not-found.tsx` is triggered on 404
- Add empty-state message in `TicketTable` when no results: "No tickets match your search."
- Audit `.gitignore`: confirm `.env`, `node_modules/`, `dist/`, `.next/` are excluded
- Confirm `.env.example` has placeholder values only — no real credentials
- Write `README.md` covering:
  - Prerequisites (Node 18+, Supabase account)
  - Clone and install steps for both server and client
  - Supabase setup (create project, copy `DATABASE_URL`)
  - `npx prisma migrate deploy` + `npx prisma db seed`
  - `npm run dev` for server and client
  - `npm test` for running Jest tests
- Do a final manual walkthrough of AC-01 through AC-11

**Tests:** `npm test` — all unit and integration tests pass. Manual AC checklist completed.

**Demo:** All 11 acceptance criteria verified:
- AC-01 Create ticket ✓
- AC-02 List tickets ✓
- AC-03 Ticket detail ✓
- AC-04 Update fields ✓
- AC-05 Add comments ✓
- AC-06 State machine enforced ✓
- AC-07 Search and filter ✓
- AC-08 Data survives restart ✓
- AC-09 Backend validation ✓
- AC-10 No secrets in repo ✓
- AC-11 Integration tests pass ✓
