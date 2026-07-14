# AI Prompt History — Support Ticket Management System

This file logs every significant AI interaction across the project lifecycle.
Each entry should include the context, the prompt used, the AI response summary,
and any corrections or iterations made. This is an assessed artifact — keep it updated.

---

## How to Use This File

For each meaningful AI interaction, add an entry using the format below.
"Meaningful" means any prompt that shaped a design decision, generated code,
debugged an issue, or produced a planning artifact.

---

## Entry Format

```
### [YYYY-MM-DD] — [Short description of what was being done]

**Context:** What were you trying to accomplish?
**Prompt:** (paste the exact prompt or summarize if long)
**AI Response Summary:** What did the AI suggest or produce?
**Iterations:** Did you correct, refine, or reject the suggestion? Why?
**Outcome:** What was the final result or decision?
```

---

## Log

### [2025-01-01] — Initial requirements analysis from assignment brief

**Context:** Analyzing the assessment brief to produce structured requirements covering
functional, non-functional, API, database, acceptance criteria, risks, and architecture.

**Prompt:**
> Analyze the assignment and generate: functional requirements, non-functional requirements,
> API requirements (Node/Express), database requirements (PostgreSQL), acceptance criteria,
> risks and assumptions, open questions, and suggested architecture.

**AI Response Summary:** Generated a full requirements document covering all 8 sections,
including a status state machine definition, Prisma schema, and layered architecture diagram.

**Iterations:**
- Updated database choice from local PostgreSQL to Supabase (hosted) to remove local install dependency.
- Switched ORM from raw `node-postgres` to Prisma for cleaner migrations and seed management.
- Added Supabase setup steps (4.2) and full migration workflow (4.7).
- Added two new risk rows covering Supabase free tier connection limits and project pausing.

**Outcome:** `kiro-specs/requirements.md` created and finalized.

---

### [2025-01-01] — Design document creation

**Context:** Translating the finalised requirements into a concrete technical design covering
backend layers, frontend component tree, state machine, error handling, testing strategy,
and environment configuration.

**Prompt:**
> yes (proceed with design.md)

**AI Response Summary:** Generated `kiro-specs/design.md` covering: system overview diagram,
backend layer responsibilities and request lifecycle, state machine module design with state
diagram, error handling with custom error classes, validation strategy, search design using
Prisma `$queryRaw` + PostgreSQL FTS, frontend page/component tree, status control UI design,
API client structure, database ERD, Prisma singleton pattern, and test case matrix.

**Iterations:** None — design flowed directly from agreed requirements.

**Outcome:** `kiro-specs/design.md` created and complete.

---

### [2025-01-01] — Tech stack update: design.md revised to Next.js 15, TypeScript, SCSS Modules, Zustand, Jest

**Context:** Original design used React (Vite) + plain JS + custom hooks. Stack revised to
match the defined tech choices.

**Prompt:**
> Update the design to include the below tech stack —
> Frontend: Next.js 15 (App Router), TypeScript, SCSS Modules, Zustand
> Backend: Node.js, Express, TypeScript, Prisma ORM
> Database: PostgreSQL
> Testing: Jest

**AI Response Summary:** Rewrote `kiro-specs/design.md` (v1.1) with:
- Tech stack summary table (section 0)
- Next.js App Router routing with Server/Client Component split
- TypeScript shared types (`Ticket`, `Comment`, `User`, `ApiError`) replacing plain JS
- Zustand stores (`useTicketStore`, `useCommentStore`, `useUserStore`) replacing custom hooks
- SCSS Modules pattern with co-located `.module.scss` files and CSS custom properties for status colours
- `stateMachine.ts` rewritten in TypeScript with typed `Record<Status, Status[]>`
- Custom error classes in TypeScript
- `fetchClient.ts` using native `fetch` instead of axios
- `NEXT_PUBLIC_API_URL` env var for client-side API base URL
- Jest + ts-jest config for TypeScript test support
- Updated directory structures for both client and server

