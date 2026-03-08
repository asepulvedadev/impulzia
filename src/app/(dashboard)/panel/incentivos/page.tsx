import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Tag } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { IncentiveCardOwner } from '@/modules/incentivos/components/incentive-card-owner'
import { INCENTIVE_PLAN_LIMITS } from '@/modules/incentivos/interfaces'
import type { IncentiveWithStats } from '@/modules/incentivos/interfaces'

export default async function IncentivosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, subscription_tier')
    .eq('owner_id', user.id)
    .limit(1)
    .maybeSingle()

  if (!business) {
    return (
      <div className="text-center py-16">
        <Tag size={40} className="mx-auto text-muted mb-4 opacity-50" />
        <h2 className="font-bold text-white text-lg mb-2">Necesitas un negocio</h2>
        <p className="text-muted text-sm mb-4">
          Para crear incentivos primero debes registrar tu negocio.
        </p>
        <Button asChild>
          <Link href="/panel/negocio">Registrar mi negocio</Link>
        </Button>
      </div>
    )
  }

  const service = new IncentiveService(supabase)
  const { data: incentives } = await service.getByBusinessId(business.id)

  const activeCount = (incentives ?? []).filter((i) => i.status === 'active').length
  const tier = (business.subscription_tier as string) ?? 'free'
  const limit = INCENTIVE_PLAN_LIMITS[tier] ?? 2
  const atLimit = activeCount >= limit

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mis Incentivos</h1>
          <p className="text-muted text-sm mt-1">
            {activeCount} de {limit === Infinity ? '∞' : limit} incentivos activos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="flex-1 sm:flex-none">
            <Link href="/panel/incentivos/validar">Validar canje</Link>
          </Button>
          <Button asChild disabled={atLimit} className="flex-1 sm:flex-none">
            <Link href="/panel/incentivos/nuevo">
              <Plus size={16} />
              Crear incentivo
            </Link>
          </Button>
        </div>
      </div>

      {atLimit && (
        <div className="rounded-xl bg-brand-warning-900/20 border border-brand-warning-500/30 p-4 text-sm text-brand-warning-300">
          Has alcanzado el límite de <strong>{limit}</strong> incentivos activos en tu plan. Pausa o
          elimina uno para crear otro, o mejora tu plan.
        </div>
      )}

      {(!incentives || incentives.length === 0) && (
        <div className="text-center py-16 rounded-2xl border border-slate-800 border-dashed">
          <Tag size={40} className="mx-auto text-muted mb-4 opacity-50" />
          <h2 className="font-bold text-white text-lg mb-2">Aún no tienes incentivos</h2>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            Crea cupones, combos y premios para fidelizar a tus clientes.
          </p>
          <Button asChild>
            <Link href="/panel/incentivos/nuevo">
              <Plus size={16} />
              Crear mi primer incentivo
            </Link>
          </Button>
        </div>
      )}

      {incentives && incentives.length > 0 && (
        <div className="space-y-3">
          {(incentives as IncentiveWithStats[]).map((incentive) => (
            <IncentiveCardOwner key={incentive.id} incentive={incentive} onEdit={(id) => void id} />
          ))}
        </div>
      )}
    </div>
  )
}
