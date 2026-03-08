'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import { AiUsageService } from '../services/ai-usage.service'
import { AiTemplatesService } from '../services/ai-templates.service'
import { generateText } from '@/lib/ai/anthropic-client'
import {
  BASE_SYSTEM_PROMPT,
  buildDescriptionGeneratorPrompt,
  fillTemplate,
} from '@/lib/ai/prompt-builder'
import { getMonthKey } from '@/lib/ai/config'
import type { ServiceResult, GenerateResult } from '../interfaces'
import type { DescriptionGeneratorInput } from '../validations/ai.schema'

interface GenerateDescriptionContext {
  businessId: string
  ownerId: string
  businessName: string
  businessCity: string
  businessCategory: string
  tier: 'free' | 'basic' | 'pro' | 'premium'
}

export async function generateDescription(
  input: DescriptionGeneratorInput,
  context: GenerateDescriptionContext,
): Promise<ServiceResult<GenerateResult>> {
  const supabase = await createServerClient()
  const genService = new AiGenerationService(supabase)
  const usageService = new AiUsageService(supabase)
  const tplService = new AiTemplatesService(supabase)

  const limitCheck = await usageService.checkLimit(
    context.businessId,
    'description_generator',
    context.tier,
  )
  if (!limitCheck.canGenerate) {
    return {
      data: null,
      error: `Has alcanzado el límite mensual de descripciones (${limitCheck.limit}).`,
      success: false,
    }
  }

  const tplResult = await tplService.getById(input.templateId)
  if (!tplResult.success || !tplResult.data) {
    return { data: null, error: 'Plantilla no encontrada', success: false }
  }

  const createResult = await genService.create({
    businessId: context.businessId,
    ownerId: context.ownerId,
    tool: 'description_generator',
    inputData: { ...input },
  })
  if (!createResult.success || !createResult.data) {
    return { data: null, error: createResult.error, success: false }
  }

  const generationId = createResult.data.id
  const prompt = buildDescriptionGeneratorPrompt({
    businessName: context.businessName,
    businessCity: context.businessCity,
    businessCategory: context.businessCategory,
    length: input.length,
    keywords: input.keywords,
    highlight: input.highlight,
    tone: input.tone,
    templatePrompt: fillTemplate(tplResult.data.prompt_template, {
      business_name: context.businessName,
      business_city: context.businessCity,
      business_category: context.businessCategory,
    }),
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
      'description_generator',
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
    const message = err instanceof Error ? err.message : 'Error generando descripción'
    return { data: null, error: message, success: false }
  }
}
