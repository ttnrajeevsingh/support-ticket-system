# Design — Support Ticket Management System

> Status: Final — v1.2
> Derived from: `kiro-specs/requirements.md`
> Updated: Tech stack revised to Next.js 15, TypeScript, SCSS Modules, Zustand (frontend) and Node.js, Express, TypeScript, Prisma (backend). Added full API contract (section 8).

---

## 0. Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | Next.js 15 (App Router) |
| Frontend language | TypeScript |
| Frontend styling | SCSS Modules |
| Frontend state | Zustand |
| Backend runtime | Node.js |
| Backend framework | Express |
| Backend language | TypeScript |
| ORM | Prisma |
| Database | PostgreSQL via Supabase (hosted, free tier) |
| Testing | Jest + supertest |

---

## 1. System Overview

Two independently running processes:

- **Client** — Next.js 15 App Router, port 3000
- **Server** — Node.js + Express REST API, port 3001
- **Database** — Supabase (hosted PostgreSQL), accessed via Prisma Client

The Next.js client communicates with the Express server exclusively over HTTP.
Next.js is used purely as a frontend framework — no API routes, no server actions.
All business logic, validation, and data access lives in the Express server.

```
┌─────────────────────────────────────────┐
│        Next.js 15 App Router  (:3000)   │
│                                         │
│  app/              → file-based routes  │
│  components/       → reusable UI        │
│  store/            → Zustand stores     │
│  lib/api/          → fetch wrappers     │
│  styles/           → SCSS Modules       │
└────────────────┬────────────────────────┘
                 │ HTTP JSON  (fetch / axios)
                 ▼
┌─────────────────────────────────────────┐
│         Express API  (:3001)            │
│                                         │
│  routes/        → URL → controller map  │
│  controllers/   → req/res handling      │
│  services/      → business logic        │
│    └─ stateMachine.ts                   │
│  repositories/  → Prisma Client calls   │
│  middleware/    → validation + errors   │
└────────────────┬────────────────────────┘
                 │ Prisma Client
                 ▼
┌─────────────────────────────────────────┐
│        Supabase (hosted PostgreSQL)     │
│  tables: users, tickets, comments       │
│  enums:  Role, Priority, Status         │
│  index:  GIN for full-text search       │
└─────────────────────────────────────────┘
```

---

## 2. Backend Design

### 2.1 Layer Responsibilities

| Layer | Files | Responsibility |
|---|---|---|
| Routes | `src/routes/*.ts` | Map HTTP verbs + paths to controller functions. No logic. |
| Controllers | `src/controllers/*.ts` | Parse `req`, call service/repository, send `res`. No SQL, no business rules. |
| Services | `src/services/*.ts` | Business logic only — state machine, orchestration. No HTTP, no SQL. |
| Repositories | `src/repositories/*.ts` | All Prisma Client calls. Returns typed plain objects. No business logic. |
| Middleware | `src/middleware/*.ts` | Input validation (express-validator), global error handler, 404 handler. |
| Errors | `src/errors/*.ts` | Custom typed error classes. |
| Prisma | `prisma/schema.prisma` | Schema source of truth. Migrations auto-generated. |
| Types | `src/types/*.ts` | Shared TypeScript interfaces and types. |

### 2.2 TypeScript Types

Shared types are defined in `src/types/` and imported across all layers.

```ts
// src/types/ticket.ts
export type Priority = 'low' | 'medium' | 'high' | 'critical';
export type Status   = 'open' | 'in_progress' | 'resolved' | 'closed' | 'cancelled';
export type Role     = 'admin' | 'agent';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  assignedTo: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  creator?: User;
  assignee?: User | null;
  comments?: Comment[];
}

export interface Comment {
  id: string;
  ticketId: string;
  message: string;
  createdBy: string;
  createdAt: string;
  author?: User;
}

export interface ApiError {
  error: string;
  code: string;
}
```

### 2.3 Request Lifecycle

