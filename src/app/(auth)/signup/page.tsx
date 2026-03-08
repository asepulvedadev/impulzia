import Link from 'next/link'
import { Clock, ArrowLeft } from 'lucide-react'
// import { SignupForm } from '@/modules/auth/components/signup-form'

export default function SignupPage() {
  // TODO: habilitar cuando el registro esté listo para producción
  // return <SignupForm />

  return (
    <div className="space-y-6 text-center">
      <div className="flex flex-col items-center gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-primary-900/40">
          <Clock className="h-8 w-8 text-brand-primary-400" />
        </div>
        <h1 className="font-heading text-2xl font-bold text-white">Próximamente</h1>
        <p className="text-sm text-muted">
          El registro de nuevos usuarios estará disponible muy pronto.
          <br />
          Por ahora puedes iniciar sesión si ya tienes una cuenta.
        </p>
      </div>

      <Link
        href="/login"
        className="inline-flex items-center gap-2 rounded-xl bg-brand-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-primary-500"
      >
        Ir al login
      </Link>

      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
