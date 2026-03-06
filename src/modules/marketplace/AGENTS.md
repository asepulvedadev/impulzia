# Module: Marketplace

## Responsibility

Provides a digital catalog where local businesses can list their products and services for discovery and purchase. This module manages product/service listings with pricing, inventory, categories, and media. It enables users to browse, search, and filter offerings, and lays the groundwork for future e-commerce features like cart, checkout, and order management.

## Structure

```
marketplace/
  components/        # ProductCard, ProductDetail, ServiceCard, CatalogGrid, FilterSidebar, PriceDisplay
  services/          # Product CRUD, service listing CRUD, catalog search, inventory management
  use-cases/         # createProduct, updateProduct, deleteProduct, createServiceListing, searchCatalog, filterByCategory
  validations/       # Zod schemas for product creation, service listing, search/filter params
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **products** — id, business_id (FK businesses), name, slug, description, price, compare_at_price, currency (default COP), category_id, stock_quantity, is_available, images (JSONB array of URLs), created_at, updated_at. RLS: business owner can CRUD their own; public can read available products.
- **service_listings** — id, business_id (FK businesses), name, slug, description, price_from, price_to, duration_minutes, category_id, is_available, image_url, created_at, updated_at. RLS: business owner can CRUD their own; public can read available services.
- **product_categories** — id, name, slug, icon, parent_id (self-referencing), sort_order. RLS: public read; admin write.

## Dependencies

- **auth** — Requires authenticated business_owner to manage listings
- **negocios** — Products and services belong to a verified business
- **incentivos** — Coupons can apply to specific products (future integration)

## Patterns

- Slug generation from product/service name for SEO-friendly URLs
- Price displayed in COP with Colombian locale formatting
- Product images stored in Supabase Storage bucket `product-assets` with max 5 images per product
- Full-text search using Supabase `tsvector` columns for product and service names/descriptions
- Paginated catalog with cursor-based pagination
- Server Actions for all mutations with Zod validation
- Category tree shared with negocios module where applicable, or independent product categories
- Mobile-first responsive grid with lazy-loaded images
- Static generation with ISR for public catalog pages
- No cart or checkout in V2 initial scope; focus is discovery and catalog listing

## Priority

V2
