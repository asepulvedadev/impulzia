# Module: IA

## Responsibility

Provides AI-powered tools for business owners to generate and optimize their commercial content. This module offers text generation for ad copy, product descriptions, social media posts, and promotional materials. It also includes image optimization suggestions, SEO recommendations, and smart content templates tailored to the business category and local market context (Cucuta, Colombia initially).

## Structure

```
ia/
  components/        # ContentGenerator, PromptBuilder, GeneratedPreview, TemplateSelector, UsageIndicator
  services/          # AI provider integration (OpenAI/Anthropic), prompt engineering, content storage, usage tracking
  use-cases/         # generateAdCopy, generateProductDescription, generateSocialPost, optimizeImage, suggestSEO
  validations/       # Zod schemas for generation requests, template parameters, content output
  __tests__/         # Unit tests for use-cases, validations, and services
```

## Supabase Tables

- **ai_generations** — id, user_id (FK profiles), business_id (FK businesses), type (ad_copy | product_description | social_post | seo_suggestion), prompt, result, model_used, tokens_used, status (pending | completed | failed), created_at. RLS: users can read their own generations.
- **ai_templates** — id, name, description, category (ad | product | social | seo), prompt_template, variables (JSONB: list of required variables), is_active, created_at. RLS: public read; admin write.
- **ai_usage** — id, user_id (FK profiles), month (YYYY-MM), generation_count, tokens_used, tier_limit, updated_at. RLS: users can read their own usage.

## Dependencies

- **auth** — Requires authenticated user (business_owner role) to access AI features
- **negocios** — Uses business profile data (name, category, description) as context for AI generation

## Patterns

- AI provider calls happen exclusively in Route Handlers or Server Actions, never on the client
- API keys for AI providers stored in environment variables, accessed only server-side
- Prompt templates are stored in the database for easy iteration without code deploys
- Content generation uses streaming responses (ReadableStream) for real-time UX feedback
- Usage tracking enforced per user per month with tier-based limits (free: 10/month, premium: 100/month)
- Rate limiting via Upstash Redis on generation endpoints (max 5 requests/minute per user)
- Generated content is saved to `ai_generations` for history, re-use, and analytics
- Prompt engineering includes local market context: city, country, currency (COP), language (Spanish)
- All generated text output is in Spanish, matching the target market
- Server Actions with Zod validation for all generation request payloads
- Mobile-first interface with step-by-step wizard for content generation
- Graceful error handling: retry logic with exponential backoff for AI provider failures

## Priority

V1
