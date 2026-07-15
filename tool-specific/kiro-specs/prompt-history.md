# AI Prompt History — Support Ticket Management System

This file logs every significant AI interaction across the project lifecycle.
Each entry includes context, the prompt, AI response summary, iterations/corrections,
and the final outcome.

---

## Log

### 2025-07-10 10:00 — Initial requirements analysis from assignment brief

**Context:** Starting the project — needed to analyze the assignment brief and produce
structured requirements covering all 8 sections the assessment expects.

**Prompt:**
> Analyze the assignment and generate: 1. Functional requirements, 2. Non-functional
> requirements, 3. API requirements (Node/Express), 4. Database requirements (PostgreSQL),
> 5. Acceptance criteria, 6. Risks and assumptions, 7. Open questions, 8. Suggested architecture

**AI Response Summary:** Generated a comprehensive requirements document with all 8 sections,
including a status state machine definition (Open → In Progress → Resolved → Closed, with
Open/In Progress → Cancelled), PostgreSQL schema with SQL DDL, API endpoint table, 11
acceptance criteria, risk matrix, and a layered architecture diagram.

**AI asked 3 clarifying questions:**
1. Deployment approach? → **User chose: Local development only**
2. State machine enforcement location? → **User chose: Hybrid (service layer + DB constraints)**
3. Frontend priority in Core? → **User chose: Balanced, usable UI from Core**

**Outcome:** `kiro-specs/requirements.md` created — first draft.

---

### 2025-07-10 10:15 — KEY DECISION: Supabase instead of local PostgreSQL

**Context:** Requirements assumed local PostgreSQL installation (A3). User challenged this.

**Prompt:**
> Assumptions - A3 - PostgreSQL is installed locally on the developer's machine.
> Can we not use Supabase or something centralized db instead of local postgresql?

**AI Response Summary:** Recommended Supabase — it's hosted PostgreSQL so all SQL, UUIDs,
GIN indexes, and constraints work identically. Zero code changes needed since `pg` driver
connects the same way. Free tier is more than sufficient.

Trade-offs discussed:
- No local Postgres install required
- `gen_random_uuid()` works natively
- AC-08 (data survives restart) always true with hosted DB
- Reviewer needs network access to verify

**User Decision:** "yes and also include steps like Prisma schema and seed data in Supabase db"

**Outcome:** Requirements updated:
- A3 changed to Supabase hosted PostgreSQL
- A5 changed from raw `node-postgres` to **Prisma ORM**
- Added Supabase setup steps (section 4.2) and migration workflow (section 4.7)
- Added Prisma schema (section 4.3) with enums, models, relations, indexes
- Added two new risk rows for Supabase connection limits and project pausing
- `.env.example` changed to `DATABASE_URL=postgresql://...supabase.co`


---

### 2025-07-10 10:30 — Design document creation

**Context:** Requirements finalized. Needed to translate into concrete technical design.

**Prompt:**
> yes (proceed with design.md)

**AI Response Summary:** Generated `kiro-specs/design.md` covering: system overview diagram,
backend layer responsibilities (routes → controllers → services → repositories), request
lifecycle flow, state machine module with state diagram, custom error classes, validation
strategy, search design using Prisma `$queryRaw` + PostgreSQL FTS, frontend component tree,
status control UI, API client structure, database ERD, Prisma singleton pattern, and test
case matrix.

**Outcome:** `kiro-specs/design.md` created (v1.0).

---

### 2025-07-10 10:45 — KEY DECISION: Tech stack defined by user

**Context:** Original design used React (Vite) + plain JS + custom hooks. User specified
their exact stack.

**Prompt:**
> Update the design to include the below tech stack —
> Frontend: Next.js 15 (App Router), TypeScript, SCSS Modules, Zustand
> Backend: Node.js, Express, TypeScript, Prisma ORM
> Database: PostgreSQL
> Testing: Jest

**AI Response Summary:** Completely rewrote `design.md` (v1.1):
- Next.js 15 App Router with file-based routing and Server/Client Component split
- TypeScript end-to-end with shared `types/ticket.ts`
- Zustand stores replacing custom hooks
- SCSS Modules with co-located `.module.scss` files and CSS custom properties
- `stateMachine.ts` as pure typed `Record<Status, Status[]>`
- `fetchClient.ts` using native `fetch` instead of axios
- `NEXT_PUBLIC_API_URL` env var for client-side config
- Jest + ts-jest for TypeScript test support
- Updated directory structures for both client and server


