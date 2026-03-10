import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import type { Json } from '@/lib/supabase/database.types'
import type {
  Business,
  BusinessCard,
  BusinessCategory,
  BusinessFormData,
  BusinessHours,
  BusinessLanding,
  BusinessSearchParams,
  BusinessSearchResult,
  BusinessWithCategory,
  CatalogItem,
  CatalogSection,
  HeroSlide,
  LandingUpdateInput,
  ServiceResult,
  SocialLinks,
} from '../interfaces'
import { SlugService } from './slug.service'

type BusinessRow = Database['public']['Tables']['businesses']['Row']

const BUSINESS_CARD_SELECT =
  'id, name, slug, short_description, logo_url, cover_url, neighborhood, city, address, phone, whatsapp, latitude, longitude, is_verified, is_featured, subscription_tier, business_categories(name, slug, icon)'

export class BusinessService {
  constructor(private supabase: SupabaseClient<Database>) {}

  async create(data: BusinessFormData, ownerId: string): Promise<ServiceResult<Business>> {
    const slug = data.slug || SlugService.generate(data.name)
    const uniqueSlug = await SlugService.ensureUnique(slug, this.supabase)

    const { data: business, error } = await this.supabase
      .from('businesses')
      .insert({
        owner_id: ownerId,
        name: data.name,
        slug: uniqueSlug,
        description: data.description ?? null,
        short_description: data.short_description ?? null,
        category_id: data.category_id,
        phone: data.phone ?? null,
        whatsapp: data.whatsapp ?? null,
        email: data.email ?? null,
        website: data.website ?? null,
        address: data.address ?? null,
        neighborhood: data.neighborhood ?? null,
        city: data.city ?? 'Cúcuta',
      })
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    // Update profile role to business_owner
    await this.supabase.from('profiles').update({ role: 'business_owner' }).eq('id', ownerId)

    return { data: business as BusinessRow, error: null, success: true }
  }