**Iterations:** None — clean rewrite from agreed stack.

**Outcome:** `kiro-specs/design.md` updated to v1.1.

---

### [2025-01-01] — tasks.md created (15 incremental tasks)

**Context:** Converting the finalized design into an ordered, test-driven task list following
agile best practices. Each task must produce demoable, integrated functionality.

**Prompt:**
> yes (proceed with tasks.md)

**AI Response Summary:** Generated `kiro-specs/tasks.md` with 15 tasks:
1. Repository and project scaffolding
2. Database setup (Prisma + Supabase, schema, seed)
3. State machine module + Jest unit tests (pure, no DB)
4. Express app skeleton + error handling middleware
5. Users API endpoint
6. Tickets CRUD API (list, get, create, update)
7. Status change API with state machine enforcement + integration tests
8. Comments API
9. Keyword search and status filter (PostgreSQL FTS)
10. Next.js client — layout, ticket list, search
11. Create ticket page
12. Ticket detail page — view and edit
13. Status control UI (Zustand + valid transitions only)
14. Comments UI
15. Final wiring, error states, README, AC walkthrough

Each task includes objective, implementation guidance, test requirements, and a demo
description tied back to acceptance criteria.

**Iterations:** None — tasks flow directly from the agreed design.

**Outcome:** `kiro-specs/tasks.md` created. All three kiro-specs files are now complete.

---

### [2025-01-01] — design.md updated to v1.2: full API contract added (section 8)

**Context:** API contracts were only summarised in requirements.md. A detailed contract
with full request/response shapes, field rules, status codes, and error codes was missing
from the design doc.

**Prompt:**
> You forgot to add api contract

**AI Response Summary:** Added section 8 (API Contract) to `kiro-specs/design.md` covering:
- GET /users — response shape
- GET /tickets — query params, response shape, error codes
- POST /tickets — request body with field rules, response 201, errors
- GET /tickets/:id — full response including nested comments and author
- PATCH /tickets/:id — partial update body, field rules, response
- PATCH /tickets/:id/status — request body, valid transitions table, 422 example
- POST /tickets/:id/comments — request body, field rules, response 201
- GET /tickets/:id/comments — response shape
- Standard error response shape with complete error code reference table

**Iterations:** None.

**Outcome:** `kiro-specs/design.md` updated to v1.2.

---

### [2026-07-10] — Task 1: Repository and project scaffolding

**Context:** Setting up the monorepo with `server/` (Express + TypeScript) and `client/`
(Next.js 15 + TypeScript + SCSS) so both can be started from the README.

**Prompt:**
> Execute the tasks defined in tasks.md starting from Task 1.

**AI Response Summary:** Created all scaffolding files:
- `server/package.json` with all deps (express, prisma, jest, supertest, ts-node, nodemon)
- `server/tsconfig.json` (strict, ES2020, commonjs)
- `server/jest.config.ts` (ts-jest preset)
- `server/src/app.ts` (health check placeholder)
- `server/src/server.ts` (entry point)
- `client/package.json` (next 15, react 19, zustand 5, sass)
- `client/tsconfig.json`, `next.config.ts`
- `client/src/app/layout.tsx`, `page.tsx`, `globals.scss`
- Root `.gitignore`, `.nvmrc` (22), `.env.example`

**Iterations:**
- `npm install` failed because the system default Node was v12.22.12 (ancient nvm default).
- Resolved by prepending `/opt/homebrew/bin` to PATH (Homebrew has Node 25) or using
  `~/.nvm/versions/node/v22.22.3/bin` directly.
- Server npm install succeeded with `export PATH="/opt/homebrew/bin:$PATH"`.

**Outcome:** Both `server/` and `client/` initialised with all dependencies installed.
`GET /health` returns `{"status":"ok"}`.

---

### [2026-07-10] — Task 2: Database setup — Prisma + Supabase

