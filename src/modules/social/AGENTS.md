# Module: Social

## Responsibility

Enables social interactions between users and businesses on the platform. This module manages user reviews and ratings for businesses, follow relationships between users and businesses, comment threads on business posts or promotions, and activity feeds. It builds community engagement and trust through user-generated content and social proof.

## Structure

```
social/
  components/        # ReviewCard, ReviewForm, StarRating, FollowButton, CommentThread, ActivityFeed, UserAvatar
  services/          # Review CRUD, follow/unfollow service, comment CRUD, feed aggregation, moderation service
  use-cases/         # createReview, updateReview, deleteReview, followBusiness, unfollowBusiness, addComment, getFeed
  validations/       # Zod schemas for review creation, comment creation, follow actions
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **reviews** — id, user_id (FK profiles), business_id (FK businesses), rating (1-5), title, body, images (JSONB array of URLs), is_verified_purchase, status (published | flagged | removed), created_at, updated_at. RLS: authenticated users can create; users can update/delete their own; public can read published reviews.
- **follows** — id, follower_id (FK profiles), business_id (FK businesses), created_at. Unique constraint on (follower_id, business_id). RLS: authenticated users can manage their own follows; public can read follower counts.
- **comments** — id, user_id (FK profiles), parent_type (review | post | promotion), parent_id, body, status (published | flagged | removed), created_at, updated_at. RLS: authenticated users can create; users can update/delete their own; public can read published comments.
- **activity_feed** — id, actor_id (FK profiles), action_type (review | follow | comment | coupon_redeem), target_type, target_id, metadata (JSONB), created_at. RLS: public can read; insert via server triggers only.

## Dependencies

- **auth** — Requires authenticated users for all write operations (reviews, follows, comments)
- **negocios** — Reviews and follows are linked to businesses; business data needed for feed context
- **incentivos** — Verified purchase reviews may reference coupon redemptions; points awarded for reviews

## Patterns

- Star rating component built with Radix UI primitives and CVA variants (no external rating library)
- Review moderation: new reviews are auto-published; flagged reviews enter admin review queue
- One review per user per business enforced via unique constraint and validation
- Follow counts cached in Redis (Upstash) with write-through cache invalidation
- Activity feed uses fan-out-on-read pattern: query recent activities from followed businesses
- Comment threads are flat (one level deep) for V2 simplicity; no nested replies
- Optimistic UI updates for follow/unfollow and comment submission
- Server Actions for all mutations with Zod validation
- Rate limiting on review and comment creation to prevent spam (Upstash Redis)
- Image uploads for reviews stored in Supabase Storage bucket `review-assets` with max 3 images
- Mobile-first layout with pull-to-refresh on activity feed
- Supabase Realtime subscriptions for live comment updates (future enhancement)

## Priority

V2
