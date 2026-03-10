import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Store, CheckCircle, XCircle, Sparkles } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminBusinessesTable } from '@/modules/auth/components/admin-businesses-table'
import type { Database } from '@/lib/supabase/database.types'

type BusinessRow = Database['public']['Tables']['businesses']['Row']

export default async function AdminNegociosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/panel')

  const { data: businesses } = await supabase
    .from('businesses')
    .select('*')
    .order('created_at', { ascending: false })

  const allBusinesses = (businesses as BusinessRow[]) ?? []
  const activeCount = allBusinesses.filter((b) => b.is_active).length
  const proOrPremium = allBusinesses.filter(
    (b) => b.subscription_tier === 'pro' || b.subscription_tier === 'premium',
  ).length

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/panel/admin"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-muted hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Gestión de negocios</h1>
          <p className="mt-1 text-muted">Visualiza, edita y controla todos los negocios</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Total', value: allBusinesses.length, icon: Store, color: 'text-brand-accent-400' },
          { label: 'Activos', value: activeCount, icon: CheckCircle, color: 'text-brand-success-400' },
          { label: 'Inactivos', value: allBusinesses.length - activeCount, icon: XCircle, color: 'text-red-400' },
          { label: 'Pro / Premium', value: proOrPremium, icon: Sparkles, color: 'text-yellow-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="rounded-2xl border border-slate-800 bg-card p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-muted">{label}</p>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <p className="mt-2 text-2xl font-bold text-white">{value}</p>
          </div>
        ))}
      </div>

      <AdminBusinessesTable businesses={allBusinesses} />
    </div>
  )
}
