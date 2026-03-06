'use server'
import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { postGeneratorSchema } from '../validations/ai.schema'
import { descriptionGeneratorSchema } from '../validations/ai.schema'
import { promoIdeasSchema } from '../validations/ai.schema'
import { reviewResponderSchema } from '../validations/ai.schema'
import { priceAssistantSchema } from '../validations/ai.schema'
import { rateGenerationSchema } from '../validations/ai.schema'
import { generatePost } from './generate-post'
import { generateDescription } from './generate-description'
import { generatePromoIdeas } from './generate-promo-ideas'
import { generateReviewResponse } from './generate-review-response'
import { generatePriceAnalysis } from './generate-price-analysis'
import { toggleFavoriteGeneration } from './toggle-favorite'
import { deleteGeneration } from './delete-generation'
import type { ServiceResult, GenerateResult, AiGeneration } from '../interfaces'
import type { SubscriptionTier } from '@/lib/ai/config'

// ─────────────────────────────────────────────────────────
// Helper: get authenticated user + business context
// ─────────────────────────────────────────────────────────

async function getAuthContext() {
  const supabase = await createServerClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: 'No autenticado', user: null, business: null }
  }

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, city, subscription_tier, category_id')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .single()

  if (!business) {
    return { error: 'Negocio no encontrado', user, business: null }
  }

  return { error: null, user, business }
}

// ─────────────────────────────────────────────────────────
// Generate post
// ─────────────────────────────────────────────────────────

export async function generatePostAction(
  formData: FormData,
): Promise<ServiceResult<GenerateResult>> {
  const raw = {
    businessId: formData.get('businessId') as string,
    templateId: formData.get('templateId') as string,
    socialNetwork: formData.get('socialNetwork') as string,
    productOrService: formData.get('productOrService') as string,
    tone: formData.get('tone') as string,
    customPrompt: (formData.get('customPrompt') as string) || undefined,
    additionalVariables: {},
  }

  const parsed = postGeneratorSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const { error: ctxError, user, business } = await getAuthContext()
  if (ctxError || !user || !business) {
    return { data: null, error: ctxError ?? 'Sin contexto', success: false }
  }

  const result = await generatePost(parsed.data, {
    businessId: business.id,
    ownerId: user.id,
    businessName: business.name,
    businessCity: business.city ?? 'Cúcuta',
    tier: business.subscription_tier as SubscriptionTier,
  })

  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Generate description
// ─────────────────────────────────────────────────────────

export async function generateDescriptionAction(
  formData: FormData,
): Promise<ServiceResult<GenerateResult>> {
  const raw = {
    businessId: formData.get('businessId') as string,
    templateId: formData.get('templateId') as string,
    length: formData.get('length') as string,
    keywords: (formData.get('keywords') as string) || '',
    highlight: (formData.get('highlight') as string) || '',
    tone: formData.get('tone') as string,
  }

  const parsed = descriptionGeneratorSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const { error: ctxError, user, business } = await getAuthContext()
  if (ctxError || !user || !business) {
    return { data: null, error: ctxError ?? 'Sin contexto', success: false }
  }

  const result = await generateDescription(parsed.data, {
    businessId: business.id,
    ownerId: user.id,
    businessName: business.name,
    businessCity: business.city ?? 'Cúcuta',
    businessCategory: business.category_id ?? 'general',
    tier: business.subscription_tier as SubscriptionTier,
  })

  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Generate promo ideas
// ─────────────────────────────────────────────────────────

export async function generatePromoIdeasAction(
  formData: FormData,
): Promise<ServiceResult<GenerateResult>> {
  const raw = {
    businessId: formData.get('businessId') as string,
    templateId: formData.get('templateId') as string,
    numIdeas: Number(formData.get('numIdeas')),
    budget: formData.get('budget') as string,
    targetAudience: formData.get('targetAudience') as string,
    additionalVariables: {},
  }

  const parsed = promoIdeasSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const { error: ctxError, user, business } = await getAuthContext()
  if (ctxError || !user || !business) {
    return { data: null, error: ctxError ?? 'Sin contexto', success: false }
  }

  const result = await generatePromoIdeas(parsed.data, {
    businessId: business.id,
    ownerId: user.id,
    businessName: business.name,
    businessCity: business.city ?? 'Cúcuta',
    businessCategory: business.category_id ?? 'general',
    tier: business.subscription_tier as SubscriptionTier,
  })

  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Generate review response
// ─────────────────────────────────────────────────────────

export async function generateReviewResponseAction(
  formData: FormData,
): Promise<ServiceResult<GenerateResult>> {
  const raw = {
    businessId: formData.get('businessId') as string,
    reviewText: formData.get('reviewText') as string,
    rating: Number(formData.get('rating')),
    reviewerName: (formData.get('reviewerName') as string) || 'Cliente',
    tone: formData.get('tone') as string,
  }

  const parsed = reviewResponderSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const { error: ctxError, user, business } = await getAuthContext()
  if (ctxError || !user || !business) {
    return { data: null, error: ctxError ?? 'Sin contexto', success: false }
  }

  const result = await generateReviewResponse(parsed.data, {
    businessId: business.id,
    ownerId: user.id,
    businessName: business.name,
    tier: business.subscription_tier as SubscriptionTier,
  })

  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Generate price analysis
// ─────────────────────────────────────────────────────────

export async function generatePriceAnalysisAction(
  formData: FormData,
): Promise<ServiceResult<GenerateResult>> {
  const raw = {
    businessId: formData.get('businessId') as string,
    productOrService: formData.get('productOrService') as string,
    currentPrice: formData.get('currentPrice') as string,
    costPrice: formData.get('costPrice') as string,
    competitorPrice: (formData.get('competitorPrice') as string) || '',
    targetMargin: (formData.get('targetMargin') as string) || '',
  }

  const parsed = priceAssistantSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const { error: ctxError, user, business } = await getAuthContext()
  if (ctxError || !user || !business) {
    return { data: null, error: ctxError ?? 'Sin contexto', success: false }
  }

  const result = await generatePriceAnalysis(parsed.data, {
    businessId: business.id,
    ownerId: user.id,
    businessCategory: business.category_id ?? 'general',
    tier: business.subscription_tier as SubscriptionTier,
  })

  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Toggle favorite
// ─────────────────────────────────────────────────────────

export async function toggleFavoriteAction(
  generationId: string,
  isFavorite: boolean,
): Promise<ServiceResult<AiGeneration>> {
  const result = await toggleFavoriteGeneration(generationId, isFavorite)
  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Delete generation
// ─────────────────────────────────────────────────────────

export async function deleteGenerationAction(generationId: string): Promise<ServiceResult<void>> {
  const result = await deleteGeneration(generationId)
  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}

// ─────────────────────────────────────────────────────────
// Rate generation
// ─────────────────────────────────────────────────────────

export async function rateGenerationAction(
  formData: FormData,
): Promise<ServiceResult<AiGeneration>> {
  const raw = {
    generationId: formData.get('generationId') as string,
    rating: Number(formData.get('rating')),
  }

  const parsed = rateGenerationSchema.safeParse(raw)
  if (!parsed.success) {
    return { data: null, error: parsed.error.issues[0].message, success: false }
  }

  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { data: null, error: 'No autenticado', success: false }

  const { AiGenerationService } = await import('../services/ai-generation.service')
  const service = new AiGenerationService(supabase)
  const result = await service.rateGeneration(parsed.data.generationId, parsed.data.rating)
  if (result.success) revalidatePath('/panel/ia/historial')
  return result
}