**Outcome:** `kiro-specs/design.md` updated to v1.1.

---

### 2025-07-10 11:00 — Tasks breakdown created (15 incremental tasks)

**Context:** Converting finalized design into an ordered, test-driven task list.

**Prompt:**
> yes (proceed with tasks.md)

**AI Response Summary:** Generated 15 tasks following TDD/agile best practices. Each task
produces demoable, integrated functionality. Key ordering decisions:
- State machine (pure logic) tested BEFORE any Express code
- Backend complete (Tasks 1-9) before frontend starts
- Integration tests prove the hardest requirement (state machine) early
- Frontend built page-by-page, each wired to live API

**Outcome:** `kiro-specs/tasks.md` created.

---

### 2025-07-10 11:10 — API contract added to design document

**Context:** User noticed the design doc lacked detailed API request/response contracts.

**Prompt:**
> You forgot to add api contract

**AI Response Summary:** Added section 8 (API Contract) to design.md with full
request/response shapes, field rules, HTTP status codes, and a complete error code
reference table for every endpoint.


**Outcome:** `kiro-specs/design.md` updated to v1.2.

---

### 2025-07-10 11:30 — Task 1: Project scaffolding

**Context:** Beginning implementation.

**Prompt:**
> You are senior fullstack dev, now execute the tasks as per tasks.md, start with task1

**AI Response Summary:** Created monorepo structure with `server/` and `client/`:
- Server: Express + TypeScript + Jest + Prisma + nodemon
- Client: Next.js 15 + TypeScript + SCSS + Zustand
- Root `.gitignore`, `.nvmrc` (22), `.env.example`

**Iteration:** `npm install` failed because system Node was v12.22.12 (ancient nvm default).
Resolved by discovering Homebrew had Node 25 and nvm had Node 22.22.3 available.

**Outcome:** Both projects initialised. `GET /health` returns `{"status":"ok"}`.

---

### 2025-07-10 12:00 — Task 2: Database setup — Prisma + Supabase

**Context:** Connecting to user's Supabase project. User provided DATABASE_URL.

**Prompt:**
> Added DATABASE_URL now proceed with init and seed

**AI Response Summary:** Created Prisma schema with enums, models, relations, indexes.
Applied two migrations (schema + GIN FTS index). Created seed script with 3 users,
5 tickets (one per status), 3 comments.

**Iterations (3 rounds of debugging):**
1. Port 5432 on `db.[ref].supabase.co` blocked by network → switched to session-mode pooler
2. Port 6543 (transaction pooler) also blocked → both URLs set to port 5432 on pooler host
3. All working after port adjustment


**Outcome:** Schema migrated, seed complete. Verified: 3 users, 5 tickets, 3 comments.

---

### 2025-07-10 12:30 — Task 3: State machine + 48 unit tests

**Context:** Core business logic — proved correct BEFORE any HTTP layer.

**Prompt:** (Continued from task execution)

**AI Response Summary:** Created `stateMachine.ts` (pure TypeScript, zero dependencies) and
48 Jest test cases covering all valid/invalid transitions, error codes, error messages.

**Outcome:** `npm run test:unit` — 48/48 green. State machine proven correct in isolation.

---

### 2025-07-14 06:00 — Tasks 4–9: Complete backend API

**Context:** Building all Express endpoints in sequence.

**Prompt:**
> proceed with remaining tasks

**AI Response Summary:** Implemented Tasks 4-9 in one session:
- Task 4: Express skeleton + global error handler
- Task 5: Users API (GET /users)
- Task 6: Tickets CRUD (list, get, create, update)
- Task 7: Status change + 17 integration tests
- Task 8: Comments API
- Task 9: Full-text search with GIN index

**Iteration:** TypeScript strict mode complained about `req.params.id` type. Fixed with
explicit `req.params['id'] as string` casts.

**Outcome:** 65/65 tests passing (48 unit + 17 integration). All backend endpoints verified.

---

### 2025-07-14 07:00 — Task 10: Frontend — ticket list, search, Zustand

**Context:** First frontend page with API integration.

**Prompt:**
> go

**AI Response Summary:** Built the complete frontend data layer (API client, Zustand stores,
types) and the ticket list page with search bar and status filter.

**Critical Iteration:** Next.js dev server crashed with `localStorage.getItem is not a
function` errors. Root cause: **Node 25 incompatibility with Next.js 15.3**. Resolved by
running client with Node 22 (`~/.nvm/versions/node/v22.22.3`).


