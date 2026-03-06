import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { IncentiveService } from '@/modules/incentivos/services/incentive.service'
import { SavedIncentivesList } from '@/modules/incentivos/components/saved-incentives-list'
import { IncentiveGridSkeleton } from '@/modules/incentivos/components/incentive-grid'

async function SavedList({ userId }: { userId: string }) {
  const supabase = await createClient()
  const service = new IncentiveService(supabase)
  const { data: saved } = await service.getUserSavedIncentives(userId)

  return (
    <SavedIncentivesList
      incentives={saved ?? []}
      onUnsave={async () => {
        'use server'
        // handled client-side
      }}
    />
  )
}

export default async function MisCuponesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="min-h-screen">
      <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Mis Cupones Guardados</h1>
          <p className="text-muted text-sm mt-1">Accede rápido a tus ofertas favoritas</p>
        </div>

        <Suspense fallback={<IncentiveGridSkeleton count={6} />}>
          <SavedList userId={user.id} />
        </Suspense>
      </div>
    </div>
  )
}