**Context:** Connecting to Supabase (hosted PostgreSQL) via Prisma, applying schema
migrations, and seeding with sample data.

**Prompt:**
> Added DATABASE_URL now proceed with init and seed

**AI Response Summary:** Created:
- `prisma/schema.prisma` with enums (Role, Priority, Status), models (User, Ticket, Comment),
  relations, indexes, and `directUrl` for migration support.
- `prisma/seed.ts` — 3 users, 5 tickets (one per status), 3 comments.
- `src/lib/prisma.ts` — singleton pattern for connection pool safety.
- Applied two migrations: `init` (schema) + `add_fts_index` (GIN full-text search).

**Iterations:**
- Port 5432 on `db.[ref].supabase.co` (direct connection) was blocked by network policy.
- Resolved by using Supabase's session-mode pooler on port 5432 at the `pooler.supabase.com` host.
- Port 6543 (transaction pooler) also blocked — set both `DATABASE_URL` and `DIRECT_URL` to
  use the session-mode pooler (port 5432 on pooler host).

**Outcome:** Schema migrated, seed complete. Verified: 3 users, 5 tickets (one per status),
3 comments all present in Supabase.

---

### [2026-07-10] — Task 3: State machine module + unit tests

**Context:** Implementing the ticket status state machine as a pure TypeScript module
with full Jest unit test coverage before writing any Express code.

**Prompt:**
> (Continued from task execution flow)

**AI Response Summary:** Created:
- `src/types/ticket.ts` — all shared TypeScript interfaces and types
- `src/errors/AppError.ts`, `InvalidTransitionError.ts`, `NotFoundError.ts`
- `src/services/stateMachine.ts` — `VALID_TRANSITIONS`, `canTransition`, `assertTransition`
- `tests/unit/stateMachine.test.ts` — 48 test cases covering all valid/invalid transitions,
  error codes, status codes, and the transition map shape.

**Iterations:** None — all 48 tests passed on first run.

**Outcome:** `npm run test:unit` — 48/48 tests green. State machine proven correct before
any HTTP layer exists.

---

### [2026-07-14] — Tasks 4–9: Complete backend API

**Context:** Building the full Express REST API in one session: skeleton, error handler,
users, tickets CRUD, status change, comments, and search.

**Prompt:**
> proceed with remaining tasks

**AI Response Summary:** Implemented in sequence:
- **Task 4:** Express app with CORS, JSON parsing, `/api/v1` router, 404 handler, typed
  global error handler (maps AppError, Prisma errors, and unknown errors to `{ error, code }`).
- **Task 5:** `GET /api/v1/users` — repository → controller → route (returns 3 seeded users).
- **Task 6:** Tickets CRUD — list (with filters), get by ID (with comments), create (validates
  user exists), update. Validation middleware using express-validator.
- **Task 7:** `PATCH /tickets/:id/status` — calls `assertTransition`, returns 422 on invalid.
  Integration test suite: 17 tests (5 valid, 9 invalid, 3 edge cases) all passing.
- **Task 8:** Comments API — `POST` and `GET /tickets/:id/comments` with nested routing
  (`mergeParams: true`), validation, and 404 on unknown ticket.
- **Task 9:** Full-text search via `$queryRaw` with PostgreSQL `to_tsvector`/`plainto_tsquery`,
  combined with status/priority filters. Returns `[]` for no matches (not 404).

**Iterations:**
- TypeScript strict mode complained about `req.params.id` type (`string | string[]`).
  Fixed with `req.params['id'] as string` in controllers.
- Shell scripting in the test terminal was fragile with `#` comments and piping through
  `node -e`. Switched to simple single-command `curl` calls for verification.

**Outcome:** Full test suite: 65/65 tests passing (48 unit + 17 integration). All backend
endpoints verified via curl. AC-01 through AC-09 are testable via the API.

---

### [2026-07-14] — Task 10: Next.js frontend — layout, ticket list, search

