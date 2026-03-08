import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { getRedis } from '@/lib/redis'
import { AiGenerationService } from '@/modules/ia/services/ai-generation.service'
import { AiUsageService } from '@/modules/ia/services/ai-usage.service'
import { AiTemplatesService } from '@/modules/ia/services/ai-templates.service'
import { streamText } from '@/lib/ai/anthropic-client'
import {
  BASE_SYSTEM_PROMPT,
  buildPostGeneratorPrompt,
  buildDescriptionGeneratorPrompt,
  buildPromoIdeasPrompt,
  buildReviewResponderPrompt,
  buildPriceAssistantPrompt,
  fillTemplate,
} from '@/lib/ai/prompt-builder'
import { getMonthKey } from '@/lib/ai/config'
import {
  postGeneratorSchema,
  descriptionGeneratorSchema,
  promoIdeasSchema,
  reviewResponderSchema,
  priceAssistantSchema,
} from '@/modules/ia/validations/ai.schema'
import type { SubscriptionTier } from '@/lib/ai/config'

const TOOL_SCHEMAS = {
  post_generator: postGeneratorSchema,
  description_generator: descriptionGeneratorSchema,
  promo_ideas: promoIdeasSchema,
  review_responder: reviewResponderSchema,
  price_assistant: priceAssistantSchema,
} as const

export async function POST(request: NextRequest) {
  const supabase = await createServerClient()

  // Auth
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }

  // Rate limiting: max 5 requests/minute per user
  const redis = getRedis()
  const rateLimitKey = `ai:ratelimit:${user.id}`
  const currentCount = await redis.incr(rateLimitKey)
  if (currentCount === 1) await redis.expire(rateLimitKey, 60)
  if (currentCount > 5) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Espera un momento antes de continuar.' },
      { status: 429 },
    )
  }

  // Parse body
  const body = (await request.json()) as Record<string, unknown>
  const tool = body.tool as string

  if (!tool || !(tool in TOOL_SCHEMAS)) {
    return NextResponse.json({ error: 'Herramienta inválida' }, { status: 400 })
  }

  // Validate input for tool
  const schema = TOOL_SCHEMAS[tool as keyof typeof TOOL_SCHEMAS]
  const parsed = schema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  // Get business
  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, city, subscription_tier, category_id')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .single()

  if (!business) {
    return NextResponse.json({ error: 'Negocio no encontrado' }, { status: 404 })
  }

  const genService = new AiGenerationService(supabase)
  const usageService = new AiUsageService(supabase)
  const tplService = new AiTemplatesService(supabase)

  // Check usage limit
  const limitCheck = await usageService.checkLimit(
    business.id,
    tool as Parameters<typeof usageService.checkLimit>[1],
    business.subscription_tier as SubscriptionTier,
  )
  if (!limitCheck.canGenerate) {
    return NextResponse.json(
      { error: `Límite mensual alcanzado (${limitCheck.limit}). Actualiza tu plan.` },
      { status: 403 },
    )
  }

  // Get template if required
  const input = parsed.data as Record<string, unknown>
  let prompt = ''

  if (tool === 'post_generator' || tool === 'description_generator' || tool === 'promo_ideas') {
    const templateId = input.templateId as string
    const tplResult = await tplService.getById(templateId)
    if (!tplResult.success || !tplResult.data) {
      return NextResponse.json({ error: 'Plantilla no encontrada' }, { status: 404 })
    }

    const tpl = tplResult.data

    if (tool === 'post_generator') {
      const d = input as {
        socialNetwork: string
        productOrService: string
        tone: string
        additionalVariables: Record<string, string>
      }
      prompt = buildPostGeneratorPrompt({
        businessName: business.name,
        businessCity: business.city ?? 'Cúcuta',
        productOrService: d.productOrService,
        socialNetwork: d.socialNetwork,
        tone: d.tone,
        templatePrompt: fillTemplate(tpl.prompt_template, {
          business_name: business.name,
          business_city: business.city ?? 'Cúcuta',
        }),
        variables: d.additionalVariables ?? {},
      })
    } else if (tool === 'description_generator') {
      const d = input as {
        length: 'corta' | 'media' | 'larga'
        keywords: string
        highlight: string
        tone: string
      }
      prompt = buildDescriptionGeneratorPrompt({
        businessName: business.name,
        businessCity: business.city ?? 'Cúcuta',
        businessCategory: business.category_id ?? 'general',
        length: d.length,
        keywords: d.keywords,
        highlight: d.highlight,
        tone: d.tone,
        templatePrompt: fillTemplate(tpl.prompt_template, { business_name: business.name }),
      })
    } else if (tool === 'promo_ideas') {
      const d = input as {
        numIdeas: number
        budget: string
        targetAudience: string
        additionalVariables: Record<string, string>
      }
      prompt = buildPromoIdeasPrompt({
        businessName: business.name,
        businessCity: business.city ?? 'Cúcuta',
        businessCategory: business.category_id ?? 'general',
        numIdeas: d.numIdeas,
        budget: d.budget,
        targetAudience: d.targetAudience,
        templatePrompt: fillTemplate(tpl.prompt_template, { business_name: business.name }),
        variables: d.additionalVariables ?? {},
      })
    }
  } else if (tool === 'review_responder') {
    const d = input as {
      reviewText: string
      rating: number
      reviewerName: string
      tone: 'formal' | 'amigable' | 'profesional'
    }
    prompt = buildReviewResponderPrompt({
      businessName: business.name,
      reviewText: d.reviewText,
      rating: d.rating,
      reviewerName: d.reviewerName,
      tone: d.tone,
    })
  } else if (tool === 'price_assistant') {
    const d = input as {
      productOrService: string
      currentPrice: string
      costPrice: string
      competitorPrice: string
      targetMargin: string
    }
    prompt = buildPriceAssistantPrompt({
      businessName: business.name,
      businessCategory: business.category_id ?? 'general',
      productOrService: d.productOrService,
      currentPrice: d.currentPrice,
      costPrice: d.costPrice,
      competitorPrice: d.competitorPrice,
      targetMargin: d.targetMargin,
    })
  }

  // Create pending generation record
  const createResult = await genService.create({
    businessId: business.id,
    ownerId: user.id,
    tool: tool as Parameters<typeof genService.create>[0]['tool'],
    inputData: input,
  })
  if (!createResult.success || !createResult.data) {
    return NextResponse.json({ error: 'Error iniciando generación' }, { status: 500 })
  }

  const generationId = createResult.data.id

  // Stream response
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    async start(controller) {
      try {
        const result = await streamText(
          { prompt, systemPrompt: BASE_SYSTEM_PROMPT, maxTokens: 2048 },
          (chunk) => {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ chunk })}\n\n`))
          },
        )

        // Update generation record
        await genService.updateOutput(generationId, {
          outputText: result.text,
          model: result.model,
          tokensUsed: result.inputTokens + result.outputTokens,
          durationMs: result.durationMs,
        })

        // Increment usage
        await usageService.incrementUsage(
          business.id,
          user.id,
          getMonthKey(),
          tool as Parameters<typeof usageService.incrementUsage>[3],
        )

        // Send final event with generationId
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ done: true, generationId })}\n\n`),
        )
        controller.close()
      } catch (err) {
        await genService.markFailed(generationId)
        const message = err instanceof Error ? err.message : 'Error en generación'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
