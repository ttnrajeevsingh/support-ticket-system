# Candidate Information

**Name:** Rajeev Singh
**Role:** Technical Lead
**Primary Technology Stack:** React,Next.js, Node.js, TypeScript

**Primary AI Tool Used:** Kiro (AWS AI IDE with Claude)
**Project Option Selected:** Support Ticket Management System (Backend-heavy)

**Assessment Start Date:** 2025-07-10
**Submission Date:** 2025-07-15

## Project Summary

A full-stack support ticket management system with strict state machine enforcement.
Users create, update, search, filter, and transition tickets through a defined lifecycle.
Comments can be added to tickets. The backend rejects invalid status transitions with
clear error messages, and the frontend only renders valid transition options.

## Tools Used

| Tool | Purpose |
|------|---------|
| Kiro (AWS) | Primary AI IDE — planning, code generation, debugging, testing |
| Node.js 22 | Runtime |
| Next.js 15 | Frontend framework (App Router) |
| Express | Backend API framework |
| TypeScript | Type safety across full stack |
| Prisma | ORM and database migrations |
| Supabase | Hosted PostgreSQL database |
| Jest | Testing (unit + integration + component) |
| Zustand | Client-side state management |
| Husky | Pre-commit hooks |

## Setup Summary

1. Clone repo → `npm install` in root, server, and client
2. Create Supabase project → copy session-mode connection string
3. Configure `server/.env` with DATABASE_URL and DIRECT_URL
4. Run `npx prisma migrate deploy` → `npx prisma db seed`
5. Start server (`npm run dev` in server/) and client (`npm run dev` in client/)
6. Open http://localhost:3000

Full instructions in README.md.
