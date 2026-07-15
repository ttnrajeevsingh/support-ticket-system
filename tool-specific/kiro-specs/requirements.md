# Requirements — Support Ticket Management System

## Problem Statement

A small internal application for managing support tickets. Internal users create, update,
comment on, search, and progress tickets through a defined lifecycle. The goal is to
demonstrate practical AI-assisted delivery across the full software development lifecycle,
not just code generation.

---

## Clarifications & Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Deployment | Local development, Supabase-hosted DB | No local Postgres needed; Supabase free tier is sufficient |
| State machine enforcement | Hybrid (backend service layer + DB constraints) | Defense-in-depth; catches violations at both layers |
| Frontend scope | Balanced, usable UI from Core | Clean UX is part of Core, not deferred to Stretch |

---

## 1. Functional Requirements

### 1.1 Ticket Management
- FR-01: Users can create a ticket with title, description, priority, and optional assignee.
- FR-02: Users can view a paginated list of all tickets.
- FR-03: Users can open a ticket detail view showing all fields, status history, and comments.
- FR-04: Users can update ticket fields: title, description, priority, and assignee.
- FR-05: Users can change ticket status only through valid state machine transitions.
- FR-06: Invalid status transitions must be rejected by the backend with a descriptive error.

### 1.2 Comments
- FR-07: Users can add a comment to any ticket.
- FR-08: Comments are displayed in chronological order on the ticket detail view.

### 1.3 Search & Filter
- FR-09: Users can search tickets by keyword (matches title and description).
- FR-10: Users can filter tickets by status.

### 1.4 Data Persistence
- FR-11: All ticket, comment, and user data must persist across server restarts.
- FR-12: Database must be initialized via a migration/setup script.
- FR-13: Seed data must be provided for users and sample tickets.

### 1.5 Status State Machine

The following transitions are the ONLY valid ones. All others must be rejected.

```
Open         → In Progress
Open         → Cancelled
In Progress  → Resolved
In Progress  → Cancelled
Resolved     → Closed
```

Invalid transitions must be:
- Rejected at the backend service layer (before DB write)
- Enforced as a DB-level check constraint as a secondary guard
- Surfaced clearly to the user in the UI

---

## 2. Non-Functional Requirements

- NFR-01: **Performance** — List and search endpoints must respond within 500ms for up to 1,000 tickets on a local dev machine.
- NFR-02: **Reliability** — Data must survive application restarts; no in-memory-only state.
- NFR-03: **Security** — No secrets (DB passwords, keys) committed to the repository. Use `.env` with a provided `.env.example`.
- NFR-04: **Maintainability** — Code must be modular (routes → controllers → services → repositories). Each layer has a single responsibility.
- NFR-05: **Readability** — Consistent naming conventions, JSDoc comments on public functions, no dead code.
- NFR-06: **Error handling** — All API errors return a consistent JSON shape: `{ error: string, code: string }`.
- NFR-07: **Validation** — All inputs validated at the API boundary before reaching business logic.
- NFR-08: **Testability** — Business logic in the service layer must be independently testable without a live DB.

---

## 3. API Requirements

Base path: `/api/v1`

### 3.1 Tickets

| Method | Path | Description |
|---|---|---|
| `GET` | `/tickets` | List all tickets. Supports `?search=`, `?status=`, `?priority=`, `?assignedTo=` query params |
| `POST` | `/tickets` | Create a new ticket |
| `GET` | `/tickets/:id` | Get a single ticket with comments |
| `PATCH` | `/tickets/:id` | Update ticket fields (title, description, priority, assignee) |
| `PATCH` | `/tickets/:id/status` | Change ticket status (enforces state machine) |
| `DELETE` | `/tickets/:id` | Delete a ticket (Stretch) |

### 3.2 Comments

| Method | Path | Description |
|---|---|---|
| `POST` | `/tickets/:id/comments` | Add a comment to a ticket |
| `GET` | `/tickets/:id/comments` | List comments for a ticket (also returned in GET /tickets/:id) |

### 3.3 Users

| Method | Path | Description |
|---|---|---|
| `GET` | `/users` | List all users (for assignee dropdown in UI) |

### 3.4 Request/Response Contracts

**POST /tickets — Request body**
```json
{
  "title": "string (required, 3–200 chars)",
  "description": "string (required, min 10 chars)",
  "priority": "low | medium | high | critical",
  "assignedTo": "uuid (optional)"
}
```

**PATCH /tickets/:id/status — Request body**
```json
{
  "status": "open | in_progress | resolved | closed | cancelled",
  "userId": "uuid (who is making the change)"
}
```

**Error Response Shape (all endpoints)**
```json
{
  "error": "Human-readable description",
  "code": "MACHINE_READABLE_CODE"
}
```

**Error codes include:**
- `INVALID_TRANSITION` — status change violates state machine
- `TICKET_NOT_FOUND` — ticket ID does not exist
- `VALIDATION_ERROR` — missing or invalid request fields
- `COMMENT_EMPTY` — comment message is blank

---

## 4. Database Requirements

