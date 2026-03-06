-- Migration 008: Incentive interactions (saved, redemptions, loyalty)

-- Helper function: generate unique 8-char alphanumeric token
CREATE OR REPLACE FUNCTION public.generate_redemption_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
  rand_index INT;
BEGIN
  FOR i IN 1..8 LOOP
    rand_index := floor(random() * length(chars) + 1)::INT;
    result := result || substr(chars, rand_index, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ─────────────────────────────────────────────────────────
-- saved_incentives: users bookmark incentives they want
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.saved_incentives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  incentive_id UUID NOT NULL REFERENCES public.incentives(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, incentive_id)
);

ALTER TABLE public.saved_incentives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their saved incentives"
  ON public.saved_incentives FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_incentives_user_id ON public.saved_incentives(user_id);
CREATE INDEX idx_saved_incentives_incentive_id ON public.saved_incentives(incentive_id);

-- ─────────────────────────────────────────────────────────
-- redemptions: tracks incentive uses by users
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  incentive_id UUID NOT NULL REFERENCES public.incentives(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  redemption_token TEXT NOT NULL UNIQUE DEFAULT public.generate_redemption_token(),
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'expired')),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their redemptions"
  ON public.redemptions FOR SELECT
  USING (auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = redemptions.business_id
        AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create redemptions"
  ON public.redemptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can confirm/cancel redemptions"
  ON public.redemptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = redemptions.business_id
        AND b.owner_id = auth.uid()
    )
  );

CREATE TRIGGER update_redemptions_updated_at
  BEFORE UPDATE ON public.redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_redemptions_user_id ON public.redemptions(user_id);
CREATE INDEX idx_redemptions_incentive_id ON public.redemptions(incentive_id);
CREATE INDEX idx_redemptions_business_id ON public.redemptions(business_id);
CREATE INDEX idx_redemptions_token ON public.redemptions(redemption_token);
CREATE INDEX idx_redemptions_status ON public.redemptions(status);
CREATE INDEX idx_redemptions_expires_at ON public.redemptions(expires_at);

-- ─────────────────────────────────────────────────────────
-- loyalty_cards: stamp-based cards per user+business
-- ─────────────────────────────────────────────────────────
CREATE TABLE public.loyalty_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  total_stamps INT NOT NULL DEFAULT 0,
  stamps_required INT NOT NULL DEFAULT 10,
  rewards_earned INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, business_id)
);

ALTER TABLE public.loyalty_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their loyalty cards"
  ON public.loyalty_cards FOR SELECT
  USING (auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = loyalty_cards.business_id
        AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "System can insert loyalty cards"
  ON public.loyalty_cards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can update loyalty cards"
  ON public.loyalty_cards FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.businesses b
      WHERE b.id = loyalty_cards.business_id
        AND b.owner_id = auth.uid()
    )
  );

CREATE TRIGGER update_loyalty_cards_updated_at
  BEFORE UPDATE ON public.loyalty_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX idx_loyalty_cards_user_id ON public.loyalty_cards(user_id);
CREATE INDEX idx_loyalty_cards_business_id ON public.loyalty_cards(business_id);

-- ─────────────────────────────────────────────────────────
-- Trigger: auto-increment current_uses on redemption insert
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_redemption_count()
RETURNS TRIGGER AS $$
BEGIN
  -- Only increment for new pending redemptions (not re-inserts)
  IF NEW.status = 'pending' THEN
    UPDATE public.incentives
    SET current_uses = current_uses + 1
    WHERE id = NEW.incentive_id;

    -- Auto-deplete if max_uses reached
    UPDATE public.incentives
    SET status = 'depleted'
    WHERE id = NEW.incentive_id
      AND max_uses IS NOT NULL
      AND current_uses >= max_uses
      AND status = 'active';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER increment_redemption_count_trigger
  AFTER INSERT ON public.redemptions
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_redemption_count();

-- ─────────────────────────────────────────────────────────
-- RPC: redeem_incentive — atomic validation + redemption
-- Returns redemption_token on success
-- ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.redeem_incentive(
  p_user_id UUID,
  p_incentive_id UUID
)
RETURNS JSON AS $$
DECLARE
  v_incentive public.incentives%ROWTYPE;
  v_user_redemptions INT;
  v_token TEXT;
  v_redemption_id UUID;
BEGIN
  -- Lock the incentive row
  SELECT * INTO v_incentive
  FROM public.incentives
  WHERE id = p_incentive_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object('error', 'Incentivo no encontrado');
  END IF;

  IF v_incentive.status != 'active' THEN
    RETURN json_build_object('error', 'El incentivo no está disponible');
  END IF;

  IF v_incentive.end_date IS NOT NULL AND v_incentive.end_date <= now() THEN
    RETURN json_build_object('error', 'El incentivo ha expirado');
  END IF;

  IF v_incentive.max_uses IS NOT NULL AND v_incentive.current_uses >= v_incentive.max_uses THEN
    RETURN json_build_object('error', 'El incentivo ha alcanzado su límite de usos');
  END IF;

  -- Check per-user limit
  SELECT COUNT(*) INTO v_user_redemptions
  FROM public.redemptions
  WHERE user_id = p_user_id
    AND incentive_id = p_incentive_id
    AND status IN ('pending', 'confirmed');

  IF v_user_redemptions >= v_incentive.max_uses_per_user THEN
    RETURN json_build_object('error', 'Ya has utilizado este incentivo el máximo de veces permitido');
  END IF;

  -- Generate unique token (retry up to 5 times)
  FOR i IN 1..5 LOOP
    v_token := public.generate_redemption_token();
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.redemptions WHERE redemption_token = v_token);
  END LOOP;

  -- Insert redemption (trigger increments current_uses)
  INSERT INTO public.redemptions (user_id, incentive_id, business_id, redemption_token, status)
  VALUES (p_user_id, p_incentive_id, v_incentive.business_id, v_token, 'pending')
  RETURNING id INTO v_redemption_id;

  RETURN json_build_object(
    'redemption_id', v_redemption_id::TEXT,
    'token', v_token,
    'incentive_title', v_incentive.title,
    'expires_at', (now() + interval '24 hours')::TEXT
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────
-- View: incentive_stats — per-incentive redemption counts
-- ─────────────────────────────────────────────────────────
CREATE VIEW public.incentive_stats AS
SELECT
  i.id AS incentive_id,
  i.business_id,
  i.owner_id,
  i.current_uses AS total_redemptions,
  COUNT(r.id) FILTER (WHERE r.status = 'confirmed') AS confirmed_redemptions,
  COUNT(r.id) FILTER (WHERE r.status = 'pending') AS pending_redemptions,
  COUNT(r.id) FILTER (WHERE r.created_at > now() - interval '7 days') AS redemptions_last_7d,
  COUNT(s.id) AS total_saved,
  i.max_uses,
  CASE
    WHEN i.max_uses IS NOT NULL AND i.max_uses > 0
    THEN ROUND((i.current_uses::numeric / i.max_uses) * 100, 1)
    ELSE NULL
  END AS usage_percentage
FROM public.incentives i
LEFT JOIN public.redemptions r ON r.incentive_id = i.id
LEFT JOIN public.saved_incentives s ON s.incentive_id = i.id
GROUP BY i.id, i.business_id, i.owner_id, i.current_uses, i.max_uses;
