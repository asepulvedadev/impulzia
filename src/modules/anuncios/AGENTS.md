# Module: Anuncios

## Responsibility

Manages local advertising campaigns for businesses. This module enables business owners to create, schedule, and manage promotional ads with geographic and category-based targeting. It tracks impressions and clicks for basic analytics, handles ad placement across the platform (feed, sidebar, search results), and enforces budget limits and campaign scheduling.

## Structure

```
anuncios/
  components/        # AdCard, AdBanner, AdCreator, CampaignDashboard, AdPlacement, AnalyticsSummary
  services/          # Campaign CRUD, ad serving/selection, impression tracking, analytics aggregation
  use-cases/         # createCampaign, updateCampaign, pauseCampaign, recordImpression, recordClick, getAdForPlacement
  validations/       # Zod schemas for campaign creation, update, targeting options
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **campaigns** — id, business_id (FK businesses), title, description, type (banner | card | sponsored), status (draft | active | paused | completed | expired), start_date, end_date, daily_budget, total_budget, spent, targeting_config (JSONB: city, categories, radius_km), created_at, updated_at. RLS: business owner can CRUD their own; public cannot read directly.
- **ad_creatives** — id, campaign_id (FK campaigns), image_url, headline, body_text, cta_text, cta_url, sort_order, is_active. RLS: business owner can CRUD; system reads for ad serving.
- **ad_impressions** — id, campaign_id, creative_id, user_id (nullable), placement, ip_hash, viewed_at. RLS: insert only via server; business owner can read aggregated stats for their campaigns.
- **ad_clicks** — id, impression_id (FK ad_impressions), clicked_at. RLS: insert only via server; business owner can read aggregated stats.

## Dependencies

- **auth** — Requires authenticated user with `business_owner` role to manage campaigns
- **negocios** — Campaigns are linked to a verified business; uses business categories and location for targeting

## Patterns

- Ad serving logic runs server-side via Route Handler (`/api/ads/serve`) to prevent client manipulation
- Impression and click tracking via lightweight Route Handlers with rate limiting (Upstash Redis)
- IP hashing for fraud detection without storing raw IPs (privacy-first)
- Targeting engine matches user context (city, current page category) against campaign `targeting_config`
- Daily budget enforcement: server-side check before serving; pause campaign when budget exhausted
- Campaign scheduling via `start_date`/`end_date` with a Supabase cron job (pg_cron) to auto-expire
- Analytics dashboard shows impressions, clicks, CTR, and spend per campaign and per creative
- Ad creatives stored in Supabase Storage bucket `ad-assets` with size/format validation
- Server Actions for all campaign mutations with Zod validation
- Mobile-first ad components that adapt to placement context (inline feed vs. sidebar)

## Priority

V1
