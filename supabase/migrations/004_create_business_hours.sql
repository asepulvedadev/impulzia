-- Migration 004: Business hours table

CREATE TABLE public.business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read business hours"
  ON public.business_hours FOR SELECT
  USING (true);

CREATE POLICY "Business owners can manage hours"
  ON public.business_hours FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can update hours"
  ON public.business_hours FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Business owners can delete hours"
  ON public.business_hours FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = business_id AND owner_id = auth.uid()
    )
  );

-- Indexes
CREATE INDEX idx_business_hours_business ON public.business_hours(business_id);
-- Unique constraint: one entry per day per business
CREATE UNIQUE INDEX idx_business_hours_unique_day
  ON public.business_hours(business_id, day_of_week);
