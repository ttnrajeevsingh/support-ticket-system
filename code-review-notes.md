# Code Review Notes

## AI-Assisted Review Summary

Used the AI to do a full codebase audit looking for:
- Unused code and dead imports
- False branding or hardcoded copyright values
- Placeholder routes left from development
- Build artifacts accidentally committed
- Inconsistent patterns

## My Review Observations

1. **Inline import in app.ts** — `import { router } from './routes'` was placed at line 21 between middleware setup and route mounting. TypeScript hoists imports regardless of position, so this was misleading. Moved to top with other imports.

2. **Emoji in empty state** — The ticket list empty state used a `🎫` emoji div as a visual anchor. Cross-platform emoji rendering is unreliable. Removed it — text-only is cleaner.

3. **Opacity overlay on search** — During search, the table faded to 50% opacity. This felt jarring. Replaced with skeleton loading (shimmer animation) for a more polished UX.

4. **Missing rate limiting** — The original implementation had no request rate limiting at all. Added `express-rate-limit` with two tiers (100/min reads, 30/min writes).

5. **Missing pagination** — The ticket list originally loaded all tickets in one request. Added server-side pagination (page/limit params, COUNT query, Prisma skip/take).

6. **`/api/v1/ping` left in routes** — A development placeholder that wasn't in the API contract. Removed.

7. **`tsconfig.tsbuildinfo` committed** — Build artifact that shouldn't be in git. Removed from tracking, added to `.gitignore`.

8. **Duplicate `tests/setup.ts`** — Both `client/tests/setup.ts` and `client/jest.setup.ts` existed with the same content. Only `jest.setup.ts` was referenced in config. Deleted the duplicate.

## Changes Made After Review

| Issue | Action |
|-------|--------|
| Inline import | Moved to top of file |
| Emoji in empty state | Removed entirely |
| Opacity overlay | Replaced with skeleton loader |
| No rate limiting | Added express-rate-limit (2 tiers) |
| No pagination | Added server + client pagination |
| /api/v1/ping | Removed from routes/index.ts |
| tsconfig.tsbuildinfo | Removed from git, added to .gitignore |
| Duplicate setup.ts | Deleted |

## Suggestions Rejected (and why)

- **`next/dynamic` with `ssr: false` for home page** — Attempted to lazy-load TicketListView to reduce initial JS. Next.js 15 App Router threw a build error with inline JSX in the `loading` prop. Rejected in favor of `'use client'` page directive which achieves client-side rendering without the dynamic import complexity.

- **`experimental.optimizeCss` in next.config** — Attempted for Lighthouse improvement. Next.js 15 requires the `critters` package for this which isn't bundled. Rejected — the CSS is already small enough without critical CSS extraction.