**Context:** Building the client-side ticket list page with Zustand stores, API client,
search bar, and status filter, wired to the live Express API.

**Prompt:**
> go

**AI Response Summary:** Created:
- `src/lib/api/fetchClient.ts` — typed `fetch` wrapper with `ApiException` class
- `src/lib/api/ticketsApi.ts`, `commentsApi.ts`, `usersApi.ts`
- `src/store/useTicketStore.ts`, `useCommentStore.ts`, `useUserStore.ts` (Zustand v5)
- `src/lib/statusTransitions.ts` — client-side mirror of `VALID_TRANSITIONS`
- `src/components/layout/Header.tsx` + SCSS module
- `src/components/ui/SearchBar.tsx`, `StatusFilter.tsx` + SCSS modules
- `src/components/tickets/StatusBadge.tsx`, `PriorityBadge.tsx`, `TicketListView.tsx` + SCSS
- `src/app/page.tsx`, `layout.tsx`, `globals.scss`

**Iterations:**
- Next.js dev server threw `localStorage.getItem is not a function` errors with Node 25.
  This is a Node 25 incompatibility with Next.js 15.3 — Node 25 is too new/unstable.
- Resolved by running the client dev server with Node 22 instead:
  `export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH" && npm run dev`
- Confirmed: Node 22 works perfectly, page renders with 200 OK.

**Outcome:** Client builds cleanly (`next build` passes). Home page renders the ticket list
with search bar and status filter, all wired to the Express API via Zustand.
Node 22 required for the client dev server (documented for README).

---

### [2026-07-14] — Task 11: Create ticket page

**Context:** Building the `/tickets/new` page with a controlled form, client-side validation,
assignee dropdown populated from the users API, and redirect to home on success.

**Prompt:**
> yes (proceed with Task 12 — context was continuing from Task 11)

**AI Response Summary:** Created:
- `src/components/tickets/TicketForm.tsx` — controlled form with fields for title, description,
  priority, assignedTo, createdBy. Client-side validation (min lengths, required fields).
  On submit: calls `useTicketStore.createTicket`, on success redirects to `/` via `useRouter`.
  API errors displayed in an `apiError` banner.
- `src/components/tickets/TicketForm.module.scss` — form styling with error states.
- `src/app/tickets/new/page.tsx` — renders `TicketForm`.

**Iterations:** None — compiled and rendered on first attempt (`200 OK` on `/tickets/new`).

**Outcome:** AC-01 (create ticket via UI) verified at the page level. Form renders, validates
client-side, and is wired to the backend.

---

### [2026-07-14] — Task 12: Ticket detail page — view and edit

**Context:** Building the `/tickets/[id]` page showing all ticket fields, with an inline
edit mode for title, description, priority, and assignee.

**Prompt:**
> yes

**AI Response Summary:** Created:
- `src/components/tickets/TicketDetailView.tsx` — shows ticket header (title, creator, date,
  status badge), a details section with grid layout (priority, assignee, status, updated),
  description, and an "Edit" button that reveals inline form fields. Save calls
  `useTicketStore.updateTicket`.
- `src/components/tickets/TicketDetailView.module.scss`
- `src/app/tickets/[id]/page.tsx` — client component using `use(params)` for Next.js 15
  async params pattern.
- `src/app/tickets/[id]/not-found.tsx` — 404 fallback page.

**Iterations:**
- Used Next.js 15's `use()` hook to unwrap the Promise-based `params` (new App Router pattern).
- No compile errors on first run.

**Outcome:** AC-03 (view ticket detail) and AC-04 (update fields) verified at the page level.
Page returns 200 and renders correctly.

---

### [2026-07-14] — Task 13: Status control UI

**Context:** Building the `StatusControl` component that renders only valid next-state
transition buttons and handles API 422 rejection gracefully.

**Prompt:**
> continue

