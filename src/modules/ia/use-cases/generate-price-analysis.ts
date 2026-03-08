'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import { AiUsageService } from '../services/ai-usage.service'
import { generateText } from '@/lib/ai/anthropic-client'
import { BASE_SYSTEM_PROMPT, buildPriceAssistantPrompt } from '@/lib/ai/prompt-builder'
import { getMonthKey } from '@/lib/ai/config'
import type { ServiceResult, GenerateResult } from '../interfaces'
import type { PriceAssistantInput } from '../validations/ai.schema'

interface GeneratePriceAnalysisContext {
  businessId: string
  ownerId: string
  businessCategory: string
  tier: 'free' | 'basic' | 'pro' | 'premium'
}

export async function generatePriceAnalysis(
  input: PriceAssistantInput,
  context: GeneratePriceAnalysisContext,
): Promise<ServiceResult<GenerateResult>> {
  const supabase = await createServerClient()
  const genService = new AiGenerationService(supabase)
  const usageService = new AiUsageService(supabase)

  const limitCheck = await usageService.checkLimit(
    context.businessId,
    'price_assistant',
    context.tier,
  )
  if (!limitCheck.canGenerate) {
    return {
      data: null,
      error: `Has alcanzado el límite mensual de análisis de precios (${limitCheck.limit}).`,
      success: false,
    }
  }

  const createResult = await genService.create({
    businessId: context.businessId,
    ownerId: context.ownerId,
    tool: 'price_assistant',
    inputData: { ...input },
  })
  if (!createResult.success || !createResult.data) {
    return { data: null, error: createResult.error, success: false }
  }

  const generationId = createResult.data.id
  const prompt = buildPriceAssistantPrompt({
    businessName: input.businessId,
    businessCategory: context.businessCategory,
    productOrService: input.productOrService,
    currentPrice: input.currentPrice,
    costPrice: input.costPrice,
    competitorPrice: input.competitorPrice,
    targetMargin: input.targetMargin,
  })

  try {
    const aiResult = await generateText({
      prompt,
      systemPrompt: BASE_SYSTEM_PROMPT,
      maxTokens: 1500,
    })

    await genService.updateOutput(generationId, {
      outputText: aiResult.text,
      model: aiResult.model,
      tokensUsed: aiResult.inputTokens + aiResult.outputTokens,
      durationMs: aiResult.durationMs,
    })

    await usageService.incrementUsage(
      context.businessId,
      context.ownerId,
      getMonthKey(),
      'price_assistant',
    )

    return {
      data: {
        generationId,
        outputText: aiResult.text,
        model: aiResult.model,
        tokensUsed: aiResult.inputTokens + aiResult.outputTokens,
        durationMs: aiResult.durationMs,
      },
      error: null,
      success: true,
    }
  } catch (err) {
    await genService.markFailed(generationId)
    const message = err instanceof Error ? err.message : 'Error en análisis de precios'
    return { data: null, error: message, success: false }
  }
}
