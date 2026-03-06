-- Migration 002: Business categories table
-- Must be created before businesses (FK reference)

CREATE TABLE public.business_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  description TEXT,
  parent_id UUID REFERENCES public.business_categories(id),
  sort_order INT DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.business_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can read active categories"
  ON public.business_categories FOR SELECT
  USING (is_active = true);

CREATE POLICY "Only admins can insert categories"
  ON public.business_categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Only admins can update categories"
  ON public.business_categories FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Indexes
CREATE INDEX idx_business_categories_parent ON public.business_categories(parent_id);
CREATE INDEX idx_business_categories_slug ON public.business_categories(slug);

-- Seed initial categories
INSERT INTO public.business_categories (name, slug, icon, sort_order) VALUES
  ('Restaurantes', 'restaurantes', 'UtensilsCrossed', 1),
  ('Cafeterías', 'cafeterias', 'Coffee', 2),
  ('Tiendas de Ropa', 'tiendas-de-ropa', 'Shirt', 3),
  ('Tecnología', 'tecnologia', 'Laptop', 4),
  ('Belleza y Salud', 'belleza-y-salud', 'Sparkles', 5),
  ('Deportes', 'deportes', 'Dumbbell', 6),
  ('Hogar', 'hogar', 'Home', 7),
  ('Servicios Profesionales', 'servicios-profesionales', 'Briefcase', 8),
  ('Educación', 'educacion', 'GraduationCap', 9),
  ('Entretenimiento', 'entretenimiento', 'Music', 10),
  ('Mascotas', 'mascotas', 'PawPrint', 11),
  ('Automotriz', 'automotriz', 'Car', 12);
