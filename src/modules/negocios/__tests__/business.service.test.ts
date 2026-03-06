import { describe, it, expect, vi } from 'vitest'
import { BusinessService } from '../services/business.service'
import type { BusinessFormData } from '../interfaces'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const OWNER_ID = '660e8400-e29b-41d4-a716-446655440001'

const mockBusiness = {
  id: VALID_UUID,
  owner_id: OWNER_ID,
  name: 'Mi Restaurante',
  slug: 'mi-restaurante',
  description: 'Comida casera',
  short_description: 'Casera y deliciosa',
  category_id: VALID_UUID,
  logo_url: null,
  cover_url: null,
  phone: '+573001234567',
  whatsapp: null,
  email: null,
  website: null,
  address: 'Calle 10 #5-20',
  city: 'Cúcuta',
  neighborhood: 'Centro',
  latitude: null,
  longitude: null,
  is_verified: false,
  is_active: true,
  is_featured: false,
  subscription_tier: 'free' as const,
  metadata: {},
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
}

const mockCategory = {
  id: VALID_UUID,
  name: 'Restaurantes',
  slug: 'restaurantes',
  icon: 'UtensilsCrossed',
  description: null,
  parent_id: null,
  sort_order: 1,
  is_active: true,
}

// Builds a chainable query mock where each call returns a new chain
function buildChain(terminal: Record<string, unknown>) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = [
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'neq',
    'ilike',
    'or',
    'is',
    'order',
    'range',
    'limit',
  ]
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnThis()
  }
  chain.single = vi.fn().mockResolvedValue(terminal)
  chain.maybeSingle = vi.fn().mockResolvedValue(terminal)
  return chain
}

describe('BusinessService', () => {
  describe('create', () => {
    const formData: BusinessFormData = {
      name: 'Mi Restaurante',
      category_id: VALID_UUID,
      description: 'Comida casera',
      city: 'Cúcuta',
    }

    it('creates a business and returns it', async () => {
      const slugChain = buildChain({ data: null, error: null })
      const insertChain = buildChain({ data: mockBusiness, error: null })
      const updateChain = buildChain({ data: null, error: null })

      let fromCallCount = 0
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'businesses') {
            fromCallCount++
            // First call: slug check, second: insert
            return fromCallCount === 1 ? slugChain : insertChain
          }
          return updateChain // profiles
        }),
        auth: { getUser: vi.fn() },
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.create(formData, OWNER_ID)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockBusiness)
    })

    it('returns error when insert fails', async () => {
      const slugChain = buildChain({ data: null, error: null })
      const insertChain = buildChain({ data: null, error: { message: 'Insert failed' } })

      let fromCallCount = 0
      const supabase = {
        from: vi.fn().mockImplementation((table: string) => {
          if (table === 'businesses') {
            fromCallCount++
            return fromCallCount === 1 ? slugChain : insertChain
          }
          return buildChain({ data: null, error: null })
        }),
        auth: { getUser: vi.fn() },
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.create(formData, OWNER_ID)
      expect(result.success).toBe(false)
      expect(result.error).toBe('Insert failed')
    })
  })

  describe('getBySlug', () => {
    it('returns business with category', async () => {
      const chain = buildChain({
        data: { ...mockBusiness, business_categories: mockCategory },
        error: null,
      })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.getBySlug('mi-restaurante')
      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Mi Restaurante')
    })

    it('returns error when not found', async () => {
      const chain = buildChain({
        data: null,
        error: { message: 'not found', code: 'PGRST116' },
      })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.getBySlug('non-existent')
      expect(result.success).toBe(false)
    })
  })

  describe('getByOwnerId', () => {
    it('returns owner business', async () => {
      const chain = buildChain({ data: mockBusiness, error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.getByOwnerId(OWNER_ID)
      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockBusiness)
    })

    it('returns null if no business', async () => {
      const chain = buildChain({ data: null, error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.getByOwnerId(OWNER_ID)
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })
  })

  describe('update', () => {
    it('updates business fields', async () => {
      const updated = { ...mockBusiness, name: 'Nuevo Nombre' }
      const chain = buildChain({ data: updated, error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.update(VALID_UUID, { name: 'Nuevo Nombre' }, OWNER_ID)
      expect(result.success).toBe(true)
      expect(result.data?.name).toBe('Nuevo Nombre')
    })

    it('returns error on failure', async () => {
      const chain = buildChain({ data: null, error: { message: 'Update failed' } })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.update(VALID_UUID, { name: 'Nuevo' }, OWNER_ID)
      expect(result.success).toBe(false)
    })
  })

  describe('search', () => {
    it('returns paginated results', async () => {
      const cardData = [
        {
          id: VALID_UUID,
          name: 'Mi Restaurante',
          slug: 'mi-restaurante',
          short_description: 'Casera',
          logo_url: null,
          neighborhood: 'Centro',
          city: 'Cúcuta',
          is_verified: false,
          business_categories: {
            name: 'Restaurantes',
            slug: 'restaurantes',
            icon: 'UtensilsCrossed',
          },
        },
      ]

      const chain = buildChain({})
      // Override limit to return the paginated response
      chain.limit.mockResolvedValueOnce({ data: cardData, count: 1, error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.search({ page: 1, per_page: 12 })
      expect(result.success).toBe(true)
      expect(result.data).not.toBeNull()
      expect(result.data?.data).toHaveLength(1)
      expect(result.data?.total).toBe(1)
      expect(result.data?.total_pages).toBe(1)
    })
  })

  describe('getFeatured', () => {
    it('returns featured businesses', async () => {
      const featured = [
        {
          id: VALID_UUID,
          name: 'Featured',
          slug: 'featured',
          short_description: 'Great',
          logo_url: null,
          neighborhood: 'Centro',
          city: 'Cúcuta',
          is_verified: true,
          business_categories: {
            name: 'Restaurantes',
            slug: 'restaurantes',
            icon: 'UtensilsCrossed',
          },
        },
      ]
      const chain = buildChain({})
      chain.limit.mockResolvedValueOnce({ data: featured, error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.getFeatured(6)
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('getCategories', () => {
    it('returns active categories', async () => {
      const chain = buildChain({})
      chain.order.mockResolvedValueOnce({ data: [mockCategory], error: null })
      const supabase = { from: vi.fn().mockReturnValue(chain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.getCategories()
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('saveHours', () => {
    it('replaces existing hours', async () => {
      const deleteChain = buildChain({ error: null })
      const insertChain = buildChain({})
      insertChain.select.mockResolvedValueOnce({ data: [], error: null })

      let callCount = 0
      const supabase = {
        from: vi.fn().mockImplementation(() => {
          callCount++
          return callCount === 1 ? deleteChain : insertChain
        }),
      }

      const hours = Array.from({ length: 7 }, (_, i) => ({
        business_id: VALID_UUID,
        day_of_week: i,
        open_time: '08:00',
        close_time: '18:00',
        is_closed: i === 0,
      }))

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new BusinessService(supabase as any)
      const result = await service.saveHours(VALID_UUID, hours, OWNER_ID)
      expect(result.success).toBe(true)
    })
  })
})
