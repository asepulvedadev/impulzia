import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Sidebar } from '@/components/layout/sidebar'
import { MobileNav } from '@/components/layout/mobile-nav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, full_name, email')
    .eq('id', user.id)
    .single()

  const role = (profile?.role ?? 'user') as 'user' | 'business_owner' | 'admin'
  const userName = profile?.full_name || profile?.email || ''

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar role={role} userName={userName} />
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 pb-20 sm:p-6 lg:p-8 lg:pb-8">{children}</main>
      </div>
      <MobileNav role={role} />
    </div>
  )
}
