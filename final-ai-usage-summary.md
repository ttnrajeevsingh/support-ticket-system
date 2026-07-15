# Final AI Usage Summary

## Tool Used
Kiro (AWS AI IDE powered by Claude) — used in both Plan mode and execution mode.

## Usage Breakdown by Activity

| Activity | AI involvement | My involvement |
|----------|---------------|----------------|
| Requirement analysis | Generated structure | Made all decisions (Supabase, stack, Prisma) |
| Design | Produced architecture + component tree | Specified tech stack, caught missing API contract |
| Implementation | Wrote code task-by-task | Verified each step (typecheck, tests, curl) |
| Testing | Generated 116 tests | Reviewed test cases, defined strategy |
| Debugging | Diagnosed root causes | Shared real errors, validated fixes |
| Code review | Audited for dead code | Caught UX issues (opacity, emoji, clickable rows) |
| Documentation | Generated specs and README | Reviewed and corrected |

## Key Decisions I Made (not AI)

1. Supabase over local PostgreSQL (easier setup, no install needed)
2. Prisma over raw SQL (type safety, migrations, seed tooling)
3. Tech stack: Next.js 15 + TypeScript + SCSS Modules + Zustand
4. Pagination (not in original Core scope — I added it for real UX)
5. Rate limiting (I noticed it was missing, AI didn't suggest it)
6. Skeleton loading over opacity fade (UX judgment)
7. Jira-style clickable rows (UX improvement I requested)

## What AI Generated vs What I Changed

| AI generated | I changed/corrected |
|---|---|
| Inline import in app.ts | Moved to top (AI explained it was misleading when asked) |
| `plainto_tsquery` for search | Switched to prefix matching + ILIKE fallback |
| Opacity fade on search | Replaced with skeleton loading |
| Emoji in empty state | Removed (unreliable rendering) |
| `/api/v1/ping` placeholder | Removed in cleanup |
| `next/dynamic` with ssr:false | Reverted to `'use client'` (build error) |

## Prompt Statistics

- ~35 significant prompts across the session
- 5 key decision prompts (infrastructure/architecture)
- 6 debugging sessions with real error output
- 4 "explain this code" questions
- 3 code review corrections I initiated

## Responsible AI Usage

- Stripped company information from assignment brief before sharing
- Database credentials stored in `.env` (gitignored), never committed
- Seed data uses fictional users (`@example.com` domains)
- AI masks sensitive values in terminal output
- Pre-commit hooks prevent accidental secret commits
