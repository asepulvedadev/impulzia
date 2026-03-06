-- Migration 005: Ads table (local advertising)

CREATE TABLE public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('banner', 'featured', 'promotion')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'pending_review', 'active', 'paused', 'expired', 'rejected')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  cta_text TEXT DEFAULT 'Ver más',
  cta_url TEXT,
  target_categories UUID[],
  target_neighborhoods TEXT[],
  target_cities TEXT[] DEFAULT '{Cúcuta}',
  schedule_start TIMESTAMPTZ,
  schedule_end TIMESTAMPTZ,
  daily_start_hour INT CHECK (daily_start_hour BETWEEN 0 AND 23),
  daily_end_hour INT CHECK (daily_end_hour BETWEEN 0 AND 23),
  budget_type TEXT NOT NULL DEFAULT 'free'
    CHECK (budget_type IN ('free', 'basic', 'pro', 'premium')),
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE public.ads
  ADD CONSTRAINT ads_title_length CHECK (char_length(title) <= 80);

ALTER TABLE public.ads
  ADD CONSTRAINT ads_description_length CHECK (char_length(description) <= 300);

ALTER TABLE public.ads
  ADD CONSTRAINT ads_cta_text_length CHECK (char_length(cta_text) <= 30);

ALTER TABLE public.ads
  ADD CONSTRAINT ads_schedule_order
  CHECK (schedule_end IS NULL OR schedule_start IS NULL OR schedule_end > schedule_start);

ALTER TABLE public.ads
  ADD CONSTRAINT ads_daily_hours_order
  CHECK (daily_end_hour IS NULL OR daily_start_hour IS NULL OR daily_end_hour > daily_start_hour);

-- Enable RLS
ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Authenticated users can view active, non-expired ads. Owners see all their own.
CREATE POLICY "Users can view active ads"
  ON public.ads FOR SELECT
  USING (
    (status = 'active' AND is_active = true AND (schedule_end IS NULL OR schedule_end > now()))
    OR auth.uid() = owner_id
  );

CREATE POLICY "Authenticated users with a business can create ads"
  ON public.ads FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their ads"
  ON public.ads FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their ads"
  ON public.ads FOR DELETE
  USING (auth.uid() = owner_id);

-- Trigger: update updated_at
CREATE TRIGGER update_ads_updated_at
  BEFORE UPDATE ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_ads_business_id ON public.ads(business_id);
CREATE INDEX idx_ads_owner_id ON public.ads(owner_id);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_type ON public.ads(type);
CREATE INDEX idx_ads_schedule ON public.ads(schedule_start, schedule_end);
CREATE INDEX idx_ads_active ON public.ads(is_active);
CREATE INDEX idx_ads_priority ON public.ads(priority DESC);