  async getById(id: string): Promise<ServiceResult<BusinessWithCategory>> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*, business_categories(*)')
      .eq('id', id)
      .eq('is_active', true)
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: data as unknown as BusinessWithCategory, error: null, success: true }
  }

  async getBySlug(slug: string): Promise<ServiceResult<BusinessWithCategory>> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*, business_categories(*)')
      .eq('slug', slug)
      .eq('is_active', true)
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: data as unknown as BusinessWithCategory, error: null, success: true }
  }

  async getByOwnerId(ownerId: string): Promise<ServiceResult<Business>> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', ownerId)
      .limit(1)
      .maybeSingle()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: data as BusinessRow | null, error: null, success: true }
  }

  async update(
    id: string,
    data: Partial<BusinessFormData>,
    ownerId: string,
  ): Promise<ServiceResult<Business>> {
    const updateData: Database['public']['Tables']['businesses']['Update'] = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.short_description !== undefined) updateData.short_description = data.short_description
    if (data.category_id !== undefined) updateData.category_id = data.category_id
    if (data.phone !== undefined) updateData.phone = data.phone
    if (data.whatsapp !== undefined) updateData.whatsapp = data.whatsapp
    if (data.email !== undefined) updateData.email = data.email
    if (data.website !== undefined) updateData.website = data.website
    if (data.address !== undefined) updateData.address = data.address
    if (data.neighborhood !== undefined) updateData.neighborhood = data.neighborhood
    if (data.city !== undefined) updateData.city = data.city

    const { data: business, error } = await this.supabase
      .from('businesses')
      .update(updateData)
      .eq('id', id)
      .eq('owner_id', ownerId)
      .select('*')
      .single()

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: business as BusinessRow, error: null, success: true }
  }

  async search(
    params: BusinessSearchParams,
    userId?: string,
  ): Promise<ServiceResult<BusinessSearchResult>> {
    const page = params.page ?? 1
    const perPage = params.per_page ?? 12
    const from = (page - 1) * perPage
    const to = from + perPage - 1

    // Obtener scores de personalización cuando hay usuario o sort_by relevance
    let scoreMap: Map<string, number> | null = null
    if (userId || params.sort_by === 'relevance') {
      const { data: scores } = await this.supabase.rpc('get_personalized_scores', {
        p_user_id: userId ?? undefined,
        p_category: params.category_slug ?? undefined,
        p_limit: 200,
      })
      if (scores && scores.length > 0) {
        scoreMap = new Map(scores.map((s) => [s.business_id, s.personalization_score]))
      }
    }

    let query = this.supabase
      .from('businesses')
      .select(BUSINESS_CARD_SELECT, { count: 'exact' })
      .eq('is_active', true)

    if (params.query) {
      query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%`)
    }
    if (params.category_id) {
      query = query.eq('category_id', params.category_id)
    }
    if (params.city) {
      query = query.eq('city', params.city)
    }
    if (params.neighborhood) {
      query = query.eq('neighborhood', params.neighborhood)
    }
    if (params.is_verified !== undefined) {
      query = query.eq('is_verified', params.is_verified)
    }

    switch (params.sort_by) {
      case 'name':
        query = query.order('name', { ascending: true })
        break
      case 'rating':
        query = query.order('is_featured', { ascending: false })
        break
      default:
        query = query.order('created_at', { ascending: false })
    }

    const { data, count, error } = await query.range(from, to).limit(perPage)

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    let businesses = (data as unknown as BusinessCard[]) ?? []

    // Re-rankear con scores personalizados si existen
    if (scoreMap && scoreMap.size > 0 && params.sort_by !== 'name') {
      businesses = [...businesses].sort((a, b) => {
        const scoreA = scoreMap!.get(a.id) ?? 0
        const scoreB = scoreMap!.get(b.id) ?? 0
        return scoreB - scoreA
      })
    }

    const total = count ?? 0
    const result: BusinessSearchResult = {
      data: businesses,
      total,
      page,
      total_pages: Math.ceil(total / perPage),
    }

    return { data: result, error: null, success: true }
  }

  async getFeatured(limit = 6): Promise<ServiceResult<BusinessCard[]>> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select(BUSINESS_CARD_SELECT)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return {
      data: (data as unknown as BusinessCard[]) ?? [],
      error: null,
      success: true,
    }
  }

  async uploadLogo(
    businessId: string,
    file: File,
    ownerId: string,
  ): Promise<ServiceResult<string>> {
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${businessId}/logo.${ext}`

    const { error: uploadError } = await this.supabase.storage
      .from('business-logos')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return { data: null, error: uploadError.message, success: false }
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('business-logos').getPublicUrl(path)

    await this.supabase
      .from('businesses')
      .update({ logo_url: publicUrl })
      .eq('id', businessId)
      .eq('owner_id', ownerId)

    return { data: publicUrl, error: null, success: true }
  }

  async uploadCover(
    businessId: string,
    file: File,
    ownerId: string,
  ): Promise<ServiceResult<string>> {
    const ext = file.name.split('.').pop() ?? 'png'
    const path = `${businessId}/cover.${ext}`

    const { error: uploadError } = await this.supabase.storage
      .from('business-covers')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      return { data: null, error: uploadError.message, success: false }
    }

    const {
      data: { publicUrl },
    } = this.supabase.storage.from('business-covers').getPublicUrl(path)

    await this.supabase
      .from('businesses')
      .update({ cover_url: publicUrl })
      .eq('id', businessId)
      .eq('owner_id', ownerId)

    return { data: publicUrl, error: null, success: true }
  }

  async saveHours(
    businessId: string,
    hours: Omit<BusinessHours, 'id'>[],
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _ownerId: string,
  ): Promise<ServiceResult<undefined>> {
    // Delete existing hours
    await this.supabase.from('business_hours').delete().eq('business_id', businessId)

    // Insert new hours
    const { error } = await this.supabase
      .from('business_hours')
      .insert(
        hours.map((h) => ({
          business_id: businessId,
          day_of_week: h.day_of_week,
          open_time: h.open_time,
          close_time: h.close_time,
          is_closed: h.is_closed,
        })),
      )
      .select('*')

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return { data: undefined, error: null, success: true }
  }

  async getCategories(): Promise<ServiceResult<BusinessCategory[]>> {
    const { data, error } = await this.supabase
      .from('business_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return {
      data: (data as unknown as BusinessCategory[]) ?? [],
      error: null,
      success: true,
    }
  }

  async getHours(businessId: string): Promise<ServiceResult<BusinessHours[]>> {
    const { data, error } = await this.supabase
      .from('business_hours')
      .select('*')
      .eq('business_id', businessId)
      .order('day_of_week', { ascending: true })

    if (error) {
      return { data: null, error: error.message, success: false }
    }

    return {
      data: (data as unknown as BusinessHours[]) ?? [],
      error: null,
      success: true,
    }
  }

  async getFullLanding(slug: string): Promise<ServiceResult<BusinessLanding>> {
    const { data, error } = await this.supabase
      .from('businesses')
      .select(`
        id, name, slug, owner_id, short_description, description,
        logo_url, cover_url, phone, whatsapp, email, website,
        address, neighborhood, city, latitude, longitude,
        is_verified, is_featured, subscription_tier,
        brand_color_primary, brand_color_secondary, brand_color_accent,
        hero_slides, social_links, story_title, story_content, landing_visible,
        business_categories(name, slug, icon),
        business_catalog_sections(
          id, name, description, sort_order, is_visible,
          business_catalog_items(
            id, name, description, price, price_label,
            image_url, is_available, is_featured, sort_order, metadata
          )
        )
      `)
      .eq('slug', slug)
      .eq('is_active', true)
      .eq('landing_visible', true)
      .single()

    if (error || !data) {
      return { data: null, error: error?.message ?? 'Not found', success: false }
    }

    const raw = data as unknown as BusinessLanding & {
      business_catalog_sections: (CatalogSection & {
        business_catalog_items: CatalogItem[]
      })[]
    }

    // Sort sections and items
    const sections = (raw.business_catalog_sections ?? [])
      .filter((s) => s.is_visible)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((s) => ({
        ...s,
        business_catalog_items: (s.business_catalog_items ?? [])
          .filter((i) => i.is_available)
          .sort((a, b) => a.sort_order - b.sort_order),
      }))

    const landing: BusinessLanding = {
      ...raw,
      hero_slides: Array.isArray(raw.hero_slides) ? (raw.hero_slides as HeroSlide[]) : [],
      social_links: (raw.social_links as SocialLinks) ?? {},
      business_catalog_sections: sections,
    }

    return { data: landing, error: null, success: true }
  }

  async updateLanding(
    businessId: string,
    ownerId: string,
    input: LandingUpdateInput,
  ): Promise<ServiceResult<void>> {
    const updateData: Database['public']['Tables']['businesses']['Update'] = {}

    const fields: (keyof LandingUpdateInput)[] = [
      'name', 'short_description', 'description', 'phone', 'whatsapp',
      'email', 'website', 'address', 'neighborhood', 'city',
      'brand_color_primary', 'brand_color_secondary', 'brand_color_accent',
      'story_title', 'story_content',
    ]
    for (const f of fields) {
      if (input[f] !== undefined) {
        (updateData as Record<string, unknown>)[f] = input[f]
      }
    }
    if (input.hero_slides !== undefined) updateData.hero_slides = input.hero_slides as unknown as Json
    if (input.social_links !== undefined) updateData.social_links = input.social_links as unknown as Json

    const { error } = await this.supabase
      .from('businesses')
      .update(updateData)
      .eq('id', businessId)
      .eq('owner_id', ownerId)

    if (error) return { data: null, error: error.message, success: false }
    return { data: undefined, error: null, success: true }
  }
}
