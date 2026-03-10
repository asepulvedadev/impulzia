import type { Database } from '@/lib/supabase/database.types'

export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'premium'

// Database row types
type BusinessRow = Database['public']['Tables']['businesses']['Row']
type CategoryRow = Database['public']['Tables']['business_categories']['Row']
type BusinessHoursRow = Database['public']['Tables']['business_hours']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

// Core types
export type Business = BusinessRow
export type BusinessCategory = CategoryRow
export type BusinessHours = BusinessHoursRow

// Expanded types
export interface BusinessWithCategory extends Business {
  business_categories: BusinessCategory | null
}

export interface BusinessWithOwner extends Business {
  profiles: ProfileRow | null
}

// Reduced type for listings
export interface BusinessCard {
  id: string
  name: string
  slug: string
  short_description: string | null
  logo_url: string | null
  cover_url: string | null
  neighborhood: string | null
  city: string | null
  address: string | null
  phone: string | null
  whatsapp: string | null
  latitude: number | null
  longitude: number | null
  is_verified: boolean
  is_featured: boolean
  subscription_tier: 'free' | 'basic' | 'pro' | 'premium'
  business_categories: Pick<BusinessCategory, 'name' | 'slug' | 'icon'> | null
}

// Form data for create/edit
export interface BusinessFormData {
  name: string
  slug?: string
  description?: string
  short_description?: string
  category_id: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  address?: string
  neighborhood?: string
  city?: string
}

// Search parameters
export interface BusinessSearchParams {
  query?: string
  category_id?: string
  category_slug?: string   // para personalización por categoría
  city?: string
  neighborhood?: string
  is_verified?: boolean
  sort_by?: 'recent' | 'name' | 'rating' | 'relevance'
  page?: number
  per_page?: number
}

// Search result with pagination
export interface BusinessSearchResult {
  data: BusinessCard[]
  total: number
  page: number
  total_pages: number
}

// Category with business count
export interface CategoryWithCount extends BusinessCategory {
  business_count: number
}

// Service result wrapper
export interface ServiceResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ── Landing page types ──────────────────────────────────────────────────────

export interface HeroSlide {
  url: string
  alt?: string
  caption?: string
}

export interface SocialLinks {
  instagram?: string
  facebook?: string
  tiktok?: string
  linkedin?: string
  twitter?: string
  youtube?: string
}

export type CatalogSection = Database['public']['Tables']['business_catalog_sections']['Row'] & {
  business_catalog_items: CatalogItem[]
}

export type CatalogItem = Database['public']['Tables']['business_catalog_items']['Row']

export interface BusinessLanding {
  id: string
  name: string
  slug: string
  owner_id: string
  short_description: string | null
  description: string | null
  logo_url: string | null
  cover_url: string | null
  phone: string | null
  whatsapp: string | null
  email: string | null
  website: string | null
  address: string | null
  neighborhood: string | null
  city: string | null
  latitude: number | null
  longitude: number | null
  is_verified: boolean
  is_featured: boolean
  subscription_tier: string
  brand_color_primary: string
  brand_color_secondary: string
  brand_color_accent: string
  hero_slides: HeroSlide[]
  social_links: SocialLinks
  story_title: string | null
  story_content: string | null
  landing_visible: boolean
  business_categories: {
    name: string
    slug: string
    icon: string | null
  } | null
  business_catalog_sections: CatalogSection[]
}

export interface LandingUpdateInput {
  name?: string
  short_description?: string
  description?: string
  phone?: string
  whatsapp?: string
  email?: string
  website?: string
  address?: string
  neighborhood?: string
  city?: string
  brand_color_primary?: string
  brand_color_secondary?: string
  brand_color_accent?: string
  story_title?: string
  story_content?: string
  hero_slides?: HeroSlide[]
  social_links?: SocialLinks
}
