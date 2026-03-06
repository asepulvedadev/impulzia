import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { History } from 'lucide-react'
import Link from 'next/link'
import { AiGenerationService } from '@/modules/ia/services/ai-generation.service'
import { AiHistoryClient } from './client'

export default async function HistorialPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .single()

  if (!business) redirect('/panel')

  const genService = new AiGenerationService(supabase)
  const { data: generations } = await genService.getByBusiness(business.id, { limit: 30 })

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Link href="/panel/ia" className="text-slate-400 hover:text-white text-sm">← IA</Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-slate-400" />
          Historial de Generaciones
        </h1>
      </div>
      <AiHistoryClient initialGenerations={generations ?? []} businessId={business.id} />
    </div>
  )
}
