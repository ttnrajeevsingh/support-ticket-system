# Reflection

## What I Built

A full-stack support ticket management system with:
- Express API (TypeScript) with 8 endpoints, pagination, search, rate limiting
- Next.js 15 frontend with dashboard-style ticket list, create/edit forms, status control, comments
- PostgreSQL database (Supabase) with Prisma ORM, migrations, seed data
- 116 automated tests across both projects
- Strict status state machine enforced at the service layer

## How I Used AI (across the lifecycle)

I used Kiro throughout — not just for code generation but for the full lifecycle:

- **Requirements:** AI structured my analysis into functional/non-functional/API/DB/acceptance criteria. I made the key decisions (Supabase, Prisma, tech stack).
- **Design:** AI produced architecture diagrams, component trees, and the state machine definition. I specified the tech stack and caught a missing API contract section.
- **Implementation:** Task-by-task execution. AI wrote the code, I verified each step before proceeding (typecheck, tests, curl, browser).
- **Testing:** AI wrote 116 tests. I reviewed the test cases to ensure they covered real scenarios including edge cases.
- **Debugging:** Shared actual errors with the AI. It diagnosed root causes (Node version, port blocking, FTS stop words) while I validated fixes.
- **Review:** Asked the AI to audit for unused code, then also caught issues myself (emoji, opacity overlay, missing pagination).

## What AI Helped With Most

1. **Boilerplate generation** — Setting up TypeScript configs, Jest configs, Prisma schemas, middleware patterns. This would have taken hours manually.
2. **Debugging** — Root cause analysis was fast. I shared the error, AI identified the cause, I verified the fix. The Supabase port issue would have taken much longer without AI explaining the three connection modes.
3. **Test coverage** — Writing 116 tests manually would have been tedious. AI generated them from my test strategy, and I verified they test the right things.

## What AI Got Wrong

1. **Inline import placement** — Placed `import` inline at line 21 thinking it would run after `dotenv.config()`. TypeScript hoists all imports — this was misleading.
2. **`next/dynamic` with inline loading JSX** — Tried to use `ssr: false` with an inline loading component. Next.js 15 App Router doesn't support this pattern.
3. **`experimental.optimizeCss`** — Suggested this config option but Next.js 15 requires `critters` which isn't bundled.
4. **Emoji in empty state** — Used `🎫` which doesn't render reliably cross-platform.
5. **Pre-commit hook didn't account for Node version** — The hook script ran with system Node (v12) instead of Node 22.

In each case, I caught the issue through testing or review and corrected it.

## How I Validated AI Output

- **Type checking** — `tsc --noEmit` after every change (catches type errors immediately)
- **Automated tests** — 116 tests run on every commit via Husky pre-commit hooks
- **Manual API testing** — `curl` each endpoint after implementation
- **Browser verification** — Opened the UI and interacted with it (caught UX issues like table flashing, emoji rendering)
- **Asking "why?"** — When I didn't understand code, I asked. The AI's explanation either confirmed the logic or revealed a mistake.

## What I Would Improve Next

1. **Authentication** — JWT with role-based access, protected routes
2. **E2E tests** — Playwright for full user flow coverage
3. **CI/CD** — GitHub Actions running tests + deploy on push
4. **Docker** — Containerized setup for one-command local dev
5. **WebSocket** — Real-time updates when tickets change
6. **Cursor-based pagination** — Better performance for large datasets

## Reusable Workflow (prompts, rules, specs, templates)

What I'd bring to the next project:

- **Spec-first approach:** requirements.md → design.md → tasks.md before any code. Front-loads decisions and gives AI clear constraints.
- **Incremental execution:** One task at a time, each producing testable output. Never "build the whole app" in one prompt.
- **Pre-commit hooks from day one:** Typecheck + tests + build as quality gates.
- **Prompt history as decision log:** Captures why decisions were made, not just what was built.
- **Dual-mode AI usage:** Plan mode for structured thinking, execution mode for implementation. Don't mix them.
