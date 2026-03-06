import { describe, it, expect, vi } from 'vitest'
import { createAdUseCase } from '../use-cases/create-ad'
import { updateAdUseCase } from '../use-cases/update-ad'
import { getActiveAdsUseCase } from '../use-cases/get-active-ads'
import type { AdService } from '../services/ad.service'

const AD_ID = '550e8400-e29b-41d4-a716-446655440000'
const BUSINESS_ID = '550e8400-e29b-41d4-a716-446655440001'
const OWNER_ID = '550e8400-e29b-41d4-a716-446655440002'
const FUTURE = new Date(Date.now() + 86400000).toISOString()
const FAR_FUTURE = new Date(Date.now() + 86400000 * 7).toISOString()

const mockAd = {
  id: AD_ID,
  business_id: BUSINESS_ID,
  owner_id: OWNER_ID,
  type: 'featured' as const,
  status: 'draft' as const,
  title: 'Anuncio válido para crear',
  description: null,
  image_url: null,
  cta_text: 'Ver más',
  cta_url: null,
  target_categories: null,
  target_neighborhoods: null,
  target_cities: ['Cúcuta'],
  schedule_start: FUTURE,
  schedule_end: FAR_FUTURE,
  daily_start_hour: null,
  daily_end_hour: null,
  budget_type: 'free' as const,
  priority: 0,
  is_active: true,
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

describe('createAdUseCase', () => {
  it('calls service.create with validated data', async () => {
    const service = {
      create: vi.fn().mockResolvedValue({ data: mockAd, error: null, success: true }),
    } as unknown as AdService

    const result = await createAdUseCase(
      service,
      { title: 'Anuncio válido para crear', type: 'featured' },
      OWNER_ID,
      BUSINESS_ID,
    )

    expect(result.success).toBe(true)
    expect(service.create).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Anuncio válido para crear', type: 'featured' }),
      OWNER_ID,
      BUSINESS_ID,
    )
  })

  it('returns validation error for invalid input', async () => {
    const service = {
      create: vi.fn(),
    } as unknown as AdService

    const result = await createAdUseCase(service, { title: 'Hi' }, OWNER_ID, BUSINESS_ID)

    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
    expect(service.create).not.toHaveBeenCalled()
  })

  it('returns validation error for banner without image', async () => {
    const service = { create: vi.fn() } as unknown as AdService

    const result = await createAdUseCase(
      service,
      { title: 'Banner sin imagen', type: 'banner' },
      OWNER_ID,
      BUSINESS_ID,
    )

    expect(result.success).toBe(false)
    expect(result.error).toMatch(/imagen/i)
  })
})

describe('updateAdUseCase', () => {
  it('calls service.update with validated data', async () => {
    const service = {
      update: vi.fn().mockResolvedValue({ data: mockAd, error: null, success: true }),
    } as unknown as AdService

    const result = await updateAdUseCase(service, AD_ID, { title: 'Título actualizado' }, OWNER_ID)

    expect(result.success).toBe(true)
    expect(service.update).toHaveBeenCalledWith(
      AD_ID,
      expect.objectContaining({ title: 'Título actualizado' }),
      OWNER_ID,
    )
  })

  it('returns validation error for invalid URL', async () => {
    const service = { update: vi.fn() } as unknown as AdService

    const result = await updateAdUseCase(service, AD_ID, { image_url: 'not-a-url' }, OWNER_ID)

    expect(result.success).toBe(false)
    expect(service.update).not.toHaveBeenCalled()
  })

  it('accepts empty update', async () => {
    const service = {
      update: vi.fn().mockResolvedValue({ data: mockAd, error: null, success: true }),
    } as unknown as AdService

    const result = await updateAdUseCase(service, AD_ID, {}, OWNER_ID)
    expect(result.success).toBe(true)
  })
})

describe('getActiveAdsUseCase', () => {
  it('calls service.getActiveAds with validated filters', async () => {
    const service = {
      getActiveAds: vi.fn().mockResolvedValue({ data: [mockAd], error: null, success: true }),
    } as unknown as AdService

    const result = await getActiveAdsUseCase(service, { city: 'Cúcuta', limit: 5 })

    expect(result.success).toBe(true)
    expect(service.getActiveAds).toHaveBeenCalledWith(
      expect.objectContaining({ city: 'Cúcuta', limit: 5 }),
    )
  })

  it('returns validation error for invalid limit', async () => {
    const service = { getActiveAds: vi.fn() } as unknown as AdService

    const result = await getActiveAdsUseCase(service, { limit: 100 })

    expect(result.success).toBe(false)
    expect(service.getActiveAds).not.toHaveBeenCalled()
  })

  it('applies Cúcuta as default city', async () => {
    const service = {
      getActiveAds: vi.fn().mockResolvedValue({ data: [], error: null, success: true }),
    } as unknown as AdService

    await getActiveAdsUseCase(service, {})

    expect(service.getActiveAds).toHaveBeenCalledWith(expect.objectContaining({ city: 'Cúcuta' }))
  })
})
