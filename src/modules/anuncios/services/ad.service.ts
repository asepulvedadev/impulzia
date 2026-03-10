import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type {
  Ad,
  AdStats,
  AdWithStats,
  AdDetailedStats,
  CreateAdInput,
  UpdateAdInput,
  AdFiltersInput,
  ServiceResult,
} from '../interfaces'
import { AD_PLAN_LIMITS } from '../interfaces'
import { publishAdSchema } from '../validations/ad.schema'

type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium'

export class AdService {
  constructor(private supabase: SupabaseClient<Database>) {}

  private async getActiveAdCount(businessId: string): Promise<number> {
    const { count } = await this.supabase
      .from('ads')
      .select('*', { count: 'exact', head: true })
      .eq('business_id', businessId)
      .eq('status', 'active')
      .eq('is_active', true)

    return count ?? 0
  }

  private async checkPlanLimit(
    businessId: string,
    tier: SubscriptionTier,
  ): Promise<ServiceResult<void>> {
    const limit = AD_PLAN_LIMITS[tier] ?? 1
    if (limit === Infinity) {
      return { data: undefined, error: null, success: true }
    }

    const count = await this.getActiveAdCount(businessId)
    if (count >= limit) {
      return {
        data: null,
        error: `Has alcanzado el límite de anuncios activos de tu plan (${limit}). Mejora tu plan para crear más anuncios.`,
        success: false,
      }
    }

    return { data: undefined, error: null, success: true }
  }

