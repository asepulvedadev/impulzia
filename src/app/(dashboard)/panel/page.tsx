import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { DashboardContent } from './dashboard-content'
import { UserDashboard } from './user-dashboard'
import { TrendingBusinesses, TrendingBusinessesSkeleton } from '@/modules/negocios/components/trending-businesses'
import type { Database } from '@/lib/supabase/database.types'
import type { BusinessCard } from '@/modules/negocios/interfaces'
import type { IncentiveWithBusiness } from '@/modules/incentivos/interfaces'
import type { PromoBanner } from '@/components/shared/promo-banner-slider'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type BusinessRow = Database['public']['Tables']['businesses']['Row']

export default async function PanelPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  const role = (profile?.role ?? 'user') as 'user' | 'business_owner' | 'admin'

  // User role: show promotions + explore
  if (role === 'user') {
    const businessService = new BusinessService(supabase)
    const incentiveService = new IncentiveService(supabase)

    const [featuredResult, incentivesResult, bannersResult] = await Promise.all([
      businessService.getFeatured(6),
      incentiveService.getActiveIncentives({ city: 'Cúcuta', limit: 4 }),
      supabase
        .from('promo_banners')
        .select('id, title, subtitle, image_url, bg_gradient, cta_text, cta_url')
        .eq('is_active', true)
        .order('display_order'),
    ])

    return (
      <div className="space-y-8">
        <UserDashboard
          banners={(bannersResult.data as PromoBanner[]) ?? []}
          incentives={(incentivesResult.data as IncentiveWithBusiness[]) ?? []}
          businesses={(featuredResult.data as BusinessCard[]) ?? []}
        />
        <Suspense fallback={<TrendingBusinessesSkeleton />}>
          <TrendingBusinesses limit={6} />
        </Suspense>
      </div>
    )
  }

  // admin: redirect to admin dashboard
  if (role === 'admin') {
    redirect('/panel/admin')
  }

  // business_owner: existing dashboard
  const { data: business } = await supabase
    .from('businesses')
    .select('*')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  return (
    <DashboardContent
      profile={profile as ProfileRow | null}
      business={business as BusinessRow | null}
    />
  )
}
