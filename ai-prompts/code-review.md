# AI Prompts — Code Review

## Prompt 1: Full codebase audit

**Prompt:** Recheck the code base and remove any unused, false branding, hardcoded copyright values etc, code base should be clean and fresh

**AI Response:** Scanned all files for:
- Copyright/branding text → none found in source
- TODO/FIXME/HACK → none found
- Unused routes → found and removed `/api/v1/ping`
- Duplicate files → found and removed `tests/setup.ts`
- Build artifacts → found and removed `tsconfig.tsbuildinfo` from git
- Dead exports → all types are imported somewhere

**What I accepted:** All cleanup actions.
**What I changed:** Nothing additional.

---

## Prompt 2: Inline import question

**Prompt:** why import at line 21 import { router as apiRouter } from './routes'; in app.ts

**AI Response:** Explained TypeScript hoists imports regardless of placement. The inline position was misleading — it implied dotenv needed to run first which isn't true.

**What I accepted:** Moved import to top of file.
**What I rejected:** Nothing — the explanation was correct.

---

## Prompt 3: Empty state emoji question

**Prompt:** If there is no ticket in table, there is no emptyIcon div which has an icon, why did you use this?

**AI Response:** Acknowledged the emoji was unreliable cross-platform. Offered to remove it or replace with SVG.

**What I accepted:** Remove it entirely — text-only empty state is cleaner.
