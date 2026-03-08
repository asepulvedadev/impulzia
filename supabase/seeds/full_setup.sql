-- ══════════════════════════════════════════════════════════════
-- IMPULZIA — Setup completo: migraciones + seed de prueba
-- Ejecutar en Supabase SQL Editor (dashboard)
-- ══════════════════════════════════════════════════════════════

-- ── 001: Profiles ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'business_owner', 'admin')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  city TEXT DEFAULT 'Cúcuta',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Anyone can read active profiles') THEN
    CREATE POLICY "Anyone can read active profiles" ON public.profiles FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can update own profile') THEN
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='profiles' AND policyname='Users can insert own profile') THEN
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

-- ── 002: Business Categories ────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.business_categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='business_categories' AND policyname='Anyone can read active categories') THEN
    CREATE POLICY "Anyone can read active categories" ON public.business_categories FOR SELECT USING (is_active = true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_business_categories_parent ON public.business_categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_business_categories_slug ON public.business_categories(slug);

INSERT INTO public.business_categories (name, slug, icon, sort_order) VALUES
  ('Restaurantes',            'restaurantes',            'UtensilsCrossed', 1),
  ('Cafeterías',              'cafeterias',              'Coffee',          2),
  ('Tiendas de Ropa',         'tiendas-de-ropa',         'Shirt',           3),
  ('Tecnología',              'tecnologia',              'Laptop',          4),
  ('Belleza y Salud',         'belleza-y-salud',         'Sparkles',        5),
  ('Deportes',                'deportes',                'Dumbbell',        6),
  ('Hogar',                   'hogar',                   'Home',            7),
  ('Servicios Profesionales', 'servicios-profesionales', 'Briefcase',       8),
  ('Educación',               'educacion',               'GraduationCap',   9),
  ('Entretenimiento',         'entretenimiento',         'Music',           10),
  ('Mascotas',                'mascotas',                'PawPrint',        11),
  ('Automotriz',              'automotriz',              'Car',             12)
ON CONFLICT (slug) DO NOTHING;

-- ── 003: Businesses ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  short_description TEXT,
  category_id UUID REFERENCES public.business_categories(id),
  logo_url TEXT,
  cover_url TEXT,
  phone TEXT,
  whatsapp TEXT,
  email TEXT,
  website TEXT,
  address TEXT,
  city TEXT DEFAULT 'Cúcuta',
  neighborhood TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'basic', 'pro', 'premium')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.businesses ADD CONSTRAINT IF NOT EXISTS businesses_short_description_length
  CHECK (char_length(short_description) <= 160);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='businesses' AND policyname='Anyone can read active businesses') THEN
    CREATE POLICY "Anyone can read active businesses" ON public.businesses FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='businesses' AND policyname='Authenticated users can create businesses') THEN
    CREATE POLICY "Authenticated users can create businesses" ON public.businesses FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='businesses' AND policyname='Owners can update their businesses') THEN
    CREATE POLICY "Owners can update their businesses" ON public.businesses FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='businesses' AND policyname='Owners can delete their businesses') THEN
    CREATE POLICY "Owners can delete their businesses" ON public.businesses FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_businesses_owner    ON public.businesses(owner_id);
