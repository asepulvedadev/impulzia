'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import { AiUsageService } from '../services/ai-usage.service'
import { generateText } from '@/lib/ai/anthropic-client'
import { BASE_SYSTEM_PROMPT, buildReviewResponderPrompt } from '@/lib/ai/prompt-builder'
import { getMonthKey } from '@/lib/ai/config'
import type { ServiceResult, GenerateResult } from '../interfaces'
import type { ReviewResponderInput } from '../validations/ai.schema'

interface GenerateReviewResponseContext {
  businessId: string
  ownerId: string
  businessName: string
  tier: 'free' | 'basic' | 'pro' | 'premium'
}

export async function generateReviewResponse(
  input: ReviewResponderInput,
  context: GenerateReviewResponseContext,
): Promise<ServiceResult<GenerateResult>> {
  const supabase = await createServerClient()
  const genService = new AiGenerationService(supabase)
  const usageService = new AiUsageService(supabase)

  const limitCheck = await usageService.checkLimit(
    context.businessId,
    'review_responder',
    context.tier,
  )
  if (!limitCheck.canGenerate) {
    return {
      data: null,
      error: `Has alcanzado el límite mensual de respuestas a reseñas (${limitCheck.limit}).`,
      success: false,
    }
  }

  const createResult = await genService.create({
    businessId: context.businessId,
    ownerId: context.ownerId,
    tool: 'review_responder',
    inputData: { ...input },
  })
  if (!createResult.success || !createResult.data) {
    return { data: null, error: createResult.error, success: false }
  }

  const generationId = createResult.data.id
  const prompt = buildReviewResponderPrompt({
    businessName: context.businessName,
    reviewText: input.reviewText,
    rating: input.rating,
    reviewerName: input.reviewerName,
    tone: input.tone,
  })

  try {
    const aiResult = await generateText({ prompt, systemPrompt: BASE_SYSTEM_PROMPT })

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
      'review_responder',
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
    const message = err instanceof Error ? err.message : 'Error generando respuesta'
    return { data: null, error: message, success: false }
  }
}
