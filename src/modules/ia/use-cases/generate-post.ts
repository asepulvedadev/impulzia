'use server'
import { createServerClient } from '@/lib/supabase/server'
import { AiGenerationService } from '../services/ai-generation.service'
import { AiUsageService } from '../services/ai-usage.service'
import { AiTemplatesService } from '../services/ai-templates.service'
import { generateText } from '@/lib/ai/anthropic-client'
import { BASE_SYSTEM_PROMPT, buildPostGeneratorPrompt, fillTemplate } from '@/lib/ai/prompt-builder'
import { getMonthKey } from '@/lib/ai/config'
import type { ServiceResult, GenerateResult } from '../interfaces'
import type { PostGeneratorInput } from '../validations/ai.schema'

interface GeneratePostContext {
  businessId: string
  ownerId: string
  businessName: string
  businessCity: string
  tier: 'free' | 'basic' | 'pro' | 'premium'
}

export async function generatePost(
  input: PostGeneratorInput,
  context: GeneratePostContext,
): Promise<ServiceResult<GenerateResult>> {
  const supabase = await createServerClient()
  const genService = new AiGenerationService(supabase)
  const usageService = new AiUsageService(supabase)
  const tplService = new AiTemplatesService(supabase)

  // Check usage limit
  const limitCheck = await usageService.checkLimit(context.businessId, 'post_generator', context.tier)
  if (!limitCheck.canGenerate) {
    return {
      data: null,
      error: `Has alcanzado el límite mensual de posts (${limitCheck.limit}). Actualiza tu plan para continuar.`,
      success: false,
    }
  }

  // Get template
  const tplResult = await tplService.getById(input.templateId)
  if (!tplResult.success || !tplResult.data) {
    return { data: null, error: 'Plantilla no encontrada', success: false }
  }

  // Create pending generation record
  const createResult = await genService.create({
    businessId: context.businessId,
    ownerId: context.ownerId,
    tool: 'post_generator',
    inputData: { ...input },
  })
  if (!createResult.success || !createResult.data) {
    return { data: null, error: createResult.error, success: false }
  }

  const generationId = createResult.data.id
  const prompt = buildPostGeneratorPrompt({
    businessName: context.businessName,
    businessCity: context.businessCity,
    productOrService: input.productOrService,
    socialNetwork: input.socialNetwork,
    tone: input.tone,
    templatePrompt: fillTemplate(tplResult.data.prompt_template, {
      business_name: context.businessName,
      business_city: context.businessCity,
      ...input.additionalVariables,
    }),
    variables: input.additionalVariables as Record<string, string>,
  })

  try {
    const aiResult = await generateText({ prompt, systemPrompt: BASE_SYSTEM_PROMPT })

    // Update generation record
    await genService.updateOutput(generationId, {
      outputText: aiResult.text,
      model: aiResult.model,
      tokensUsed: aiResult.inputTokens + aiResult.outputTokens,
      durationMs: aiResult.durationMs,
    })

    // Increment usage
    await usageService.incrementUsage(
      context.businessId,
      context.ownerId,
      getMonthKey(),
      'post_generator',
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
    const message = err instanceof Error ? err.message : 'Error generando contenido'
    return { data: null, error: message, success: false }
  }
}
