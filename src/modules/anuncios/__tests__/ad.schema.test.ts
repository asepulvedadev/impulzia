import { describe, it, expect } from 'vitest'
import {
  createAdSchema,
  updateAdSchema,
  publishAdSchema,
  adFiltersSchema,
} from '../validations/ad.schema'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const FUTURE_DATE = new Date(Date.now() + 86400000).toISOString() // +1 day
const FAR_FUTURE_DATE = new Date(Date.now() + 86400000 * 7).toISOString() // +7 days
const PAST_DATE = new Date(Date.now() - 86400000).toISOString() // -1 day

describe('createAdSchema', () => {
  const validBase = {
    title: 'Mi primer anuncio',
    type: 'featured' as const,
    schedule_start: FUTURE_DATE,
    schedule_end: FAR_FUTURE_DATE,
  }

  it('accepts a valid featured ad', () => {
    const result = createAdSchema.safeParse(validBase)
    expect(result.success).toBe(true)
  })

  it('accepts a valid banner ad with image', () => {
    const result = createAdSchema.safeParse({
      ...validBase,
      type: 'banner',
      image_url: 'https://example.com/image.jpg',
    })
    expect(result.success).toBe(true)
  })

  it('rejects banner without image_url', () => {
    const result = createAdSchema.safeParse({ ...validBase, type: 'banner' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/imagen/i)
  })

  it('rejects title shorter than 5 chars', () => {
    const result = createAdSchema.safeParse({ ...validBase, title: 'Hi' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('5')
  })

  it('rejects title longer than 80 chars', () => {
    const result = createAdSchema.safeParse({ ...validBase, title: 'A'.repeat(81) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('80')
  })

  it('rejects description longer than 300 chars', () => {
    const result = createAdSchema.safeParse({ ...validBase, description: 'A'.repeat(301) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('300')
  })

  it('rejects invalid type', () => {
    const result = createAdSchema.safeParse({ ...validBase, type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid image_url', () => {
    const result = createAdSchema.safeParse({ ...validBase, image_url: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects cta_text longer than 30 chars', () => {
    const result = createAdSchema.safeParse({ ...validBase, cta_text: 'A'.repeat(31) })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toContain('30')
  })

  it('rejects invalid cta_url', () => {
    const result = createAdSchema.safeParse({ ...validBase, cta_url: 'not-a-url' })
    expect(result.success).toBe(false)
  })

  it('rejects invalid UUID in target_categories', () => {
    const result = createAdSchema.safeParse({ ...validBase, target_categories: ['not-a-uuid'] })
    expect(result.success).toBe(false)
  })

  it('accepts valid UUIDs in target_categories', () => {
    const result = createAdSchema.safeParse({
      ...validBase,
      target_categories: [VALID_UUID],
    })
    expect(result.success).toBe(true)
  })

  it('rejects schedule_end before schedule_start', () => {
    const result = createAdSchema.safeParse({
      ...validBase,
      schedule_start: FAR_FUTURE_DATE,
      schedule_end: FUTURE_DATE,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/fin.*inicio|posterior/i)
  })

  it('rejects schedule_start in the past', () => {
    const result = createAdSchema.safeParse({
      ...validBase,
      schedule_start: PAST_DATE,
      schedule_end: FAR_FUTURE_DATE,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/futura|pasado/i)
  })

  it('rejects daily_start_hour out of range', () => {
    const result = createAdSchema.safeParse({ ...validBase, daily_start_hour: 24 })
    expect(result.success).toBe(false)
  })

  it('rejects daily_end_hour out of range', () => {
    const result = createAdSchema.safeParse({ ...validBase, daily_end_hour: -1 })
    expect(result.success).toBe(false)
  })

  it('rejects daily_end_hour <= daily_start_hour', () => {
    const result = createAdSchema.safeParse({
      ...validBase,
      daily_start_hour: 10,
      daily_end_hour: 10,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/mayor|hora/i)
  })

  it('accepts valid daily hours', () => {
    const result = createAdSchema.safeParse({
      ...validBase,
      daily_start_hour: 8,
      daily_end_hour: 18,
    })
    expect(result.success).toBe(true)
  })

  it('uses default cta_text when not provided', () => {
    const result = createAdSchema.safeParse(validBase)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.cta_text).toBe('Ver más')
    }
  })
})

describe('updateAdSchema', () => {
  it('accepts partial update', () => {
    const result = updateAdSchema.safeParse({ title: 'Nuevo título actualizado' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateAdSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('still validates title length if provided', () => {
    const result = updateAdSchema.safeParse({ title: 'Hi' })
    expect(result.success).toBe(false)
  })

  it('still validates image_url if provided', () => {
    const result = updateAdSchema.safeParse({ image_url: 'not-a-url' })
    expect(result.success).toBe(false)
  })
})

describe('publishAdSchema', () => {
  it('accepts a valid publish payload', () => {
    const result = publishAdSchema.safeParse({
      title: 'Mi anuncio a publicar',
      type: 'featured',
      schedule_start: FUTURE_DATE,
      schedule_end: FAR_FUTURE_DATE,
    })
    expect(result.success).toBe(true)
  })

  it('rejects banner without image_url', () => {
    const result = publishAdSchema.safeParse({
      title: 'Banner sin imagen',
      type: 'banner',
      schedule_start: FUTURE_DATE,
      schedule_end: FAR_FUTURE_DATE,
    })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].message).toMatch(/imagen/i)
  })

  it('rejects if schedule_end is in the past', () => {
    const result = publishAdSchema.safeParse({
      title: 'Anuncio expirado',
      type: 'featured',
      schedule_start: PAST_DATE,
      schedule_end: PAST_DATE,
    })
    expect(result.success).toBe(false)
  })

  it('requires title', () => {
    const result = publishAdSchema.safeParse({
      type: 'featured',
      schedule_start: FUTURE_DATE,
      schedule_end: FAR_FUTURE_DATE,
    })
    expect(result.success).toBe(false)
  })
})

describe('adFiltersSchema', () => {
  it('accepts empty filters with defaults', () => {
    const result = adFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.city).toBe('Cúcuta')
      expect(result.data.limit).toBe(5)
    }
  })

  it('accepts valid type filter', () => {
    const result = adFiltersSchema.safeParse({ type: 'banner' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid type filter', () => {
    const result = adFiltersSchema.safeParse({ type: 'invalid' })
    expect(result.success).toBe(false)
  })

  it('rejects limit > 20', () => {
    const result = adFiltersSchema.safeParse({ limit: 21 })
    expect(result.success).toBe(false)
  })

  it('rejects limit < 1', () => {
    const result = adFiltersSchema.safeParse({ limit: 0 })
    expect(result.success).toBe(false)
  })

  it('accepts valid category_id UUID', () => {
    const result = adFiltersSchema.safeParse({ category_id: VALID_UUID })
    expect(result.success).toBe(true)
  })

  it('rejects invalid category_id', () => {
    const result = adFiltersSchema.safeParse({ category_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})
