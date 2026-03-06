-- Migration 009: AI generations history table

CREATE TABLE public.ai_generations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Tool type
  tool TEXT NOT NULL CHECK (tool IN (
    'post_generator',
    'photo_enhancer',
    'promo_ideas',
    'description_generator',
    'review_responder',
    'price_assistant'
  )),

  -- Status
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'processing', 'completed', 'failed')),

  -- Input
  input_data JSONB NOT NULL DEFAULT '{}',
  input_image_url TEXT,

  -- Output
  output_text TEXT,
  output_image_url TEXT,
  output_data JSONB,

  -- Metadata
  model_used TEXT,
  tokens_used INT,
  processing_time_ms INT,

  -- Owner feedback
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_used BOOLEAN NOT NULL DEFAULT false,
  rating INT CHECK (rating BETWEEN 1 AND 5),

  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can view their generations"
  ON public.ai_generations FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create generations"
  ON public.ai_generations FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update their generations"
  ON public.ai_generations FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can delete their generations"
  ON public.ai_generations FOR DELETE
  USING (auth.uid() = owner_id);

-- Indexes
CREATE INDEX idx_ai_generations_business_id ON public.ai_generations(business_id);
CREATE INDEX idx_ai_generations_owner_id ON public.ai_generations(owner_id);
CREATE INDEX idx_ai_generations_tool ON public.ai_generations(tool);
CREATE INDEX idx_ai_generations_created_at ON public.ai_generations(created_at DESC);
CREATE INDEX idx_ai_generations_favorite ON public.ai_generations(owner_id, is_favorite)
  WHERE is_favorite = true;
