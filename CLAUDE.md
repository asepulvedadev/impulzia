# IMPULZIA — Plataforma Digital Urbana con IA

## What it is

All-in-one platform connecting local businesses, entrepreneurs and users.
Advertising + incentives + marketplace + commercial social network + AI for businesses.
Initial city: Cucuta, Colombia. Vision: all of Latin America.

## Stack

- Next.js 16 (App Router) + TypeScript strict + TailwindCSS 4 + PWA
- Supabase (PostgreSQL + Auth + Storage + RLS)
- Redis (Upstash) for cache and rate limiting
- Vercel for deploy
- Radix UI + CVA for components

## Architecture

- Domain-Driven Design: each module in src/modules/{name}/
- Module = use-cases/ + validations/ + services/ + interfaces/ + components/ + **tests**/
- Server Actions for mutations, Route Handlers for APIs
- RLS active on ALL Supabase tables
- Supabase clients in src/lib/supabase/ (client.ts and server.ts)
- UI components in src/components/ui/ (Radix + CVA + Tailwind, NO shadcn)

## Commands

- `bun dev` — development
- `bun build` — production build
- `bun test` — Vitest
- `bun test:run` — Vitest single run
- `bun test:e2e` — Playwright
- `bun lint` — ESLint + Prettier
- `bun lint:fix` — auto-fix

## Non-Negotiable Rules

1. TDD mandatory: test FIRST, implementation AFTER
2. Strict TypeScript: ZERO use of `any`
3. ALWAYS validate with Zod in Server Actions and API routes
4. NEVER expose service_role key on client
5. ALL tables with RLS enabled
6. Commits: feat|fix|refactor|test|docs(module): description
7. Branches: feat/{module}/{description}
8. UI components: Radix + CVA + Tailwind (NO shadcn install, manual)
9. Mobile-first always

## Modules

auth | negocios | anuncios | incentivos | marketplace (future) | social (future) | ia

## V1 Priority

1. Auth (signup, login, route protection)
2. Negocios (business profiles, search, categories)
3. Anuncios (local advertising with targeting)
4. Incentivos (coupons, basic discounts)
5. IA Center (content generation for businesses)

## Brand Palette

- Primary: #2563EB (electric blue) — trust, tech
- Accent: #F97316 (vibrant orange) — energy, action
- Success: #10B981 (emerald) — growth
- Neutrals: slate scale
- Dark mode: slate-900 base

## Commands available

- `/plan` — Feature planning
- `/tdd` — Strict TDD flow (Red-Green-Refactor)
- `/review` — Code review

## Language

- Code, variables, commits, branches — ENGLISH
- UI, content, user-facing text — SPANISH
