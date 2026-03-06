# Module: Incentivos

## Responsibility

Manages the incentive and loyalty system for the platform. This module handles creation and redemption of coupons and discount codes by businesses, tracks user reward points earned through platform interactions (purchases, reviews, referrals), and provides a basic loyalty program framework. It drives user engagement and repeat visits to local businesses.

## Structure

```
incentivos/
  components/        # CouponCard, CouponList, RedeemButton, PointsBalance, LoyaltyDashboard, DiscountBadge
  services/          # Coupon CRUD, redemption service, points calculation, loyalty tier service
  use-cases/         # createCoupon, redeemCoupon, validateCoupon, awardPoints, getPointsBalance, listUserCoupons
  validations/       # Zod schemas for coupon creation, redemption, points award
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **coupons** — id, business_id (FK businesses), code (unique), title, description, discount_type (percentage | fixed_amount | free_item), discount_value, min_purchase, max_uses, current_uses, max_uses_per_user, start_date, end_date, status (active | paused | expired | depleted), created_at, updated_at. RLS: business owner can CRUD their own; authenticated users can read active coupons.
- **coupon_redemptions** — id, coupon_id (FK coupons), user_id (FK profiles), redeemed_at, status (pending | confirmed | cancelled). RLS: users can read their own redemptions; business owner can read redemptions for their coupons.
- **user_points** — id, user_id (FK profiles), total_points, lifetime_points, tier (bronze | silver | gold), updated_at. RLS: users can read their own row.
- **points_transactions** — id, user_id (FK profiles), points, type (earned | spent | expired), source (coupon_redeem | review | referral | purchase), reference_id, description, created_at. RLS: users can read their own transactions.

## Dependencies

- **auth** — Requires authenticated users for coupon redemption and points tracking
- **negocios** — Coupons are created by and linked to verified businesses

## Patterns

- Coupon codes are uppercase alphanumeric, auto-generated or custom (validated for uniqueness)
- Redemption is atomic: use a Supabase RPC function to validate + redeem + increment `current_uses` in a single transaction
- Rate limiting on redemption endpoint via Upstash Redis to prevent abuse
- Points are awarded asynchronously via database triggers or edge functions after qualifying events
- Coupon validation checks: status, date range, max uses, max uses per user, min purchase amount
- Auto-expire coupons via pg_cron job checking `end_date` and `max_uses`
- Server Actions for all coupon mutations with Zod validation
- QR code generation for in-store redemption (client-side library, no server dependency)
- Mobile-first coupon cards with swipe-to-save interaction
- Loyalty tier thresholds are configurable via environment variables or admin settings

## Priority

V1