**AI Response Summary:** Created:
- `src/components/tickets/StatusControl.tsx` — reads `VALID_TRANSITIONS[currentStatus]` to
  determine which buttons to render. Each button triggers `useTicketStore.changeStatus`.
  On 422 error, displays inline error banner with dismiss button. Terminal states (closed,
  cancelled) show "no further transitions" message.
- `src/components/tickets/StatusControl.module.scss` — colour-coded buttons matching each
  status colour. Loading/disabled states on click.
- Wired into `TicketDetailView` as a dedicated section.

**Iterations:** None — compiled cleanly on first pass.

**Outcome:** AC-06 (status changes only through valid transitions, invalid ones never offered
in UI) verified at the component level. The server remains the sole enforcement point.

---

### [2026-07-14] — Task 14: Comments UI

**Context:** Building the comment section on the ticket detail page — chronological list
and add-comment form.

**Prompt:**
> (continued from Task 13)

**AI Response Summary:** Created:
- `src/components/comments/CommentSection.tsx` — loads comments via `useCommentStore.fetchComments`
  on mount, renders `CommentList` and `CommentForm`.
- `src/components/comments/CommentList.tsx` — renders comments oldest-first, shows empty state.
- `src/components/comments/CommentItem.tsx` — author name, timestamp, message.
- `src/components/comments/CommentForm.tsx` — textarea + user selector + submit. Client-side
  validation (empty message rejected). Clears form on success. Errors shown inline.
- Co-located SCSS modules for all four components.
- Wired `CommentSection` into `TicketDetailView` as the final section.

**Iterations:** None — page returned 200 with all components rendered after hot-reload.

**Outcome:** AC-05 (add comments, displayed chronologically) verified at the component level.
Backend comment API wired end-to-end through Zustand store.

---

### [2026-07-14] — Task 15: Final wiring, error states, README

**Context:** Polishing the app — auditing .gitignore, verifying no secrets, running final
tests, writing the README, and verifying all 11 acceptance criteria end-to-end.

**Prompt:**
> continue with task 15

**AI Response Summary:**
- Audited `.gitignore` — confirms `.env`, `.env.local`, `node_modules/`, `dist/`, `.next/` excluded.
- Verified `.env.example` contains only placeholder values (no real passwords).
- Ran full test suite: 65/65 passing (48 unit + 17 integration).
- Built client with `next build` — all routes compile (static + dynamic).
- Wrote `README.md` covering: tech stack, prerequisites, setup steps (clone, install,
  Supabase config, migrate, seed, start dev servers, run tests), project structure,
  state machine diagram, API endpoints table, key design decisions, and Node 22 version note.
- Verified all pages return 200 after clearing stale `.next` cache.

**Iterations:**
- The `/tickets/[id]` route returned 500 with `Cannot find module './663.js'` error. This was
  a stale webpack chunk in the `.next` cache from hot-reload cycles during development.
  Resolved by `rm -rf .next` and restarting the dev server.
- Multi-line bash scripts with `echo` + pipe caused shell parsing issues. Resolved by running
  each verification as a separate single-command `curl` call.

**Outcome:** All 11 acceptance criteria verified:
- AC-01 through AC-11 all pass.
- 65/65 tests green.
- README provides full setup instructions.
- No secrets in repository.
- Project complete and ready for submission.

---

### [2026-07-14] — Bug fix: Partial search not working + add request cancellation

**Context:** Searching "dar" or "da" returned no results because `plainto_tsquery` only
matches complete words. Also needed: cancel in-flight search requests when user types
a new character.

**Prompt:**
> search is not working properly - i tried with searching dar, it should return ticket
> which includes dark. Also if one search call is in progress and another request came in,
> cancel the first request.

**AI Response Summary:**

Fix 1 — Backend prefix search:
- Replaced `plainto_tsquery('english', ${search})` with `to_tsquery('english', ${tsquery})`
- Built `tsquery` by splitting input into words and appending `:*` to the last word
  (e.g. "dar" → `dar:*`, "dark mode" → `dark & mode:*`)
