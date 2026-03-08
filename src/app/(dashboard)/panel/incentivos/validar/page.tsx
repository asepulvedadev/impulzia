import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { ValidationScanner } from '@/modules/incentivos/components/validation-scanner'

export default async function ValidarCanjePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/panel/incentivos"
          className="p-1.5 rounded-lg hover:bg-slate-800 text-muted hover:text-white transition-colors"
        >
          <ChevronLeft size={18} />
        </Link>
        <div>
          <h1 className="font-heading text-xl font-bold text-white">Validar Canje</h1>
          <p className="text-muted text-sm">
            Confirma el código del cliente para aplicar el descuento
          </p>
        </div>
      </div>

      <div className="max-w-sm mx-auto">
        <ValidationScanner />
      </div>
    </div>
  )
}