**Outcome:** Client renders at localhost:3000 with live ticket data from the API.

---

### 2025-07-14 08:00 — Tasks 11–14: Create, Detail, Status Control, Comments UI

**Context:** Building remaining frontend pages.

**AI Response Summary:**
- Task 11: Create ticket form with client-side validation + API integration
- Task 12: Ticket detail page with inline edit
- Task 13: StatusControl — renders ONLY valid next-state buttons (Jira-style)
- Task 14: Comment section with chronological list + add form

**Outcome:** All pages compile and render (200 OK). Full UI flow working end-to-end.

---

### 2025-07-14 09:00 — Task 15: Final wiring + README

**Context:** Polish, verification, documentation.

**AI Response Summary:** Audited .gitignore (no secrets), ran full test suite (65/65),
built client (`next build` passes), wrote comprehensive README with setup instructions.

**Iteration:** `/tickets/[id]` returned 500 with stale webpack chunk error. Fixed by
clearing `.next` cache.

**Outcome:** All 11 acceptance criteria verified. README written.

---

### 2025-07-14 09:30 — User question: Why validationResult from express-validator?

**Context:** User asking to understand code they'll need to explain in evaluation.

**Prompt:**
> What does import { validationResult } from 'express-validator'; do? explain

**AI Response Summary:** Explained the 3-step flow: define rules → they run silently and
store failures on request → `validationResult(req)` reads them → act on them (return 400
or proceed). Without it, rules run but nothing acts on failures.


---

### 2025-07-14 09:35 — User question: Why is assignedTo validated as UUID?

**Context:** User questioning a validation rule to understand the reasoning.

**Prompt:**
> why .assignedTo should be uuid?

**AI Response Summary:** Because `assignedTo` is a foreign key to `users.id` which is a
UUID in the database. Without UUID validation, invalid strings would reach Prisma and
produce cryptic database errors. The `.optional({ nullable: true })` allows: no value
(skip), null (unassign), or a valid UUID (must exist).


---

### 2025-07-14 10:00 — Bug fix: Partial search not working

**Context:** Searching "dar" returned nothing — should match "dark mode" ticket.

**Prompt:**
> search is not working properly - i tried with searching dar, it should return ticket
> which includes dark. Also if one search call is in progress and another request came in,
> cancel the first request.

**AI Response Summary:**
1. **Backend fix:** Replaced `plainto_tsquery` with `to_tsquery` + `:*` suffix for prefix
   matching. "dar" → `dar:*` matches "dark", "darling", etc.
2. **Client fix:** Added `AbortController` to `useTicketStore.fetchTickets` — each new call
   aborts the previous in-flight request. AbortErrors silently ignored.

**User follow-up question:** "I can't see any canceled network call, is it because you
added debounce delay of 300?"

**AI Answer:** Yes — debounce prevents rapid API calls (absorbs fast typing), AbortController
is a safety net for the race condition when typing resumes after a pause. Both are
complementary.


---

### 2025-07-14 10:30 — UX fix: Table reload flash on search

**Context:** Searching caused the table to unmount and show "Loading tickets..." text.

**Prompt:**
> on search it reloads the whole table not a good user experience, fix it make it async
> and also lighthouse performance score is 85, it should 95+

**AI Response Summary:**
- Replaced full unmount with skeleton loading (shimmer animation)
- Added `hasLoadedOnce` ref to distinguish initial load from subsequent searches
- Added viewport meta, font smoothing, reactStrictMode for Lighthouse
- Explained dev mode always scores 15-20 points lower than production build

**Iteration:** `next/dynamic` with `ssr: false` and inline JSX `loading` caused a build
error in Next.js 15 App Router. Simplified to `'use client'` page component.

---

### 2025-07-14 11:00 — UI polish: Skeleton loader + dashboard card design

**Context:** User wanted a professional-looking dashboard, not just functional.

**Prompt:**
> Instead of using opacity overlay use skeleton and make it a beautiful UI so it looks
> nice and like a real dashboard

**AI Response Summary:** Created reusable `Skeleton` component with CSS shimmer animation,
`TicketTableSkeleton` matching the table grid layout, redesigned `TicketListView` as a
dashboard card with shadows, sticky header, avatar initials, footer count, and empty state.

---

### 2025-07-14 11:30 — Frontend test cases (51 tests, 8 suites)

**Context:** No frontend tests existed yet.

**Prompt:**
> Write the test cases of Frontend and also keep maintaining prompt history