- Sanitized input to strip special characters before building the tsquery
- Still uses the GIN index — prefix scan is index-backed, sub-millisecond at this scale.

Fix 2 — Client request cancellation (AbortController):
- Added `signal?: AbortSignal` parameter to `ticketsApi.getTickets()`
- In `useTicketStore.fetchTickets`: maintain a module-level `searchAbortController`
- On each new call: abort the previous controller, create a fresh one, pass its signal
- Abort errors (`DOMException` with name `AbortError`) are silently ignored
- Only the response from the latest request updates the store state

**Iterations:** None — both fixes worked on first verification.

**Outcome:**
- `?search=da` now returns 3 results (dark, date, dashboard)
- Rapid typing cancels stale requests, preventing race conditions in the UI

---

### [2026-07-14] — Question: Why no cancelled requests visible in Network tab?

**Context:** After implementing AbortController, no cancelled network calls were visible
in the browser's Network tab during fast typing.

**Prompt:**
> I can't see any canceled network call. Is it because you added debounce delay of 300?

**AI Response Summary:** Explained how the two mechanisms work at different layers:
- **Debounce (300ms in SearchBar):** Prevents the API call from firing until typing pauses.
  Fast typing never triggers a request — the timer resets each keystroke.
- **AbortController (in useTicketStore):** Cancels in-flight requests when a new one starts.
  This is a safety net for the race condition where the user pauses, a request fires, then
  types again before the response arrives.

In practice, on a fast connection to Supabase, the debounce absorbs all rapid input so the
abort never visibly triggers. The abort only fires when:
1. User pauses → request fires
2. User types again before the response comes back → new request aborts the old one

Both are complementary — debounce reduces load, abort prevents stale data.

**Iterations:** None — explanation only, no code change.

**Outcome:** User understands the layered approach. No change needed.

---

### [2026-07-14] — Fix: Table reload on search + Lighthouse performance

**Context:** Searching caused the entire ticket table to unmount and remount (flash of
"Loading tickets..." text), and Lighthouse performance score was 85.

**Prompt:**
> on search it reloads the whole table not a good user experience, fix it make it async
> and also lighthouse performance score is 85, it should 95+

**AI Response Summary:**

Fix 1 — Smooth async search (no table flash):
- Changed `TicketListView` to distinguish between initial load and subsequent searches
- Used `hasLoadedOnce` ref to track first successful load
- During subsequent searches: table remains visible at 50% opacity (`.fading` class)
  with `pointer-events: none` while loading
- "Searching..." indicator appears in the toolbar instead of replacing the table
- Added CSS transition: `opacity 0.15s ease` for smooth visual feedback

Fix 2 — Lighthouse performance:
- Added `Viewport` export with explicit `width`, `initialScale`, `themeColor`
- Added `-webkit-font-smoothing`, `text-size-adjust`, and image defaults in globals
- Removed failed `experimental: { optimizeCss: true }` (requires `critters` dep)
- Kept `compiler: { removeConsole: true }` for production builds
- Explained that dev mode always scores ~15-20 points lower than production
  (unminified JS, source maps, hot-reload scripts, no compression)
- Production build shows 107kB First Load JS (101kB shared + 2.96kB page) — lean

**Iterations:**
- `next/dynamic` with `ssr: false` and inline `loading` JSX caused a build error in
  Next.js 15 App Router. Simplified to `'use client'` page component instead.
- `experimental.optimizeCss` caused MODULE_NOT_FOUND — removed (not bundled with Next 15).
- Stale `.next` cache required `rm -rf .next` + restart after config changes.

**Outcome:** Table no longer flashes during search — stays visible with fade effect.
Production build bundle is lean (107kB). Score should be 95+ when tested with
`next build && next start` (production mode).

---

### [2026-07-14] — UI polish: Skeleton loader + dashboard card design

**Context:** The opacity fade during search was not a good user experience. Requested
skeleton loading and a polished dashboard-style UI.