### 4.1 Technology
- **Database host:** Supabase (hosted PostgreSQL — free tier). No local Postgres installation required.
- **ORM / migrations:** Prisma. Schema is defined in `prisma/schema.prisma`; migrations are managed via `prisma migrate`.
- **Seeding:** Prisma seed script at `prisma/seed.js`, run via `npx prisma db seed`.
- **DB driver:** Prisma Client (replaces raw `node-postgres`).

### 4.2 Supabase Setup Steps

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy the **connection string** from Project Settings → Database → Connection string (URI mode).
3. Add it to your `.env` as `DATABASE_URL`.
4. Run `npx prisma migrate deploy` to apply schema migrations to the Supabase DB.
5. Run `npx prisma db seed` to populate seed data.

### 4.3 Prisma Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  admin
  agent
}

enum Priority {
  low
  medium
  high
  critical
}

enum Status {
  open
  in_progress
  resolved
  closed
  cancelled
}

model User {
  id              String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name            String    @db.VarChar(100)
  email           String    @unique @db.VarChar(255)
  role            Role      @default(agent)
  createdAt       DateTime  @default(now()) @map("created_at")

  createdTickets  Ticket[]  @relation("CreatedBy")
  assignedTickets Ticket[]  @relation("AssignedTo")
  comments        Comment[]

  @@map("users")
}

model Ticket {
  id          String    @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  title       String    @db.VarChar(200)
  description String
  priority    Priority
  status      Status    @default(open)
  assignedTo  String?   @map("assigned_to") @db.Uuid
  createdBy   String    @map("created_by") @db.Uuid
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  creator     User      @relation("CreatedBy", fields: [createdBy], references: [id])
  assignee    User?     @relation("AssignedTo", fields: [assignedTo], references: [id])
  comments    Comment[]

  @@index([status])
  @@index([createdBy])
  @@index([assignedTo])
  @@map("tickets")
}

model Comment {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  ticketId  String   @map("ticket_id") @db.Uuid
  message   String
  createdBy String   @map("created_by") @db.Uuid
  createdAt DateTime @default(now()) @map("created_at")

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  author    User     @relation(fields: [createdBy], references: [id])

  @@index([ticketId])
  @@map("comments")
}
```

### 4.4 Full-Text Search

Prisma does not generate GIN indexes natively. The FTS index is added via a raw SQL migration:

```sql
-- prisma/migrations/XXXXXX_add_fts_index/migration.sql
CREATE INDEX idx_tickets_fts ON tickets
  USING GIN(to_tsvector('english', title || ' ' || description));
```

Search queries use Prisma's `$queryRaw` with `to_tsvector` / `plainto_tsquery` for keyword matching.

### 4.5 State Machine DB Constraint (Secondary Guard)

A CHECK constraint cannot validate transitions (it cannot compare old vs new row values). The backend service layer is the **primary guard**. A PostgreSQL trigger enforcing valid transitions is a **Stretch goal** and would be added via a raw SQL migration.

### 4.6 Seed Data (`prisma/seed.js`)

```js
// Minimum seed content:
// - 3 users: 1 admin, 2 agents
// - 5 tickets spanning all statuses (open, in_progress, resolved, closed, cancelled)
// - 2 comments on different tickets
```

Run with:
```bash
npx prisma db seed
```

`package.json` must include:
```json
"prisma": {
  "seed": "node prisma/seed.js"
}
```

### 4.7 Migration Workflow

```bash
# First-time setup
npx prisma migrate dev --name init       # creates migration + applies to Supabase
npx prisma db seed                        # loads seed data

# After schema changes
npx prisma migrate dev --name <change>   # generates + applies new migration

# CI / reviewer setup
npx prisma migrate deploy                # applies existing migrations (no new ones)
npx prisma db seed
```

---

## 5. Acceptance Criteria

| # | Criterion | How to Verify |
|---|---|---|
| AC-01 | A user can create a ticket via the UI | Submit create form; ticket appears in list |
| AC-02 | A user can view all tickets from the database | List page renders all seeded + created tickets |
| AC-03 | A user can open a ticket detail view | Click ticket; detail page shows all fields and comments |
| AC-04 | A user can update ticket fields and reassign | Edit form saves and reflects changes immediately |
| AC-05 | A user can add comments | Comment form appends to ticket detail without page reload |
| AC-06 | Status changes only through valid transitions | UI prevents invalid options; API rejects invalid PATCH with 422 |
| AC-07 | Keyword search and status filter work | Search returns only matching tickets; filter narrows list correctly |
| AC-08 | Data remains available after restart | Stop and restart server; all tickets and comments still present |
| AC-09 | Backend validation prevents invalid records | POST with missing title returns 400 with `VALIDATION_ERROR` code |
| AC-10 | No secrets committed to repo | `.env` in `.gitignore`; `.env.example` present with `DATABASE_URL=postgresql://...` placeholder |
| AC-11 | State-machine integration tests pass | `npm test` runs and all transition tests green |

---

## 6. Risks and Assumptions

### Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Supabase free tier connection limits cause test failures | Low | Medium | Use a single shared Prisma Client instance; connection pool size capped at 5 |
| Supabase project pauses after inactivity (free tier) | Low | Low | Documented in README; resume via Supabase dashboard before running |
| PostgreSQL state machine cannot be enforced by a simple CHECK constraint | High | Medium | Enforce in service layer as primary guard; DB trigger as secondary (Stretch) |
| Full-text search performance degrades on large datasets | Low | Low | GIN index added via raw SQL migration; acceptable for Core scale |
| No authentication means any user can act as any seeded user | Medium | Low | Acceptable for Core per assignment spec; user is selected via UI dropdown |
| Over-engineering Stretch features detracts from Core quality | Medium | High | Freeze Core first, only add Stretch after AC-01 through AC-11 pass |
| Missing prompt history weakens assessment score | Medium | High | Log every significant AI interaction in `/ai-workflow/prompt-history.md` |

### Assumptions

- A1: No authentication is required for Core; the acting user is passed in the request body or selected from a dropdown.
- A2: "Keyword search" means a case-insensitive match against ticket title and description.
- A3: A Supabase project is used as the PostgreSQL host. The `DATABASE_URL` connection string is provided via `.env`. No local PostgreSQL installation is required.
- A4: The frontend is a React SPA served separately (Vite dev server) calling the Express API.
- A5: Prisma is used as the ORM and migration tool. Raw `node-postgres` (`pg`) is not used directly.
- A6: Timestamps are stored in UTC.
- A7: UUIDs are generated by the database using `gen_random_uuid()` via Prisma's `@default(dbgenerated("gen_random_uuid()"))` directive.

---

## 7. Open Questions

| # | Question | Owner | Priority |
|---|---|---|---|
| OQ-01 | Should the UI support reassigning a ticket while simultaneously changing its status in one action, or are these always separate operations? | Product | Medium |
| OQ-02 | Is a soft-delete (archive) required for tickets, or is hard delete acceptable? | Product | Low |
| OQ-03 | Should comments be editable or deletable, or append-only? | Product | Low |
| OQ-04 | Is pagination required on the ticket list for Core, or is it Stretch? | Product | Medium |
| OQ-05 | Should the keyword search be real-time (debounced input) or triggered on form submit? | UX | Low |
| OQ-06 | Should the DB trigger for state machine enforcement be implemented in Core or Stretch? | Engineering | Medium |

---

## 8. Suggested Architecture

### Overview

```
┌─────────────────────────────────────────┐
│              React SPA (Vite)           │
│  - Ticket List / Search / Filter        │
│  - Ticket Detail (comments, status)     │
│  - Create / Edit Ticket Forms           │
└────────────────┬────────────────────────┘
                 │ HTTP (fetch / axios)
                 ▼
┌─────────────────────────────────────────┐
│         Express API  (:3001)            │
│                                         │
│  routes/        → thin HTTP layer       │
│  controllers/   → req/res handling      │
│  services/      → business logic        │
│    └─ stateMachine.js  ← KEY FILE       │
│  repositories/  → Prisma Client calls   │
│  middleware/    → validation, errors    │
└────────────────┬────────────────────────┘
                 │ Prisma Client
                 ▼
┌─────────────────────────────────────────┐
│        Supabase (hosted PostgreSQL)     │
│  users / tickets / comments             │
│  GIN index for FTS (raw migration)      │
│  Enum constraints via Prisma enums      │
└─────────────────────────────────────────┘
```

### Layer Responsibilities

| Layer | Responsibility |
|---|---|
| `routes/` | Map HTTP verbs + paths to controller functions |
| `controllers/` | Parse request, call service, format response |
| `services/` | Business logic: state machine, validation rules |
| `repositories/` | All Prisma Client calls; returns plain JS objects |
| `middleware/` | Input validation (express-validator), error handler |
| `db/` | Prisma schema, migrations, seed script |

### State Machine Module (Key Design)

```
services/stateMachine.js

VALID_TRANSITIONS = {
  open:        ['in_progress', 'cancelled'],
  in_progress: ['resolved', 'cancelled'],
  resolved:    ['closed'],
  closed:      [],
  cancelled:   []
}

canTransition(from, to) → boolean
assertTransition(from, to) → void | throws InvalidTransitionError
```

### Directory Structure

```
support-ticket-system/
├── client/                   # React SPA (Vite)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── api/              # fetch wrappers per resource
│   └── vite.config.js
│
├── server/                   # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── services/
│   │   │   └── stateMachine.js
│   │   ├── repositories/     # Prisma Client calls
│   │   ├── middleware/
│   │   └── app.js
│   ├── prisma/
│   │   ├── schema.prisma     # Prisma schema (source of truth)
│   │   ├── seed.js           # Seed script (npx prisma db seed)
│   │   └── migrations/       # Auto-generated by prisma migrate dev
│   └── tests/
│       └── integration/
│           └── stateMachine.test.js
│
├── kiro-specs/
│   ├── requirements.md       ← this file
│   ├── design.md
│   └── tasks.md
│
├── ai-workflow/
│   └── prompt-history.md
│
├── .env.example
├── .gitignore
└── README.md
```
