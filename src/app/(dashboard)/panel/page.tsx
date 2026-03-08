import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BusinessService } from '@/modules/negocios/services/business.service'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { DashboardContent } from './dashboard-content'
import { UserDashboard } from './user-dashboard'
import type { Database } from '@/lib/supabase/database.types'
import type { BusinessCard } from '@/modules/negocios/interfaces'
import type { IncentiveWithBusiness } from '@/modules/incentivos/interfaces'

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
  const firstName = profile?.full_name?.split(' ')[0] || 'Usuario'

  // User role: show promotions + explore
  if (role === 'user') {
    const businessService = new BusinessService(supabase)
    const incentiveService = new IncentiveService(supabase)

    const [featuredResult, incentivesResult] = await Promise.all([
      businessService.getFeatured(6),
      incentiveService.getActiveIncentives({ city: 'Cúcuta', limit: 4 }),
    ])

    return (
      <UserDashboard
        firstName={firstName}
        incentives={(incentivesResult.data as IncentiveWithBusiness[]) ?? []}
        businesses={(featuredResult.data as BusinessCard[]) ?? []}
      />
    )
  }

  // business_owner / admin: existing dashboard
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
