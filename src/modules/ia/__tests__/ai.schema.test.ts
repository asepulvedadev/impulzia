import { describe, it, expect } from 'vitest'
import {
  postGeneratorSchema,
  photoEnhancerSchema,
  promoIdeasSchema,
  descriptionGeneratorSchema,
  reviewResponderSchema,
  priceAssistantSchema,
  aiGenerationFilterSchema,
  AI_TONES,
  AI_SOCIAL_NETWORKS,
} from '../validations/ai.schema'

// ─────────────────────────────────────────────────────────
// Post Generator
// ─────────────────────────────────────────────────────────
describe('postGeneratorSchema', () => {
  const valid = {
    businessId: 'uuid-001',
    templateId: 'tpl-001',
    socialNetwork: 'Instagram',
    productOrService: 'Hamburguesa especial',
    tone: 'amigable',
    additionalVariables: {},
  }

  it('accepts valid input', () => {
    const result = postGeneratorSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects empty businessId', () => {
    const result = postGeneratorSchema.safeParse({ ...valid, businessId: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty socialNetwork', () => {
    const result = postGeneratorSchema.safeParse({ ...valid, socialNetwork: '' })
    expect(result.success).toBe(false)
  })

  it('rejects empty productOrService', () => {
    const result = postGeneratorSchema.safeParse({ ...valid, productOrService: '' })
    expect(result.success).toBe(false)
  })

  it('rejects productOrService over 200 chars', () => {
    const result = postGeneratorSchema.safeParse({
      ...valid,
      productOrService: 'x'.repeat(201),
    })
    expect(result.success).toBe(false)
  })

  it('allows optional customPrompt', () => {
    const result = postGeneratorSchema.safeParse({
      ...valid,
      customPrompt: 'Agrega emojis divertidos',
    })
    expect(result.success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────
// Photo Enhancer
// ─────────────────────────────────────────────────────────
describe('photoEnhancerSchema', () => {
  const valid = {
    businessId: 'uuid-001',
    imageUrl: 'https://example.com/photo.jpg',
    enhancement: 'background_removal',
  }

  it('accepts valid input', () => {
    expect(photoEnhancerSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid URL', () => {
    const result = photoEnhancerSchema.safeParse({ ...valid, imageUrl: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown enhancement', () => {
    const result = photoEnhancerSchema.safeParse({ ...valid, enhancement: 'unknown_enhancement' })
    expect(result.success).toBe(false)
  })

  it('rejects empty businessId', () => {
    const result = photoEnhancerSchema.safeParse({ ...valid, businessId: '' })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
// Promo Ideas
// ─────────────────────────────────────────────────────────
describe('promoIdeasSchema', () => {
  const valid = {
    businessId: 'uuid-001',
    templateId: 'tpl-001',
    numIdeas: 5,
    budget: '500000',
    targetAudience: 'Familias jóvenes',
    additionalVariables: {},
  }

  it('accepts valid input', () => {
    expect(promoIdeasSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects numIdeas < 1', () => {
    const result = promoIdeasSchema.safeParse({ ...valid, numIdeas: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects numIdeas > 10', () => {
    const result = promoIdeasSchema.safeParse({ ...valid, numIdeas: 11 })
    expect(result.success).toBe(false)
  })

  it('rejects empty budget', () => {
    const result = promoIdeasSchema.safeParse({ ...valid, budget: '' })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
// Description Generator
// ─────────────────────────────────────────────────────────
describe('descriptionGeneratorSchema', () => {
  const valid = {
    businessId: 'uuid-001',
    templateId: 'tpl-001',
    length: 'media' as const,
    keywords: 'deliciosa comida, rápida entrega',
    highlight: 'Somos los únicos con envío gratis en Cúcuta',
    tone: 'profesional',
  }

  it('accepts valid input', () => {
    expect(descriptionGeneratorSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects invalid length', () => {
    const result = descriptionGeneratorSchema.safeParse({ ...valid, length: 'gigante' })
    expect(result.success).toBe(false)
  })

  it('rejects highlight over 300 chars', () => {
    const result = descriptionGeneratorSchema.safeParse({
      ...valid,
      highlight: 'x'.repeat(301),
    })
    expect(result.success).toBe(false)
  })

  it('accepts all valid lengths', () => {
    for (const length of ['corta', 'media', 'larga'] as const) {
      const result = descriptionGeneratorSchema.safeParse({ ...valid, length })
      expect(result.success).toBe(true)
    }
  })
})

// ─────────────────────────────────────────────────────────
// Review Responder
// ─────────────────────────────────────────────────────────
describe('reviewResponderSchema', () => {
  const valid = {
    businessId: 'uuid-001',
    reviewText: 'Excelente servicio, muy recomendado!',
    rating: 5,
    reviewerName: 'Carlos P.',
    tone: 'amigable' as const,
  }

  it('accepts valid input', () => {
    expect(reviewResponderSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects rating < 1', () => {
    const result = reviewResponderSchema.safeParse({ ...valid, rating: 0 })
    expect(result.success).toBe(false)
  })

  it('rejects rating > 5', () => {
    const result = reviewResponderSchema.safeParse({ ...valid, rating: 6 })
    expect(result.success).toBe(false)
  })

  it('rejects empty reviewText', () => {
    const result = reviewResponderSchema.safeParse({ ...valid, reviewText: '' })
    expect(result.success).toBe(false)
  })

  it('rejects reviewText over 1000 chars', () => {
    const result = reviewResponderSchema.safeParse({
      ...valid,
      reviewText: 'x'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })

  it('rejects invalid tone', () => {
    const result = reviewResponderSchema.safeParse({ ...valid, tone: 'agresivo' })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
// Price Assistant
// ─────────────────────────────────────────────────────────
describe('priceAssistantSchema', () => {
  const valid = {
    businessId: 'uuid-001',
    productOrService: 'Hamburguesa doble',
    currentPrice: '25000',
    costPrice: '10000',
    competitorPrice: '22000',
    targetMargin: '60',
  }

  it('accepts valid input', () => {
    expect(priceAssistantSchema.safeParse(valid).success).toBe(true)
  })

  it('rejects empty productOrService', () => {
    const result = priceAssistantSchema.safeParse({ ...valid, productOrService: '' })
    expect(result.success).toBe(false)
  })

  it('rejects non-numeric currentPrice', () => {
    const result = priceAssistantSchema.safeParse({ ...valid, currentPrice: 'veinte mil' })
    expect(result.success).toBe(false)
  })

  it('rejects non-numeric costPrice', () => {
    const result = priceAssistantSchema.safeParse({ ...valid, costPrice: 'diez mil' })
    expect(result.success).toBe(false)
  })

  it('accepts empty competitorPrice (optional)', () => {
    const result = priceAssistantSchema.safeParse({ ...valid, competitorPrice: '' })
    expect(result.success).toBe(true)
  })
})

// ─────────────────────────────────────────────────────────
// AI Generation Filter
// ─────────────────────────────────────────────────────────
describe('aiGenerationFilterSchema', () => {
  it('accepts empty object with defaults', () => {
    const result = aiGenerationFilterSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.limit).toBe(20)
    }
  })

  it('accepts valid filters', () => {
    const result = aiGenerationFilterSchema.safeParse({
      tool: 'post_generator',
      onlyFavorites: true,
      limit: 10,
      offset: 0,
    })
    expect(result.success).toBe(true)
  })

  it('rejects invalid tool', () => {
    const result = aiGenerationFilterSchema.safeParse({ tool: 'invalid_tool' })
    expect(result.success).toBe(false)
  })

  it('rejects limit > 100', () => {
    const result = aiGenerationFilterSchema.safeParse({ limit: 101 })
    expect(result.success).toBe(false)
  })
})

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────
describe('AI_TONES and AI_SOCIAL_NETWORKS', () => {
  it('AI_TONES is a non-empty array of strings', () => {
    expect(Array.isArray(AI_TONES)).toBe(true)
    expect(AI_TONES.length).toBeGreaterThan(0)
    AI_TONES.forEach((t) => expect(typeof t).toBe('string'))
  })

  it('AI_SOCIAL_NETWORKS is a non-empty array of strings', () => {
    expect(Array.isArray(AI_SOCIAL_NETWORKS)).toBe(true)
    expect(AI_SOCIAL_NETWORKS.length).toBeGreaterThan(0)
  })
})
