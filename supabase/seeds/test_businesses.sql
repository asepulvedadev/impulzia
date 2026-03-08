-- ── Seed: 5 negocios de prueba ──
-- Ejecutar en Supabase SQL Editor
-- Crea un owner ficticio (sin auth real) usando un UUID fijo

DO $$
DECLARE
  v_owner_id UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_cat_rest UUID;
  v_cat_cafe UUID;
  v_cat_tech UUID;
  v_cat_bel  UUID;
  v_cat_dep  UUID;
BEGIN

  -- 1. Insertar perfil de prueba si no existe
  INSERT INTO public.profiles (id, full_name, username, role, city)
  VALUES (v_owner_id, 'Demo Owner', 'demo_owner', 'business', 'Cúcuta')
  ON CONFLICT (id) DO NOTHING;

  -- 2. Obtener IDs de categorías
  SELECT id INTO v_cat_rest FROM public.business_categories WHERE slug = 'restaurantes';
  SELECT id INTO v_cat_cafe FROM public.business_categories WHERE slug = 'cafeterias';
  SELECT id INTO v_cat_tech FROM public.business_categories WHERE slug = 'tecnologia';
  SELECT id INTO v_cat_bel  FROM public.business_categories WHERE slug = 'belleza-y-salud';
  SELECT id INTO v_cat_dep  FROM public.business_categories WHERE slug = 'deportes';

  -- 3. Insertar los 5 negocios
  INSERT INTO public.businesses
    (owner_id, name, slug, short_description, category_id, neighborhood, city, is_verified, is_featured, is_active, subscription_tier)
  VALUES
    (
      v_owner_id,
      'La Fogata Cucuteña',
      'la-fogata-cucutena',
      'Sabores auténticos de la región. Bandeja paisa, sancocho y más en el corazón de Cúcuta.',
      v_cat_rest,
      'Centro',
      'Cúcuta',
      true, true, true, 'pro'
    ),
    (
      v_owner_id,
      'Café Arte y Letras',
      'cafe-arte-y-letras',
      'Tu rincón favorito para trabajar, leer y tomar el mejor café de especialidad de la ciudad.',
      v_cat_cafe,
      'La Playa',
      'Cúcuta',
      true, true, true, 'basic'
    ),
    (
      v_owner_id,
      'TechCúcuta',
      'techcucuta',
      'Venta y reparación de computadores, celulares y accesorios tecnológicos. Soporte especializado.',
      v_cat_tech,
      'Atalaya',
      'Cúcuta',
      false, true, true, 'free'
    ),
    (
      v_owner_id,
      'Glamour Studio',
      'glamour-studio',
      'Salón de belleza premium. Corte, color, uñas y tratamientos faciales con los mejores profesionales.',
      v_cat_bel,
      'Quinta Oriental',
      'Cúcuta',
      true, true, true, 'premium'
    ),
    (
      v_owner_id,
      'FitZone Gym',
      'fitzone-gym',
      'Gimnasio equipado con máquinas de última generación, clases grupales y nutricionista incluida.',
      v_cat_dep,
      'Los Patios',
      'Cúcuta',
      true, true, true, 'pro'
    )
  ON CONFLICT (slug) DO NOTHING;

  RAISE NOTICE 'Seed completado: 5 negocios insertados.';
END $$;