```
HTTP Request
    │
    ▼
Router          (match method + path)
    │
    ▼
Validation MW   (express-validator — reject bad input, return 400)
    │
    ▼
Controller      (extract typed params, call service or repository)
    │
    ▼
Service         (business rules — assertTransition, throw on invalid)
    │
    ▼
Repository      (Prisma query — returns typed data)
    │
    ▼
Controller      (format response, set status code)
    │
    ▼
HTTP Response
    │
    (on any throw)
    ▼
Error Handler MW  (map error type → HTTP status + { error, code } JSON)
```

### 2.4 State Machine Design

Lives in `src/services/stateMachine.ts`. Pure TypeScript — no Express, no Prisma.
This makes it independently testable with Jest without any server setup.

```ts
// src/services/stateMachine.ts

import { Status } from '../types/ticket';

const VALID_TRANSITIONS: Record<Status, Status[]> = {
  open:        ['in_progress', 'cancelled'],
  in_progress: ['resolved',    'cancelled'],
  resolved:    ['closed'],
  closed:      [],
  cancelled:   [],
};

export function canTransition(from: Status, to: Status): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function assertTransition(from: Status, to: Status): void {
  if (!canTransition(from, to)) {
    throw new InvalidTransitionError(from, to);
  }
}
```

**State diagram:**

```
         ┌─────────────┐
         │    open     │──────────────────────────┐
         └──────┬──────┘                          │
                │                                 │
         [→ in_progress]                    [→ cancelled]
                │                                 │
         ┌──────▼──────┐                          │
         │ in_progress │──────────────────────────┤
         └──────┬──────┘                          │
                │                                 │
          [→ resolved]                      [→ cancelled]
                │                                 │
         ┌──────▼──────┐                   ┌──────▼──────┐
         │  resolved   │──[→ closed]───────│  cancelled  │
         └─────────────┘                   └─────────────┘
                │
         ┌──────▼──────┐
         │   closed    │  (terminal — no outgoing transitions)
         └─────────────┘
```

### 2.5 Error Handling Design

All errors flow through a single typed Express error handler registered last in `app.ts`.

| Error Type | HTTP Status | `code` |
|---|---|---|
| `InvalidTransitionError` | 422 | `INVALID_TRANSITION` |
| `NotFoundError` | 404 | `TICKET_NOT_FOUND` / `USER_NOT_FOUND` |
| `ValidationError` (express-validator) | 400 | `VALIDATION_ERROR` |
| `PrismaClientKnownRequestError` P2025 | 404 | `NOT_FOUND` |
| `PrismaClientKnownRequestError` P2002 | 409 | `CONFLICT` |
| Unhandled / unknown | 500 | `INTERNAL_ERROR` |

```ts
// src/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public readonly message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) { super(message); }
}

// src/errors/InvalidTransitionError.ts
export class InvalidTransitionError extends AppError {
  constructor(from: string, to: string) {
    super(`Cannot transition from '${from}' to '${to}'`, 'INVALID_TRANSITION', 422);
  }
}

// src/errors/NotFoundError.ts
export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, `${resource.toUpperCase()}_NOT_FOUND`, 404);
  }
}
```

### 2.6 Validation Design

Validation uses `express-validator`. Rules are defined in middleware files per route group.

**Ticket creation rules:**
- `title`: required, string, 3–200 chars
- `description`: required, string, min 10 chars
- `priority`: required, one of `low | medium | high | critical`
- `assignedTo`: optional, valid UUID
- `createdBy`: required, valid UUID

**Status change rules:**
- `status`: required, one of the five valid statuses
- `userId`: required, valid UUID
- Business rule (service layer): `assertTransition(current, requested)`

**Comment creation rules:**
- `message`: required, string, min 1 char (trimmed)
- `createdBy`: required, valid UUID

### 2.7 Search Design

Keyword search uses PostgreSQL full-text search via `$queryRaw`:

