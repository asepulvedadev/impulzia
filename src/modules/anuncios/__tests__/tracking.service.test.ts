import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TrackingService } from '../services/tracking.service'

const AD_ID = '550e8400-e29b-41d4-a716-446655440000'
const VIEWER_ID = '550e8400-e29b-41d4-a716-446655440001'
const IMPRESSION_ID = '550e8400-e29b-41d4-a716-446655440002'
const VIEWER_IP = '192.168.1.1'

function buildChain(terminal: Record<string, unknown> = {}) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {}
  const methods = ['select', 'insert', 'eq', 'order', 'limit', 'gte']
  for (const m of methods) {
    chain[m] = vi.fn().mockReturnThis()
  }
  chain.single = vi.fn().mockResolvedValue(terminal)
  chain.maybeSingle = vi.fn().mockResolvedValue(terminal)
  chain.then = vi
    .fn()
    .mockImplementation((resolve: (val: unknown) => void) =>
      Promise.resolve(terminal).then(resolve),
    )
  return chain
}

function buildRedis(exists: boolean) {
  return {
    get: vi.fn().mockResolvedValue(exists ? '1' : null),
    set: vi.fn().mockResolvedValue('OK'),
    setex: vi.fn().mockResolvedValue('OK'),
  }
}

describe('TrackingService', () => {
  describe('trackImpression', () => {
    it('inserts impression when not in cache', async () => {
      const redis = buildRedis(false) // not cached
      const insertChain = buildChain({ data: { id: IMPRESSION_ID }, error: null })
      const supabase = {
        from: vi.fn().mockReturnValue(insertChain),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackImpression(AD_ID, VIEWER_ID, undefined, 'feed')

      expect(supabase.from).toHaveBeenCalledWith('ad_impressions')
      expect(redis.setex).toHaveBeenCalled()
    })

    it('skips insertion when impression is cached (dedup)', async () => {
      const redis = buildRedis(true) // cached — already tracked
      const supabase = {
        from: vi.fn(),
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackImpression(AD_ID, VIEWER_ID, undefined, 'feed')

      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('uses viewer IP for anonymous dedup', async () => {
      const redis = buildRedis(false)
      const insertChain = buildChain({ data: { id: IMPRESSION_ID }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(insertChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackImpression(AD_ID, undefined, VIEWER_IP, 'explorer')

      expect(redis.get).toHaveBeenCalledWith(expect.stringContaining(VIEWER_IP))
    })

    it('does not throw if redis fails gracefully', async () => {
      const redis = {
        get: vi.fn().mockRejectedValue(new Error('Redis down')),
        set: vi.fn(),
        setex: vi.fn(),
      }
      const insertChain = buildChain({ data: { id: IMPRESSION_ID }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(insertChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      // Should not throw
      await expect(
        service.trackImpression(AD_ID, VIEWER_ID, undefined, 'feed'),
      ).resolves.not.toThrow()
    })
  })

  describe('trackClick', () => {
    it('inserts click when not cached', async () => {
      const redis = buildRedis(false)
      const insertChain = buildChain({ data: { id: 'click-id' }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(insertChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackClick(AD_ID, IMPRESSION_ID, VIEWER_ID, undefined)

      expect(supabase.from).toHaveBeenCalledWith('ad_clicks')
      expect(redis.setex).toHaveBeenCalled()
    })

    it('skips click when cached (dedup within 5s)', async () => {
      const redis = buildRedis(true)
      const supabase = { from: vi.fn() }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackClick(AD_ID, IMPRESSION_ID, VIEWER_ID, undefined)

      expect(supabase.from).not.toHaveBeenCalled()
    })

    it('uses TTL of 5 seconds for click dedup', async () => {
      const redis = buildRedis(false)
      const insertChain = buildChain({ data: { id: 'click-id' }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(insertChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackClick(AD_ID, undefined, VIEWER_ID, undefined)

      expect(redis.setex).toHaveBeenCalledWith(expect.any(String), 5, '1')
    })

    it('uses TTL of 1800 seconds for impression dedup', async () => {
      const redis = buildRedis(false)
      const insertChain = buildChain({ data: { id: IMPRESSION_ID }, error: null })
      const supabase = { from: vi.fn().mockReturnValue(insertChain) }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const service = new TrackingService(supabase as any, redis as any)
      await service.trackImpression(AD_ID, VIEWER_ID, undefined, 'search')

      expect(redis.setex).toHaveBeenCalledWith(expect.any(String), 1800, '1')
    })
  })
})
