import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import {
  Users,
  Store,
  Gift,
  TrendingUp,
  UserCheck,
  UserX,
  Shield,
  ChevronRight,
  Activity,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { AdminAnalyticsPanel } from '@/modules/analytics/components/admin-analytics-panel'

export default async function AdminPage() {
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

  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: users },
    { data: businesses },
    { data: incentives },
    { data: newUsers },
    { data: newBusinesses },
  ] = await Promise.all([
    supabase.from('profiles').select('id, role, is_active'),
    supabase.from('businesses').select('id, is_active, subscription_tier'),
    supabase.from('incentives').select('id, status'),
    supabase
      .from('profiles')
      .select('id')
      .gte('created_at', thirtyDaysAgo),
    supabase
      .from('businesses')
      .select('id')
      .gte('created_at', thirtyDaysAgo),
  ])

  const allUsers = users ?? []
  const allBusinesses = businesses ?? []
  const allIncentives = incentives ?? []

  const stats = {
    totalUsers: allUsers.length,
    activeUsers: allUsers.filter((u) => u.is_active).length,
    inactiveUsers: allUsers.filter((u) => !u.is_active).length,
    admins: allUsers.filter((u) => u.role === 'admin').length,
    totalBusinesses: allBusinesses.length,
    activeBusinesses: allBusinesses.filter((b) => b.is_active).length,
    proOrPremium: allBusinesses.filter((b) => b.subscription_tier === 'pro' || b.subscription_tier === 'premium').length,
    activeIncentives: allIncentives.filter((i) => i.status === 'active').length,
    newUsersMonth: newUsers?.length ?? 0,
    newBusinessesMonth: newBusinesses?.length ?? 0,
  }

  const sections = [
    {
      href: '/panel/admin/usuarios',
      label: 'Gestión de usuarios',
      description: 'Ver, editar roles, activar y eliminar usuarios',
      icon: Users,
      color: 'text-brand-primary-400',
      bg: 'bg-brand-primary-900/20',
      badge: `${stats.totalUsers} usuarios`,
    },
    {
      href: '/panel/admin/negocios',
      label: 'Gestión de negocios',
      description: 'Ver todos los negocios, editar y controlar su estado',
      icon: Store,
      color: 'text-brand-accent-400',
      bg: 'bg-brand-accent-900/20',
      badge: `${stats.totalBusinesses} negocios`,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-white">Panel de administración</h1>
        <p className="mt-1 text-muted">Visión general de la plataforma Rcomienda</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: 'Usuarios totales', value: stats.totalUsers, icon: Users, color: 'text-brand-primary-400' },
          { label: 'Usuarios activos', value: stats.activeUsers, icon: UserCheck, color: 'text-brand-success-400' },
          { label: 'Negocios', value: stats.totalBusinesses, icon: Store, color: 'text-brand-accent-400' },
          { label: 'Incentivos activos', value: stats.activeIncentives, icon: Gift, color: 'text-yellow-400' },
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

      {/* Activity this month */}
      <div className="rounded-2xl border border-slate-800 bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Activity className="h-4 w-4 text-brand-primary-400" />
          <h2 className="font-heading text-base font-bold text-white">Actividad últimos 30 días</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Nuevos usuarios', value: stats.newUsersMonth, icon: TrendingUp, color: 'text-brand-primary-400' },
            { label: 'Nuevos negocios', value: stats.newBusinessesMonth, icon: Store, color: 'text-brand-accent-400' },
            { label: 'Usuarios inactivos', value: stats.inactiveUsers, icon: UserX, color: 'text-red-400' },
            { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-brand-primary-300' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <Icon className={`h-5 w-5 shrink-0 ${color}`} />
              <div>
                <p className="text-lg font-bold text-white">{value}</p>
                <p className="text-[11px] text-muted">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analytics ML */}
      <Suspense fallback={
        <div className="h-64 animate-pulse rounded-2xl border border-slate-800 bg-card" />
      }>
        <AdminAnalyticsPanel />
      </Suspense>

      {/* Quick access sections */}
      <div className="space-y-3">
        <h2 className="font-heading text-base font-bold text-white">Gestión</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {sections.map(({ href, label, description, icon: Icon, color, bg, badge }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 rounded-2xl border border-slate-800 bg-card p-5 transition hover:border-slate-700 hover:bg-slate-800/40"
            >
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${bg}`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-white">{label}</p>
                <p className="mt-0.5 text-xs text-muted">{description}</p>
                <span className="mt-1.5 inline-block rounded-full bg-slate-800 px-2 py-0.5 text-[10px] font-semibold text-slate-300">
                  {badge}
                </span>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted transition group-hover:text-white" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
