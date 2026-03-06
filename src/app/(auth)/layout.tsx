import { Logo } from '@/components/shared/logo'
import { Store, BarChart3, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: form */}
      <div className="flex w-full flex-col items-center justify-center px-4 py-12 lg:w-1/2">
        <Link href="/" className="mb-8">
          <Logo size="lg" />
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right side: decorative panel (desktop only) */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-brand-primary-600 via-brand-primary-700 to-brand-accent-600 lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:p-12">
        <div className="relative z-10 text-center text-white">
          <h2 className="font-heading text-3xl font-bold leading-tight xl:text-4xl">
            Impulsa tu negocio
            <br />
            con inteligencia artificial
          </h2>
          <p className="mt-4 text-lg text-brand-primary-100">
            Publicidad, incentivos y herramientas
            <br />
            para hacer crecer tu comercio local
          </p>
          <div className="mt-12 flex justify-center gap-8">
            <div className="flex flex-col items-center gap-2 text-brand-primary-200">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <Store className="h-6 w-6" />
              </div>
              <span className="text-xs">Tu tienda</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-brand-primary-200">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <BarChart3 className="h-6 w-6" />
              </div>
              <span className="text-xs">Analíticas</span>
            </div>
            <div className="flex flex-col items-center gap-2 text-brand-primary-200">
              <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-sm">
                <Sparkles className="h-6 w-6" />
              </div>
              <span className="text-xs">IA</span>
            </div>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/5" />
        <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-white/5" />
      </div>
    </div>
  )
}
