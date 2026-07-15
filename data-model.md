# Data Model

## Entity Relationship Diagram

```
┌──────────────┐        ┌───────────────────────┐        ┌──────────────┐
│    users     │        │        tickets         │        │   comments   │
│──────────────│        │───────────────────────│        │──────────────│
│ id (PK, UUID)│◄───────│ created_by (FK)        │        │ id (PK, UUID)│
│ name         │        │ id (PK, UUID)          │◄───────│ ticket_id(FK)│
│ email (UQ)   │◄───────│ assigned_to (FK, null) │        │ message      │
│ role (enum)  │        │ title                  │        │ created_by   │──► users.id
│ created_at   │        │ description            │        │ created_at   │
└──────────────┘        │ priority (enum)        │        └──────────────┘
                        │ status (enum)          │
                        │ created_at             │
                        │ updated_at             │
                        └───────────────────────┘
```

## Enums

```sql
CREATE TYPE "Role" AS ENUM ('admin', 'agent');
CREATE TYPE "Priority" AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE "Status" AS ENUM ('open', 'in_progress', 'resolved', 'closed', 'cancelled');
```

## Tables

### users
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| name | VARCHAR(100) | NOT NULL |
| email | VARCHAR(255) | NOT NULL, UNIQUE |
| role | Role enum | NOT NULL, default 'agent' |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |

### tickets
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NOT NULL |
| priority | Priority enum | NOT NULL |
| status | Status enum | NOT NULL, default 'open' |
| assigned_to | UUID | FK → users.id, nullable, ON DELETE SET NULL |
| created_by | UUID | FK → users.id, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |
| updated_at | TIMESTAMPTZ | NOT NULL, auto-updated by Prisma |

### comments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, default gen_random_uuid() |
| ticket_id | UUID | FK → tickets.id, NOT NULL, ON DELETE CASCADE |
| message | TEXT | NOT NULL |
| created_by | UUID | FK → users.id, NOT NULL |
| created_at | TIMESTAMPTZ | NOT NULL, default NOW() |

## Indexes

```sql
CREATE INDEX idx_tickets_status      ON tickets(status);
CREATE INDEX idx_tickets_created_by  ON tickets(created_by);
CREATE INDEX idx_tickets_assigned_to ON tickets(assigned_to);
CREATE INDEX idx_comments_ticket_id  ON comments(ticket_id);
CREATE INDEX idx_tickets_fts         ON tickets USING GIN(to_tsvector('english', title || ' ' || description));
```

## Seed Data

- 3 users: Alice Admin, Bob Agent, Carol Agent
- 5 tickets: one per status (open, in_progress, resolved, closed, cancelled)
- 3 comments on different tickets
