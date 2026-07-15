# AI Prompts — Implementation

## Prompt 1: Start execution

**Prompt:** You are senior fullstack dev, now execute the tasks as per tasks.md, start with task1 and so on.

**AI Response:** Created project scaffolding (package.json, tsconfig, jest config, app.ts, server.ts) for both server and client.

**What I accepted:** All generated files.
**What I changed:** Nothing at this stage.

---

## Prompt 2: Database setup

**Prompt:** Added DATABASE_URL now proceed with init and seed

**AI Response:** Wrote Prisma schema, ran migrations, created seed script with 3 users + 5 tickets + 3 comments.

**What I accepted:** Schema, seed data, migration workflow.
**What I changed:** Connection URLs — had to debug port blocking (see debugging.md).

---

## Prompt 3: Backend API

**Prompt:** proceed with remaining tasks

**AI Response:** Implemented Tasks 4-9 in one session: Express skeleton, users API, tickets CRUD, status change with tests, comments, search.

**What I accepted:** All endpoint implementations.
**What I changed:** `req.params.id` to `req.params['id'] as string` (TypeScript strict mode fix).

---

## Prompt 4: Frontend

**Prompt:** go

**AI Response:** Built ticket list page with Zustand stores, API client, search, status filter, all wired to live backend.

**What I accepted:** Component structure, Zustand pattern, API client design.
**What I changed:** Had to use Node 22 instead of 25 (incompatibility discovered during this step).

---

## Prompt 5: Pagination

**Prompt:** In tickets table, it should have pagination and also backend APIs should support it.

**AI Response:** Added PaginatedResponse type, LIMIT/OFFSET + COUNT in repository, page/limit query params, Pagination component.

**What I accepted:** Full implementation.
**What I changed:** Nothing — worked on first run.

---

## Prompt 6: Multiple filters

**Prompt:** apply multiple filters like assignee, priority

**AI Response:** Created PriorityFilter and AssigneeFilter dropdowns, wired into toolbar and API calls.

**What I accepted:** Both components.
**What I changed:** Nothing — backend already supported these params.