```ts
// repositories/ticketRepository.ts
import { Prisma } from '@prisma/client';

async function searchTickets({ search, status, priority, assignedTo }: SearchParams) {
  if (search) {
    return prisma.$queryRaw<Ticket[]>`
      SELECT t.*, row_to_json(u.*) AS creator, row_to_json(a.*) AS assignee
      FROM tickets t
      LEFT JOIN users u ON u.id = t.created_by
      LEFT JOIN users a ON a.id = t.assigned_to
      WHERE to_tsvector('english', t.title || ' ' || t.description)
            @@ plainto_tsquery('english', ${search})
      ${status ? Prisma.sql`AND t.status = ${status}::"Status"` : Prisma.empty}
      ORDER BY t.created_at DESC
    `;
  }
  return prisma.ticket.findMany({
    where: {
      ...(status     && { status }),
      ...(priority   && { priority }),
      ...(assignedTo && { assignedTo }),
    },
    include: { creator: true, assignee: true },
    orderBy: { createdAt: 'desc' },
  });
}
```

### 2.8 Directory Structure — Server

```
server/
├── src/
│   ├── app.ts                      # Express app setup (no listen)
│   ├── server.ts                   # Entry point (app.listen)
│   ├── types/
│   │   └── ticket.ts               # Shared TS interfaces
│   ├── routes/
│   │   ├── ticketRoutes.ts
│   │   ├── commentRoutes.ts
│   │   └── userRoutes.ts
│   ├── controllers/
│   │   ├── ticketController.ts
│   │   ├── commentController.ts
│   │   └── userController.ts
│   ├── services/
│   │   ├── ticketService.ts
│   │   └── stateMachine.ts         ← pure typed logic, no deps
│   ├── repositories/
│   │   ├── ticketRepository.ts
│   │   ├── commentRepository.ts
│   │   └── userRepository.ts
│   ├── middleware/
│   │   ├── validate.ts             # express-validator result checker
│   │   ├── ticketValidation.ts
│   │   ├── commentValidation.ts
│   │   └── errorHandler.ts         # global typed error handler
│   ├── errors/
│   │   ├── AppError.ts
│   │   ├── InvalidTransitionError.ts
│   │   └── NotFoundError.ts
│   └── lib/
│       └── prisma.ts               # Prisma Client singleton
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── tests/
│   ├── unit/
│   │   └── stateMachine.test.ts    # pure unit — no DB
│   └── integration/
│       └── tickets.test.ts         # supertest — state machine + API
├── jest.config.ts
├── tsconfig.json
├── .env
├── .env.example
└── package.json
```

---

## 3. Frontend Design

### 3.1 Routing — Next.js 15 App Router

File-system based routing. All pages are React Server Components by default;
interactive components (forms, status controls, Zustand consumers) are Client Components
marked with `'use client'`.

| Route | File | Description |
|---|---|---|
| `/` | `app/page.tsx` | Ticket list with search bar and status filter |
| `/tickets/new` | `app/tickets/new/page.tsx` | Create ticket form |
| `/tickets/[id]` | `app/tickets/[id]/page.tsx` | Ticket detail: fields, status, comments |

### 3.2 Component Tree

```
app/layout.tsx          (root layout — Header, global SCSS)
│
├── app/page.tsx                       (Server Component — fetches initial ticket list)
│   └── TicketListView                 ('use client' — search, filter, list)
│       ├── SearchBar.tsx
│       ├── StatusFilter.tsx
│       ├── TicketTable.tsx
│       │   └── TicketRow.tsx          (priority badge, status badge, assignee)
│       └── CreateTicketButton.tsx
│
├── app/tickets/new/page.tsx           (Server Component — shell)
│   └── TicketForm.tsx                 ('use client' — controlled form)
│       ├── AssigneeSelect.tsx         (fetches /api/v1/users)
│       └── PrioritySelect.tsx
│
└── app/tickets/[id]/page.tsx          (Server Component — fetches ticket by id)
    └── TicketDetailView               ('use client' — all interactive parts)
        ├── TicketHeader.tsx
        ├── TicketFields.tsx           (inline edit)
        ├── StatusControl.tsx          (only valid next states shown)
        │   └── StatusBadge.tsx
        └── CommentSection.tsx
            ├── CommentList.tsx
            │   └── CommentItem.tsx
            └── CommentForm.tsx
```