  async create(
    data: CreateAdInput,
    ownerId: string,
    businessId: string,
  ): Promise<ServiceResult<Ad>> {
    // Verify business exists and get plan
    const { data: business, error: bizError } = await this.supabase
      .from('businesses')
      .select('id, subscription_tier')
      .eq('id', businessId)
      .eq('owner_id', ownerId)
      .single()

    if (bizError || !business) {
      return {
        data: null,
        error: 'No se encontró el negocio asociado a tu cuenta',
        success: false,
      }
    }

    // Check plan limit for active ads
    const limitCheck = await this.checkPlanLimit(
      businessId,
      business.subscription_tier as SubscriptionTier,
    )
    if (!limitCheck.success) {
      return { data: null, error: limitCheck.error, success: false }
    }

    const { data: ad, error } = await this.supabase
      .from('ads')
      .insert({
        business_id: businessId,
        owner_id: ownerId,
        type: data.type,
        status: 'draft',
        title: data.title,
        description: data.description ?? null,
        image_url: data.image_url ?? null,
        cta_text: data.cta_text ?? 'Ver más',
        cta_url: data.cta_url ?? null,
        target_categories: data.target_categories ?? null,
        target_neighborhoods: data.target_neighborhoods ?? null,
        schedule_start: data.schedule_start ?? null,
        schedule_end: data.schedule_end ?? null,
        daily_start_hour: data.daily_start_hour ?? null,
        daily_end_hour: data.daily_end_hour ?? null,
      })
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: ad as Ad, error: null, success: true }
  }

  async getById(id: string): Promise<ServiceResult<Ad>> {
    const { data, error } = await this.supabase.from('ads').select('*').eq('id', id).single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: data as Ad, error: null, success: true }
  }

  async getByBusinessId(
    businessId: string,
    ownerId: string,
  ): Promise<ServiceResult<AdWithStats[]>> {
    const { data, error } = await this.supabase
      .from('ads')
      .select('*')
      .eq('business_id', businessId)
      .eq('owner_id', ownerId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    // Get stats for each ad from impressions/clicks tables
    const ads = (data as Ad[]) ?? []
    const adsWithStats: AdWithStats[] = await Promise.all(
      ads.map(async (ad) => {
        const [{ count: impressions }, { count: clicks }] = await Promise.all([
          this.supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', ad.id),
          this.supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', ad.id),
        ])
        const totalImpressions = impressions ?? 0
        const totalClicks = clicks ?? 0
        const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0
        const stats: AdStats = {
          ad_id: ad.id,
          total_impressions: totalImpressions,
          total_clicks: totalClicks,
          ctr,
          ctr_percentage: Math.round(ctr * 10000) / 100,
          impressions_7d: null,
          clicks_7d: null,
        }
        return { ...ad, stats }
      }),
    )

    return { data: adsWithStats, error: null, success: true }
  }

  async update(id: string, data: UpdateAdInput, ownerId: string): Promise<ServiceResult<Ad>> {
    // Verify ownership and editable status
    const existing = await this.getById(id)
    if (!existing.success || !existing.data) {
      return { data: null, error: existing.error ?? 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return { data: null, error: 'No tienes permiso para editar este anuncio', success: false }
    }

    if (!['draft', 'paused'].includes(existing.data.status)) {
      return {
        data: null,
        error: 'Solo puedes editar anuncios en estado borrador o pausado',
        success: false,
      }
    }

    const updateData: Database['public']['Tables']['ads']['Update'] = {}
    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.image_url !== undefined) updateData.image_url = data.image_url
    if (data.cta_text !== undefined) updateData.cta_text = data.cta_text
    if (data.cta_url !== undefined) updateData.cta_url = data.cta_url
    if (data.target_categories !== undefined) updateData.target_categories = data.target_categories
    if (data.target_neighborhoods !== undefined)
      updateData.target_neighborhoods = data.target_neighborhoods
    if (data.schedule_start !== undefined) updateData.schedule_start = data.schedule_start
    if (data.schedule_end !== undefined) updateData.schedule_end = data.schedule_end
    if (data.daily_start_hour !== undefined) updateData.daily_start_hour = data.daily_start_hour
    if (data.daily_end_hour !== undefined) updateData.daily_end_hour = data.daily_end_hour

    const { data: ad, error } = await this.supabase
      .from('ads')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: ad as Ad, error: null, success: true }
  }

  async publish(id: string, ownerId: string): Promise<ServiceResult<Ad>> {
    const existing = await this.getById(id)
    if (!existing.success || !existing.data) {
      return { data: null, error: existing.error ?? 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return { data: null, error: 'No tienes permiso para publicar este anuncio', success: false }
    }

    // Validate publishable state
    const validation = publishAdSchema.safeParse({
      title: existing.data.title,
      type: existing.data.type,
      image_url: existing.data.image_url ?? undefined,
      schedule_start: existing.data.schedule_start ?? undefined,
      schedule_end: existing.data.schedule_end ?? undefined,
    })

    if (!validation.success) {
      const message = validation.error.issues.map((i) => i.message).join(', ')
      return { data: null, error: message, success: false }
    }

    // Check plan limits
    const { data: business, error: bizError } = await this.supabase
      .from('businesses')
      .select('id, subscription_tier')
      .eq('id', existing.data.business_id)
      .single()

    if (bizError || !business) {
      return { data: null, error: 'No se pudo verificar el negocio', success: false }
    }

    const limitCheck = await this.checkPlanLimit(
      existing.data.business_id,
      business.subscription_tier as SubscriptionTier,
    )
    if (!limitCheck.success) {
      return { data: null, error: limitCheck.error, success: false }
    }

    // Auto-approve: go directly to 'active'
    const { data: ad, error } = await this.supabase
      .from('ads')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: ad as Ad, error: null, success: true }
  }

  async pause(id: string, ownerId: string): Promise<ServiceResult<Ad>> {
    const existing = await this.getById(id)
    if (!existing.success || !existing.data) {
      return { data: null, error: existing.error ?? 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return { data: null, error: 'No tienes permiso para pausar este anuncio', success: false }
    }

    if (existing.data.status !== 'active') {
      return {
        data: null,
        error: 'Solo puedes pausar anuncios que estén activo',
        success: false,
      }
    }

    const { data: ad, error } = await this.supabase
      .from('ads')
      .update({ status: 'paused' })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: ad as Ad, error: null, success: true }
  }

  async resume(id: string, ownerId: string): Promise<ServiceResult<Ad>> {
    const existing = await this.getById(id)
    if (!existing.success || !existing.data) {
      return { data: null, error: existing.error ?? 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return { data: null, error: 'No tienes permiso para reactivar este anuncio', success: false }
    }

    if (existing.data.status !== 'paused') {
      return {
        data: null,
        error: 'Solo puedes reactivar anuncios que estén pausado',
        success: false,
      }
    }

    // Check schedule hasn't expired
    if (existing.data.schedule_end && new Date(existing.data.schedule_end) <= new Date()) {
      return {
        data: null,
        error: 'No se puede reactivar un anuncio cuya fecha de fin ya ha pasado',
        success: false,
      }
    }

    // Check plan limit
    const { data: business, error: bizError } = await this.supabase
      .from('businesses')
      .select('id, subscription_tier')
      .eq('id', existing.data.business_id)
      .single()

    if (bizError || !business) {
      return { data: null, error: 'No se pudo verificar el negocio', success: false }
    }

    const limitCheck = await this.checkPlanLimit(
      existing.data.business_id,
      business.subscription_tier as SubscriptionTier,
    )
    if (!limitCheck.success) {
      return { data: null, error: limitCheck.error, success: false }
    }

    const { data: ad, error } = await this.supabase
      .from('ads')
      .update({ status: 'active' })
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: ad as Ad, error: null, success: true }
  }

  async delete(id: string, ownerId: string): Promise<ServiceResult<void>> {
    const existing = await this.getById(id)
    if (!existing.success || !existing.data) {
      return { data: null, error: existing.error ?? 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return { data: null, error: 'No tienes permiso para eliminar este anuncio', success: false }
    }

    // Soft delete
    const { error } = await this.supabase
      .from('ads')
      .update({ is_active: false, status: 'paused' })
      .eq('id', id)
      .eq('owner_id', ownerId)

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: undefined, error: null, success: true }
  }

  async uploadImage(adId: string, file: File, ownerId: string): Promise<ServiceResult<string>> {
    const existing = await this.getById(adId)
    if (!existing.success || !existing.data) {
      return { data: null, error: 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return {
        data: null,
        error: 'No tienes permiso para subir imágenes a este anuncio',
        success: false,
      }
    }

    // Validate file
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

    if (file.size > MAX_SIZE) {
      return { data: null, error: 'La imagen no puede superar los 5MB', success: false }
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        data: null,
        error: 'Solo se permiten imágenes en formato JPG, PNG o WebP',
        success: false,
      }
    }

    const ext = file.name.split('.').pop() ?? 'jpg'
    const path = `${existing.data.business_id}/${adId}.${ext}`

    const { error: uploadError } = await this.supabase.storage
      .from('ad-images')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return { data: null, error: uploadError.message, success: false }
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('ad-images').getPublicUrl(path)

    await this.supabase
      .from('ads')
      .update({ image_url: publicUrl })
      .eq('id', adId)
      .eq('owner_id', ownerId)

    return { data: publicUrl, error: null, success: true }
  }

  async getActiveAds(filters: AdFiltersInput): Promise<ServiceResult<Ad[]>> {
    const now = new Date().toISOString()
    const hour = new Date().getHours()

    let query = this.supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .eq('is_active', true)
      .or(`schedule_start.is.null,schedule_start.lte.${now}`)
      .or(`schedule_end.is.null,schedule_end.gt.${now}`)
      .or(`daily_start_hour.is.null,daily_start_hour.lte.${hour}`)
      .or(`daily_end_hour.is.null,daily_end_hour.gt.${hour}`)

    if (filters.type) {
      query = query.eq('type', filters.type)
    }

    if (filters.city) {
      query = query.contains('target_cities', [filters.city])
    }

    if (filters.neighborhood) {
      query = query.contains('target_neighborhoods', [filters.neighborhood])
    }

    if (filters.category_id) {
      query = query.contains('target_categories', [filters.category_id])
    }

    query = query.order('priority', { ascending: false })

    const { data, error } = await query.limit(filters.limit ?? 5)

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: (data as Ad[]) ?? [], error: null, success: true }
  }

  async getAdsForBusiness(businessId: string, categoryId?: string): Promise<ServiceResult<Ad[]>> {
    const now = new Date().toISOString()

    let query = this.supabase
      .from('ads')
      .select('*')
      .eq('status', 'active')
      .eq('is_active', true)
      .neq('business_id', businessId)
      .or(`schedule_end.is.null,schedule_end.gt.${now}`)
      .order('priority', { ascending: false })
      .limit(3)

    if (categoryId) {
      query = query.contains('target_categories', [categoryId])
    }

    const { data, error } = await query

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: (data as Ad[]) ?? [], error: null, success: true }
  }

  async getStats(adId: string, ownerId: string): Promise<ServiceResult<AdDetailedStats>> {
    // Verify ownership
    const existing = await this.getById(adId)
    if (!existing.success || !existing.data) {
      return { data: null, error: 'Anuncio no encontrado', success: false }
    }

    if (existing.data.owner_id !== ownerId) {
      return {
        data: null,
        error: 'No tienes permiso para ver las estadísticas de este anuncio',
        success: false,
      }
    }

    const now = new Date()
    const last24h = new Date(now.getTime() - 86400000).toISOString()
    const last7d = new Date(now.getTime() - 86400000 * 7).toISOString()
    const last30d = new Date(now.getTime() - 86400000 * 30).toISOString()

    const [impTotal, clkTotal, imp24h, clk24h, imp7d, clk7d, imp30d, clk30d] = await Promise.all([
      this.supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', adId),
      this.supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', adId),
      this.supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', adId).gte('created_at', last24h),
      this.supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', adId).gte('created_at', last24h),
      this.supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', adId).gte('created_at', last7d),
      this.supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', adId).gte('created_at', last7d),
      this.supabase.from('ad_impressions').select('*', { count: 'exact', head: true }).eq('ad_id', adId).gte('created_at', last30d),
      this.supabase.from('ad_clicks').select('*', { count: 'exact', head: true }).eq('ad_id', adId).gte('created_at', last30d),
    ])

    const totalImpressions = impTotal.count ?? 0
    const totalClicks = clkTotal.count ?? 0
    const ctr = totalImpressions > 0 ? totalClicks / totalImpressions : 0

    const result: AdDetailedStats = {
      ad_id: adId,
      total_impressions: totalImpressions,
      total_clicks: totalClicks,
      ctr_percentage: Math.round(ctr * 10000) / 100,
      impressions_last_7d: imp7d.count ?? 0,
      clicks_last_7d: clk7d.count ?? 0,
      impressions_last_24h: imp24h.count ?? 0,
      clicks_last_24h: clk24h.count ?? 0,
      impressions_last_30d: imp30d.count ?? 0,
      clicks_last_30d: clk30d.count ?? 0,
    }

    return { data: result, error: null, success: true }
  }
}