**AI Response Summary:** Set up Jest + React Testing Library. Wrote 8 test suites:
1. statusTransitions (9 tests) — transition map logic
2. fetchClient (7 tests) — API success/error/abort handling
3. StatusBadge (6 tests) — renders all statuses
4. PriorityBadge (5 tests) — renders all priorities
5. SearchBar (5 tests) — debounce, accessibility
6. StatusControl (8 tests) — only valid buttons, terminal states
7. TicketForm (6 tests) — fields, validation, API call
8. CommentList (4 tests) — empty state, rendering, order

**Iterations:** `next/jest` needed `.js` extension, `setupFilesAfterFramework` is not valid
(correct key: `setupFilesAfterEnv`), `userEvent` incompatible with fake timers (used
`fireEvent` instead).

**Outcome:** 51/51 client tests green. Total project: 116 tests.

---

### 2025-07-14 12:00 — Husky pre-commit hooks

**Context:** Needed automated quality gates before every commit.

**Prompt:**
> Now use husky and add pre commit hooks — include type checking, test cases pass and
> successful build for frontend, and for backend use type checking and test cases

**AI Response Summary:** Initialized git repo, installed Husky, created `.husky/pre-commit`
running 5 checks: server typecheck → server unit tests → client typecheck → client tests →
client build. Each step blocks commit on failure.

**Outcome:** First commit with hooks passed all gates. Future broken commits are blocked.

---

### 2025-07-14 12:30 — User question: Why inline import in app.ts?

**Prompt:**
> why import at line 21 import { router as apiRouter } from './routes'; in app.ts

**AI Response Summary:** The placement was intended to ensure dotenv runs first, but
TypeScript hoists all imports regardless — it's misleading. Moved to top.


---

### 2025-07-14 12:35 — User question: Why emoji in empty state?

**Prompt:**
> If there is no ticket in table, there is an emptyIcon div  which has an icon/emoji, why did you use this?

**AI Response Summary:** Emoji rendering is unreliable cross-platform. Removed it — clean
text-only empty state is better.

---

### 2025-07-14 13:00 — Codebase cleanup audit

**Prompt:**
> Recheck the code base and remove any unused, false branding, hardcoded copyright values
> etc, code base should be clean and fresh

**AI Response Summary:** Removed `/api/v1/ping` placeholder route, deleted duplicate
`tests/setup.ts`, removed committed `tsconfig.tsbuildinfo`, added `*.tsbuildinfo` to
`.gitignore`. Confirmed: no copyright text, no TODOs, no dead exports, no secrets.

---

### 2025-07-14 13:30 — Rate limiting added

**Prompt:**
> There is no rate limiting

**AI Response Summary:** Added `express-rate-limit` with two tiers:
- `apiLimiter`: 100 req/min for all API routes
- `writeLimiter`: 30 req/min for POST/PATCH mutations

Returns `429` with `{ error: "Too many requests...", code: "RATE_LIMITED" }`.
Includes `RateLimit-*` standard headers.

---

### 2025-07-15 05:00 — Pagination (server + client)

**Prompt:**
> In tickets table, it should have pagination and also backend APIs should support it.
> Make it in both client and server side to adopt pagination.

**AI Response Summary:**
- Server: Added `page`/`limit` to filters, `PaginatedResponse<T>` type, `LIMIT/OFFSET` in
  raw SQL, `skip/take` in Prisma, parallel `COUNT(*)` query
- Client: `Pagination` component (Prev/Next + page info), store tracks pagination state,
  page resets on search/filter change, `PAGE_SIZE = 10`

**Outcome:** API returns `{ data: [...], pagination: { page, limit, total, totalPages } }`.

---

### 2025-07-15 05:30 — Fix: DATABASE_ERROR on pagination + improve error messages

**Prompt:**
> api/v1/tickets?page=1&limit=10 gives 400 DATABASE_ERROR. Also maintain readable message
> not database error.

**AI Response Summary:** The error was transient (hot-reload). Rewrote `errorHandler.ts`
with contextual messages: extracts field names from Prisma meta, includes dev-only
diagnostic details, production messages are user-friendly without leaking internals.

---

### 2025-07-15 06:00 — Entire row clickable, Jira-style UX

**Prompt:**
> In ticket table make entire row clickable and user friendly UX like Jira

