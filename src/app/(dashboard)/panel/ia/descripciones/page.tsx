import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { FileText } from 'lucide-react'
import Link from 'next/link'
import { AiTemplatesService } from '@/modules/ia/services/ai-templates.service'
import { DescriptionGeneratorClient } from './client'

export default async function DescriptionGeneratorPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: business } = await supabase
    .from('businesses')
    .select('id, name')
    .eq('owner_id', user.id)
    .eq('is_active', true)
    .single()

  if (!business) redirect('/panel')

  const tplService = new AiTemplatesService(supabase)
  const { data: templates } = await tplService.getByTool('description_generator')

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <div className="flex items-center gap-2">
        <Link href="/panel/ia" className="text-slate-400 hover:text-white text-sm">
          ← IA
        </Link>
        <span className="text-slate-600">/</span>
        <h1 className="text-lg font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-brand-success-400" />
          Generador de Descripciones
        </h1>
      </div>
      <DescriptionGeneratorClient templates={templates ?? []} businessId={business.id} />
    </div>
  )
}
