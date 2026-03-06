import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AdService } from '../services/ad.service'

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
  title: 'Mi anuncio de prueba',
  description: 'Descripción del anuncio',
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

const mockBusiness = {
  id: BUSINESS_ID,
  owner_id: OWNER_ID,
  subscription_tier: 'free' as const,
}

function buildChain(terminal: Record<string, unknown>) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'in',
    'is',
    'or',
    'order',
    'range',
    'limit',
    'filter',
    'overlaps',
    'contains',
    'gte',
    'lte',
    'gt',
    'lt',
    'not',
  ]
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnThis()
  }
  chain.single = vi.fn().mockResolvedValue(terminal)
  chain.maybeSingle = vi.fn().mockResolvedValue(terminal)
  // Make chain itself thenable so `await chain` resolves to terminal
  chain.then = vi
    .fn()
    .mockImplementation((resolve: (val: unknown) => void) =>
      Promise.resolve(terminal).then(resolve),
    )
  return chain
}

describe('AdService', () => {
  describe('create', () => {
    it('creates a draft ad successfully', async () => {
      const businessChain = buildChain({ data: mockBusiness, error: null })
      const countChain = buildChain({})
      countChain.eq = vi.fn().mockReturnThis()
      countChain.single = vi.fn().mockResolvedValue({ count: 0, error: null })
      const insertChain = buildChain({ data: mockAd, error: null })

      let callCount = 0
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'businesses') {
            callCount++
            return callCount === 1 ? businessChain : countChain
          }
          if (table === 'ads') return insertChain
          return buildChain({ data: null, error: null })
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.create(
        { title: 'Mi anuncio de prueba', type: 'featured' },
        OWNER_ID,
        BUSINESS_ID,
      )

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('draft')
    })

    it('fails if business not found', async () => {
      const businessChain = buildChain({ data: null, error: { message: 'not found' } })

      const supabase = {
        from: vi.fn().mockReturnValue(businessChain),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.create(
        { title: 'Mi anuncio', type: 'featured' },
        OWNER_ID,
        BUSINESS_ID,
      )

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/negocio/i)
    })

    it('fails when free plan limit reached', async () => {
      const businessChain = buildChain({ data: mockBusiness, error: null })
      // Active ads count = 1 (free limit reached): terminal has count=1
      const countChain = buildChain({ count: 1, error: null })

      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'businesses') return businessChain
          if (table === 'ads') return countChain
          return buildChain({ data: null, error: null })
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.create(
        { title: 'Mi anuncio', type: 'featured' },
        OWNER_ID,
        BUSINESS_ID,
      )

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/límite|plan/i)
    })
  })

  describe('getById', () => {
    it('returns ad by id', async () => {
      const chain = buildChain({ data: mockAd, error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.getById(AD_ID)

      expect(result.success).toBe(true)
      expect(result.data?.id).toBe(AD_ID)
    })

    it('returns error when not found', async () => {
      const chain = buildChain({ data: null, error: { message: 'not found' } })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.getById('non-existent')

      expect(result.success).toBe(false)
    })
  })

  describe('update', () => {
    it('updates a draft ad', async () => {
      const getChain = buildChain({ data: { ...mockAd, status: 'draft' }, error: null })
      const updateChain = buildChain({
        data: { ...mockAd, title: 'Título actualizado' },
        error: null,
      })

      let callCount = 0
      const supabase = {
        from: vi.fn().mockImplementation(() => {
          callCount++
          return callCount === 1 ? getChain : updateChain
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.update(AD_ID, { title: 'Título actualizado' }, OWNER_ID)

      expect(result.success).toBe(true)
      expect(result.data?.title).toBe('Título actualizado')
    })

    it('rejects update on active ad', async () => {
      const getChain = buildChain({ data: { ...mockAd, status: 'active' }, error: null })

      const supabase = {
        from: vi.fn().mockReturnValue(getChain),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.update(AD_ID, { title: 'Nuevo' }, OWNER_ID)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/borrador|pausado|editar/i)
    })

    it('rejects update when ad not found', async () => {
      const getChain = buildChain({ data: null, error: { message: 'not found' } })
      const supabase = { from: vi.fn().mockReturnValue(getChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.update(AD_ID, { title: 'Nuevo' }, OWNER_ID)

      expect(result.success).toBe(false)
    })
  })

  describe('publish', () => {
    it('publishes a draft ad directly to active', async () => {
      const getChain = buildChain({
        data: {
          ...mockAd,
          status: 'draft',
          title: 'Anuncio para publicar',
          schedule_start: FUTURE,
          schedule_end: FAR_FUTURE,
        },
        error: null,
      })
      const businessChain = buildChain({ data: mockBusiness, error: null })
      const countChain = buildChain({})
      countChain.single = vi.fn().mockResolvedValue({ count: 0, error: null })
      const updateChain = buildChain({ data: { ...mockAd, status: 'active' }, error: null })

      let adCalls = 0
      let bizCalls = 0

      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'ads') {
            adCalls++
            return adCalls === 1 ? getChain : updateChain
          }
          if (table === 'businesses') {
            bizCalls++
            return bizCalls === 1 ? businessChain : countChain
          }
          return buildChain({ data: null, error: null })
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.publish(AD_ID, OWNER_ID)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('active')
    })
  })

  describe('pause', () => {
    it('pauses an active ad', async () => {
      const getChain = buildChain({ data: { ...mockAd, status: 'active' }, error: null })
      const updateChain = buildChain({ data: { ...mockAd, status: 'paused' }, error: null })

      let callCount = 0
      const supabase = {
        from: vi.fn().mockImplementation(() => {
          callCount++
          return callCount === 1 ? getChain : updateChain
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.pause(AD_ID, OWNER_ID)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('paused')
    })

    it('rejects pausing a non-active ad', async () => {
      const getChain = buildChain({ data: { ...mockAd, status: 'draft' }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(getChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.pause(AD_ID, OWNER_ID)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/activo/i)
    })
  })

  describe('resume', () => {
    it('resumes a paused ad', async () => {
      const getChain = buildChain({
        data: { ...mockAd, status: 'paused', schedule_end: FAR_FUTURE },
        error: null,
      })
      const businessChain = buildChain({ data: mockBusiness, error: null })
      const countChain = buildChain({})
      countChain.single = vi.fn().mockResolvedValue({ count: 0, error: null })
      const updateChain = buildChain({ data: { ...mockAd, status: 'active' }, error: null })

      let adCalls = 0
      let bizCalls = 0
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'ads') {
            adCalls++
            return adCalls === 1 ? getChain : updateChain
          }
          if (table === 'businesses') {
            bizCalls++
            return bizCalls === 1 ? businessChain : countChain
          }
          return buildChain({ data: null, error: null })
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.resume(AD_ID, OWNER_ID)

      expect(result.success).toBe(true)
      expect(result.data?.status).toBe('active')
    })

    it('rejects resuming a non-paused ad', async () => {
      const getChain = buildChain({ data: { ...mockAd, status: 'draft' }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(getChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.resume(AD_ID, OWNER_ID)

      expect(result.success).toBe(false)
      expect(result.error).toMatch(/pausado/i)
    })
  })

  describe('delete', () => {
    it('soft deletes an ad', async () => {
      const getChain = buildChain({ data: mockAd, error: null })
      const updateChain = buildChain({ data: { ...mockAd, is_active: false }, error: null })

      let callCount = 0
      const supabase = {
        from: vi.fn().mockImplementation(() => {
          callCount++
          return callCount === 1 ? getChain : updateChain
        }),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.delete(AD_ID, OWNER_ID)

      expect(result.success).toBe(true)
    })

    it('fails if ad not found', async () => {
      const getChain = buildChain({ data: null, error: { message: 'not found' } })
      const supabase = { from: vi.fn().mockReturnValue(getChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.delete(AD_ID, OWNER_ID)

      expect(result.success).toBe(false)
    })
  })

  describe('getActiveAds', () => {
    it('returns active ads matching filters', async () => {
      const chain = buildChain({})
      chain.limit = vi.fn().mockResolvedValue({ data: [mockAd], error: null })

      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new AdService(supabase as any)
      const result = await service.getActiveAds({ city: 'Cúcuta', limit: 5 })

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })
  })
})
