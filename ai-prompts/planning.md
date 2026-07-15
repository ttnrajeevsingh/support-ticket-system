# AI Prompts — Planning

## Prompt 1: Initial requirements analysis

**Prompt:** Analyze the assignment and generate: functional requirements, non-functional requirements, API requirements, database requirements, acceptance criteria, risks and assumptions, open questions, suggested architecture.

**AI Response:** Generated full 8-section requirements document with state machine definition, schema, and architecture diagram.

**What I accepted:** The structure and most content.
**What I changed:** Database from local PostgreSQL to Supabase, ORM from raw pg to Prisma.
**Why:** Supabase removes install dependency; Prisma gives type safety and migration tooling.

---

## Prompt 2: Supabase decision

**Prompt:** Can we not use Supabase or something centralized db instead of local postgresql?

**AI Response:** Recommended Supabase — hosted PostgreSQL, free tier sufficient, same SQL features, zero code changes for pg driver.

**What I accepted:** The recommendation and all the setup steps it generated.
**What I changed:** Nothing — it was exactly what I wanted.

---

## Prompt 3: Tasks breakdown

**Prompt:** yes (proceed with tasks.md)

**AI Response:** 15 incremental tasks, each with objective, implementation guidance, tests, and demo criteria.

**What I accepted:** The task ordering (state machine tested before HTTP, backend before frontend).
**What I changed:** Nothing significant.
