# Module: Auth

## Responsibility

Handles user authentication, session management, and route protection for the entire platform. This module manages signup and login flows via Supabase Auth (email/password and OAuth), maintains user profiles with role differentiation (user, business_owner, admin), enforces middleware-based route guards, and provides the authenticated user context consumed by all other modules.

## Structure

```
auth/
  components/        # Login form, signup form, auth guards, profile editor
  services/          # Supabase Auth wrappers (signIn, signUp, signOut, getSession)
  use-cases/         # signUpUser, signInUser, updateProfile, resetPassword
  validations/       # Zod schemas for login, signup, profile update payloads
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **profiles** — Extends `auth.users` with display_name, avatar_url, role (user | business_owner | admin), phone, city, created_at, updated_at. RLS: users can read/update their own row; admins can read all.

## Dependencies

- None (this is the foundational module; all other modules depend on auth)

## Patterns

- Use Supabase Auth helpers for Next.js (`@supabase/ssr`) with server-side client in Server Actions and middleware
- Middleware at `src/middleware.ts` refreshes session and protects routes under `/(dashboard)`
- Route groups: `(auth)` for login/signup pages, `(dashboard)` for authenticated pages
- Server Actions for all mutations (signUp, signIn, updateProfile) with Zod validation
- Store minimal data in `auth.users` metadata; extended profile in public `profiles` table
- On signup, use a Supabase database trigger to auto-create a row in `profiles`
- Never expose `service_role` key on the client; all privileged operations go through Server Actions or Route Handlers
- Role-based access checks happen in Server Actions, not in components
- Mobile-first responsive forms with Radix UI primitives + CVA variants

## Priority

V1
