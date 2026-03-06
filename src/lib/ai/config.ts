export type AiTool =
  | 'post_generator'
  | 'photo_enhancer'
  | 'promo_ideas'
  | 'description_generator'
  | 'review_responder'
  | 'price_assistant'

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium'

// Monthly usage limits per tool per tier (-1 = unlimited)
export const AI_USAGE_LIMITS: Record<SubscriptionTier, Record<AiTool, number>> = {
  free: {
    post_generator: 10,
    photo_enhancer: 5,
    promo_ideas: 5,
    description_generator: 3,
    review_responder: 5,
    price_assistant: 3,
  },
  basic: {
    post_generator: 30,
    photo_enhancer: 15,
    promo_ideas: 15,
    description_generator: 10,
    review_responder: 15,
    price_assistant: 10,
  },
  pro: {
    post_generator: 100,
    photo_enhancer: 50,
    promo_ideas: 50,
    description_generator: 30,
    review_responder: 50,
    price_assistant: 30,
  },
  premium: {
    post_generator: -1,
    photo_enhancer: -1,
    promo_ideas: -1,
    description_generator: -1,
    review_responder: -1,
    price_assistant: -1,
  },
}

// Anthropic model to use
export const AI_MODEL = 'claude-haiku-4-5-20251001'
export const AI_MODEL_MAX_TOKENS = 1024

// Tool display names in Spanish
export const AI_TOOL_LABELS: Record<AiTool, string> = {
  post_generator: 'Generador de Posts',
  photo_enhancer: 'Mejorador de Fotos',
  promo_ideas: 'Ideas de Promociones',
  description_generator: 'Generador de Descripciones',
  review_responder: 'Respuestas a Reseñas',
  price_assistant: 'Asistente de Precios',
}

export function getMonthKey(date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

export function isUnlimited(limit: number): boolean {
  return limit === -1
}
