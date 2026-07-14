# Support Ticket Management System

A full-stack application for managing support tickets. Internal users create, update, comment on, search, and progress tickets through a defined lifecycle with strict state machine enforcement.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), TypeScript, SCSS Modules, Zustand |
| Backend | Node.js, Express, TypeScript, Prisma ORM |
| Database | PostgreSQL via Supabase (hosted) |
| Testing | Jest + Supertest |

## Prerequisites

- **Node.js 22+** (use `nvm use 22` — the `.nvmrc` is set)
- **npm 10+**
- A **Supabase** account (free tier is sufficient)

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url> support-ticket-system
cd support-ticket-system

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Supabase setup

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **Project Settings → Database → Connection string**.
3. Copy the **Session mode** connection string (port 5432 on the pooler host).

### 3. Configure environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and set your real connection strings:

```
DATABASE_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
DIRECT_URL="postgresql://postgres.[ref]:[PASSWORD]@aws-0-[region].pooler.supabase.com:5432/postgres"
```

For the client:
```bash
cd ../client
cp .env.local.example .env.local
```

The default `NEXT_PUBLIC_API_URL=http://localhost:3001/api/v1` should work as-is.

### 4. Run database migrations and seed

```bash
cd server
npx prisma migrate deploy
npx prisma db seed
```

This creates the schema and populates:
- 3 users (1 admin, 2 agents)
- 5 tickets (one per status)
- 3 comments

### 5. Start development servers

**Server** (Express API on port 3001):
```bash
cd server
npm run dev
```

**Client** (Next.js on port 3000):
```bash
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run tests

```bash
cd server
npm test          # all tests (unit + integration)
npm run test:unit        # state machine unit tests only
npm run test:integration # API integration tests only
```

## Project Structure

```
support-ticket-system/
├── server/                     # Express API
│   ├── src/
│   │   ├── controllers/       # Request/response handling
│   │   ├── services/          # Business logic (state machine)
│   │   ├── repositories/      # Prisma database calls
│   │   ├── middleware/        # Validation, error handling
│   │   ├── errors/           # Typed error classes
│   │   ├── types/            # Shared TypeScript interfaces
│   │   └── lib/              # Prisma client singleton
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   ├── seed.ts           # Seed data
│   │   └── migrations/       # SQL migrations
│   └── tests/
│       ├── unit/             # Pure logic tests
│       └── integration/      # API tests with supertest
├── client/                    # Next.js 15 frontend
│   └── src/
│       ├── app/              # File-based routing
│       ├── components/       # UI components (SCSS Modules)
│       ├── store/            # Zustand state management
│       ├── lib/              # API client, utilities
│       └── types/            # TypeScript interfaces
├── kiro-specs/               # Planning artifacts
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── ai-workflow/
    └── prompt-history.md     # AI interaction log
```

## Status State Machine

```
Open         → In Progress | Cancelled
In Progress  → Resolved    | Cancelled
Resolved     → Closed
Closed       → (terminal)
Cancelled    → (terminal)
```

Invalid transitions are rejected by the backend (HTTP 422) and never offered in the UI.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/v1/users` | List all users |
| GET | `/api/v1/tickets` | List tickets (supports `?search=`, `?status=`) |
| POST | `/api/v1/tickets` | Create a ticket |
| GET | `/api/v1/tickets/:id` | Get ticket with comments |
| PATCH | `/api/v1/tickets/:id` | Update ticket fields |
| PATCH | `/api/v1/tickets/:id/status` | Change status (enforces state machine) |
| POST | `/api/v1/tickets/:id/comments` | Add a comment |
| GET | `/api/v1/tickets/:id/comments` | List comments |

## Key Design Decisions

- **State machine isolation**: Pure TypeScript module with zero dependencies — trivially unit-testable.
- **Hybrid enforcement**: Service layer is the primary guard; Prisma enums prevent invalid status values at DB level.
- **Zustand over Redux**: Lightweight, minimal boilerplate, fits the mutation + re-fetch pattern.
- **SCSS Modules**: Scoped styles, no global class pollution, co-located with components.
- **No authentication in Core**: User is selected via dropdown (per assignment spec).

## Node.js Version Note

The project requires **Node 22** (LTS). Node 25 has an incompatibility with Next.js 15 (`localStorage` errors during SSR). The `.nvmrc` file is set to `22` — run `nvm use` before starting.