**AI Response Summary:** Made `<tr>` clickable with `onClick` → `router.push`, blue left
border accent on hover, keyboard accessible (Enter/Space), short ticket ID shown below
title in monospace (#d43af5f7), active state on click.

---

### 2025-07-15 06:30 — Multiple filters (priority + assignee)

**Prompt:**
> apply multiple filters like assignee, priority

**AI Response Summary:** Created `PriorityFilter` and `AssigneeFilter` dropdown components,
wired into toolbar. All 4 filters combine in the API query. Page resets on any filter change.
Backend already supported these — no server changes needed.

---

### 2025-07-15 07:00 — Fix: Single-character search returning empty

**Prompt:**
> api/v1/tickets?search=t&priority=medium&page=1&limit=10 responds with blank array but
> search=test works

**AI Response Summary:** PostgreSQL English stemmer drops single characters as stop words.
Fixed with dual strategy: 1-2 chars use `ILIKE` fallback, 3+ chars use FTS with `:*` prefix.


---

## Summary Statistics

- **Total prompts in session:** ~35
- **Key user decisions:** 5 (Supabase, Prisma, tech stack, prefix search, pagination)
- **Bug fixes requiring debugging:** 6 (Node version, Supabase ports, TS strict types,
  Next.js cache, FTS stop words, short search terms)
- **User questions answered:** 4 (validationResult, UUID validation, debounce vs abort,
  inline import)
- **Code review corrections from user:** 3 (missing API contract, emoji removal, unused code)
- **Total tests:** 116 (65 server + 51 client)
- **Pre-commit quality gates:** 5 (2 typechecks + 2 test runs + 1 build)

### 2025-07-15 07:30 — Final checkout and verification

**Context:** All features implemented. Needed a final end-to-end verification of the entire
system before submission.

**Prompt:**
> do this again as final checkout — Final wiring + README and make sure everything working
> as expected

**AI Response Summary:** Ran a systematic 12-step checkout process:

1. **Server typecheck** (`tsc --noEmit`) — passed, no type errors
2. **Server tests** — 65/65 passing (48 unit + 17 integration)
3. **Client typecheck** (`tsc --noEmit`) — passed, no type errors
4. **Client tests** — 51/51 passing across 8 suites
5. **Client production build** (`next build`) — all routes compile:
   - `/` (static) — 4.44 kB
   - `/tickets/new` (static) — 2.63 kB
   - `/tickets/[id]` (dynamic) — 4.78 kB
6. **API endpoint verification** — tested each endpoint:
   - `GET /health` → `{"status":"ok"}`
   - `GET /api/v1/users` → 3 users
   - `GET /api/v1/tickets?page=1&limit=5` → 5 items, total 12, 3 pages
   - `GET /api/v1/tickets?search=dark` → 1 result (FTS prefix match)
   - `GET /api/v1/tickets?search=t&priority=medium` → 8 results (ILIKE fallback)
   - `POST /tickets` (missing title) → 400 `VALIDATION_ERROR`
   - `GET /tickets/unknown-id` → 404 `TICKET_NOT_FOUND`
   - `PATCH /tickets/:id/status` (invalid: in_progress → open) → 422 `INVALID_TRANSITION`
   - `PATCH /tickets/:id/status` (valid: in_progress → resolved) → 200 + updated ticket
   - `GET /tickets/:id/comments` → 2 comments
   - `GET /api/v1/nonexistent` → 404 `NOT_FOUND`
7. **Client pages** — all returned 200:
   - `/` — ticket list with search, filters, pagination
   - `/tickets/new` — create form
   - `/tickets/[id]` — detail with edit, status control, comments
8. **Secrets audit** — only `.example` files tracked in git, no real credentials
9. **.env.example** — confirmed placeholder values only
10. **README updated** — added pagination query params, rate limiting docs, full test count (116), dual-strategy search explanation
11. **Stale cache fix** — `.next` cache from prior sessions caused MODULE_NOT_FOUND 500 on detail page. Cleared with `rm -rf .next` and restarted dev server — all pages then returned 200.
12. **Git status** — 27 modified/new files ready to commit

**Iteration:** Detail page (`/tickets/[id]`) initially returned 500 due to stale webpack
chunks in `.next` cache from previous file changes. Fixed by clearing the cache directory
and restarting the Next.js dev server. This is a development-only issue (doesn't affect
production builds or fresh clones).

**Outcome:** All systems verified green:
- 116 tests passing (65 server + 51 client)
- All API endpoints return correct responses and error codes
- All client pages render without errors
- No secrets in repository
- README reflects the final feature set
- Project ready for submission

