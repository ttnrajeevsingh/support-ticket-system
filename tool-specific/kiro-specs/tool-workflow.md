# AI Tool Workflow

How I used AI throughout this project — from planning to shipping.

---

## 1. Primary AI Tool

I used **Kiro** (AI-powered IDE by AWS) as my primary development tool. It runs Claude as the underlying model and has direct access to my filesystem, terminal, and project context. This is different from a chat-based AI — Kiro can read files, run commands, create/edit code, and verify results in real-time within my workspace.

I also used the **Plan mode** in Kiro for structured requirement gathering and task breakdown before switching to execution mode for implementation.

---

## 2. Providing Project Context

Before sharing anything with the AI, I cleaned up the assignment brief — removed all company-specific information, internal process details, and evaluation criteria that weren't relevant to the actual build. I kept only the project requirements, technical expectations, and tool specifications. This cleaned version (`JS - AI_Assesment_Project.md`) became the first reference I gave Kiro for requirements analysis and design.

From there, I worked iteratively:

- The cleaned assignment brief was always accessible in the workspace as the source of truth
- I maintained `kiro-specs/` with three living documents (requirements, design, tasks) that the AI referenced throughout implementation
- When asking for changes, I pointed to specific files or had them open in the editor so the AI had the exact current state
- For debugging, I shared the actual error output rather than describing it

The key principle: give the AI the real context (files, errors, output) rather than a summary of it. But also — don't overshare. Strip out anything that isn't relevant to what you're asking the AI to do.

---

## 3. Requirement Analysis

I pasted the assignment brief and asked the AI to break it down into structured sections (functional, non-functional, API, DB, acceptance criteria, risks, open questions, architecture).

But I didn't just accept the output. I:

- **Challenged assumptions** — the AI assumed local PostgreSQL, I asked "can we use Supabase instead?" which led to a better architecture
- **Made stack decisions** — I specified Next.js 15, TypeScript, SCSS Modules, Zustand rather than accepting the AI's default (React + Vite + plain JS)
- **Added Prisma** — when the AI suggested raw SQL scripts, I asked to include Prisma for schema management and seeding
- **Caught gaps** — when the API contract section was missing from the design doc, I called it out and the AI added it

The AI generates the structure, but the decisions are mine.

---

## 4. Planning and Design

I used the AI to produce three planning artifacts:

1. **requirements.md** — what to build (functional/non-functional/API/DB/acceptance criteria)
2. **design.md** — how to build it (architecture, state machine, error handling, component tree)
3. **tasks.md** — implementation order (15 incremental, test-driven tasks)

The workflow:
- AI drafts → I review → I request changes → AI revises → I approve → move to next doc
- Each document references the previous one, so the design is traceable back to requirements
- Tasks are ordered so each one produces demoable functionality and builds on the previous

I didn't write these from scratch — but I did make every non-trivial decision (tech stack, Supabase, hybrid state machine enforcement, pagination scope).

---

## 5. Code Generation

For implementation, I switched from Plan mode to execution mode and worked task-by-task:

- I told the AI to "execute tasks as per tasks.md" one at a time
- The AI wrote the code, created files, installed dependencies, and ran verification commands
- I reviewed the output at each step before moving to the next task

What I learned works well:
- Give the AI a clear spec (tasks.md had objective + implementation guidance + test requirements for each task)
- Let it write entire files rather than asking for snippets — fewer integration issues
- Have it verify its own output (run tests, curl endpoints) before declaring done

What didn't work:
- Long multi-file changes in one prompt sometimes led to errors the AI didn't catch until I pointed them out
- Shell scripting in the terminal was fragile — multi-line bash with pipes and node had parsing issues

---

## 6. Validating AI-Generated Code

I validated at multiple levels:

**Automated:**
- Type checking (`tsc --noEmit`) on every change
- Jest tests (116 total) — AI wrote them, I verified they test the right things
- Pre-commit hooks (Husky) block commits if typecheck, tests, or build fail

**Manual:**
- I tested endpoints with curl/browser after each task
- I checked the actual UI in the browser — caught issues like table flashing on search, emoji rendering, and the opacity overlay that I replaced with skeleton loading
- I asked "why?" questions about code I didn't understand (e.g., "why is assignedTo validated as UUID?", "why is the import inline at line 21?")

