import { describe, it, expect, vi } from 'vitest'
import { createIncentive } from '../use-cases/create-incentive'
import { redeemIncentive } from '../use-cases/redeem-incentive'
import { confirmRedemption } from '../use-cases/confirm-redemption'

// Minimal Supabase mock
function buildChain(terminal: unknown) {
  const chain: Record<string, unknown> = {}
  const methods = [
    'from',
    'select',
    'insert',
    'update',
    'delete',
    'eq',
    'in',
    'gt',
    'or',
    'single',
    'maybeSingle',
    'limit',
    'order',
    'contains',
    'range',
    'not',
  ]
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain)
  }
  chain.then = vi
    .fn()
    .mockImplementation((resolve: (val: unknown) => void) =>
      Promise.resolve(terminal).then(resolve),
    )
  return chain
}

function makeMock(data: unknown, error: unknown = null, count: number | null = null) {
  const chain = buildChain({ data, error, count })
  return {
    from: vi.fn().mockReturnValue(chain),
    rpc: vi.fn().mockResolvedValue({ data, error }),
    storage: { from: vi.fn() },
    _chain: chain,
  }
}

describe('createIncentive use-case', () => {
  it('rejects invalid input', async () => {
    const supabase = makeMock(null)
    const result = await createIncentive(supabase as never, 'u1', 'b1', 'free', {
      title: 'AB', // too short
      type: 'coupon',
    })
    expect(result.success).toBe(false)
    expect(result.error).toBeTruthy()
  })

  it('rejects when plan limit reached', async () => {
    // Count chain returns 2 (free plan limit is 2)
    const chain = buildChain({ count: 2, error: null })
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
      rpc: vi.fn(),
      storage: { from: vi.fn() },
    }
    // Override chain.then for count query
    chain.then = vi
      .fn()
      .mockImplementation((resolve: (val: unknown) => void) =>
        Promise.resolve({ count: 2, error: null }).then(resolve),
      )

    const result = await createIncentive(supabase as never, 'u1', 'b1', 'free', {
      title: 'Descuento especial',
      type: 'coupon',
      discount_type: 'percentage',
      discount_value: 20,
      max_uses_per_user: 1,
    })
    expect(result.success).toBe(false)
    expect(result.error).toContain('límite')
  })

  it('creates when below limit', async () => {
    const created = { id: 'i1', title: 'Descuento especial', status: 'draft' }
    const chain = buildChain({ data: created, error: null })
    // Count returns 0
    chain.then = vi
      .fn()
      .mockImplementation((resolve: (val: unknown) => void) =>
        Promise.resolve({ data: created, error: null, count: 0 }).then(resolve),
      )
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
      rpc: vi.fn(),
      storage: { from: vi.fn() },
    }

    const result = await createIncentive(supabase as never, 'u1', 'b1', 'free', {
      title: 'Descuento especial',
      type: 'coupon',
      discount_type: 'percentage',
      discount_value: 20,
      max_uses_per_user: 1,
    })
    expect(result.success).toBe(true)
  })
})

describe('redeemIncentive use-case', () => {
  it('rejects invalid incentive_id', async () => {
    const supabase = makeMock(null)
    const result = await redeemIncentive(supabase as never, 'u1', { incentive_id: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('returns token on success', async () => {
    const rpcData = {
      redemption_id: 'r1',
      token: 'ABCD1234',
      incentive_title: 'Test',
      expires_at: '2026-12-31T00:00:00Z',
    }
    const supabase = makeMock(rpcData)
    const result = await redeemIncentive(supabase as never, 'u1', {
      incentive_id: '550e8400-e29b-41d4-a716-446655440000',
    })
    expect(result.success).toBe(true)
    expect(result.data?.token).toBe('ABCD1234')
  })
})

describe('confirmRedemption use-case', () => {
  it('rejects invalid token format', async () => {
    const supabase = makeMock(null)
    const result = await confirmRedemption(supabase as never, 'owner-1', { token: 'bad!' })
    expect(result.success).toBe(false)
  })

  it('confirms valid token', async () => {
    const confirmed = { id: 'r1', status: 'confirmed', redemption_token: 'ABCD1234' }
    const chain = buildChain({ data: confirmed, error: null })
    const supabase = {
      from: vi.fn().mockReturnValue(chain),
      rpc: vi.fn(),
      storage: { from: vi.fn() },
    }

    const result = await confirmRedemption(supabase as never, 'owner-1', { token: 'ABCD1234' })
    expect(result.success).toBe(true)
  })
})
