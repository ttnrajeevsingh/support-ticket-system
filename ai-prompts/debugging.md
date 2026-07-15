# AI Prompts — Debugging

## Prompt 1: Supabase port blocking

**Prompt:** (Shared the error: `P1001: Can't reach database server at db.[ref].supabase.co:5432`)

**AI Response:** Suggested testing which ports are open with `nc -zv`. Identified session-mode pooler (port 5432 on pooler host) as the working option. Explained the three Supabase connection modes.

**What I accepted:** The port 5432 session-mode solution.
**What I changed:** Updated both DATABASE_URL and DIRECT_URL to use the same pooler host.
**Iteration:** Also hit port 6543 blocking — had to set both to port 5432.

---

## Prompt 2: Node 25 incompatibility

**Prompt:** (Shared error: `TypeError: localStorage.getItem is not a function` from Next.js)

**AI Response:** Systematically eliminated causes — stripped components, minimal page, identified it as a Node version issue. Confirmed Node 22 works.

**What I accepted:** Use Node 22 for the client dev server.
**What I changed:** Added `.nvmrc` and documented in README.

---

## Prompt 3: FTS single-character search

**Prompt:** api/v1/tickets?search=t&priority=medium responds with blank array but search=test works

**AI Response:** Explained PostgreSQL English stemmer drops single characters as stop words. `to_tsquery('english', 't:*')` produces empty tsquery. Implemented dual strategy: ILIKE for 1-2 chars, FTS for 3+.

**What I accepted:** The dual-strategy approach.
**What I changed:** Nothing — fix worked immediately.

---

## Prompt 4: Stale .next cache

**Prompt:** (Detail page returning 500 with `Cannot find module './663.js'`)

**AI Response:** Identified as stale webpack chunk in dev server cache. Fix: `rm -rf .next` and restart.

**What I accepted:** The diagnosis.
**What I changed:** Nothing in code — development workflow issue.

---

## Prompt 5: TypeScript strict params

**Prompt:** (Server wouldn't start — TS error on `req.params.id`)

**AI Response:** Express types params as `string | string[]` in strict mode. Fix: `req.params['id'] as string`.

**What I accepted:** The cast pattern.
**What I changed:** Applied to all controller functions.