**Key principle:** If I can't explain a piece of code, I ask before moving on. The AI explaining its reasoning helps me verify the logic is sound.

---

## 7. Testing

The AI wrote all test files, but the strategy was mine:

- **State machine tests first** — 48 unit tests proving the core business logic BEFORE any HTTP layer existed. This is the assignment's "signature judgment piece" so I wanted it bulletproof.
- **Integration tests for state machine** — 17 supertest cases hitting the Express app (5 valid + 9 invalid transitions + 3 edge cases)
- **Frontend component tests** — 51 tests covering StatusBadge, PriorityBadge, SearchBar (debounce), StatusControl (only valid buttons), TicketForm (validation), CommentList, and the API client

I told the AI what to test and reviewed the test cases to make sure they covered real scenarios, not just happy paths.

---

## 8. Debugging

Several real bugs came up during development. My approach:

1. **Share the exact error** — I pasted the actual error message/output, not a paraphrase
2. **Let the AI diagnose** — it usually identified the root cause quickly
3. **Verify the fix** — I tested after each fix rather than trusting "it should work now"

Examples from this project:
- **Node 25 incompatibility** — `localStorage.getItem is not a function` in Next.js. AI systematically eliminated causes (removed Zustand, minimal page, different Node version) to isolate it to Node 25.
- **Supabase port blocking** — Port 5432 and 6543 both failed. AI checked which ports were open with `nc -zv` and identified the session-mode pooler on port 5432 as the working option.
- **FTS stop words** — `search=t` returned nothing. AI explained PostgreSQL English stemmer drops single chars and implemented a dual-strategy (ILIKE for short, FTS for long).

---

## 9. Code Review

I used the AI for review in two ways:

**AI reviewing its own code (prompted by me):**
- "Recheck the codebase and remove unused, false branding, hardcoded copyright" → caught `/api/v1/ping` placeholder, duplicate `tests/setup.ts`, committed `tsconfig.tsbuildinfo`
- Asked about specific code ("why is this import here?") → identified a misleading pattern and fixed it

**Me reviewing AI code:**
- Caught missing API contract in design doc
- Rejected emoji in empty state (unreliable cross-platform)
- Requested skeleton instead of opacity overlay for search UX
- Asked for Jira-style clickable rows instead of just link text
- Added rate limiting (AI didn't include it unprompted)
- Added pagination (not in original scope but needed for real UX)

The AI generates code that works, but UX judgment, architecture decisions, and "does this feel right?" are mine.

---

## 10. What I Avoid Sharing

- **Real credentials** — I didn't paste database passwords or API keys directly into prompts. The AI's workspace has access to `.env` files (it needs to run commands), but I ensured secrets are excluded from git via `.gitignore` and never echoed back in responses. The AI itself masks sensitive values in output . In a production setting I'd use a secrets manager (AWS Secrets Manager, macOS Keychain  for local etc), but for local development the `.env` + `.gitignore` pattern is the quick and standard approach.
- **Company-internal context** — I stripped the assignment brief of any company-specific information before sharing it with the AI. Only project requirements and technical expectations remained in the workspace.
- **Personal data** — No real user data in seed files — all fictional (Alice, Bob, Carol with `@example.com` domains).

---

## 11. Reusing This Workflow in a Real Project

This workflow scales beyond an assessment. What I'd keep:

1. **Spec-first** — requirements.md → design.md → tasks.md before any code. This front-loads decisions and gives the AI clear constraints.

2. **Incremental execution** — one task at a time, each producing testable output. Don't ask for "build the whole app" in one prompt.

3. **Test-driven** — write (or have AI write) tests alongside implementation. The pre-commit hook enforces this going forward.

4. **Question everything** — if I don't understand a line, I ask. The AI's explanations are faster than Stack Overflow and contextual to my exact code.

5. **Prompt history as documentation** — `prompt-history.md` serves as a decision log. 

What I'd change for a team setting:
- Use Git branches per task instead of one long session
- Have the AI generate PR descriptions from the diff
- Add lint-staged to pre-commit hooks (only check changed files for speed)
- Use the AI for code review on PRs rather than just generation