CREATE INDEX IF NOT EXISTS idx_businesses_category ON public.businesses(category_id);
CREATE INDEX IF NOT EXISTS idx_businesses_city     ON public.businesses(city);
CREATE INDEX IF NOT EXISTS idx_businesses_active   ON public.businesses(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_location ON public.businesses(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_businesses_slug     ON public.businesses(slug);

-- ── 004: Business Hours ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.business_hours (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  open_time TIME,
  close_time TIME,
  is_closed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.business_hours ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='business_hours' AND policyname='Anyone can read business hours') THEN
    CREATE POLICY "Anyone can read business hours" ON public.business_hours FOR SELECT USING (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_business_hours_business ON public.business_hours(business_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_business_hours_unique_day ON public.business_hours(business_id, day_of_week);

-- ── 005: Ads ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('banner', 'featured', 'promotion')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','pending_review','active','paused','expired','rejected')),
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
  budget_type TEXT NOT NULL DEFAULT 'free' CHECK (budget_type IN ('free','basic','pro','premium')),
  priority INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ads' AND policyname='Users can view active ads') THEN
    CREATE POLICY "Users can view active ads" ON public.ads FOR SELECT
      USING ((status = 'active' AND is_active = true AND (schedule_end IS NULL OR schedule_end > now())) OR auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ads' AND policyname='Authenticated users with a business can create ads') THEN
    CREATE POLICY "Authenticated users with a business can create ads" ON public.ads FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ads' AND policyname='Owners can update their ads') THEN
    CREATE POLICY "Owners can update their ads" ON public.ads FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ads' AND policyname='Owners can delete their ads') THEN
    CREATE POLICY "Owners can delete their ads" ON public.ads FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_ads_updated_at ON public.ads;
CREATE TRIGGER update_ads_updated_at BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_ads_business_id ON public.ads(business_id);
CREATE INDEX IF NOT EXISTS idx_ads_owner_id    ON public.ads(owner_id);
CREATE INDEX IF NOT EXISTS idx_ads_status      ON public.ads(status);
CREATE INDEX IF NOT EXISTS idx_ads_active      ON public.ads(is_active);
CREATE INDEX IF NOT EXISTS idx_ads_priority    ON public.ads(priority DESC);

-- ── 006: Ad Tracking ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  context TEXT CHECK (context IN ('feed','explorer','business_profile','search')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ad_impressions' AND policyname='Anyone can record impressions') THEN
    CREATE POLICY "Anyone can record impressions" ON public.ad_impressions FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ad_impressions_ad_id      ON public.ad_impressions(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_impressions_created_at ON public.ad_impressions(created_at);

CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  impression_id UUID REFERENCES public.ad_impressions(id) ON DELETE SET NULL,
  viewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  viewer_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ad_clicks' AND policyname='Anyone can record clicks') THEN
    CREATE POLICY "Anyone can record clicks" ON public.ad_clicks FOR INSERT WITH CHECK (true);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_ad_clicks_ad_id      ON public.ad_clicks(ad_id);
CREATE INDEX IF NOT EXISTS idx_ad_clicks_created_at ON public.ad_clicks(created_at);

-- ── 007: Incentives ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.incentives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('coupon','combo','reward')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','active','paused','expired','depleted')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  terms TEXT,
  discount_type TEXT CHECK (discount_type IN ('percentage','fixed_amount','free_item')),
  discount_value NUMERIC(10, 2),
  min_purchase NUMERIC(10, 2),
  code TEXT UNIQUE,
  max_uses INT,
  current_uses INT NOT NULL DEFAULT 0,
  max_uses_per_user INT NOT NULL DEFAULT 1,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  target_categories UUID[],
  target_neighborhoods TEXT[],
  target_cities TEXT[] DEFAULT '{Cúcuta}',
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.incentives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incentives' AND policyname='Users can view active incentives') THEN
    CREATE POLICY "Users can view active incentives" ON public.incentives FOR SELECT
      USING ((status = 'active' AND (end_date IS NULL OR end_date > now())) OR auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incentives' AND policyname='Authenticated business owners can create incentives') THEN
    CREATE POLICY "Authenticated business owners can create incentives" ON public.incentives FOR INSERT WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incentives' AND policyname='Owners can update their incentives') THEN
    CREATE POLICY "Owners can update their incentives" ON public.incentives FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='incentives' AND policyname='Owners can delete their incentives') THEN
    CREATE POLICY "Owners can delete their incentives" ON public.incentives FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

DROP TRIGGER IF EXISTS update_incentives_updated_at ON public.incentives;
CREATE TRIGGER update_incentives_updated_at BEFORE UPDATE ON public.incentives FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE INDEX IF NOT EXISTS idx_incentives_business_id ON public.incentives(business_id);
CREATE INDEX IF NOT EXISTS idx_incentives_status      ON public.incentives(status);
CREATE INDEX IF NOT EXISTS idx_incentives_schedule    ON public.incentives(start_date, end_date);

-- ── 008: Incentive Interactions ─────────────────────────────────
CREATE OR REPLACE FUNCTION public.generate_redemption_token()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql VOLATILE;

CREATE TABLE IF NOT EXISTS public.saved_incentives (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  incentive_id UUID NOT NULL REFERENCES public.incentives(id) ON DELETE CASCADE,
  saved_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, incentive_id)
);

ALTER TABLE public.saved_incentives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='saved_incentives' AND policyname='Users manage their saved incentives') THEN
    CREATE POLICY "Users manage their saved incentives" ON public.saved_incentives FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  incentive_id UUID NOT NULL REFERENCES public.incentives(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  redemption_token TEXT NOT NULL UNIQUE DEFAULT public.generate_redemption_token(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','expired')),
  confirmed_at TIMESTAMPTZ,
  confirmed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours'),
  metadata JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.redemptions ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS idx_redemptions_user_id     ON public.redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_incentive_id ON public.redemptions(incentive_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_token       ON public.redemptions(redemption_token);
CREATE INDEX IF NOT EXISTS idx_redemptions_status      ON public.redemptions(status);

-- ── 009-011: AI tables ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ai_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  tool TEXT NOT NULL CHECK (tool IN ('post_generator','photo_enhancer','promo_ideas','description_generator','review_responder','price_assistant')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','processing','completed','failed')),
  input_data JSONB NOT NULL DEFAULT '{}',
  input_image_url TEXT,
  output_text TEXT,
  output_image_url TEXT,
  output_data JSONB,
  model_used TEXT,
  tokens_used INT,
  processing_time_ms INT,
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_used BOOLEAN NOT NULL DEFAULT false,
  rating INT CHECK (rating BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_generations' AND policyname='Owners can view their generations') THEN
    CREATE POLICY "Owners can view their generations" ON public.ai_generations FOR SELECT USING (auth.uid() = owner_id);
    CREATE POLICY "Owners can create generations"     ON public.ai_generations FOR INSERT WITH CHECK (auth.uid() = owner_id);
    CREATE POLICY "Owners can update their generations" ON public.ai_generations FOR UPDATE USING (auth.uid() = owner_id) WITH CHECK (auth.uid() = owner_id);
    CREATE POLICY "Owners can delete their generations" ON public.ai_generations FOR DELETE USING (auth.uid() = owner_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL,
  tool TEXT NOT NULL CHECK (tool IN ('post_generator','photo_enhancer','promo_ideas','description_generator','review_responder','price_assistant')),
  usage_count INT NOT NULL DEFAULT 0,
  UNIQUE(business_id, month, tool)
);

ALTER TABLE public.ai_usage ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_usage' AND policyname='Owners can view their usage') THEN
    CREATE POLICY "Owners can view their usage"   ON public.ai_usage FOR SELECT USING (auth.uid() = owner_id);
    CREATE POLICY "Owners can insert their usage" ON public.ai_usage FOR INSERT WITH CHECK (auth.uid() = owner_id);
    CREATE POLICY "Owners can update their usage" ON public.ai_usage FOR UPDATE USING (auth.uid() = owner_id);
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.ai_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool TEXT NOT NULL CHECK (tool IN ('post_generator','photo_enhancer','promo_ideas','description_generator','review_responder','price_assistant')),
  category_slug TEXT,
  name TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,
  variables TEXT[] NOT NULL DEFAULT '{}',
  example_output TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_templates ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='ai_templates' AND policyname='Anyone can view active templates') THEN
    CREATE POLICY "Anyone can view active templates" ON public.ai_templates FOR SELECT USING (is_active = true);
  END IF;
END $$;

-- ══════════════════════════════════════════════════════════════
-- SEED: 5 negocios de prueba (sin FK a auth.users)
-- Usa un usuario existente en auth.users como owner
-- ══════════════════════════════════════════════════════════════
DO $$
DECLARE
  v_owner_id UUID;
  v_cat_rest UUID;
  v_cat_cafe UUID;
  v_cat_tech UUID;
  v_cat_bel  UUID;
  v_cat_dep  UUID;
BEGIN
  -- Toma el primer usuario existente en auth.users
  SELECT id INTO v_owner_id FROM auth.users LIMIT 1;

  IF v_owner_id IS NULL THEN
    RAISE NOTICE 'No hay usuarios en auth.users. Crea un usuario primero desde Authentication > Users en el dashboard, luego vuelve a correr solo el bloque DO del seed.';
    RETURN;
  END IF;

  -- Asegurar que el profile existe
  INSERT INTO public.profiles (id, email, full_name, role, city)
  SELECT v_owner_id, email, 'Demo Owner', 'business_owner', 'Cúcuta'
  FROM auth.users WHERE id = v_owner_id
  ON CONFLICT (id) DO NOTHING;

  -- IDs de categorías
  SELECT id INTO v_cat_rest FROM public.business_categories WHERE slug = 'restaurantes';
  SELECT id INTO v_cat_cafe FROM public.business_categories WHERE slug = 'cafeterias';
  SELECT id INTO v_cat_tech FROM public.business_categories WHERE slug = 'tecnologia';
  SELECT id INTO v_cat_bel  FROM public.business_categories WHERE slug = 'belleza-y-salud';
  SELECT id INTO v_cat_dep  FROM public.business_categories WHERE slug = 'deportes';

  -- Insertar negocios
  INSERT INTO public.businesses (owner_id, name, slug, short_description, category_id, neighborhood, city, is_verified, is_featured, is_active, subscription_tier)
  VALUES
    (v_owner_id, 'La Fogata Cucuteña',  'la-fogata-cucutena',  'Sabores auténticos de la región. Bandeja paisa, sancocho y más en el corazón de Cúcuta.',         v_cat_rest, 'Centro',         'Cúcuta', true,  true, true, 'pro'),
    (v_owner_id, 'Café Arte y Letras',  'cafe-arte-y-letras',  'Tu rincón favorito para trabajar, leer y tomar el mejor café de especialidad de la ciudad.',        v_cat_cafe, 'La Playa',       'Cúcuta', true,  true, true, 'basic'),
    (v_owner_id, 'TechCúcuta',          'techcucuta',          'Venta y reparación de computadores, celulares y accesorios. Soporte especializado garantizado.',     v_cat_tech, 'Atalaya',        'Cúcuta', false, true, true, 'free'),
    (v_owner_id, 'Glamour Studio',      'glamour-studio',      'Salón de belleza premium. Corte, color, uñas y tratamientos faciales con los mejores profesionales.', v_cat_bel,  'Quinta Oriental', 'Cúcuta', true,  true, true, 'premium'),
    (v_owner_id, 'FitZone Gym',         'fitzone-gym',         'Gimnasio equipado con máquinas de última generación, clases grupales y nutricionista incluida.',     v_cat_dep,  'Los Patios',     'Cúcuta', true,  true, true, 'pro')
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE 'Seed completado con owner_id = %', v_owner_id;
END $$;
