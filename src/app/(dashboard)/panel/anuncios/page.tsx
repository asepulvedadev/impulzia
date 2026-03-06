import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Megaphone } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { AdService } from '@/modules/anuncios/services/ad.service'
import { AdCardOwner } from '@/modules/anuncios/components/ad-card-owner'
import { AdLimitBanner } from '@/modules/anuncios/components/ad-limit-banner'
import { AD_PLAN_LIMITS } from '@/modules/anuncios/interfaces'
import type { AdWithStats } from '@/modules/anuncios/interfaces'

export default async function AnunciosPage() {
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
        <Megaphone size={40} className="mx-auto text-muted mb-4 opacity-50" />
        <h2 className="font-bold text-white text-lg mb-2">Necesitas un negocio</h2>
        <p className="text-muted text-sm mb-4">
          Para crear anuncios primero debes registrar tu negocio.
        </p>
        <Button asChild>
          <Link href="/panel/negocio">Registrar mi negocio</Link>
        </Button>
      </div>
    )
  }

  const service = new AdService(supabase)
  const { data: ads } = await service.getByBusinessId(business.id, user.id)

  const activeCount = (ads ?? []).filter((a) => a.status === 'active').length
  const tier = (business.subscription_tier as string) ?? 'free'
  const limit = AD_PLAN_LIMITS[tier] ?? 1
  const atLimit = activeCount >= limit

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mis Anuncios</h1>
          <p className="text-muted text-sm mt-1">
            {activeCount} de {limit === Infinity ? '∞' : limit} anuncios activos
          </p>
        </div>
        <Button asChild disabled={atLimit}>
          <Link href="/panel/anuncios/nuevo">
            <Plus size={16} />
            Crear anuncio
          </Link>
        </Button>
      </div>

      {/* Limit banner */}
      {atLimit && <AdLimitBanner currentCount={activeCount} tier={tier} />}

      {/* Empty state */}
      {(!ads || ads.length === 0) && (
        <div className="text-center py-16 rounded-2xl border border-slate-800 border-dashed">
          <Megaphone size={40} className="mx-auto text-muted mb-4 opacity-50" />
          <h2 className="font-bold text-white text-lg mb-2">Aún no tienes anuncios</h2>
          <p className="text-muted text-sm mb-6 max-w-sm mx-auto">
            Crea tu primer anuncio y llega a más clientes en Cúcuta.
          </p>
          <Button asChild>
            <Link href="/panel/anuncios/nuevo">
              <Plus size={16} />
              Crear mi primer anuncio
            </Link>
          </Button>
        </div>
      )}

      {/* Ad list */}
      {ads && ads.length > 0 && (
        <div className="space-y-3">
          {(ads as AdWithStats[]).map((ad) => (
            <AdCardOwner
              key={ad.id}
              ad={ad}
              onEdit={(id) => {
                // Navigation handled by client component
                void id
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
