import type { Database } from '@/lib/supabase/database.types'

export type Incentive = Database['public']['Tables']['incentives']['Row']
export type IncentiveInsert = Database['public']['Tables']['incentives']['Insert']
export type IncentiveUpdate = Database['public']['Tables']['incentives']['Update']
export type SavedIncentive = Database['public']['Tables']['saved_incentives']['Row']
export type Redemption = Database['public']['Tables']['redemptions']['Row']
export type LoyaltyCard = Database['public']['Tables']['loyalty_cards']['Row']
export type IncentiveStats = Database['public']['Views']['incentive_stats']['Row']

export interface IncentiveWithStats extends Incentive {
  stats: IncentiveStats | null
}

export interface IncentiveWithBusiness extends Incentive {
  business: {
    id: string
    name: string
    slug: string
    logo_url: string | null
    neighborhood: string | null
    city: string | null
  } | null
}

export interface RedemptionWithDetails extends Redemption {
  incentive: Pick<Incentive, 'id' | 'title' | 'type' | 'discount_type' | 'discount_value'> | null
  user: Pick<Database['public']['Tables']['profiles']['Row'], 'id' | 'full_name' | 'email'> | null
}

export interface RedeemResult {
  redemption_id: string
  token: string
  incentive_title: string
  expires_at: string
}

export interface ServiceResult<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface IncentiveFilters {
  type?: 'coupon' | 'combo' | 'reward'
  category_id?: string
  neighborhood?: string
  city?: string
  business_id?: string
  limit?: number
  offset?: number
}

export const INCENTIVE_PLAN_LIMITS: Record<string, number> = {
  free: 2,
  basic: 10,
  pro: 30,
  premium: Infinity,
}