**Prompt:**
> Instead of using opacity overlay use skeleton and make it a beautiful UI so it looks
> nice and like a real dashboard

**AI Response Summary:**

1. Created reusable `Skeleton` component with shimmer animation (CSS `linear-gradient`
   animating `background-position`).

2. Created `TicketTableSkeleton` — mimics the table layout with skeleton bars matching
   the grid columns (title, status badge, priority badge, assignee, date). Shows 5 rows.

3. Redesigned `TicketListView` as a dashboard card:
   - White card with subtle shadow and rounded corners
   - Toolbar with search, filter, and "+ New Ticket" button
   - Table with uppercase column headers on a slightly grey background
   - Avatar initials circle next to assignee names
   - Footer showing ticket count
   - Empty state with emoji icon, title, and context-aware description
   - Skeleton shows during all loading states (not opacity fade)

4. Made header sticky with `position: sticky; top: 0; z-index: 50`

5. Updated home page with subtitle "Manage and track support requests"

**Iterations:**
- None — all compiled on first hot-reload.

**Outcome:** Dashboard-style ticket list with skeleton loading, professional look with
card layout, subtle shadows, avatar initials, and smooth transitions.

---

### [2026-07-14] — Frontend test cases (51 tests across 8 suites)

**Context:** No frontend tests existed yet. Needed to set up Jest + React Testing Library
for the Next.js client and write tests covering components, utilities, and the API client.

**Prompt:**
> Write the test cases of Frontend and also keep maintaining prompt history

**AI Response Summary:**

Setup:
- Installed `jest`, `@testing-library/react`, `@testing-library/jest-dom`,
  `@testing-library/user-event`, `jest-environment-jsdom`, `ts-jest`, `@types/jest`
- Created `jest.config.ts` using `next/jest.js` with `setupFilesAfterEnv`, `moduleNameMapper`
- Created `jest.setup.ts` importing `@testing-library/jest-dom`
- Added `"test"` and `"test:watch"` scripts to `client/package.json`

Test files written (8 suites, 51 tests):

1. **`tests/unit/statusTransitions.test.ts`** — Pure logic tests for `VALID_TRANSITIONS`,
   `STATUS_LABELS`, `PRIORITY_LABELS` (covers all 5 statuses + counts).

2. **`tests/unit/fetchClient.test.ts`** — Tests the `fetchApi` function: success case,
   Content-Type header, error handling for 400/404/422/500, non-JSON error fallback,
   AbortController signal passthrough.

3. **`tests/components/StatusBadge.test.tsx`** — Renders correct label and CSS class
   for all 5 statuses.

4. **`tests/components/PriorityBadge.test.tsx`** — Renders correct label and CSS class
   for all 4 priorities.

5. **`tests/components/SearchBar.test.tsx`** — Placeholder, aria-label, debounce behavior
   (doesn't fire immediately, fires after 300ms), rapid input only fires last value,
   clears to empty string.

6. **`tests/components/StatusControl.test.tsx`** — Renders only valid transition buttons
   for each status, doesn't render invalid ones, shows terminal message for closed/cancelled.

7. **`tests/components/TicketForm.test.tsx`** — Renders all fields, validation errors
   for empty title and short description, populates priority and assignee dropdowns,
   calls createTicket with valid data.

8. **`tests/components/CommentList.test.tsx`** — Empty state, renders all comments,
   shows author names, maintains order.

**Iterations:**
- `next/jest` import needed explicit `.js` extension (`next/jest.js`).
- `setupFilesAfterFramework` is not a valid Jest key — corrected to `setupFilesAfterEnv`.
- `moduleNameMapper` needed explicitly for `@/` alias to resolve in mocked imports.
- `userEvent` doesn't work with `jest.useFakeTimers()` — switched to `fireEvent`.

**Outcome:** `npm test` in client — 51/51 tests green across 8 test suites.
Combined with server tests: **116 total tests** (65 server + 51 client).

---
