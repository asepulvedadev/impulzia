-- Migration 007: Incentives table (coupons, combos, rewards)

CREATE TABLE public.incentives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('coupon', 'combo', 'reward')),
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'paused', 'expired', 'depleted')),

  -- Content
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  terms TEXT,

  -- Discount details (coupon / combo)
  discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_item')),
  discount_value NUMERIC(10, 2),
  min_purchase NUMERIC(10, 2),

  -- Redemption code
  code TEXT UNIQUE,

  -- Usage limits
  max_uses INT,
  current_uses INT NOT NULL DEFAULT 0,
  max_uses_per_user INT NOT NULL DEFAULT 1,

  -- Scheduling
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,

  -- Targeting
  target_categories UUID[],
  target_neighborhoods TEXT[],
  target_cities TEXT[] DEFAULT '{Cúcuta}',

  -- Metadata
  metadata JSONB NOT NULL DEFAULT '{}',

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Constraints
ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_title_length CHECK (char_length(title) <= 100);

ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_description_length CHECK (char_length(description) <= 500);

ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_schedule_order
  CHECK (end_date IS NULL OR start_date IS NULL OR end_date > start_date);

ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_discount_value_positive
  CHECK (discount_value IS NULL OR discount_value > 0);

ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_percentage_max
  CHECK (discount_type != 'percentage' OR discount_value IS NULL OR discount_value <= 100);

ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_uses_positive
  CHECK (max_uses IS NULL OR max_uses > 0);

ALTER TABLE public.incentives
  ADD CONSTRAINT incentives_current_uses_positive
  CHECK (current_uses >= 0);

-- Enable RLS
ALTER TABLE public.incentives ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view active incentives"
  ON public.incentives FOR SELECT
  USING (
    (status = 'active' AND (end_date IS NULL OR end_date > now()))
    OR auth.uid() = owner_id
  );

CREATE POLICY "Authenticated business owners can create incentives"
  ON public.incentives FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their incentives"
  ON public.incentives FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their incentives"
  ON public.incentives FOR DELETE
  USING (auth.uid() = owner_id);

-- Trigger: update updated_at
CREATE TRIGGER update_incentives_updated_at
  BEFORE UPDATE ON public.incentives
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

-- Indexes
CREATE INDEX idx_incentives_business_id ON public.incentives(business_id);
CREATE INDEX idx_incentives_owner_id ON public.incentives(owner_id);
CREATE INDEX idx_incentives_status ON public.incentives(status);
CREATE INDEX idx_incentives_type ON public.incentives(type);
CREATE INDEX idx_incentives_code ON public.incentives(code);
CREATE INDEX idx_incentives_schedule ON public.incentives(start_date, end_date);
CREATE INDEX idx_incentives_active ON public.incentives(status, end_date)
  WHERE status = 'active';
