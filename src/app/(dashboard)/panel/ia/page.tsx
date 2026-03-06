import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Sparkles } from 'lucide-react'
import { AiToolsGrid } from '@/modules/ia/components/ai-tools-grid'
import { AiUsageMeter } from '@/modules/ia/components/ai-usage-meter'
import { getUsageSummary } from '@/modules/ia/use-cases/get-usage-summary'
import type { SubscriptionTier } from '@/lib/ai/config'

export default async function IACenterPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name, subscription_tier')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .single()

  if (!business) redirect('/panel')

  const { data: summaries } = await getUsageSummary(
    business.id,
    business.subscription_tier as SubscriptionTier,
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-primary-600 to-purple-600 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Centro IA</h1>
          <p className="text-sm text-slate-400">Herramientas inteligentes para hacer crecer {business.name}</p>
        </div>
      </div>

      {/* Tools grid */}
      <AiToolsGrid usageSummaries={summaries ?? []} />

      {/* Usage summary */}
      <div className="rounded-xl border border-white/10 bg-slate-800/40 p-4">
        <AiUsageMeter summaries={summaries ?? []} />
      </div>
    </div>
  )
}
