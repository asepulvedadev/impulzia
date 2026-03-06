-- Migration 010: AI usage tracking per business/month/tool

CREATE TABLE public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,          -- format: '2026-03'
  tool TEXT NOT NULL CHECK (tool IN (
    'post_generator',
    'photo_enhancer',
    'promo_ideas',
    'description_generator',
    'review_responder',
    'price_assistant'
  )),
  usage_count INT NOT NULL DEFAULT 0,
  UNIQUE(business_id, month, tool)
);

-- Enable RLS
ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their usage"
  ON public.ai_usage FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert their usage"
  ON public.ai_usage FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their usage"
  ON public.ai_usage FOR UPDATE
  USING (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_ai_usage_business_month ON public.ai_usage(business_id, month);
CREATE INDEX idx_ai_usage_owner_id ON public.ai_usage(owner_id);
