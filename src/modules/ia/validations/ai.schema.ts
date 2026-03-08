import { z } from 'zod'

export const AI_TOOLS = [
  'post_generator',
  'photo_enhancer',
  'promo_ideas',
  'description_generator',
  'review_responder',
  'price_assistant',
] as const

export const AI_TONES = [
  'amigable',
  'profesional',
  'formal',
  'divertido',
  'inspirador',
  'urgente',
] as const

export const AI_SOCIAL_NETWORKS = [
  'Instagram',
  'Facebook',
  'Twitter/X',
  'WhatsApp',
  'TikTok',
] as const

export const AI_ENHANCEMENTS = [
  'background_removal',
  'brightness_contrast',
  'sharpness',
  'color_correction',
  'resize_optimize',
] as const

export type AiTool = (typeof AI_TOOLS)[number]
export type AiTone = (typeof AI_TONES)[number]
export type AiSocialNetwork = (typeof AI_SOCIAL_NETWORKS)[number]
export type AiEnhancement = (typeof AI_ENHANCEMENTS)[number]

// ─────────────────────────────────────────────────────────
// Post Generator
// ─────────────────────────────────────────────────────────

export const postGeneratorSchema = z.object({
  businessId: z.string().min(1, 'Negocio requerido'),
  templateId: z.string().min(1, 'Plantilla requerida'),
  socialNetwork: z.string().min(1, 'Red social requerida'),
  productOrService: z
    .string()
    .min(1, 'Producto o servicio requerido')
    .max(200, 'Máximo 200 caracteres'),
  tone: z.string().min(1, 'Tono requerido'),
  customPrompt: z.string().max(500).optional(),
  additionalVariables: z.record(z.string(), z.string()).default({}),
})

export type PostGeneratorInput = z.infer<typeof postGeneratorSchema>

// ─────────────────────────────────────────────────────────
// Photo Enhancer
// ─────────────────────────────────────────────────────────

export const photoEnhancerSchema = z.object({
  businessId: z.string().min(1, 'Negocio requerido'),
  imageUrl: z.string().url('URL de imagen inválida'),
  enhancement: z.enum(AI_ENHANCEMENTS, {
    error: 'Tipo de mejora inválido',
  }),
  instructions: z.string().max(300).optional(),
})

export type PhotoEnhancerInput = z.infer<typeof photoEnhancerSchema>

// ─────────────────────────────────────────────────────────
// Promo Ideas
// ─────────────────────────────────────────────────────────

export const promoIdeasSchema = z.object({
  businessId: z.string().min(1, 'Negocio requerido'),
  templateId: z.string().min(1, 'Plantilla requerida'),
  numIdeas: z.number().int().min(1, 'Mínimo 1 idea').max(10, 'Máximo 10 ideas'),
  budget: z.string().min(1, 'Presupuesto requerido'),
  targetAudience: z.string().min(1, 'Público objetivo requerido').max(200),
  additionalVariables: z.record(z.string(), z.string()).default({}),
})

export type PromoIdeasInput = z.infer<typeof promoIdeasSchema>

// ─────────────────────────────────────────────────────────
// Description Generator
// ─────────────────────────────────────────────────────────

export const descriptionGeneratorSchema = z.object({
  businessId: z.string().min(1, 'Negocio requerido'),
  templateId: z.string().min(1, 'Plantilla requerida'),
  length: z.enum(['corta', 'media', 'larga'], {
    error: 'Longitud inválida: corta, media o larga',
  }),
  keywords: z.string().max(300).default(''),
  highlight: z.string().max(300).default(''),
  tone: z.string().min(1, 'Tono requerido'),
})

export type DescriptionGeneratorInput = z.infer<typeof descriptionGeneratorSchema>

// ─────────────────────────────────────────────────────────
// Review Responder
// ─────────────────────────────────────────────────────────

export const reviewResponderSchema = z.object({
  businessId: z.string().min(1, 'Negocio requerido'),
  reviewText: z
    .string()
    .min(1, 'Texto de reseña requerido')
    .max(1000, 'Máximo 1000 caracteres'),
  rating: z.number().int().min(1, 'Mínimo 1 estrella').max(5, 'Máximo 5 estrellas'),
  reviewerName: z.string().max(100).default('Cliente'),
  tone: z.enum(['formal', 'amigable', 'profesional'], {
    error: 'Tono inválido: formal, amigable o profesional',
  }),
})

export type ReviewResponderInput = z.infer<typeof reviewResponderSchema>

// ─────────────────────────────────────────────────────────
// Price Assistant
// ─────────────────────────────────────────────────────────

const numericString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Debe ser un número válido')

export const priceAssistantSchema = z.object({
  businessId: z.string().min(1, 'Negocio requerido'),
  productOrService: z.string().min(1, 'Producto o servicio requerido').max(200),
  currentPrice: numericString,
  costPrice: numericString,
  competitorPrice: z
    .string()
    .refine((v) => v === '' || /^\d+(\.\d{1,2})?$/.test(v), 'Debe ser un número válido')
    .default(''),
  targetMargin: z
    .string()
    .refine((v) => v === '' || /^\d+(\.\d{1,2})?$/.test(v), 'Debe ser un número válido')
    .default(''),
})

export type PriceAssistantInput = z.infer<typeof priceAssistantSchema>

// ─────────────────────────────────────────────────────────
// AI Generation History Filters
// ─────────────────────────────────────────────────────────

export const aiGenerationFilterSchema = z.object({
  tool: z.enum(AI_TOOLS).optional(),
  onlyFavorites: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(20),
  offset: z.number().int().min(0).default(0),
})

export type AiGenerationFilters = z.infer<typeof aiGenerationFilterSchema>

// ─────────────────────────────────────────────────────────
// Rating update
// ─────────────────────────────────────────────────────────

export const rateGenerationSchema = z.object({
  generationId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
})

export type RateGenerationInput = z.infer<typeof rateGenerationSchema>
