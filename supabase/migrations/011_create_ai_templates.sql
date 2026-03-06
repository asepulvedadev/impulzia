-- Migration 011: AI prompt templates (platform content)

CREATE TABLE public.ai_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tool TEXT NOT NULL CHECK (tool IN (
    'post_generator',
    'photo_enhancer',
    'promo_ideas',
    'description_generator',
    'review_responder',
    'price_assistant'
  )),
  category_slug TEXT,           -- NULL = applies to all categories
  name TEXT NOT NULL,
  description TEXT,
  prompt_template TEXT NOT NULL,-- template with {{variable}} placeholders
  variables TEXT[] NOT NULL DEFAULT '{}',
  example_output TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_templates ENABLE ROW LEVEL SECURITY;

-- Templates are public platform content (read-only for all)
CREATE POLICY "Anyone can view active templates"
  ON public.ai_templates FOR SELECT
  USING (is_active = true);

-- Indexes
CREATE INDEX idx_ai_templates_tool ON public.ai_templates(tool, is_active, sort_order);
CREATE INDEX idx_ai_templates_category ON public.ai_templates(category_slug);

-- ─────────────────────────────────────────────────────────
-- Seed: Post Generator templates
-- ─────────────────────────────────────────────────────────

INSERT INTO public.ai_templates (tool, category_slug, name, description, prompt_template, variables, sort_order)
VALUES
  -- All categories
  ('post_generator', NULL, 'Promoción del día',
   'Promociona un producto o servicio con urgencia',
   'Crea un post para {{social_network}} promocionando {{product_or_service}} del negocio {{business_name}} ubicado en {{business_city}}. Tono: {{tone}}. Incluye una oferta o descuento atractivo para hoy.',
   ARRAY['social_network', 'product_or_service', 'business_name', 'business_city', 'tone'],
   1),

  ('post_generator', NULL, 'Nuevo producto o servicio',
   'Anuncia una novedad a tus seguidores',
   'Anuncia el nuevo {{product_or_service}} que llega a {{business_name}}. Escribe el post para {{social_network}} generando expectativa y curiosidad. Tono: {{tone}}.',
   ARRAY['product_or_service', 'business_name', 'social_network', 'tone'],
   2),

  ('post_generator', NULL, 'Oferta relámpago',
   'Crea urgencia con una oferta por tiempo limitado',
   'Crea un post de urgencia para {{social_network}} anunciando una oferta relámpago de {{product_or_service}} en {{business_name}}. Destaca el tiempo limitado y la escasez. Tono: urgente y emocionante.',
   ARRAY['social_network', 'product_or_service', 'business_name'],
   3),

  ('post_generator', NULL, 'Historia del negocio',
   'Conecta con tu audiencia compartiendo tu historia',
   'Escribe un post para {{social_network}} contando brevemente la historia o misión de {{business_name}}. Que sea emotivo, auténtico y conecte con la comunidad local de {{business_city}}. Tono: {{tone}}.',
   ARRAY['social_network', 'business_name', 'business_city', 'tone'],
   4),

  -- Restaurants
  ('post_generator', 'restaurantes', 'Plato del día',
   'Muestra el plato especial de hoy',
   'Crea un post apetitoso para {{social_network}} promocionando el plato del día de {{business_name}}: {{product_or_service}}. Hazlo tan delicioso que den ganas de ir al restaurante. Tono: {{tone}}.',
   ARRAY['social_network', 'business_name', 'product_or_service', 'tone'],
   5),

  ('post_generator', 'restaurantes', 'Horario especial',
   'Comunica horarios festivos o especiales',
   'Escribe un post para {{social_network}} informando el horario especial de {{business_name}} para el próximo {{product_or_service}} (ej: festivo, evento especial). Sé claro, amigable y directo.',
   ARRAY['social_network', 'business_name', 'product_or_service'],
   6),

  -- Beauty/Salud
  ('post_generator', 'belleza', 'Antes y después',
   'Muestra transformaciones de tus servicios',
   'Crea un post para {{social_network}} de resultados antes y después del servicio {{product_or_service}} de {{business_name}}. Resalta la transformación y el profesionalismo. Tono: {{tone}}.',
   ARRAY['social_network', 'product_or_service', 'business_name', 'tone'],
   7),

-- ─────────────────────────────────────────────────────────
-- Description Generator templates
-- ─────────────────────────────────────────────────────────

  ('description_generator', NULL, 'Profesional y confiable',
   'Descripción formal que transmite experiencia',
   'Genera una descripción profesional y confiable para el negocio {{business_name}} en {{business_city}}, categoría {{business_category}}. Longitud: {{length}}. Palabras clave a incluir: {{keywords}}. Lo que nos hace únicos: {{highlight}}.',
   ARRAY['business_name', 'business_city', 'business_category', 'length', 'keywords', 'highlight'],
   1),

  ('description_generator', NULL, 'Casual y cercano',
   'Tono amigable que conecta con la comunidad',
   'Genera una descripción cercana y amigable para {{business_name}} en {{business_city}}. Habla directamente a los clientes, usa un tono cálido y colombiano. Longitud: {{length}}. Destaca: {{highlight}}.',
   ARRAY['business_name', 'business_city', 'length', 'highlight'],
   2),

  ('description_generator', NULL, 'Premium y exclusivo',
   'Posicionamiento de lujo y alta calidad',
   'Genera una descripción de lujo y exclusividad para {{business_name}} en {{business_city}}. Transmite calidad premium, atención especial y experiencia única. Longitud: {{length}}.',
   ARRAY['business_name', 'business_city', 'length'],
   3),

-- ─────────────────────────────────────────────────────────
-- Promo Ideas templates
-- ─────────────────────────────────────────────────────────

  ('promo_ideas', NULL, 'Ideas para temporada actual',
   'Aprovecha la temporada para generar más ventas',
   'Genera {{num_ideas}} ideas de promociones para el negocio {{business_name}} ({{business_category}}) en {{business_city}} para la temporada actual. Presupuesto: {{budget}}. Público objetivo: {{target_audience}}.',
   ARRAY['num_ideas', 'business_name', 'business_category', 'business_city', 'budget', 'target_audience'],
   1),

  ('promo_ideas', NULL, 'Ideas para fecha especial',
   'Capitaliza fechas importantes del calendario',
   'Genera {{num_ideas}} ideas de promociones para {{business_name}} ({{business_category}}) para la fecha especial: {{specific_date}}. Presupuesto: {{budget}}. Asegúrate de que sean ejecutables en Cúcuta, Colombia.',
   ARRAY['num_ideas', 'business_name', 'business_category', 'specific_date', 'budget'],
   2),

  ('promo_ideas', NULL, 'Ideas para fidelización',
   'Convierte clientes nuevos en clientes leales',
   'Genera {{num_ideas}} ideas de programas de fidelización para {{business_name}} en {{business_city}}. Enfócate en que los clientes vuelvan más seguido. Presupuesto: {{budget}}.',
   ARRAY['num_ideas', 'business_name', 'business_city', 'budget'],
   3);