### 3.3 State Management — Zustand

Zustand replaces custom hooks as the state layer. Two stores cover all client state:

**`useTicketStore`** — ticket list + active ticket:

```ts
// store/useTicketStore.ts
import { create } from 'zustand';
import { Ticket, Status } from '@/types/ticket';
import * as ticketsApi from '@/lib/api/ticketsApi';

interface TicketStore {
  tickets: Ticket[];
  activeTicket: Ticket | null;
  loading: boolean;
  error: string | null;

  fetchTickets: (params?: { search?: string; status?: Status }) => Promise<void>;
  fetchTicket: (id: string) => Promise<void>;
  createTicket: (data: CreateTicketInput) => Promise<void>;
  updateTicket: (id: string, data: UpdateTicketInput) => Promise<void>;
  changeStatus: (id: string, status: Status, userId: string) => Promise<void>;
}

export const useTicketStore = create<TicketStore>((set) => ({ ... }));
```

**`useCommentStore`** — comments for the active ticket:

```ts
// store/useCommentStore.ts
interface CommentStore {
  comments: Comment[];
  loading: boolean;
  fetchComments: (ticketId: string) => Promise<void>;
  addComment: (ticketId: string, message: string, createdBy: string) => Promise<void>;
}
```

**`useUserStore`** — seeded user list for assignee dropdowns (fetched once):

```ts
// store/useUserStore.ts
interface UserStore {
  users: User[];
  fetchUsers: () => Promise<void>;
}
```

Zustand stores call the API layer directly. Components subscribe to only the slices they need,
preventing unnecessary re-renders.

### 3.4 SCSS Modules

Each component has a co-located `.module.scss` file. No global utility classes.
A single `styles/globals.scss` defines CSS variables (colours, spacing, typography).

```
components/tickets/StatusBadge.tsx
components/tickets/StatusBadge.module.scss   ← co-located styles

styles/
  globals.scss        # CSS custom properties: --color-open, --color-resolved, etc.
  _variables.scss     # SCSS variables imported by modules that need them
```

Status badge colours are driven by CSS custom properties:

```scss
// StatusBadge.module.scss
.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;

  &.open        { background-color: var(--color-open-bg);        color: var(--color-open-text); }
  &.in_progress { background-color: var(--color-progress-bg);    color: var(--color-progress-text); }
  &.resolved    { background-color: var(--color-resolved-bg);    color: var(--color-resolved-text); }
  &.closed      { background-color: var(--color-closed-bg);      color: var(--color-closed-text); }
  &.cancelled   { background-color: var(--color-cancelled-bg);   color: var(--color-cancelled-text); }
}
```

### 3.5 Status Control UI Design

The `StatusControl` component only renders buttons for valid next states.
The client-side transition map in `lib/statusTransitions.ts` mirrors `VALID_TRANSITIONS`
from the server — used only for rendering, never for enforcement.

```
Current status: in_progress

  [ Mark Resolved ]   [ Cancel Ticket ]

  (only resolved and cancelled are valid next states for in_progress)
```

On API error (422 `INVALID_TRANSITION`), an inline error banner appears and the store
re-fetches the ticket to sync current state.

### 3.6 Error Display

| Scenario | UI behaviour |
|---|---|
| Form validation failure (400) | Field-level inline error below each input |
| Invalid transition (422) | Inline error banner on `StatusControl`, auto-dismiss 5s |
| Ticket not found (404) | Next.js `not-found.tsx` — "Ticket not found" with back link |
| Network / server error (500) | Toast notification via Zustand `useUiStore` |
| Empty search results | Inline: "No tickets match your search." |

### 3.7 API Client Design

All HTTP calls are in `lib/api/`. Each file exports typed async functions.
A shared `fetchClient.ts` wraps `fetch` with base URL, JSON headers,
and error normalisation into `ApiError`.

