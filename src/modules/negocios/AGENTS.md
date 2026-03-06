# Module: Negocios

## Responsibility

Manages the full lifecycle of business profiles on the platform. This module handles business registration and verification, categorization by industry, geolocation-based search and discovery, business hours management, photo galleries via Supabase Storage, and public-facing business detail pages. It is the core entity that anuncios, incentivos, and ia modules operate upon.

## Structure

```
negocios/
  components/        # BusinessCard, BusinessForm, BusinessList, CategoryFilter, SearchBar, BusinessDetail
  services/          # CRUD operations for businesses, category service, search/filter service, storage service
  use-cases/         # createBusiness, updateBusiness, verifyBusiness, searchBusinesses, listByCategory
  validations/       # Zod schemas for business creation, update, search params
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **businesses** — id, owner_id (FK profiles), name, slug, description, category_id, subcategory_id, address, city, latitude, longitude, phone, email, website, logo_url, cover_url, is_verified, status (draft | active | suspended), created_at, updated_at. RLS: owner can CRUD their own; public can read active businesses.
- **business_categories** — id, name, slug, icon, parent_id (self-referencing for subcategories), sort_order. RLS: public read; admin write.
- **business_hours** — id, business_id (FK businesses), day_of_week (0-6), open_time, close_time, is_closed. RLS: owner can CRUD; public can read.
- **business_photos** — id, business_id (FK businesses), url, alt_text, sort_order, created_at. RLS: owner can CRUD; public can read.

## Dependencies

- **auth** — Requires authenticated user with `business_owner` role to create/manage businesses; uses `profiles.id` as owner reference

## Patterns

- Slug generation from business name for SEO-friendly URLs
- Geolocation search using PostGIS extension (`geography` type, `ST_DWithin` for radius queries)
- Supabase Storage bucket `business-assets` for logos, covers, and gallery photos with image optimization
- Server Actions for all create/update mutations with Zod validation
- Paginated listing with cursor-based pagination for infinite scroll
- Category tree loaded once and cached via Redis (Upstash) with 1-hour TTL
- Business verification is an admin-only workflow (manual for V1)
- Mobile-first card grid layout with responsive breakpoints
- Public business pages are statically generated with ISR (revalidate on update)

## Priority

V1
