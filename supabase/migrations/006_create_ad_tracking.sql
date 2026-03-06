-- Migration 006: Ad impressions and clicks tracking tables

-- Impressions
CREATE TABLE public.ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  context TEXT CHECK (context IN ('feed', 'explorer', 'business_profile', 'search')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

-- Anyone (even anon) can insert impressions
CREATE POLICY "Anyone can record impressions"
  ON public.ad_impressions FOR INSERT
  WITH CHECK (true);

-- Only the ad owner can view impressions for their ads
CREATE POLICY "Ad owners can view impressions"
  ON public.ad_impressions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ads
      WHERE ads.id = ad_impressions.ad_id
        AND ads.owner_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_ad_impressions_ad_id ON public.ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_created_at ON public.ad_impressions(created_at);
CREATE INDEX idx_ad_impressions_dedup ON public.ad_impressions(ad_id, viewer_id);

-- Clicks
CREATE TABLE public.ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  impression_id UUID REFERENCES public.ad_impressions(id) ON DELETE SET NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

-- Anyone can record clicks
CREATE POLICY "Anyone can record clicks"
  ON public.ad_clicks FOR INSERT
  WITH CHECK (true);

-- Only the ad owner can view clicks for their ads
CREATE POLICY "Ad owners can view clicks"
  ON public.ad_clicks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.ads
      WHERE ads.id = ad_clicks.ad_id
        AND ads.owner_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_ad_clicks_ad_id ON public.ad_clicks(ad_id);
CREATE INDEX idx_ad_clicks_created_at ON public.ad_clicks(created_at);

-- Ad stats view
CREATE VIEW public.ad_stats AS
SELECT
  a.id AS ad_id,
  a.business_id,
  a.owner_id,
  COUNT(DISTINCT ai.id) AS total_impressions,
  COUNT(DISTINCT ac.id) AS total_clicks,
  CASE
    WHEN COUNT(DISTINCT ai.id) > 0
    THEN ROUND(COUNT(DISTINCT ac.id)::numeric / COUNT(DISTINCT ai.id) * 100, 2)
    ELSE 0
  END AS ctr_percentage,
  COUNT(DISTINCT ai.id) FILTER (WHERE ai.created_at > now() - interval '7 days') AS impressions_last_7d,
  COUNT(DISTINCT ac.id) FILTER (WHERE ac.created_at > now() - interval '7 days') AS clicks_last_7d
FROM public.ads a
LEFT JOIN public.ad_impressions ai ON ai.ad_id = a.id
LEFT JOIN public.ad_clicks ac ON ac.ad_id = a.id
GROUP BY a.id, a.business_id, a.owner_id;