```
client/src/lib/api/
  fetchClient.ts      # base fetch wrapper — normalises errors to ApiError
  ticketsApi.ts       # getTickets, getTicket, createTicket, updateTicket, changeStatus
  commentsApi.ts      # addComment, getComments
  usersApi.ts         # getUsers
```

### 3.8 Directory Structure — Client

```
client/
├── app/
│   ├── layout.tsx                    # Root layout — Header, global styles
│   ├── page.tsx                      # /  → Ticket list
│   ├── tickets/
│   │   ├── new/
│   │   │   └── page.tsx              # /tickets/new
│   │   └── [id]/
│   │       ├── page.tsx              # /tickets/:id
│   │       └── not-found.tsx         # 404 within ticket routes
│   └── globals.scss                  # global CSS (imports _variables.scss)
├── components/
│   ├── layout/
│   │   └── Header.tsx
│   ├── tickets/
│   │   ├── TicketListView.tsx        # 'use client'
│   │   ├── TicketDetailView.tsx      # 'use client'
│   │   ├── TicketForm.tsx            # 'use client'
│   │   ├── TicketTable.tsx
│   │   ├── TicketRow.tsx
│   │   ├── TicketRow.module.scss
│   │   ├── StatusControl.tsx         # 'use client'
│   │   ├── StatusControl.module.scss
│   │   ├── StatusBadge.tsx
│   │   └── StatusBadge.module.scss
│   ├── comments/
│   │   ├── CommentSection.tsx        # 'use client'
│   │   ├── CommentList.tsx
│   │   ├── CommentItem.tsx
│   │   ├── CommentItem.module.scss
│   │   └── CommentForm.tsx
│   └── ui/
│       ├── SearchBar.tsx
│       ├── StatusFilter.tsx
│       ├── ErrorBanner.tsx
│       ├── ErrorBanner.module.scss
│       └── LoadingSpinner.tsx
├── store/
│   ├── useTicketStore.ts
│   ├── useCommentStore.ts
│   └── useUserStore.ts
├── lib/
│   ├── api/
│   │   ├── fetchClient.ts
│   │   ├── ticketsApi.ts
│   │   ├── commentsApi.ts
│   │   └── usersApi.ts
│   └── statusTransitions.ts          # client-side transition map (render only)
├── types/
│   └── ticket.ts                     # shared TS types (mirrors server types)
├── styles/
│   └── _variables.scss
├── next.config.ts
└── tsconfig.json
```

> Note: `lib/statusTransitions.ts` mirrors the server's `VALID_TRANSITIONS` for UI rendering only.
> The Express server remains the sole enforcement point.

---

## 4. Database Design

### 4.1 Entity Relationship Diagram

```
┌──────────────┐        ┌───────────────────────┐        ┌──────────────┐
│    users     │        │        tickets         │        │   comments   │
│──────────────│        │───────────────────────│        │──────────────│
│ id (PK)      │◄───────│ created_by (FK)        │        │ id (PK)      │
│ name         │        │ id (PK)                │◄───────│ ticket_id(FK)│
│ email        │◄───────│ assigned_to (FK, null) │        │ message      │
│ role         │        │ title                  │        │ created_by   │◄──┐
│ created_at   │        │ description            │        │ created_at   │   │
└──────────────┘        │ priority (enum)        │        └──────────────┘   │
                        │ status (enum)          │                           │
                        │ created_at             │        users.id ──────────┘
                        │ updated_at             │
                        └───────────────────────┘
```

### 4.2 Key Design Decisions

- **Prisma enums for `Priority` and `Status`**: enforced at DB level; invalid values never reach the DB.
- **`@updatedAt` on Ticket**: Prisma sets this automatically on every `ticket.update()`.
- **Cascade delete on comments**: deleting a ticket removes all its comments automatically.
- **`assigned_to` nullable**: tickets can exist unassigned.
- **No `updated_at` on comments**: append-only in Core.

