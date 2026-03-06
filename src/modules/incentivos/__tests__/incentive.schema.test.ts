import { describe, it, expect } from 'vitest'
import {
  createIncentiveSchema,
  updateIncentiveSchema,
  publishIncentiveSchema,
  incentiveFiltersSchema,
  redeemIncentiveSchema,
  validateTokenSchema,
} from '../validations/incentive.schema'

const validCoupon = {
  title: 'Descuento 20% en burger',
  type: 'coupon' as const,
  discount_type: 'percentage' as const,
  discount_value: 20,
  max_uses_per_user: 1,
}

const validReward = {
  title: 'Sello de lealtad',
  type: 'reward' as const,
}

describe('createIncentiveSchema', () => {
  it('accepts a valid coupon', () => {
    const result = createIncentiveSchema.safeParse(validCoupon)
    expect(result.success).toBe(true)
  })

  it('accepts a valid reward without discount fields', () => {
    const result = createIncentiveSchema.safeParse(validReward)
    expect(result.success).toBe(true)
  })

  it('rejects a coupon without discount_type', () => {
    const result = createIncentiveSchema.safeParse({
      title: 'Sin descuento',
      type: 'coupon',
    })
    expect(result.success).toBe(false)
    const issues = result.error?.issues ?? []
    expect(issues.some((i) => i.path.includes('discount_type'))).toBe(true)
  })

  it('rejects discount_value required for percentage type', () => {
    const result = createIncentiveSchema.safeParse({
      title: 'Prueba',
      type: 'coupon',
      discount_type: 'percentage',
    })
    expect(result.success).toBe(false)
    const issues = result.error?.issues ?? []
    expect(issues.some((i) => i.path.includes('discount_value'))).toBe(true)
  })

  it('rejects percentage > 100', () => {
    const result = createIncentiveSchema.safeParse({
      ...validCoupon,
      discount_value: 150,
    })
    expect(result.success).toBe(false)
  })

  it('accepts free_item without discount_value', () => {
    const result = createIncentiveSchema.safeParse({
      title: 'Lleva 3 paga 2',
      type: 'combo',
      discount_type: 'free_item',
    })
    expect(result.success).toBe(true)
  })

  it('rejects end_date before start_date', () => {
    const result = createIncentiveSchema.safeParse({
      ...validCoupon,
      start_date: '2027-01-10T00:00:00Z',
      end_date: '2027-01-05T00:00:00Z',
    })
    expect(result.success).toBe(false)
    const issues = result.error?.issues ?? []
    expect(issues.some((i) => i.path.includes('end_date'))).toBe(true)
  })

  it('rejects end_date in the past', () => {
    const result = createIncentiveSchema.safeParse({
      ...validCoupon,
      end_date: '2020-01-01T00:00:00Z',
    })
    expect(result.success).toBe(false)
  })

  it('rejects title shorter than 3 chars', () => {
    const result = createIncentiveSchema.safeParse({ ...validCoupon, title: 'AB' })
    expect(result.success).toBe(false)
  })

  it('rejects title longer than 100 chars', () => {
    const result = createIncentiveSchema.safeParse({ ...validCoupon, title: 'A'.repeat(101) })
    expect(result.success).toBe(false)
  })

  it('rejects invalid code format', () => {
    const result = createIncentiveSchema.safeParse({ ...validCoupon, code: 'invalid code!' })
    expect(result.success).toBe(false)
  })

  it('accepts valid uppercase code', () => {
    const result = createIncentiveSchema.safeParse({ ...validCoupon, code: 'PROMO2026' })
    expect(result.success).toBe(true)
  })

  it('defaults max_uses_per_user to 1', () => {
    const result = createIncentiveSchema.safeParse({
      title: 'Test reward',
      type: 'reward',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.max_uses_per_user).toBe(1)
    }
  })
})

describe('updateIncentiveSchema', () => {
  it('accepts partial update', () => {
    const result = updateIncentiveSchema.safeParse({ title: 'Nuevo título' })
    expect(result.success).toBe(true)
  })

  it('accepts empty object', () => {
    const result = updateIncentiveSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('rejects discount without value', () => {
    const result = updateIncentiveSchema.safeParse({ discount_type: 'fixed_amount' })
    expect(result.success).toBe(false)
    const issues = result.error?.issues ?? []
    expect(issues.some((i) => i.path.includes('discount_value'))).toBe(true)
  })
})

describe('publishIncentiveSchema', () => {
  it('accepts a valid coupon to publish', () => {
    const result = publishIncentiveSchema.safeParse({
      title: 'Descuento especial',
      type: 'coupon',
      discount_type: 'percentage',
      discount_value: 15,
    })
    expect(result.success).toBe(true)
  })

  it('rejects coupon without discount_type', () => {
    const result = publishIncentiveSchema.safeParse({
      title: 'Descuento especial',
      type: 'coupon',
    })
    expect(result.success).toBe(false)
  })

  it('rejects expired end_date', () => {
    const result = publishIncentiveSchema.safeParse({
      title: 'Prueba',
      type: 'reward',
      end_date: '2020-01-01T00:00:00Z',
    })
    expect(result.success).toBe(false)
  })

  it('accepts reward without discount fields', () => {
    const result = publishIncentiveSchema.safeParse({
      title: 'Sello de lealtad',
      type: 'reward',
    })
    expect(result.success).toBe(true)
  })
})

describe('incentiveFiltersSchema', () => {
  it('applies defaults', () => {
    const result = incentiveFiltersSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.city).toBe('Cúcuta')
      expect(result.data.limit).toBe(12)
      expect(result.data.offset).toBe(0)
    }
  })

  it('rejects limit > 50', () => {
    const result = incentiveFiltersSchema.safeParse({ limit: 100 })
    expect(result.success).toBe(false)
  })

  it('accepts valid type filter', () => {
    const result = incentiveFiltersSchema.safeParse({ type: 'coupon' })
    expect(result.success).toBe(true)
  })
})

describe('redeemIncentiveSchema', () => {
  it('accepts valid UUID', () => {
    const result = redeemIncentiveSchema.safeParse({
      incentive_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
  })

  it('rejects non-UUID', () => {
    const result = redeemIncentiveSchema.safeParse({ incentive_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })
})

describe('validateTokenSchema', () => {
  it('accepts valid 8-char uppercase token', () => {
    const result = validateTokenSchema.safeParse({ token: 'AB3D5F7G' })
    expect(result.success).toBe(true)
  })

  it('rejects lowercase token', () => {
    const result = validateTokenSchema.safeParse({ token: 'ab3d5f7g' })
    expect(result.success).toBe(false)
  })

  it('rejects token with wrong length', () => {
    const result = validateTokenSchema.safeParse({ token: 'TOOSHORT' })
    // 8 chars — actually valid. Let's test 7 chars
    const r2 = validateTokenSchema.safeParse({ token: 'TOOSHOR' })
    expect(r2.success).toBe(false)
  })

  it('rejects token with special characters', () => {
    const result = validateTokenSchema.safeParse({ token: 'AB3D5F!G' })
    expect(result.success).toBe(false)
  })
})
