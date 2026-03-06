import { describe, it, expect, vi, beforeEach } from 'vitest'
import { IncentiveService } from '../services/incentive.service'

// ─────────────────────────────────────────────────────────
// Supabase mock factory
// ─────────────────────────────────────────────────────────
function buildChain(terminal: { data?: unknown; error?: unknown; count?: number | null }) {
  const chain: Record<string, unknown> = {}
  const methods = [
    'from', 'select', 'insert', 'update', 'delete', 'eq', 'in',
    'gt', 'or', 'contains', 'limit', 'order', 'range', 'single',
    'maybeSingle', 'not',
  ]
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  // Make thenable for `await chain`
  chain.then = vi.fn().mockImplementation(
    (resolve: (val: unknown) => void) => Promise.resolve(terminal).then(resolve),
  )
  return chain
}

function makeMockSupabase(terminal: { data?: unknown; error?: unknown; count?: number | null }) {
  const chain = buildChain(terminal)
  const mockSupabase = {
    from: vi.fn().mockReturnValue(chain),
    rpc: vi.fn().mockResolvedValue(terminal),
    storage: {
      from: vi.fn().mockReturnValue({
        upload: vi.fn().mockResolvedValue({ error: null }),
        getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'https://cdn.example.com/img.jpg' } }),
      }),
    },
  }
  return { mockSupabase, chain }
}

// ─────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────

const mockIncentive = {
  id: 'inc-1',
  business_id: 'biz-1',
  owner_id: 'user-1',
  type: 'coupon',
  status: 'draft',
  title: '20% descuento en hamburguesas',
  discount_type: 'percentage',
  discount_value: 20,
  current_uses: 0,
  max_uses_per_user: 1,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('IncentiveService.create', () => {
  it('creates a new incentive', async () => {
    const { mockSupabase } = makeMockSupabase({ data: mockIncentive, error: null })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.create(
      {
        title: '20% descuento en hamburguesas',
        type: 'coupon',
        discount_type: 'percentage',
        discount_value: 20,
        max_uses_per_user: 1,
      },
      'biz-1',
      'user-1',
    )

    expect(result.success).toBe(true)
    expect(result.data).toEqual(mockIncentive)
  })

  it('returns error on DB failure', async () => {
    const { mockSupabase } = makeMockSupabase({ data: null, error: { message: 'DB error' } })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.create(
      { title: 'Test', type: 'reward', max_uses_per_user: 1 },
      'biz-1',
      'user-1',
    )

    expect(result.success).toBe(false)
    expect(result.error).toBe('DB error')
  })
})

describe('IncentiveService.publish', () => {
  it('publishes a draft incentive', async () => {
    const published = { ...mockIncentive, status: 'active' }
    const { mockSupabase } = makeMockSupabase({ data: published, error: null })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.publish('inc-1')

    expect(result.success).toBe(true)
    expect(result.data?.status).toBe('active')
  })

  it('returns error when no data returned', async () => {
    const { mockSupabase } = makeMockSupabase({ data: null, error: null })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.publish('inc-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('no se puede publicar')
  })
})

describe('IncentiveService.pause', () => {
  it('pauses an active incentive', async () => {
    const paused = { ...mockIncentive, status: 'paused' }
    const { mockSupabase } = makeMockSupabase({ data: paused, error: null })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.pause('inc-1')

    expect(result.success).toBe(true)
    expect(result.data?.status).toBe('paused')
  })
})

describe('IncentiveService.delete', () => {
  it('deletes a draft incentive', async () => {
    const { mockSupabase } = makeMockSupabase({ data: null, error: null })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.delete('inc-1')

    expect(result.success).toBe(true)
  })

  it('returns error on DB failure', async () => {
    const { mockSupabase } = makeMockSupabase({ data: null, error: { message: 'FK error' } })
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.delete('inc-1')

    expect(result.success).toBe(false)
  })
})

describe('IncentiveService.redeemIncentive', () => {
  it('calls RPC and returns token on success', async () => {
    const rpcResult = {
      data: {
        redemption_id: 'red-1',
        token: 'ABCD1234',
        incentive_title: '20% descuento',
        expires_at: '2026-01-02T00:00:00Z',
      },
      error: null,
    }
    const { mockSupabase } = makeMockSupabase({})
    mockSupabase.rpc = vi.fn().mockResolvedValue(rpcResult)
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.redeemIncentive('user-1', 'inc-1')

    expect(result.success).toBe(true)
    expect(result.data?.token).toBe('ABCD1234')
  })

  it('returns error when RPC returns error field', async () => {
    const rpcResult = {
      data: { error: 'Ya has utilizado este incentivo el máximo de veces permitido' },
      error: null,
    }
    const { mockSupabase } = makeMockSupabase({})
    mockSupabase.rpc = vi.fn().mockResolvedValue(rpcResult)
    const service = new IncentiveService(mockSupabase as never)

    const result = await service.redeemIncentive('user-1', 'inc-1')

    expect(result.success).toBe(false)
    expect(result.error).toContain('máximo')
  })
})

describe('IncentiveService.getActiveIncentiveCount', () => {
  it('returns count of active incentives', async () => {
    const { mockSupabase, chain } = makeMockSupabase({ count: 3, error: null })
    // Override chain for count query
    chain.then = vi.fn().mockImplementation(
      (resolve: (val: unknown) => void) =>
        Promise.resolve({ count: 3, error: null }).then(resolve),
    )
    const service = new IncentiveService(mockSupabase as never)

    const count = await service.getActiveIncentiveCount('biz-1')

    expect(count).toBe(3)
  })

  it('returns 0 on error', async () => {
    const { mockSupabase, chain } = makeMockSupabase({ count: null, error: { message: 'err' } })
    chain.then = vi.fn().mockImplementation(
      (resolve: (val: unknown) => void) =>
        Promise.resolve({ count: null, error: { message: 'err' } }).then(resolve),
    )
    const service = new IncentiveService(mockSupabase as never)

    const count = await service.getActiveIncentiveCount('biz-1')

    expect(count).toBe(0)
  })
})

describe('IncentiveService.uploadImage', () => {
  it('uploads and returns public URL', async () => {
    const { mockSupabase } = makeMockSupabase({})
    const service = new IncentiveService(mockSupabase as never)

    const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' })
    const result = await service.uploadImage(file, 'biz-1', 'inc-1')

    expect(result.success).toBe(true)
    expect(result.data).toBe('https://cdn.example.com/img.jpg')
  })
})

describe('IncentiveService.addStamp', () => {
  it('creates loyalty card if none exists', async () => {
    const newCard = {
      id: 'lc-1',
      user_id: 'user-1',
      business_id: 'biz-1',
      total_stamps: 1,
      stamps_required: 10,
      rewards_earned: 0,
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-01T00:00:00Z',
    }
    const { mockSupabase, chain } = makeMockSupabase({ data: null, error: null })
    // maybeSingle for getLoyaltyCard returns null (no existing card)
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null })
    // insert returns newCard
    chain.single = vi.fn().mockResolvedValue({ data: newCard, error: null })

    const service = new IncentiveService(mockSupabase as never)
    const result = await service.addStamp('user-1', 'biz-1')

    expect(result.success).toBe(true)
    expect(result.data?.total_stamps).toBe(1)
  })
})
