# Support Ticket Management System

A full-stack application for managing support tickets. Internal users create, update, comment on, search, and progress tickets through a defined lifecycle with strict state machine enforcement.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, SCSS Modules, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL via Supabase (hosted) |
| Testing | Jest + Supertest |

---

## Setup Instructions

### Prerequisites

- **Node.js 22+** — run `nvm use 22` (the `.nvmrc` is set)
- **npm 10+** (ships with Node 22)
- A **Supabase** account — free tier at [supabase.com](https://supabase.com)

### Step 1: Clone the repository

```bash
git clone <repo-url> support-ticket-system
cd support-ticket-system
```

### Step 2: Install dependencies

```bash
# Root (Husky pre-commit hooks)
npm install

# Server
cd server
npm install

# Client
cd ../client
npm install

cd ..
```

### Step 3: Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Wait for the project to provision (~2 minutes).
3. Navigate to **Project Settings → Database → Connection string**.
4. Select **Session mode** (port 5432 on the pooler host).
5. Copy the connection string.

### Step 4: Configure environment variables

**Server:**
```bash
cd server
cp .env.example .env
```

Open `server/.env` and replace the placeholder values with your Supabase connection string:

```env
DATABASE_URL="postgresql://postgres.[your-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[your-ref]:[YOUR-PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
PORT=3001
CLIENT_ORIGIN=http://localhost:3000
NODE_ENV=development
```

**Client:**
```bash
cd ../client
cp .env.local.example .env.local
```

The default value (`NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1`) works for local development.

### Step 5: Run Prisma migrations

```bash
cd server

# Apply the schema to your Supabase database
npx prisma migrate deploy

# Verify the schema was created
npx prisma validate
```

This creates three tables: `users`, `tickets`, `comments` with all indexes and enums.

### Step 6: Seed the database

```bash
npx prisma db seed
```

This populates:
- **3 users** — Alice Admin, Bob Agent, Carol Agent
- **5 tickets** — one per status (open, in_progress, resolved, closed, cancelled)
- **3 comments** — on different tickets

You can verify with:
```bash
npx prisma studio
```

### Step 7: Start the development servers

**Terminal 1 — Server (Express API on port 3001):**
```bash
cd server
npm run dev
```

**Terminal 2 — Client (Next.js on port 3000):**
```bash
cd client
npm run dev
```

### Step 8: Open the app

Go to [http://localhost:3000](http://localhost:3000) in your browser.

You should see the ticket list with 5 seeded tickets, search bar, status/priority/assignee filters, and pagination.

### Step 9: Run tests

```bash
# Server — 65 tests (48 unit + 17 integration)
cd server
npm test

# Client — 51 tests (8 test suites)
cd ../client
npm test
```

**Total: 116 tests** across both projects.

### Step 10: Verify the API manually (optional)

```bash
# Health check
curl http://localhost:3001/health

# List tickets with pagination
curl "http://localhost:3001/api/v1/tickets?page=1&limit=5"

# Search
curl "http://localhost:3001/api/v1/tickets?search=dashboard"

# Get a specific ticket
curl http://localhost:3001/api/v1/tickets/<ticket-id>
```

---

## Project Structure

```
support-ticket-system/
├── server/                     # Express API (TypeScript)
│   ├── src/
│   │   ├── controllers/       # Request/response handling
│   │   ├── services/          # Business logic (state machine)
│   │   ├── repositories/      # Prisma database queries
│   │   ├── middleware/        # Validation, error handling, rate limiting
│   │   ├── errors/           # Typed error classes
│   │   ├── types/            # Shared TypeScript interfaces
│   │   └── lib/              # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema (source of truth)
│   │   ├── seed.ts           # Seed data script
│   │   └── migrations/       # SQL migrations (auto-generated)
│   └── tests/
│       ├── unit/             # Pure logic tests (no DB)
│       └── integration/      # API tests with supertest
├── client/                    # Next.js 15 frontend (TypeScript)
│   └── src/
│       ├── app/              # File-based routing (App Router)
│       ├── components/       # UI components with SCSS Modules
│       ├── store/            # Zustand state management
│       ├── lib/              # API client, status transitions
│       └── types/            # TypeScript interfaces
├── tool-specific/kiro-specs/  # Planning artifacts
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
├── ai-workflow/               # AI workflow documentation
│   ├── prompt-history.md
│   └── tool-workflow.md
├── .husky/pre-commit          # Pre-commit hooks (typecheck + tests + build)
└── .nvmrc                     # Node version (22)
```

---

## Status State Machine

```
Open         → In Progress | Cancelled
In Progress  → Resolved    | Cancelled
Resolved     → Closed
Closed       → (terminal — no transitions allowed)
Cancelled    → (terminal — no transitions allowed)
```

Invalid transitions are rejected by the backend with HTTP 422 and `code: "INVALID_TRANSITION"`. The frontend only renders buttons for valid next states — invalid transitions are never offered to the user.

---

## API Endpoints

Base URL: `http://localhost:3001/api/v1`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/users` | List all users |
| GET | `/tickets` | List tickets (paginated, searchable, filterable) |
| POST | `/tickets` | Create a ticket |
| GET | `/tickets/:id` | Get ticket with comments |
| PATCH | `/tickets/:id` | Update ticket fields |
| PATCH | `/tickets/:id/status` | Change status (enforces state machine) |
| POST | `/tickets/:id/comments` | Add a comment |
| GET | `/tickets/:id/comments` | List comments for a ticket |

### Query parameters for GET /tickets

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search (prefix matching) |
| `status` | enum | Filter: open, in_progress, resolved, closed, cancelled |
| `priority` | enum | Filter: low, medium, high, critical |
| `assignedTo` | uuid | Filter by assignee user ID |
| `page` | int | Page number (default: 1) |
| `limit` | int | Items per page (default: 10, max: 100) |

### Error Response Format

All errors return a consistent shape:
```json
{
  "error": "Human-readable message",
  "code": "MACHINE_READABLE_CODE"
}
```

Error codes: `VALIDATION_ERROR` (400), `NOT_FOUND` (404), `TICKET_NOT_FOUND` (404), `INVALID_TRANSITION` (422), `RATE_LIMITED` (429), `INTERNAL_ERROR` (500).

### Rate Limiting

- All API routes: **100 requests/minute** per IP
- Write operations (POST/PATCH): **30 requests/minute** per IP
- Exceeding returns `429` with `code: "RATE_LIMITED"`
- Response headers include `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| State machine in pure module | Zero dependencies, trivially testable with Jest, no framework coupling |
| Hybrid enforcement | Service layer is primary guard; Prisma enums prevent invalid DB values |
| Zustand over Redux | Lightweight, minimal boilerplate, fits mutation + re-fetch pattern |
| SCSS Modules | Scoped styles, no class pollution, co-located with components |
| Server-side pagination | `LIMIT/OFFSET` + parallel `COUNT(*)` — client controls page size |
| Dual search strategy | ILIKE for 1-2 chars (stop word issue), PostgreSQL FTS for 3+ chars |
| Rate limiting | Two tiers via `express-rate-limit` — protects against abuse |
| AbortController | Client cancels in-flight search requests when new input arrives |
| Husky pre-commit | Blocks commits unless typecheck + tests + build all pass |
| No auth in Core | User selected via dropdown — per assignment specification |

---

## Node.js Version

This project requires **Node.js 22** (LTS). The `.nvmrc` file is set — run `nvm use` before starting.

> Note: Node 25 has an incompatibility with Next.js 15 (`localStorage` errors during SSR). Stick to Node 22.

---

## Available Scripts

### Server (`cd server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with hot-reload (nodemon + ts-node) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run compiled build |
| `npm run typecheck` | Type check without emitting |
| `npm test` | Run all tests (unit + integration) |
| `npm run test:unit` | Unit tests only (no DB needed) |
| `npm run test:integration` | Integration tests (needs running DB) |

### Client (`cd client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm run typecheck` | Type check without emitting |
| `npm test` | Run all Jest tests |
