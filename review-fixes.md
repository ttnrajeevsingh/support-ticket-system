# Review Fixes

Changes made after reviewing AI-generated code and identifying issues.

## Fix 1: Move inline import to top (app.ts)

**Before:**
```typescript
// Line 21 — between middleware and route mounting
import { router as apiRouter } from './routes';
```

**After:**
```typescript
// Line 6 — grouped with all other imports
import { router as apiRouter } from './routes';
```

**Why:** TypeScript hoists imports regardless of source position. The inline placement was misleading — it implied dotenv needed to run first, which isn't true.

---

## Fix 2: Remove emoji from empty state

**Before:**
```tsx
<div className={styles.emptyIcon}>🎫</div>
<p>No tickets found</p>
```

**After:**
```tsx
<p className={styles.emptyTitle}>No tickets found</p>
<p className={styles.emptyDesc}>Try adjusting your search or filters.</p>
```

**Why:** Emoji rendering is inconsistent across platforms and adds no semantic value.

---

## Fix 3: Replace opacity fade with skeleton loader

**Before:** Table stayed visible at 50% opacity during search with `pointer-events: none`.

**After:** Table is replaced by a `TicketTableSkeleton` component with shimmer animation matching the table grid layout (5 rows × 5 columns).

**Why:** Opacity fade felt laggy and unclear. Skeleton loading is the standard pattern for data-fetching states in modern apps.

---

## Fix 4: Single-character search fallback

**Before:** `to_tsquery('english', 't:*')` returned empty (PostgreSQL drops single chars as stop words).

**After:**
```typescript
if (sanitized.length <= 2) {
  // ILIKE fallback — substring match
  searchCondition = `(t.title ILIKE '%${term}%' OR t.description ILIKE '%${term}%')`;
} else {
  // FTS prefix match — uses GIN index
  searchCondition = `to_tsvector(...) @@ to_tsquery('english', '${term}:*')`;
}
```

**Why:** Users expect typing a single character to narrow results. FTS can't handle it, so ILIKE covers the edge case.

---

## Fix 5: Pre-commit hook Node version

**Issue:** The `.husky/pre-commit` script used system Node (v12) which doesn't support `??` (nullish coalescing) — TypeScript's compiled output uses it.

**Fix:** Need to ensure the hook uses Node 22. Added PATH setup at the top of the hook script.