### 4.3 Prisma Client Singleton

```ts
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

Shared across all repositories to avoid connection pool exhaustion on Supabase free tier.

---

## 5. Testing Design

### 5.1 Framework

Jest with `ts-jest` for TypeScript support on both server and client.
`supertest` for Express integration tests.

```json
// jest.config.ts (server)
{
  "preset": "ts-jest",
  "testEnvironment": "node",
  "roots": ["<rootDir>/tests"]
}
```

### 5.2 Mandatory — State Machine Tests

**Unit tests** (`tests/unit/stateMachine.test.ts`) — pure functions, no DB:

```ts
describe('canTransition', () => {
  it('open → in_progress returns true');
  it('open → closed returns false');
  it('cancelled → any returns false');
});

describe('assertTransition', () => {
  it('throws InvalidTransitionError for invalid transition');
  it('does not throw for valid transition');
});
```

**Integration tests** (`tests/integration/tickets.test.ts`) — supertest against Express app:

```
Valid transitions (expect 200):
  ✓ open        → in_progress
  ✓ open        → cancelled
  ✓ in_progress → resolved
  ✓ in_progress → cancelled
  ✓ resolved    → closed

Invalid transitions (expect 422 + code: INVALID_TRANSITION):
  ✗ open        → resolved
  ✗ open        → closed
  ✗ in_progress → open
  ✗ in_progress → closed
  ✗ resolved    → open
  ✗ resolved    → in_progress
  ✗ resolved    → cancelled
  ✗ closed      → any
  ✗ cancelled   → any
```

### 5.3 Test Structure

```
server/tests/
├── unit/
│   └── stateMachine.test.ts     # pure — no DB, no supertest
└── integration/
    └── tickets.test.ts          # supertest — hits Express routes
```

---

## 6. Environment Configuration

### `.env.example`

```
# Supabase PostgreSQL connection string
# Get from: Supabase dashboard → Project Settings → Database → URI
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Express server port
PORT=3001

# Next.js client origin (for CORS on the Express server)
CLIENT_ORIGIN=http://localhost:3000

# Exposed to Next.js browser bundle — points to Express API
NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1

# Node environment
NODE_ENV=development
```

### CORS

```ts
// server/src/app.ts
import cors from 'cors';
app.use(cors({ origin: process.env.CLIENT_ORIGIN }));
```

### Next.js API base URL

```ts
// client/lib/api/fetchClient.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;
```

---

## 7. Key Design Decisions & Rationale

| Decision | Rationale |
|---|---|
| Next.js App Router (no API routes / server actions) | Keeps frontend and backend fully decoupled; Express owns all API logic |
| TypeScript end-to-end | Shared type definitions catch contract mismatches between client and server at compile time |
| Zustand over React Query / SWR | Lightweight, no boilerplate, fits the mutation + re-fetch pattern used here |
| SCSS Modules over Tailwind | Scoped styles, no class name pollution, natural fit for component-level design tokens |
| State machine in its own module (`stateMachine.ts`) | Pure, no framework deps, trivially unit-testable with Jest |
| Custom typed error classes | Single error handler maps cleanly; TypeScript ensures all error shapes are handled |
| Repositories return plain objects | Services and controllers never import Prisma types; easier to test and swap |
| Client-side `statusTransitions.ts` mirrors server | Only valid buttons rendered; server remains authoritative enforcement point |
| Prisma singleton | Prevents connection pool exhaustion on Supabase free tier |
| `NEXT_PUBLIC_API_URL` env var | Allows changing the API base URL without code changes |

---

## 8. API Contract

Base URL: `http://localhost:3001/api/v1`

All requests and responses use `Content-Type: application/json`.
All error responses follow the shape: `{ "error": string, "code": string }`.

---

### 8.1 Users

#### GET /users

Returns all seeded users. Used to populate the assignee dropdown.

