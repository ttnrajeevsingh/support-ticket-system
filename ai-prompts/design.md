# AI Prompts — Design

## Prompt 1: Generate design document

**Prompt:** yes (proceed with design.md)

**AI Response:** Full design doc with system overview, backend layers, state machine module, error handling, validation strategy, search design, frontend component tree, database ERD, testing approach.

**What I accepted:** Architecture, layer separation, state machine module design.
**What I changed:** Nothing initially.

---

## Prompt 2: Tech stack update

**Prompt:** Update the design to include: Frontend: Next.js 15 (App Router), TypeScript, SCSS Modules, Zustand. Backend: Node.js, Express, TypeScript, Prisma ORM. Database: PostgreSQL. Testing: Jest.

**AI Response:** Complete rewrite of design.md with the specified stack — Zustand stores, SCSS Modules pattern, Next.js App Router routing, TypeScript throughout.

**What I accepted:** Full rewrite matched my stack choice.
**What I changed:** Nothing — it adapted correctly.

---

## Prompt 3: Missing API contract

**Prompt:** You forgot to add api contract

**AI Response:** Added section 8 with full request/response shapes for all endpoints, field rules, error codes.

**What I accepted:** All of it.
**What I changed:** Nothing.
**Why this was important:** I caught a gap in AI output and asked for it to be fixed. Shows review, not just acceptance.
