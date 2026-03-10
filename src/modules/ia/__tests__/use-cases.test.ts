import { describe, it, expect, vi, beforeEach } from 'vitest'
import { AiGenerationService } from '../services/ai-generation.service'
import { AiUsageService } from '../services/ai-usage.service'
import { AiTemplatesService } from '../services/ai-templates.service'

// Mock createServerClient
vi.mock('@/lib/supabase/server', () => ({
  createServerClient: vi.fn(),
}))

// Mock generateText
vi.mock('@/lib/ai/anthropic-client', () => ({
  generateText: vi.fn().mockResolvedValue({
    text: 'Contenido generado por IA',
    model: 'claude-haiku-4-5-20251001',
    inputTokens: 100,
    outputTokens: 50,
    durationMs: 1500,
  }),
}))

// ─────────────────────────────────────────────────────────
// Shared mock helpers
// ─────────────────────────────────────────────────────────

function makeChain(data: unknown = null, error: null | { message: string } = null) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
    then: vi.fn((resolve: (v: unknown) => unknown) => resolve({ data: data ?? [], error })),
  }
  return chain
}

// ─────────────────────────────────────────────────────────
// AiGenerationService — unit coverage for business logic
// ─────────────────────────────────────────────────────────

describe('AiGenerationService - business logic', () => {
  it('rateGeneration returns error for rating 0', async () => {
    const supabase = { from: vi.fn() } as unknown as ConstructorParameters<typeof AiGenerationService>[0]
    const service = new AiGenerationService(supabase)
    const result = await service.rateGeneration('gen-001', 0)
    expect(result.success).toBe(false)
    expect(result.error).toMatch(/1 y 5/)
  })

  it('rateGeneration returns error for rating 6', async () => {
    const supabase = { from: vi.fn() } as unknown as ConstructorParameters<typeof AiGenerationService>[0]
    const service = new AiGenerationService(supabase)
    const result = await service.rateGeneration('gen-001', 6)
    expect(result.success).toBe(false)
  })

  it('rateGeneration succeeds for valid rating', async () => {
    const chain = makeChain({ id: 'gen-001', rating: 4 })
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiGenerationService>[0]
    const service = new AiGenerationService(supabase)
    const result = await service.rateGeneration('gen-001', 4)
    expect(result.success).toBe(true)
    expect(chain.update).toHaveBeenCalledWith({ rating: 4 })
  })
})

// ─────────────────────────────────────────────────────────
// AiUsageService — limit checking logic
// ─────────────────────────────────────────────────────────

describe('AiUsageService - checkLimit', () => {
  it('free tier: canGenerate=true when 0 usage', async () => {
    const chain = makeChain(null) // no record = 0 usage
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiUsageService>[0]
    const service = new AiUsageService(supabase)
    const result = await service.checkLimit('biz-001', 'post_generator', 'free')
    expect(result.canGenerate).toBe(true)
    expect(result.usageCount).toBe(0)
    expect(result.limit).toBe(10)
    expect(result.remaining).toBe(10)
  })

  it('free tier: canGenerate=false at limit (10)', async () => {
    const chain = makeChain({ usage_count: 10 })
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiUsageService>[0]
    const service = new AiUsageService(supabase)
    const result = await service.checkLimit('biz-001', 'post_generator', 'free')
    expect(result.canGenerate).toBe(false)
    expect(result.remaining).toBe(0)
  })

  it('premium: unlimited always canGenerate=true', async () => {
    const chain = makeChain({ usage_count: 999 })
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiUsageService>[0]
    const service = new AiUsageService(supabase)
    const result = await service.checkLimit('biz-001', 'post_generator', 'premium')
    expect(result.canGenerate).toBe(true)
    expect(result.isUnlimited).toBe(true)
  })

  it('basic tier: canGenerate=true with 29/30 usage', async () => {
    const chain = makeChain({ usage_count: 29 })
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiUsageService>[0]
    const service = new AiUsageService(supabase)
    const result = await service.checkLimit('biz-001', 'post_generator', 'basic')
    expect(result.canGenerate).toBe(true)
    expect(result.remaining).toBe(1)
  })

  it('different tools have different limits on same tier', async () => {
    // photo_enhancer free limit = 5
    const chain5 = makeChain({ usage_count: 5 })
    const supabase5 = { from: vi.fn().mockReturnValue(chain5) } as unknown as ConstructorParameters<typeof AiUsageService>[0]
    const service5 = new AiUsageService(supabase5)
    const result5 = await service5.checkLimit('biz-001', 'photo_enhancer', 'free')
    expect(result5.canGenerate).toBe(false) // 5/5 = at limit

    // post_generator free limit = 10
    const chain10 = makeChain({ usage_count: 5 })
    const supabase10 = { from: vi.fn().mockReturnValue(chain10) } as unknown as ConstructorParameters<typeof AiUsageService>[0]
    const service10 = new AiUsageService(supabase10)
    const result10 = await service10.checkLimit('biz-001', 'post_generator', 'free')
    expect(result10.canGenerate).toBe(true) // 5/10 = still has capacity
  })
})

// ─────────────────────────────────────────────────────────
// AiTemplatesService
// ─────────────────────────────────────────────────────────

describe('AiTemplatesService', () => {
  it('getByTool queries correct table', async () => {
    const templates = [{ id: 'tpl-001', name: 'Test', tool: 'post_generator', category_slug: null }]
    const chain = makeChain(templates)
    chain.then = vi.fn((resolve: (v: unknown) => unknown) =>
      resolve({ data: templates, error: null }),
    )
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiTemplatesService>[0]
    const service = new AiTemplatesService(supabase)
    const result = await service.getByTool('post_generator')
    expect(supabase.from).toHaveBeenCalledWith('ai_templates')
    expect(result.success).toBe(true)
  })

  it('getById returns template on success', async () => {
    const template = { id: 'tpl-001', name: 'Promoción del día' }
    const chain = makeChain(template)
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiTemplatesService>[0]
    const service = new AiTemplatesService(supabase)
    const result = await service.getById('tpl-001')
    expect(result.success).toBe(true)
    expect(result.data?.id).toBe('tpl-001')
  })

  it('getById returns error when not found', async () => {
    const chain = makeChain(null, { message: 'Row not found' })
    const supabase = { from: vi.fn().mockReturnValue(chain) } as unknown as ConstructorParameters<typeof AiTemplatesService>[0]
    const service = new AiTemplatesService(supabase)
    const result = await service.getById('nonexistent')
    expect(result.success).toBe(false)
    expect(result.error).toBe('Row not found')
  })
})