**Response 200**
```json
[
  {
    "id": "uuid",
    "name": "Alice Admin",
    "email": "alice@example.com",
    "role": "admin",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  {
    "id": "uuid",
    "name": "Bob Agent",
    "email": "bob@example.com",
    "role": "agent",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
]
```

---

### 8.2 Tickets

#### GET /tickets

Returns a list of tickets. Supports optional query parameters for search and filtering.

**Query parameters**

| Param | Type | Required | Description |
|---|---|---|---|
| `search` | `string` | No | Keyword search against title and description (PostgreSQL FTS) |
| `status` | `Status` | No | Filter by status: `open \| in_progress \| resolved \| closed \| cancelled` |
| `priority` | `Priority` | No | Filter by priority: `low \| medium \| high \| critical` |
| `assignedTo` | `uuid` | No | Filter by assignee user ID |

**Response 200**
```json
[
  {
    "id": "uuid",
    "title": "Login page crashes on mobile",
    "description": "Users on iOS 17 report a blank screen after tapping login.",
    "priority": "high",
    "status": "open",
    "assignedTo": "uuid",
    "createdBy": "uuid",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "creator": { "id": "uuid", "name": "Alice Admin", "email": "alice@example.com", "role": "admin" },
    "assignee": { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "agent" }
  }
]
```

**Error responses**

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | `status` or `priority` param has an invalid value |

---

#### POST /tickets

Creates a new ticket.

**Request body**
```json
{
  "title": "Login page crashes on mobile",
  "description": "Users on iOS 17 report a blank screen after tapping login.",
  "priority": "high",
  "assignedTo": "uuid",
  "createdBy": "uuid"
}
```

**Field rules**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | `string` | Yes | 3–200 characters |
| `description` | `string` | Yes | Minimum 10 characters |
| `priority` | `Priority` | Yes | `low \| medium \| high \| critical` |
| `assignedTo` | `uuid` | No | Must be a valid user UUID if provided |
| `createdBy` | `uuid` | Yes | Must be a valid user UUID |

**Response 201**
```json
{
  "id": "uuid",
  "title": "Login page crashes on mobile",
  "description": "Users on iOS 17 report a blank screen after tapping login.",
  "priority": "high",
  "status": "open",
  "assignedTo": "uuid",
  "createdBy": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "creator": { "id": "uuid", "name": "Alice Admin", "email": "alice@example.com", "role": "admin" },
  "assignee": { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "agent" }
}
```

**Error responses**

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing or invalid fields |

---

#### GET /tickets/:id

Returns a single ticket with its comments.

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `uuid` | Ticket ID |

**Response 200**
```json
{
  "id": "uuid",
  "title": "Login page crashes on mobile",
  "description": "Users on iOS 17 report a blank screen after tapping login.",
  "priority": "high",
  "status": "in_progress",
  "assignedTo": "uuid",
  "createdBy": "uuid",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-02T00:00:00.000Z",
  "creator": { "id": "uuid", "name": "Alice Admin", "email": "alice@example.com", "role": "admin" },
  "assignee": { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "agent" },
  "comments": [
    {
      "id": "uuid",
      "ticketId": "uuid",
      "message": "Reproduced on iPhone 14. Investigating.",
      "createdBy": "uuid",
      "createdAt": "2024-01-02T00:00:00.000Z",
      "author": { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "agent" }
    }
  ]
}
```

**Error responses**

| Code | Status | Description |
|---|---|---|
| `TICKET_NOT_FOUND` | 404 | No ticket with the given ID |

---

#### PATCH /tickets/:id

Updates ticket fields. Only fields provided in the body are changed.

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `uuid` | Ticket ID |

**Request body** (all fields optional — at least one required)
```json
{
  "title": "Updated title",
  "description": "Updated description with more detail.",
  "priority": "critical",
  "assignedTo": "uuid"
}
```

**Field rules**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `title` | `string` | No | 3–200 characters if provided |
| `description` | `string` | No | Minimum 10 characters if provided |
| `priority` | `Priority` | No | `low \| medium \| high \| critical` if provided |
| `assignedTo` | `uuid \| null` | No | Valid user UUID or `null` to unassign |

