import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AiGenerationService } from '../services/ai-generation.service'
import { AiUsageService } from '../services/ai-usage.service'
import { AiTemplatesService } from '../services/ai-templates.service'

// ─────────────────────────────────────────────────────────
// Supabase mock factory
// ─────────────────────────────────────────────────────────

function makeMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
    then: vi.fn((resolve: (v: unknown) => unknown) => resolve({ data: null, error: null })),
  }
  const from = vi.fn().mockReturnValue(chain)
  const rpc = vi.fn()
  return { supabase: { from, rpc } as unknown as Parameters<typeof AiGenerationService>[0], chain }
}

// ─────────────────────────────────────────────────────────
// AiGenerationService
// ─────────────────────────────────────────────────────────
describe('AiGenerationService', () => {
  let mock: ReturnType<typeof makeMock>
  let service: AiGenerationService

  beforeEach(() => {
    mock = makeMock()
    service = new AiGenerationService(mock.supabase)
  })

  describe('create', () => {
    it('calls insert with correct fields and returns created record', async () => {
      const record = {
        id: 'gen-001',
        business_id: 'biz-001',
        owner_id: 'user-001',
        tool: 'post_generator',
        status: 'pending',
        input_data: {},
        input_image_url: null,
        output_text: null,
        output_image_url: null,
        output_data: null,
        model_used: null,
        tokens_used: null,
        processing_time_ms: null,
        is_favorite: false,
        is_used: false,
        rating: null,
        created_at: new Date().toISOString(),
      }
      mock.chain.single.mockResolvedValue({ data: record, error: null })

      const result = await service.create({
        businessId: 'biz-001',
        ownerId: 'user-001',
        tool: 'post_generator',
        inputData: { template: 'test' },
      })

      expect(mock.supabase.from).toHaveBeenCalledWith('ai_generations')
      expect(mock.chain.insert).toHaveBeenCalled()
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('gen-001')
    })

    it('returns error on db failure', async () => {
      mock.chain.single.mockResolvedValue({ data: null, error: { message: 'DB error' } })
      const result = await service.create({
        businessId: 'biz-001',
        ownerId: 'user-001',
        tool: 'post_generator',
        inputData: {},
      })
      expect(result.success).toBe(false)
      expect(result.error).toBe('DB error')
    })
  })

  describe('updateOutput', () => {
    it('calls update with output fields', async () => {
      const updated = { id: 'gen-001', output_text: 'Generated content', status: 'completed' }
      mock.chain.single.mockResolvedValue({ data: updated, error: null })

      const result = await service.updateOutput('gen-001', {
        outputText: 'Generated content',
        model: 'claude-haiku-4-5-20251001',
        tokensUsed: 150,
        durationMs: 1200,
      })

      expect(mock.chain.update).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('getByBusiness', () => {
    it('queries by business_id with filters', async () => {
      mock.chain.then = vi.fn((resolve: (v: unknown) => unknown) =>
        resolve({ data: [], error: null }),
      )
      const result = await service.getByBusiness('biz-001', { limit: 10, offset: 0 })
      expect(mock.supabase.from).toHaveBeenCalledWith('ai_generations')
      expect(result.success).toBe(true)
      expect(result.data).toEqual([])
    })
  })

  describe('toggleFavorite', () => {
    it('sets is_favorite to true', async () => {
      mock.chain.single.mockResolvedValue({
        data: { id: 'gen-001', is_favorite: true },
        error: null,
      })
      const result = await service.toggleFavorite('gen-001', true)
      expect(mock.chain.update).toHaveBeenCalledWith({ is_favorite: true })
      expect(result.success).toBe(true)
    })
  })

  describe('rateGeneration', () => {
    it('updates rating field', async () => {
      mock.chain.single.mockResolvedValue({ data: { id: 'gen-001', rating: 4 }, error: null })
      const result = await service.rateGeneration('gen-001', 4)
      expect(mock.chain.update).toHaveBeenCalledWith({ rating: 4 })
      expect(result.success).toBe(true)
    })

    it('rejects rating outside 1-5', async () => {
      const result = await service.rateGeneration('gen-001', 6)
      expect(result.success).toBe(false)
      expect(result.error).toContain('1 y 5')
    })
  })

  describe('delete', () => {
    it('deletes by id', async () => {
      mock.chain.then = vi.fn((resolve: (v: unknown) => unknown) =>
        resolve({ data: null, error: null }),
      )
      const result = await service.delete('gen-001')
      expect(mock.chain.delete).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })
})

// ─────────────────────────────────────────────────────────
// AiUsageService
// ─────────────────────────────────────────────────────────
describe('AiUsageService', () => {
  let mock: ReturnType<typeof makeMock>
  let service: AiUsageService

  beforeEach(() => {
    mock = makeMock()
    service = new AiUsageService(mock.supabase)
  })

  describe('getUsage', () => {
    it('returns usage record for business/month/tool', async () => {
      const usageRecord = { id: 'u-001', usage_count: 5 }
      mock.chain.maybeSingle.mockResolvedValue({ data: usageRecord, error: null })

      const result = await service.getUsage('biz-001', '2026-03', 'post_generator')
      expect(mock.supabase.from).toHaveBeenCalledWith('ai_usage')
      expect(result.success).toBe(true)
      expect(result.data?.usage_count).toBe(5)
    })

    it('returns null data when no record exists (not an error)', async () => {
      mock.chain.maybeSingle.mockResolvedValue({ data: null, error: null })
      const result = await service.getUsage('biz-001', '2026-03', 'promo_ideas')
      expect(result.success).toBe(true)
      expect(result.data).toBeNull()
    })
  })

  describe('incrementUsage', () => {
    it('upserts with incremented count', async () => {
      mock.chain.single.mockResolvedValue({
        data: { id: 'u-001', usage_count: 6 },
        error: null,
      })
      const result = await service.incrementUsage(
        'biz-001',
        'user-001',
        '2026-03',
        'post_generator',
      )
      expect(mock.chain.insert).toHaveBeenCalled()
      expect(result.success).toBe(true)
    })
  })

  describe('checkLimit', () => {
    it('returns canGenerate=true when under limit', async () => {
      mock.chain.maybeSingle.mockResolvedValue({ data: { usage_count: 5 }, error: null })
      const result = await service.checkLimit('biz-001', 'post_generator', 'free')
      expect(result.canGenerate).toBe(true)
      expect(result.remaining).toBe(5) // free limit is 10
    })

    it('returns canGenerate=false when at limit', async () => {
      mock.chain.maybeSingle.mockResolvedValue({ data: { usage_count: 10 }, error: null })
      const result = await service.checkLimit('biz-001', 'post_generator', 'free')
      expect(result.canGenerate).toBe(false)
      expect(result.remaining).toBe(0)
    })

    it('returns canGenerate=true for premium (unlimited)', async () => {
      mock.chain.maybeSingle.mockResolvedValue({ data: { usage_count: 999 }, error: null })
      const result = await service.checkLimit('biz-001', 'post_generator', 'premium')
      expect(result.canGenerate).toBe(true)
      expect(result.isUnlimited).toBe(true)
    })

    it('returns canGenerate=true when no record exists (fresh month)', async () => {
      mock.chain.maybeSingle.mockResolvedValue({ data: null, error: null })
      const result = await service.checkLimit('biz-001', 'post_generator', 'free')
      expect(result.canGenerate).toBe(true)
      expect(result.usageCount).toBe(0)
    })
  })
})

// ─────────────────────────────────────────────────────────
// AiTemplatesService
// ─────────────────────────────────────────────────────────
describe('AiTemplatesService', () => {
  let mock: ReturnType<typeof makeMock>
  let service: AiTemplatesService

  beforeEach(() => {
    mock = makeMock()
    service = new AiTemplatesService(mock.supabase)
  })

  describe('getByTool', () => {
    it('queries templates by tool and category', async () => {
      const templates = [
        { id: 'tpl-001', name: 'Promoción del día', tool: 'post_generator', category_slug: null },
      ]
      mock.chain.then = vi.fn((resolve: (v: unknown) => unknown) =>
        resolve({ data: templates, error: null }),
      )
      const result = await service.getByTool('post_generator', 'restaurantes')
      expect(mock.supabase.from).toHaveBeenCalledWith('ai_templates')
      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
    })
  })

  describe('getById', () => {
    it('returns single template', async () => {
      const template = { id: 'tpl-001', name: 'Test template' }
      mock.chain.single.mockResolvedValue({ data: template, error: null })
      const result = await service.getById('tpl-001')
      expect(result.success).toBe(true)
      expect(result.data?.id).toBe('tpl-001')
    })

    it('returns error when not found', async () => {
      mock.chain.single.mockResolvedValue({ data: null, error: { message: 'Not found' } })
      const result = await service.getById('nonexistent')
      expect(result.success).toBe(false)
    })
  })
})
