# Debugging Notes

## Issue 1: Node 25 incompatibility with Next.js 15

### Problem
Next.js dev server threw `TypeError: localStorage.getItem is not a function` on every page request, even a minimal page with no client-side code.

### How I Investigated
1. Removed all Zustand imports — still crashed
2. Created a minimal page with just `<p>test</p>` — still crashed
3. Checked if the error came from our code: `grep -r "localStorage" src/` — nothing
4. Hypothesis: framework-level issue with Node version

### How AI Helped
AI suggested testing with Node 22 instead of Node 25 (which was from Homebrew). Ran the dev server with `export PATH="$HOME/.nvm/versions/node/v22.22.3/bin:$PATH"` — immediate fix.

### What I Validated
- Node 22 → all pages return 200
- Node 25 → all pages return 500 with localStorage error
- Production `next build` works on both (only dev server affected)

### Final Fix
Added `.nvmrc` with `22` at project root. Documented in README that Node 25 is incompatible.

---

## Issue 2: Supabase connection — port blocking

### Problem
`npx prisma migrate dev` failed with `P1001: Can't reach database server at db.[ref].supabase.co:5432`. Seed script also failed on port 6543 (transaction pooler).

### How I Investigated
1. Tested port 5432 on direct host: `nc -zv db.[ref].supabase.co 5432` — timed out
2. Tested port 6543 on pooler: `nc -zv [pooler].supabase.com 6543` — timed out
3. Tested port 5432 on pooler: `nc -zv [pooler].supabase.com 5432` — connected

### How AI Helped
AI explained Supabase's three connection modes (direct, transaction pooler, session pooler) and that session mode on port 5432 at the pooler host works for both migrations and app runtime.

### What I Validated
- Set both DATABASE_URL and DIRECT_URL to session-mode pooler (port 5432)
- `npx prisma migrate dev` — succeeded
- `npx prisma db seed` — succeeded
- Runtime queries — succeeded

### Final Fix
Both URLs in `.env` point to `aws-1-ap-south-1.pooler.supabase.com:5432`. Updated `.env.example` with explanation.

---

## Issue 3: PostgreSQL FTS drops single characters

### Problem
`GET /tickets?search=t&priority=medium` returned empty array. But `search=test` worked fine.

### How I Investigated
1. Checked the raw SQL: `to_tsquery('english', 't:*')` 
2. Ran in Supabase SQL editor: `SELECT to_tsquery('english', 't:*')` → returned empty tsquery
3. PostgreSQL English stemmer treats single characters as stop words

### How AI Helped
AI explained the root cause (English text search config stop words) and suggested a dual strategy: ILIKE for short terms, FTS for 3+ characters.

### What I Validated
- `?search=t` now returns tickets containing "t" in title/description (ILIKE)
- `?search=test` still uses FTS with GIN index (prefix matching)
- Combined filters work: `?search=t&priority=medium` returns correct subset

### Final Fix
```typescript
if (sanitized.length <= 2) {
  // ILIKE fallback for short terms
  searchCondition = Prisma.sql`(t.title ILIKE ${likePattern} OR t.description ILIKE ${likePattern})`;
} else {
  // FTS with prefix matching for 3+ chars
  searchCondition = Prisma.sql`... @@ to_tsquery('english', ${tsquery})`;
}
```

---

## Issue 4: Stale .next cache causing 500 errors

### Problem
After file changes, `/tickets/[id]` returned 500 with `Cannot find module './663.js'` in webpack-runtime.

### How I Investigated
Checked the Next.js dev server logs — webpack chunk references were outdated from a prior compilation.

### How AI Helped
AI identified this as a stale cache issue specific to the dev server's hot-module-replacement.

### What I Validated
After `rm -rf .next && npm run dev`, all pages returned 200.

### Final Fix
Not a code fix — a development workflow issue. Clear `.next` when switching branches or after major file restructuring. Production builds (`next build`) are not affected.

---

## Issue 5: TypeScript strict mode — req.params type

### Problem
`tsc --noEmit` failed with: `Argument of type 'string | string[]' is not assignable to parameter of type 'string'` on `req.params.id`.

### How I Investigated
Express 5 types `req.params` values as `string | string[]` for array route patterns.

### How AI Helped
AI suggested using `req.params['id'] as string` — explicit access + cast for single-value params.

### What I Validated
`npm run typecheck` passed after the change. No runtime behavior change.

### Final Fix
```typescript
// Before (fails strict check)
req.params.id
// After
req.params['id'] as string
```