**Response 200** — returns the full updated ticket (same shape as GET /tickets/:id)

**Error responses**

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Invalid field values |
| `TICKET_NOT_FOUND` | 404 | No ticket with the given ID |

---

#### PATCH /tickets/:id/status

Changes ticket status. Enforces the state machine — invalid transitions are rejected.

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `uuid` | Ticket ID |

**Request body**
```json
{
  "status": "in_progress",
  "userId": "uuid"
}
```

**Field rules**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `status` | `Status` | Yes | `open \| in_progress \| resolved \| closed \| cancelled` |
| `userId` | `uuid` | Yes | UUID of the user performing the action |

**Valid transitions**

| From | To (allowed) |
|---|---|
| `open` | `in_progress`, `cancelled` |
| `in_progress` | `resolved`, `cancelled` |
| `resolved` | `closed` |
| `closed` | _(terminal — no transitions allowed)_ |
| `cancelled` | _(terminal — no transitions allowed)_ |

**Response 200** — returns the full updated ticket

**Error responses**

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing or invalid `status` / `userId` |
| `TICKET_NOT_FOUND` | 404 | No ticket with the given ID |
| `INVALID_TRANSITION` | 422 | Transition from current status to requested status is not allowed |

**Example 422 response**
```json
{
  "error": "Cannot transition from 'open' to 'closed'",
  "code": "INVALID_TRANSITION"
}
```

---

### 8.3 Comments

#### POST /tickets/:id/comments

Adds a comment to a ticket.

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `uuid` | Ticket ID |

**Request body**
```json
{
  "message": "Reproduced on iPhone 14. Investigating.",
  "createdBy": "uuid"
}
```

**Field rules**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `message` | `string` | Yes | Minimum 1 character (trimmed) |
| `createdBy` | `uuid` | Yes | Must be a valid user UUID |

**Response 201**
```json
{
  "id": "uuid",
  "ticketId": "uuid",
  "message": "Reproduced on iPhone 14. Investigating.",
  "createdBy": "uuid",
  "createdAt": "2024-01-02T00:00:00.000Z",
  "author": { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "agent" }
}
```

**Error responses**

| Code | Status | Description |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Empty or missing `message`, or invalid `createdBy` |
| `TICKET_NOT_FOUND` | 404 | No ticket with the given ID |

---

#### GET /tickets/:id/comments

Returns all comments for a ticket in chronological order.

**Path parameters**

| Param | Type | Description |
|---|---|---|
| `id` | `uuid` | Ticket ID |

**Response 200**
```json
[
  {
    "id": "uuid",
    "ticketId": "uuid",
    "message": "Reproduced on iPhone 14. Investigating.",
    "createdBy": "uuid",
    "createdAt": "2024-01-02T00:00:00.000Z",
    "author": { "id": "uuid", "name": "Bob Agent", "email": "bob@example.com", "role": "agent" }
  }
]
```

**Error responses**

| Code | Status | Description |
|---|---|---|
| `TICKET_NOT_FOUND` | 404 | No ticket with the given ID |

---

### 8.4 Standard Error Response Shape

All error responses across every endpoint use this consistent shape:

```ts
// Matches ApiError type in src/types/ticket.ts
{
  "error": string,  // Human-readable description
  "code": string    // Machine-readable constant
}
```

**Complete error code reference**

| Code | HTTP Status | Trigger |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Missing required field, wrong type, or value outside allowed enum |
| `TICKET_NOT_FOUND` | 404 | Ticket ID does not exist |
| `USER_NOT_FOUND` | 404 | User ID does not exist |
| `NOT_FOUND` | 404 | Generic — Prisma P2025 (related record missing) |
| `CONFLICT` | 409 | Prisma P2002 (unique constraint violation, e.g. duplicate email) |
| `INVALID_TRANSITION` | 422 | Status change violates the state machine |
| `INTERNAL_ERROR` | 500 | Unhandled exception |
